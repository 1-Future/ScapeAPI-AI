// ══════════════════════════════════════════════════════════════════════════════
// Bank Engine (burn-v2 completion)
//
// Layers on top of the player.bank flat array that pre-existed from the initial
// engine cut. This module adds:
//
//   - 10 tabs (index 0 = "All", 1-9 user-named)
//   - Bank PIN gate (delegates to account-security.requireBankPinGate)
//   - Placeholders (per-tab, toggle)
//   - Tag-based search (name + implicit category + region-of-origin)
//   - Quantity controls (1 / 5 / 10 / X / All)
//   - Inventory right-click menu protocol (ws message shape)
//   - Examine text lookup
//   - Bank Value Estimator (GE guide price + top-5 most valuable)
//
// Design notes:
//   - Items are still stored in the flat `player.bank` array.
//   - Each bank entry gains an optional `tab` field (default 0 == "All"). Tab 0
//     is not a physical container — it is a VIEW of the union of all tabs. All
//     stored entries therefore live on a numeric tab 1..9, or on a synthetic
//     tab 0 when the owner has not created any custom tab yet. When a player
//     creates their first tab, existing entries stay on tab 0 until moved.
//   - Placeholders: `{ id, name, count: 0, placeholder: true, tab: N }`. They
//     only occupy a display slot; withdrawals ignore them, deposits refill them.
//   - GE guide prices come from `src/engine/ge-runner.js`. If a guide price is
//     missing we fall back to `item.value` (Math.floor integer).
//
// All coin / GP math is pure integer.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const security = require('./account-security');

// ── Constants ───────────────────────────────────────────────────────────────
const BANK_SIZE = 816;
const TAB_COUNT = 10;               // 0 = All, 1-9 custom
const TAB_MIN_CUSTOM = 1;
const TAB_MAX_CUSTOM = 9;
const WORN_SESSION_MS = 10 * 60 * 1000; // rolling 10-minute loot window
const MAX_TAB_NAME_LEN = 20;
const VALID_TAB_NAME = /^[A-Za-z0-9 _\-]{1,20}$/;

// ── Player shape helpers ────────────────────────────────────────────────────

/**
 * ensureBankState(player) — lazy-init the per-player bank state. Idempotent.
 * Shape:
 *   player.bank          = [ { id, name, count, tab?, placeholder? } ]
 *   player.bankTabs      = [null, name1..name9]  (0 is "All", stored as null)
 *   player.placeholdersOn = true | false
 *   player.bankPinVerifiedAt (handled by account-security)
 *   player.lootLog       = [{ id, count, at(ms) }]   — for deposit-loot
 *   player.isWornSession = bool (unused gate flag for /bank deposit-worn)
 */
function ensureBankState(player) {
  if (!player) throw new Error('bank: player required');
  if (!Array.isArray(player.bank)) player.bank = [];
  if (!Array.isArray(player.bankTabs) || player.bankTabs.length !== TAB_COUNT) {
    player.bankTabs = new Array(TAB_COUNT).fill(null);
    player.bankTabs[0] = 'All';
  }
  if (typeof player.placeholdersOn !== 'boolean') player.placeholdersOn = false;
  if (!Array.isArray(player.lootLog)) player.lootLog = [];
  if (typeof player.isWornSession !== 'boolean') player.isWornSession = false;
  // Normalize entries missing a tab number.
  for (const e of player.bank) {
    if (typeof e.tab !== 'number' || e.tab < 0 || e.tab >= TAB_COUNT) e.tab = 0;
    if (typeof e.count !== 'number' || e.count < 0) e.count = 0;
    if (e.placeholder === undefined) e.placeholder = false;
  }
  return player;
}

function requireItems(ctx) {
  if (!ctx || !ctx.items || typeof ctx.items.get !== 'function') {
    throw new Error('bank: ctx.items registry required (with get/find)');
  }
  return ctx.items;
}

// ── PIN gate ────────────────────────────────────────────────────────────────

/**
 * pinGate(player) -> { ok:true } or { ok:false, reason }
 * Fails closed — if anything in the security module misbehaves we deny.
 */
function pinGate(player) {
  try {
    if (!security || typeof security.requireBankPinGate !== 'function') {
      return { ok: false, reason: 'Bank PIN module unavailable. Contact staff.' };
    }
    const res = security.requireBankPinGate(player);
    if (!res || typeof res !== 'object') {
      return { ok: false, reason: 'Bank PIN check failed.' };
    }
    return res;
  } catch (e) {
    return { ok: false, reason: `Bank PIN check failed: ${e.message}` };
  }
}

// ── Tab operations ──────────────────────────────────────────────────────────

function listTabs(player) {
  ensureBankState(player);
  const out = [];
  for (let i = 0; i < TAB_COUNT; i++) {
    out.push({ id: i, name: i === 0 ? 'All' : (player.bankTabs[i] || null) });
  }
  return out;
}

function createTab(player, name) {
  ensureBankState(player);
  if (typeof name !== 'string' || !VALID_TAB_NAME.test(name)) {
    return { ok: false, reason: `Tab name must match [A-Za-z0-9 _-], 1..${MAX_TAB_NAME_LEN} chars.` };
  }
  const clean = name.trim();
  // Reserved: "All"
  if (clean.toLowerCase() === 'all') return { ok: false, reason: 'Reserved tab name.' };
  // Reject duplicates
  for (let i = 1; i < TAB_COUNT; i++) {
    if (player.bankTabs[i] && player.bankTabs[i].toLowerCase() === clean.toLowerCase()) {
      return { ok: false, reason: 'Duplicate tab name.' };
    }
  }
  for (let i = 1; i < TAB_COUNT; i++) {
    if (!player.bankTabs[i]) { player.bankTabs[i] = clean; return { ok: true, id: i, name: clean }; }
  }
  return { ok: false, reason: 'All tab slots in use.' };
}

function renameTab(player, id, name) {
  ensureBankState(player);
  const iid = id | 0;
  if (iid < TAB_MIN_CUSTOM || iid > TAB_MAX_CUSTOM) {
    return { ok: false, reason: `Only custom tabs 1..${TAB_MAX_CUSTOM} can be renamed.` };
  }
  if (!player.bankTabs[iid]) return { ok: false, reason: `Tab ${iid} does not exist.` };
  if (typeof name !== 'string' || !VALID_TAB_NAME.test(name)) {
    return { ok: false, reason: `Invalid tab name.` };
  }
  const clean = name.trim();
  if (clean.toLowerCase() === 'all') return { ok: false, reason: 'Reserved tab name.' };
  for (let i = 1; i < TAB_COUNT; i++) {
    if (i !== iid && player.bankTabs[i] && player.bankTabs[i].toLowerCase() === clean.toLowerCase()) {
      return { ok: false, reason: 'Duplicate tab name.' };
    }
  }
  player.bankTabs[iid] = clean;
  return { ok: true, id: iid, name: clean };
}

function deleteTab(player, id) {
  ensureBankState(player);
  const iid = id | 0;
  if (iid < TAB_MIN_CUSTOM || iid > TAB_MAX_CUSTOM) {
    return { ok: false, reason: `Cannot delete tab ${iid}.` };
  }
  if (!player.bankTabs[iid]) return { ok: false, reason: `Tab ${iid} does not exist.` };
  // Move items to "All" (tab 0)
  let moved = 0;
  for (const e of player.bank) {
    if (e.tab === iid) { e.tab = 0; moved++; }
  }
  player.bankTabs[iid] = null;
  return { ok: true, id: iid, itemsReassigned: moved };
}

function moveToTab(player, itemId, targetTab) {
  ensureBankState(player);
  const iid = targetTab | 0;
  if (iid < 0 || iid >= TAB_COUNT) return { ok: false, reason: 'Invalid tab id.' };
  if (iid > 0 && !player.bankTabs[iid]) return { ok: false, reason: `Tab ${iid} does not exist.` };
  const entry = player.bank.find(e => e.id === itemId);
  if (!entry) return { ok: false, reason: 'Item not in bank.' };
  entry.tab = iid;
  return { ok: true, id: itemId, tab: iid };
}

function findTabIdByName(player, name) {
  ensureBankState(player);
  const q = String(name || '').trim().toLowerCase();
  if (!q) return -1;
  if (q === 'all') return 0;
  for (let i = 1; i < TAB_COUNT; i++) {
    if (player.bankTabs[i] && player.bankTabs[i].toLowerCase() === q) return i;
  }
  // Numeric id
  const maybe = parseInt(q, 10);
  if (!isNaN(maybe) && maybe >= 0 && maybe < TAB_COUNT && (maybe === 0 || player.bankTabs[maybe])) return maybe;
  return -1;
}

// ── Core deposit / withdraw ─────────────────────────────────────────────────

/**
 * deposit(player, ctx, itemName, count, tabName?) ->
 *   { ok, item?, count?, tab?, reason? }
 *
 * ctx: { items, invAdd, invRemove, invCount }
 * count: integer | 'all'
 */
function deposit(player, ctx, itemName, count, tabName) {
  const items = requireItems(ctx);
  ensureBankState(player);

  const gate = pinGate(player);
  if (!gate.ok) return { ok: false, reason: gate.reason };

  // Resolve inventory slot
  const nameLower = String(itemName || '').toLowerCase();
  if (!nameLower) return { ok: false, reason: 'Item required.' };

  // How many does the player carry?
  let available = 0;
  for (const s of player.inventory) {
    if (s && s.name && s.name.toLowerCase() === nameLower) available += s.count;
  }
  if (available <= 0) return { ok: false, reason: `You don't have "${itemName}".` };

  let amt = count === 'all' ? available : Math.min(available, Math.max(0, count | 0));
  if (amt <= 0) return { ok: false, reason: 'Count must be > 0.' };

  // Resolve item id from first matching inventory slot
  let sourceSlot = -1;
  for (let i = 0; i < player.inventory.length; i++) {
    const s = player.inventory[i];
    if (s && s.name && s.name.toLowerCase() === nameLower) { sourceSlot = i; break; }
  }
  if (sourceSlot < 0) return { ok: false, reason: 'Item not in inventory.' };
  const srcItem = player.inventory[sourceSlot];
  const def = items.get(srcItem.id);
  if (def && def.tradeable === false && !def.bankable) {
    // Default to allowing — only block when explicitly untradeable AND not bankable.
    // In OSRS even untradeable items usually bank, so we lean permissive.
  }

  // Remove from inventory
  let removed = 0;
  for (let i = 0; i < player.inventory.length && removed < amt; i++) {
    const s = player.inventory[i];
    if (s && s.id === srcItem.id) {
      if (s.count <= amt - removed) { removed += s.count; player.inventory[i] = null; }
      else { s.count -= amt - removed; removed = amt; }
    }
  }

  // Determine tab: existing item keeps its tab; new item goes to specified tab or 0.
  const existing = player.bank.find(b => b.id === srcItem.id);
  let tabId = 0;
  if (existing) {
    if (existing.placeholder) {
      existing.placeholder = false;
      existing.count = 0;
    }
    existing.count += removed;
    tabId = existing.tab || 0;
  } else {
    if (tabName) {
      const tid = findTabIdByName(player, tabName);
      if (tid < 0) return { ok: false, reason: `Unknown tab "${tabName}".` };
      tabId = tid;
    }
    if (player.bank.length >= BANK_SIZE) return { ok: false, reason: 'Bank is full.' };
    player.bank.push({ id: srcItem.id, name: srcItem.name, count: removed, tab: tabId, placeholder: false });
  }

  return { ok: true, item: srcItem.name, count: removed, tab: tabId };
}

/**
 * withdraw(player, ctx, itemName, count, opts?) ->
 *   { ok, item?, count?, reason? }
 *
 * ctx: { items, invAdd, invFreeSlots }
 * count: integer | 'all'
 * opts: { noted?: boolean }
 */
function withdraw(player, ctx, itemName, count, opts) {
  const items = requireItems(ctx);
  if (typeof ctx.invAdd !== 'function' || typeof ctx.invFreeSlots !== 'function') {
    throw new Error('bank.withdraw: ctx.invAdd / invFreeSlots required');
  }
  ensureBankState(player);

  const gate = pinGate(player);
  if (!gate.ok) return { ok: false, reason: gate.reason };

  const nameLower = String(itemName || '').toLowerCase();
  if (!nameLower) return { ok: false, reason: 'Item required.' };

  const bankIdx = player.bank.findIndex(b => b.name.toLowerCase() === nameLower && !b.placeholder);
  if (bankIdx < 0) return { ok: false, reason: `"${itemName}" not in bank.` };

  const entry = player.bank[bankIdx];
  const amt = count === 'all' ? entry.count : Math.max(0, count | 0);
  if (amt <= 0) return { ok: false, reason: 'Count must be > 0.' };
  const take = Math.min(amt, entry.count);
  if (take <= 0) return { ok: false, reason: 'Bank has zero of that item.' };

  if (ctx.invFreeSlots(player) < 1) {
    // Stackables can fold into existing slot even if "full" — check.
    const def = items.get(entry.id);
    const stackable = !!(def && def.stackable);
    const hasStack = stackable && player.inventory.some(s => s && s.id === entry.id);
    if (!hasStack) return { ok: false, reason: 'Inventory is full.' };
  }

  const def = items.get(entry.id);
  const stackable = !!(def && (def.stackable || (opts && opts.noted)));
  const ok = ctx.invAdd(player, entry.id, entry.name, take, stackable);
  if (!ok) return { ok: false, reason: 'Inventory is full.' };

  entry.count -= take;
  if (entry.count <= 0) {
    if (player.placeholdersOn) {
      entry.count = 0;
      entry.placeholder = true;
    } else {
      player.bank.splice(bankIdx, 1);
    }
  }
  return { ok: true, item: entry.name, count: take };
}

// ── Bulk deposits ───────────────────────────────────────────────────────────

function depositInventory(player, ctx) {
  const items = requireItems(ctx);
  ensureBankState(player);
  const gate = pinGate(player);
  if (!gate.ok) return { ok: false, reason: gate.reason };

  let deposited = 0;
  for (let i = 0; i < player.inventory.length; i++) {
    const s = player.inventory[i];
    if (!s) continue;
    const def = items.get(s.id);
    if (def && def.tradeable === false) continue;
    const existing = player.bank.find(b => b.id === s.id);
    if (existing) {
      if (existing.placeholder) { existing.placeholder = false; existing.count = 0; }
      existing.count += s.count;
    } else {
      if (player.bank.length >= BANK_SIZE) continue;
      player.bank.push({ id: s.id, name: s.name, count: s.count, tab: 0, placeholder: false });
    }
    deposited += s.count;
    player.inventory[i] = null;
  }
  return { ok: true, count: deposited };
}

function depositWorn(player, ctx) {
  const items = requireItems(ctx);
  ensureBankState(player);
  const gate = pinGate(player);
  if (!gate.ok) return { ok: false, reason: gate.reason };

  let deposited = 0;
  const slots = Object.keys(player.equipment || {});
  for (const slot of slots) {
    const item = player.equipment[slot];
    if (!item) continue;
    const def = items.get(item.id);
    if (def && def.tradeable === false) continue;
    const existing = player.bank.find(b => b.id === item.id);
    if (existing) {
      if (existing.placeholder) { existing.placeholder = false; existing.count = 0; }
      existing.count += 1;
    } else {
      if (player.bank.length >= BANK_SIZE) continue;
      player.bank.push({ id: item.id, name: item.name, count: 1, tab: 0, placeholder: false });
    }
    deposited++;
    delete player.equipment[slot];
  }
  return { ok: true, count: deposited };
}

/**
 * trackLoot(player, itemId, count) — called by whoever awards loot. The worn
 * session (opt-in) is ignored here; deposit-loot walks player.lootLog.
 */
function trackLoot(player, itemId, count, nameOrNow) {
  ensureBankState(player);
  const at = typeof nameOrNow === 'number' ? nameOrNow : Date.now();
  player.lootLog.push({ id: itemId | 0, count: (count | 0) || 1, at });
  // Trim very old entries occasionally
  if (player.lootLog.length > 256) {
    const cutoff = at - WORN_SESSION_MS;
    player.lootLog = player.lootLog.filter(x => x.at >= cutoff);
  }
}

function depositLoot(player, ctx, nowMs) {
  const items = requireItems(ctx);
  ensureBankState(player);
  const gate = pinGate(player);
  if (!gate.ok) return { ok: false, reason: gate.reason };

  const at = typeof nowMs === 'number' ? nowMs : Date.now();
  const cutoff = at - WORN_SESSION_MS;
  const eligible = new Map(); // id -> count
  for (const row of player.lootLog) {
    if (row.at < cutoff) continue;
    eligible.set(row.id, (eligible.get(row.id) || 0) + (row.count | 0));
  }
  if (eligible.size === 0) return { ok: true, count: 0 };

  let deposited = 0;
  for (const [id, wanted] of eligible.entries()) {
    const carried = player.inventory.filter(s => s && s.id === id).reduce((a, b) => a + b.count, 0);
    if (carried <= 0) continue;
    const take = Math.min(carried, wanted);
    // Remove from inventory
    let rm = 0;
    for (let i = 0; i < player.inventory.length && rm < take; i++) {
      const s = player.inventory[i];
      if (s && s.id === id) {
        if (s.count <= take - rm) { rm += s.count; player.inventory[i] = null; }
        else { s.count -= take - rm; rm = take; }
      }
    }
    const def = items.get(id);
    const name = (def && def.name) || (player.inventory.find(s => s && s.id === id)?.name) || `item_${id}`;
    const existing = player.bank.find(b => b.id === id);
    if (existing) {
      if (existing.placeholder) { existing.placeholder = false; existing.count = 0; }
      existing.count += rm;
    } else if (player.bank.length < BANK_SIZE) {
      player.bank.push({ id, name, count: rm, tab: 0, placeholder: false });
    }
    deposited += rm;
  }
  // Clear consumed entries
  player.lootLog = player.lootLog.filter(x => x.at >= cutoff && !eligible.has(x.id));
  return { ok: true, count: deposited };
}

// ── Placeholder toggle ──────────────────────────────────────────────────────

function setPlaceholders(player, on) {
  ensureBankState(player);
  player.placeholdersOn = !!on;
  if (!player.placeholdersOn) {
    // Drop any zero-count placeholders when toggled off.
    player.bank = player.bank.filter(e => !e.placeholder);
  }
  return { ok: true, on: player.placeholdersOn };
}

// ── Search (by name, tag, region) ───────────────────────────────────────────

/**
 * implicitTags(def) — derive tags from the item definition.
 *   - category (weapon/food/potion/herb/rune/ore/log/arrow/armor/tool/seed/gem)
 *   - equipSlot if present
 *   - stackable / tradeable keywords
 */
function implicitTags(def) {
  const tags = new Set();
  if (!def) return tags;
  if (def.category) tags.add(String(def.category).toLowerCase());
  if (def.equipSlot) tags.add(String(def.equipSlot).toLowerCase());
  if (def.stackable) tags.add('stackable');
  if (def.tradeable) tags.add('tradeable');
  if (def.noted) tags.add('noted');
  if (def.members) tags.add('members');
  if (def.region) tags.add(String(def.region).toLowerCase());
  if (def.origin) tags.add(String(def.origin).toLowerCase());
  // Common name-derived tags
  const nm = (def.name || '').toLowerCase();
  if (/potion|brew|serum|elixir/.test(nm)) tags.add('potion');
  if (/(raw )?(shrimp|trout|salmon|lobster|tuna|shark|swordfish|monkfish|anglerfish|karambwan)/.test(nm)) tags.add('food');
  if (/(bones?$| bones)/.test(nm)) tags.add('prayer');
  if (/(rune$|rune of|chaos rune|nature rune|law rune|soul rune|death rune)/.test(nm)) tags.add('rune');
  if (/(sword|dagger|scimitar|mace|hammer|axe$|battleaxe|spear|pike|halberd)/.test(nm)) tags.add('weapon');
  if (/(bow|crossbow|arrows?|bolts?)/.test(nm)) tags.add('ranged');
  if (/(guam|marrentill|tarromin|harralander|ranarr|toadflax|irit|avantoe|kwuarm|snapdragon|cadantine|lantadyme|dwarf weed|torstol)/.test(nm)) tags.add('herb');
  if (/(log$| logs)/.test(nm)) tags.add('log');
  if (/ore$/.test(nm)) tags.add('ore');
  return tags;
}

function search(player, ctx, query, opts) {
  const items = requireItems(ctx);
  ensureBankState(player);
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];
  const region = opts && opts.region ? String(opts.region).toLowerCase() : null;

  const matches = [];
  for (const entry of player.bank) {
    const def = items.get(entry.id);
    const tags = implicitTags(def);
    const nameHit = entry.name.toLowerCase().includes(q);
    const tagHit = tags.has(q);
    if (!nameHit && !tagHit) continue;
    if (region) {
      const ok = tags.has(region) || (def && def.region && String(def.region).toLowerCase() === region);
      if (!ok) continue;
    }
    matches.push({
      id: entry.id,
      name: entry.name,
      count: entry.count,
      tab: entry.tab || 0,
      placeholder: !!entry.placeholder,
      tags: [...tags],
    });
  }
  return matches;
}

// ── Examine text ────────────────────────────────────────────────────────────

function examine(ctx, itemNameOrId) {
  const items = requireItems(ctx);
  let def = null;
  if (typeof itemNameOrId === 'number') def = items.get(itemNameOrId);
  else if (typeof itemNameOrId === 'string') {
    def = items.find ? items.find(itemNameOrId) : null;
    if (!def) {
      for (const id of (items.items ? items.items.keys() : [])) {
        const d = items.get(id);
        if (d && d.name && d.name.toLowerCase() === itemNameOrId.toLowerCase()) { def = d; break; }
      }
    }
  }
  if (!def) return { ok: false, reason: `Unknown item.` };
  return { ok: true, id: def.id, name: def.name, examine: def.examine || `It's ${def.name.toLowerCase()}.` };
}

// ── Inventory right-click menu protocol ─────────────────────────────────────

/**
 * Emit the ws payload describing available actions for a given inventory slot.
 * Actions inferred from item category / slot:
 *   - food / potion → "eat" / "drink"
 *   - weapon / armor / cape / ring / etc → "wield" (or "wear")
 *   - stackable or non-stackable → always "drop"
 *   - noteable → "note"; noted → "unnote"
 *   - everything → "use", "examine"
 */
function buildContextMenu(player, ctx, slot) {
  const items = requireItems(ctx);
  ensureBankState(player);
  const entry = player.inventory[slot | 0];
  if (!entry) return { type: 'inventory_context_menu', slot, actions: [] };
  const def = items.get(entry.id) || {};

  const actions = [];
  const cat = String(def.category || '').toLowerCase();
  const nm = String(entry.name || '').toLowerCase();

  if (cat === 'food' || /shrimps?$|lobster|shark|swordfish|chicken|beef|trout|salmon|cake|bread|pie$/.test(nm)) {
    actions.push('eat');
  }
  if (cat === 'potion' || /potion|brew|serum|elixir/.test(nm)) {
    actions.push('drink');
  }
  if (def.equipSlot) {
    actions.push(def.equipSlot === 'weapon' || def.equipSlot === 'shield' ? 'wield' : 'wear');
  }
  if (def.noteable || def.noted) {
    actions.push(def.noted ? 'unnote' : 'note');
  }
  actions.push('use');
  actions.push('drop');
  actions.push('examine');

  return {
    type: 'inventory_context_menu',
    slot,
    itemId: entry.id,
    itemName: entry.name,
    count: entry.count,
    actions,
  };
}

// ── Bank Value Estimator ────────────────────────────────────────────────────

function bankValue(player, ctx) {
  const items = requireItems(ctx);
  ensureBankState(player);
  let ge = null;
  try { ge = require('./ge-runner'); } catch (_e) { ge = null; }

  let total = 0;
  const byItem = [];
  for (const entry of player.bank) {
    if (entry.placeholder || entry.count <= 0) continue;
    const def = items.get(entry.id) || {};
    let unit = 0;
    if (ge && typeof ge.getGuidePrice === 'function') {
      unit = ge.getGuidePrice(entry.id) || 0;
    }
    if (!unit && typeof def.value === 'number') unit = def.value;
    unit = Math.max(0, unit | 0);
    const sub = unit * entry.count;
    total += sub;
    byItem.push({ id: entry.id, name: entry.name, count: entry.count, unit, value: sub });
  }
  byItem.sort((a, b) => b.value - a.value);
  const top = byItem.slice(0, 5);
  return { ok: true, total, top5: top, items: byItem.length };
}

// ── Tab-aware view ──────────────────────────────────────────────────────────

function viewTab(player, tabIdOrName) {
  ensureBankState(player);
  let id = 0;
  if (typeof tabIdOrName === 'number') id = tabIdOrName | 0;
  else id = findTabIdByName(player, tabIdOrName);
  if (id < 0) id = 0;
  const rows = [];
  for (const entry of player.bank) {
    if (id === 0 || (entry.tab || 0) === id) {
      rows.push({
        id: entry.id,
        name: entry.name,
        count: entry.count,
        tab: entry.tab || 0,
        placeholder: !!entry.placeholder,
      });
    }
  }
  return { ok: true, tab: id, name: id === 0 ? 'All' : (player.bankTabs[id] || null), rows };
}

// ── Public API ──────────────────────────────────────────────────────────────

module.exports = {
  // State
  ensureBankState,

  // PIN
  pinGate,

  // Tabs
  listTabs, createTab, renameTab, deleteTab, moveToTab, findTabIdByName,

  // Operations
  deposit, withdraw,
  depositInventory, depositWorn, depositLoot, trackLoot,

  // Placeholders
  setPlaceholders,

  // Search
  search, implicitTags,

  // Examine
  examine,

  // Context menu
  buildContextMenu,

  // Value
  bankValue,

  // View
  viewTab,

  // Constants
  BANK_SIZE, TAB_COUNT, TAB_MIN_CUSTOM, TAB_MAX_CUSTOM,
  WORN_SESSION_MS, MAX_TAB_NAME_LEN,
};
