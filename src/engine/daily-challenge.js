// ══════════════════════════════════════════════════════════════════════════════
// Daily Challenge Runner — one deterministic challenge per player per UTC day
//
// Gap: player.dailyChallenge was read by commands/all.js but was only ever
// populated in server.js login with a 12-template pool. This module takes
// ownership: a larger cross-region pool, a seeded pick keyed on (playerId,
// UTC date), progress/claim tracking, history, and a tick-loop hook that
// rolls the day over at midnight UTC.
//
// Design notes:
//   - Persistence: player.dailyChallenge (today's task) and
//     player.dailyChallengeHistory (last N completed) round-trip through the
//     existing JSON save as plain objects.
//   - Determinism: dailyChallengeFor(player, date) is deterministic; tests
//     can freeze the date and get the same template every time.
//   - Reward scaling: base * tierMultiplier. Tier = floor((totalLevel-100)/100)
//     clamped to 0..5. A fresh player gets base rewards; a 1800 total gets 5x.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const tickSys = require('./tick');
const events = require('./events');
const player = require('../player/player');

// ── Seeded RNG (mulberry32) ──────────────────────────────────────────────────
function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t |= 0; t = (t + 0x6D2B79F5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  // FNV-1a 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// ── Date helpers (UTC) ───────────────────────────────────────────────────────

function utcDateKey(date) {
  const d = date instanceof Date ? date : new Date(date || Date.now());
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function utcDayEpochMs(date) {
  const d = date instanceof Date ? date : new Date(date || Date.now());
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

// ── Challenge template pool ──────────────────────────────────────────────────
// 50+ templates spanning every region and most skill lines. Templates are pure
// data (no closures) so the deterministic pick is fully reproducible.

const templates = [];

function tpl(obj) {
  templates.push(Object.freeze(Object.assign({}, obj)));
}

// Heartlands
tpl({ id: 'kill_goblins_10',       region: 'heartlands', type: 'kill', targetName: 'goblin',       goal: 10, rewardType: 'coins', reward: 500 });
tpl({ id: 'kill_cows_12',          region: 'heartlands', type: 'kill', targetName: 'cow',          goal: 12, rewardType: 'coins', reward: 600 });
tpl({ id: 'kill_chickens_15',      region: 'heartlands', type: 'kill', targetName: 'chicken',      goal: 15, rewardType: 'coins', reward: 300 });
tpl({ id: 'kill_guards_5',         region: 'heartlands', type: 'kill', targetName: 'guard',        goal: 5,  rewardType: 'coins', reward: 1200 });
tpl({ id: 'kill_giants_5',         region: 'heartlands', type: 'kill', targetName: 'hill giant',   goal: 5,  rewardType: 'coins', reward: 2000 });
tpl({ id: 'cook_shrimps_20',       region: 'heartlands', type: 'cook', targetName: 'shrimps',      goal: 20, rewardType: 'xp',    reward: 1000, rewardSkill: 'cooking' });
tpl({ id: 'cook_trout_15',         region: 'heartlands', type: 'cook', targetName: 'trout',        goal: 15, rewardType: 'xp',    reward: 2500, rewardSkill: 'cooking' });
tpl({ id: 'cook_lobster_10',       region: 'heartlands', type: 'cook', targetName: 'lobster',      goal: 10, rewardType: 'xp',    reward: 3500, rewardSkill: 'cooking' });
tpl({ id: 'fish_shrimps_20',       region: 'heartlands', type: 'fish', targetName: 'raw shrimps',  goal: 20, rewardType: 'xp',    reward: 800,  rewardSkill: 'fishing' });
tpl({ id: 'fish_trout_15',         region: 'heartlands', type: 'fish', targetName: 'raw trout',    goal: 15, rewardType: 'xp',    reward: 1500, rewardSkill: 'fishing' });
tpl({ id: 'chop_logs_30',          region: 'heartlands', type: 'chop', targetName: 'logs',         goal: 30, rewardType: 'xp',    reward: 1000, rewardSkill: 'woodcutting' });
tpl({ id: 'chop_oak_15',           region: 'heartlands', type: 'chop', targetName: 'oak logs',     goal: 15, rewardType: 'xp',    reward: 1500, rewardSkill: 'woodcutting' });
tpl({ id: 'mine_copper_15',        region: 'heartlands', type: 'mine', targetName: 'copper ore',   goal: 15, rewardType: 'xp',    reward: 800,  rewardSkill: 'mining' });
tpl({ id: 'mine_iron_10',          region: 'heartlands', type: 'mine', targetName: 'iron ore',     goal: 10, rewardType: 'xp',    reward: 1500, rewardSkill: 'mining' });

// Sootworks
tpl({ id: 'mine_coal_20',          region: 'sootworks',  type: 'mine', targetName: 'coal',         goal: 20, rewardType: 'xp',    reward: 2500, rewardSkill: 'mining' });
tpl({ id: 'mine_mithril_8',        region: 'sootworks',  type: 'mine', targetName: 'mithril ore',  goal: 8,  rewardType: 'xp',    reward: 3500, rewardSkill: 'mining' });
tpl({ id: 'smith_steel_bars_15',   region: 'sootworks',  type: 'smelt',targetName: 'steel bar',    goal: 15, rewardType: 'xp',    reward: 2500, rewardSkill: 'smithing' });
tpl({ id: 'smith_mithril_bars_10', region: 'sootworks',  type: 'smelt',targetName: 'mithril bar',  goal: 10, rewardType: 'xp',    reward: 3500, rewardSkill: 'smithing' });
tpl({ id: 'kill_sootwyrms_4',      region: 'sootworks',  type: 'kill', targetName: 'sootwyrm',     goal: 4,  rewardType: 'coins', reward: 4000 });
tpl({ id: 'sootworks_minigame_3',  region: 'sootworks',  type: 'minigame', targetName: 'blast_furnace', goal: 3, rewardType: 'coins', reward: 3000 });

// Moryskah
tpl({ id: 'pray_bones_30',         region: 'moryskah',   type: 'bury', targetName: 'bones',        goal: 30, rewardType: 'xp',    reward: 1000, rewardSkill: 'prayer' });
tpl({ id: 'pray_big_bones_10',     region: 'moryskah',   type: 'bury', targetName: 'big bones',    goal: 10, rewardType: 'xp',    reward: 1500, rewardSkill: 'prayer' });
tpl({ id: 'kill_barrows_brother',  region: 'moryskah',   type: 'kill', targetName: 'barrows brother', goal: 1, rewardType: 'coins', reward: 5000 });
tpl({ id: 'slay_skeletons_15',     region: 'moryskah',   type: 'kill', targetName: 'skeleton',     goal: 15, rewardType: 'xp',    reward: 2000, rewardSkill: 'slayer' });

// Veilwood
tpl({ id: 'chop_yew_10',           region: 'veilwood',   type: 'chop', targetName: 'yew logs',     goal: 10, rewardType: 'xp',    reward: 3000, rewardSkill: 'woodcutting' });
tpl({ id: 'chop_magic_5',          region: 'veilwood',   type: 'chop', targetName: 'magic logs',   goal: 5,  rewardType: 'xp',    reward: 4500, rewardSkill: 'woodcutting' });
tpl({ id: 'hunter_chinchompa_12',  region: 'veilwood',   type: 'hunt', targetName: 'chinchompa',   goal: 12, rewardType: 'xp',    reward: 3500, rewardSkill: 'hunter' });
tpl({ id: 'farming_herbs_8',       region: 'veilwood',   type: 'farm', targetName: 'herb',         goal: 8,  rewardType: 'xp',    reward: 3000, rewardSkill: 'farming' });

// Boneyard Wastes
tpl({ id: 'slay_zombies_20',       region: 'boneyard_wastes', type: 'kill', targetName: 'zombie',   goal: 20, rewardType: 'xp',   reward: 2500, rewardSkill: 'slayer' });
tpl({ id: 'slay_ghosts_15',        region: 'boneyard_wastes', type: 'kill', targetName: 'ghost',    goal: 15, rewardType: 'xp',   reward: 3000, rewardSkill: 'slayer' });
tpl({ id: 'pray_demonic_bones_5',  region: 'boneyard_wastes', type: 'bury', targetName: 'demonic bones', goal: 5, rewardType: 'xp', reward: 3500, rewardSkill: 'prayer' });

// Saltbrine Reach
tpl({ id: 'fish_sharks_5',         region: 'saltbrine_reach', type: 'fish', targetName: 'raw shark', goal: 5, rewardType: 'xp',    reward: 2500, rewardSkill: 'fishing' });
tpl({ id: 'fish_monkfish_10',      region: 'saltbrine_reach', type: 'fish', targetName: 'raw monkfish', goal: 10, rewardType: 'xp', reward: 3500, rewardSkill: 'fishing' });
tpl({ id: 'kill_pirates_10',       region: 'saltbrine_reach', type: 'kill', targetName: 'pirate',    goal: 10, rewardType: 'coins',reward: 2500 });
tpl({ id: 'cook_sharks_5',         region: 'saltbrine_reach', type: 'cook', targetName: 'shark',    goal: 5,  rewardType: 'xp',    reward: 3500, rewardSkill: 'cooking' });

// Inkweald
tpl({ id: 'craft_runes_100',       region: 'inkweald',   type: 'craft',targetName: 'rune',         goal: 100, rewardType: 'xp',   reward: 2500, rewardSkill: 'runecrafting' });
tpl({ id: 'fletching_bows_20',     region: 'inkweald',   type: 'fletch',targetName: 'yew shortbow',goal: 20, rewardType: 'xp',    reward: 3000, rewardSkill: 'fletching' });
tpl({ id: 'pick_silk_30',          region: 'inkweald',   type: 'thieve',targetName: 'silk stall',  goal: 30, rewardType: 'xp',    reward: 2000, rewardSkill: 'thieving' });

// Glass Desert
tpl({ id: 'mine_granite_10',       region: 'glass_desert',type: 'mine', targetName: 'granite',     goal: 10, rewardType: 'xp',    reward: 3500, rewardSkill: 'mining' });
tpl({ id: 'slay_wyrms_4',          region: 'glass_desert',type: 'kill', targetName: 'desert wyrm', goal: 4,  rewardType: 'xp',    reward: 4000, rewardSkill: 'slayer' });
tpl({ id: 'fletch_magic_bows_8',   region: 'glass_desert',type: 'fletch',targetName: 'magic shortbow', goal: 8, rewardType: 'xp', reward: 4500, rewardSkill: 'fletching' });

// Cross-region
tpl({ id: 'minigames_3',           region: 'any',        type: 'minigame', targetName: 'any',       goal: 3,  rewardType: 'coins', reward: 3000 });
tpl({ id: 'ge_profit_100k',        region: 'any',        type: 'ge_profit',targetName: 'coins',     goal: 100000, rewardType: 'coins', reward: 5000 });
tpl({ id: 'visit_all_regions',     region: 'any',        type: 'visit',targetName: 'all_regions',   goal: 9,  rewardType: 'coins', reward: 7500 });
tpl({ id: 'agility_laps_20',       region: 'any',        type: 'agility', targetName: 'any',        goal: 20, rewardType: 'xp',    reward: 2500, rewardSkill: 'agility' });
tpl({ id: 'firemaking_logs_50',    region: 'any',        type: 'firemake',targetName: 'logs',       goal: 50, rewardType: 'xp',    reward: 2000, rewardSkill: 'firemaking' });
tpl({ id: 'clue_scroll_1',         region: 'any',        type: 'clue',  targetName: 'easy',         goal: 1,  rewardType: 'coins', reward: 4000 });
tpl({ id: 'random_event_1',        region: 'any',        type: 'random_event', targetName: 'any',   goal: 1,  rewardType: 'coins', reward: 2500 });
tpl({ id: 'drop_hunt_dragon_bones', region: 'any',       type: 'drop',  targetName: 'dragon bones', goal: 1,  rewardType: 'coins', reward: 5000, multiDay: true });
tpl({ id: 'drop_hunt_dragon_spear', region: 'any',       type: 'drop',  targetName: 'dragon spear', goal: 1,  rewardType: 'coins', reward: 15000, multiDay: true });
tpl({ id: 'drop_hunt_magic_seed',   region: 'any',       type: 'drop',  targetName: 'magic seed',   goal: 1,  rewardType: 'coins', reward: 20000, multiDay: true });
tpl({ id: 'bank_total_10m',         region: 'any',       type: 'bank',  targetName: 'coins',        goal: 10_000_000, rewardType: 'coins', reward: 10000 });

function listTemplates() { return templates.slice(); }

// ── Pick a challenge for (playerId, date) ─────────────────────────────────────

function tierFor(p) {
  const total = typeof player.totalLevel === 'function' ? player.totalLevel(p) : 0;
  return Math.max(0, Math.min(5, Math.floor((total - 100) / 200)));
}

function tierMultiplier(tier) {
  const table = [1, 1.25, 1.5, 2, 2.5, 3];
  return table[Math.max(0, Math.min(table.length - 1, tier))];
}

function dailyChallengeFor(p, date) {
  if (!p || p.id == null) throw new Error('daily-challenge.dailyChallengeFor: player.id required');
  const key = utcDateKey(date);
  const seed = hashSeed(`${p.id}|${key}`);
  const rng = mulberry32(seed);
  const idx = Math.floor(rng() * templates.length);
  const tpl = templates[idx];
  const tier = tierFor(p);
  const mult = tierMultiplier(tier);
  return {
    id: tpl.id,
    dateKey: key,
    generatedAt: utcDayEpochMs(date),
    type: tpl.type,
    targetName: tpl.targetName,
    region: tpl.region,
    goal: tpl.goal,
    progress: 0,
    reward: Math.floor(tpl.reward * mult),
    rewardType: tpl.rewardType,
    rewardSkill: tpl.rewardSkill || null,
    baseReward: tpl.reward,
    tier,
    multiDay: !!tpl.multiDay,
    claimed: false,
    complete: false,
  };
}

// ── Getters / mutators ────────────────────────────────────────────────────────

function getOrGenerate(p, date) {
  const key = utcDateKey(date);
  const cur = p.dailyChallenge;
  if (cur && cur.dateKey === key) return cur;
  // Rollover. If the previous day's challenge was a multi-day drop and not
  // claimed, push it into pending instead of discarding — caller can still
  // claim once obtained.
  if (cur && cur.multiDay && !cur.claimed) {
    p.multiDayChallenges = p.multiDayChallenges || [];
    p.multiDayChallenges.push(cur);
  }
  p.dailyChallenge = dailyChallengeFor(p, date);
  return p.dailyChallenge;
}

function status(p, date) {
  const dc = getOrGenerate(p, date);
  return {
    id: dc.id,
    type: dc.type,
    targetName: dc.targetName,
    goal: dc.goal,
    progress: dc.progress,
    complete: !!dc.complete,
    claimed: !!dc.claimed,
    reward: dc.reward,
    rewardType: dc.rewardType,
    rewardSkill: dc.rewardSkill,
    tier: dc.tier,
    region: dc.region,
    multiDay: !!dc.multiDay,
    dateKey: dc.dateKey,
  };
}

function history(p) {
  return (p.dailyChallengeHistory || []).slice();
}

// progress tracking — server.js hooks this when relevant actions occur.
// kind: 'kill' | 'cook' | 'mine' | 'fish' | 'chop' | 'smelt' | 'craft' |
//       'fletch' | 'thieve' | 'hunt' | 'farm' | 'firemake' | 'agility' |
//       'bury' | 'minigame' | 'visit' | 'random_event' | 'clue' |
//       'ge_profit' | 'drop' | 'bank'
//
// match: arbitrary string — compared case-insensitive against targetName.
// amount: default 1.
//
// Returns { progressed, complete, reward?, rewardType?, rewardSkill? } when the
// challenge matches, or null when no match / already claimed.

function track(p, kind, match, amount, opts) {
  opts = opts || {};
  const date = opts.date;
  const dc = getOrGenerate(p, date);
  if (!dc) return null;
  if (dc.claimed) return null;
  if (dc.type !== kind) return null;

  const want = String(dc.targetName || '').toLowerCase();
  const have = String(match || '').toLowerCase();
  if (want !== 'any' && want !== 'all_regions' && want !== have) return null;

  const n = Math.max(1, Math.floor(amount || 1));
  dc.progress = Math.min(dc.goal, (dc.progress || 0) + n);
  const complete = dc.progress >= dc.goal;
  if (complete && !dc.complete) {
    dc.complete = true;
    try {
      events.emit('daily_challenge_complete', { player: p, challenge: dc });
    } catch (_) {}
  }
  return { progressed: n, total: dc.progress, goal: dc.goal, complete };
}

function claim(p, opts) {
  opts = opts || {};
  const dc = getOrGenerate(p, opts.date);
  if (!dc) return { ok: false, reason: 'No challenge available.' };
  if (!dc.complete) return { ok: false, reason: 'Challenge not complete.' };
  if (dc.claimed) return { ok: false, reason: 'Already claimed.' };

  // Apply reward
  let applied = null;
  try {
    if (dc.rewardType === 'coins') {
      player.invAdd(p, 101, 'Coins', dc.reward, true);
      applied = { type: 'coins', amount: dc.reward };
    } else if (dc.rewardType === 'xp' && dc.rewardSkill) {
      player.addXp(p, dc.rewardSkill, dc.reward);
      applied = { type: 'xp', skill: dc.rewardSkill, amount: dc.reward };
    }
  } catch (e) {
    return { ok: false, reason: `Reward failed: ${e.message}` };
  }
  dc.claimed = true;
  dc.claimedAt = Date.now();

  p.dailyChallengeHistory = p.dailyChallengeHistory || [];
  p.dailyChallengeHistory.push({
    id: dc.id, dateKey: dc.dateKey, type: dc.type, targetName: dc.targetName,
    goal: dc.goal, reward: dc.reward, rewardType: dc.rewardType,
    rewardSkill: dc.rewardSkill, claimedAt: dc.claimedAt,
  });
  if (p.dailyChallengeHistory.length > 100) p.dailyChallengeHistory.shift();

  try {
    events.emit('daily_challenge_claimed', { player: p, challenge: dc, applied });
  } catch (_) {}
  return { ok: true, applied, challenge: dc };
}

function completeChallenge(p, opts) {
  // Convenience — marks the current challenge complete (used in tests + admin).
  const dc = getOrGenerate(p, opts?.date);
  if (!dc) return null;
  dc.progress = dc.goal;
  dc.complete = true;
  return dc;
}

// ── Tick integration: roll over at UTC midnight ──────────────────────────────

let _attached = false;
function attachTickHook(opts) {
  if (_attached) return false;
  opts = opts || {};
  const getPlayers = opts.getPlayers;
  if (typeof getPlayers !== 'function') return false;
  // Roll challenges every N ticks (default every 50 ticks = 30s).
  const interval = opts.intervalTicks || 50;
  tickSys.onTick('daily-challenge', (t) => {
    if (t % interval !== 0) return;
    const today = utcDateKey();
    for (const entry of getPlayers()) {
      const p = entry && entry.id != null ? entry : (entry && entry.p ? entry.p : null);
      if (!p) continue;
      if (!p.dailyChallenge || p.dailyChallenge.dateKey !== today) {
        getOrGenerate(p);
      }
    }
  });
  _attached = true;
  return true;
}

function detachTickHook() {
  tickSys.offTick('daily-challenge');
  _attached = false;
}

module.exports = {
  // deterministic
  dailyChallengeFor, utcDateKey, hashSeed, mulberry32,
  // templates
  listTemplates, tierFor, tierMultiplier,
  // lifecycle
  getOrGenerate, status, history, track, claim, completeChallenge,
  // tick integration
  attachTickHook, detachTickHook,
};
