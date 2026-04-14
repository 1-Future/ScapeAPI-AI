// ══════════════════════════════════════════════════════════════════════════════
// Codex API — read-only endpoints serving the engine's in-memory content
//
// The builder API (/api/content/*) serves builder_entities from Postgres.
// The Codex API (/api/codex/*) serves ALL content: hardcoded + builder-loaded.
// This is what the Codex viewer reads from.
// ══════════════════════════════════════════════════════════════════════════════

const items = require('../data/items');
const npcsModule = require('../world/npcs');
const quests = require('../data/quests');
const shops = require('../data/shops');
const droptables = require('../data/droptables');

function handleCodexRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (req.method !== 'GET') return false;

  const json = (data) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(JSON.stringify(data, null, 2));
  };

  // ── /api/codex/summary — overview of all content ─────────────────────────
  if (path === '/api/codex/summary') {
    const allItems = [...items.items.values()];
    const allNpcDefs = [...npcsModule.npcDefs.values()];
    const allQuests = quests.listAll();
    json({
      items: allItems.length,
      monsters: allNpcDefs.filter(n => n.combat > 0).length,
      npcs: allNpcDefs.filter(n => n.combat === 0).length,
      quests: allQuests.length,
      shops: shops.shops ? [...shops.shops.values()].length : 0,
    });
    return true;
  }

  // ── /api/codex/items — all items ─────────────────────────────────────────
  if (path === '/api/codex/items') {
    const q = url.searchParams.get('q')?.toLowerCase();
    const cat = url.searchParams.get('category');
    let result = [...items.items.values()];
    if (q) result = result.filter(i => i.name.toLowerCase().includes(q) || (i.examine || '').toLowerCase().includes(q));
    if (cat) result = result.filter(i => i.category === cat);
    json(result);
    return true;
  }

  // ── /api/codex/items/:id — single item ────────────────────────────���──────
  if (path.match(/^\/api\/codex\/items\/\d+$/)) {
    const id = parseInt(path.split('/').pop());
    const item = items.get(id);
    if (!item) { res.writeHead(404); res.end('Not found'); return true; }
    // Find which monsters drop this item
    const droppedBy = [];
    for (const [monsterId, table] of (droptables.tables || new Map())) {
      const allDrops = [...(table.always || []), ...(table.main || []), ...(table.tertiary || [])];
      if (allDrops.some(d => d.id === id || d.name === item.name)) {
        const def = npcsModule.npcDefs.get(monsterId);
        droppedBy.push({ monsterId, name: def?.name || monsterId, combat: def?.combat || 0 });
      }
    }
    json({ ...item, droppedBy });
    return true;
  }

  // ── /api/codex/monsters — all combat NPCs ───────────────────────────────��
  if (path === '/api/codex/monsters') {
    const q = url.searchParams.get('q')?.toLowerCase();
    let result = [...npcsModule.npcDefs.entries()]
      .filter(([, def]) => def.combat > 0)
      .map(([id, def]) => ({ defId: id, ...def }));
    if (q) result = result.filter(m => m.name.toLowerCase().includes(q));
    // Sort by combat level
    result.sort((a, b) => a.combat - b.combat);
    json(result);
    return true;
  }

  // ── /api/codex/monsters/:defId — single monster ──────────────────────────
  if (path.match(/^\/api\/codex\/monsters\/[\w-]+$/)) {
    const defId = path.split('/').pop();
    const def = npcsModule.npcDefs.get(defId);
    if (!def) { res.writeHead(404); res.end('Not found'); return true; }
    // Get drop table
    const table = droptables.tables?.get(defId) || null;
    json({ defId, ...def, dropTable: table });
    return true;
  }

  // ── /api/codex/npcs — all non-combat NPCs ────────────────────────────────
  if (path === '/api/codex/npcs') {
    const result = [...npcsModule.npcDefs.entries()]
      .filter(([, def]) => def.combat === 0)
      .map(([id, def]) => ({ defId: id, ...def }));
    json(result);
    return true;
  }

  // ── /api/codex/quests — all quests ──────────────────────────────────���────
  if (path === '/api/codex/quests') {
    json(quests.listAll());
    return true;
  }

  // ── /api/codex/quests/:id — single quest ─────────────────────────────────
  if (path.match(/^\/api\/codex\/quests\/[\w-]+$/)) {
    const qId = path.split('/').pop();
    const quest = quests.getQuest(qId);
    if (!quest) { res.writeHead(404); res.end('Not found'); return true; }
    json(quest);
    return true;
  }

  // ── /api/codex/shops — all shops ─────────────────────────────────────────
  if (path === '/api/codex/shops') {
    if (!shops.shops) { json([]); return true; }
    json([...shops.shops.values()]);
    return true;
  }

  // ── /api/codex/shops/:id — single shop ──────────────────────────���────────
  if (path.match(/^\/api\/codex\/shops\/[\w-]+$/)) {
    const shopId = path.split('/').pop();
    const shop = shops.getShop(shopId);
    if (!shop) { res.writeHead(404); res.end('Not found'); return true; }
    json(shop);
    return true;
  }

  // ── /api/codex/search — universal search across all entity types ─────────
  if (path === '/api/codex/search') {
    const q = url.searchParams.get('q')?.toLowerCase();
    if (!q || q.length < 2) { json([]); return true; }
    const results = [];

    // Search items
    for (const item of items.items.values()) {
      if (item.name.toLowerCase().includes(q) || (item.examine || '').toLowerCase().includes(q)) {
        results.push({ type: 'item', id: item.id, name: item.name, meta: item.examine, extra: item.category });
      }
    }

    // Search monsters
    for (const [defId, def] of npcsModule.npcDefs) {
      if (def.combat > 0 && (def.name.toLowerCase().includes(q) || (def.examine || '').toLowerCase().includes(q))) {
        results.push({ type: 'monster', id: defId, name: def.name, meta: def.examine, extra: `Combat ${def.combat}` });
      }
    }

    // Search NPCs
    for (const [defId, def] of npcsModule.npcDefs) {
      if (def.combat === 0 && def.name.toLowerCase().includes(q)) {
        results.push({ type: 'npc', id: defId, name: def.name, meta: def.examine });
      }
    }

    // Search quests
    for (const quest of quests.listAll()) {
      if (quest.name.toLowerCase().includes(q) || (quest.description || '').toLowerCase().includes(q)) {
        results.push({ type: 'quest', id: quest.id, name: quest.name, meta: quest.description, extra: quest.difficulty });
      }
    }

    // Search shops
    if (shops.shops) {
      for (const shop of shops.shops.values()) {
        if (shop.name.toLowerCase().includes(q)) {
          results.push({ type: 'shop', id: shop.id, name: shop.name, meta: `${shop.stock.length} items` });
        }
      }
    }

    json(results.slice(0, 50)); // Cap at 50 results
    return true;
  }

  // ── /api/codex/docs — list all reference documents ────────────────────────
  if (path === '/api/codex/docs') {
    const fs = require('fs');
    const pathMod = require('path');
    const repos = [
      { id: 'spec', label: 'Game Spec', dir: pathMod.join(__dirname, '..', '..', '..', 'build-your-own-scape', 'docs') },
      { id: 'manifesto', label: 'Manifesto Principles', dir: pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'principles') },
      { id: 'manifesto-scape', label: 'Scape Doctrine', dir: pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'scape-specific') },
    ];
    const result = [];
    for (const repo of repos) {
      try {
        const files = require('fs').readdirSync(repo.dir).filter(f => f.endsWith('.md'));
        for (const f of files) {
          result.push({
            repo: repo.id,
            repoLabel: repo.label,
            filename: f,
            name: f.replace(/\.md$/, '').replace(/^\d+-/, '').replace(/-/g, ' '),
          });
        }
      } catch {}
    }
    json(result);
    return true;
  }

  // ── /api/codex/docs/:repo/:filename — read a document ───────────────────
  if (path.match(/^\/api\/codex\/docs\/[\w-]+\/[\w.-]+$/)) {
    const parts = path.split('/');
    const repoId = parts[4];
    const filename = decodeURIComponent(parts[5]);
    const pathMod = require('path');
    const fs = require('fs');
    const repoDirs = {
      spec: pathMod.join(__dirname, '..', '..', '..', 'build-your-own-scape', 'docs'),
      manifesto: pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'principles'),
      'manifesto-scape': pathMod.join(__dirname, '..', '..', '..', 'ScapeManifesto', 'scape-specific'),
    };
    const dir = repoDirs[repoId];
    if (!dir) { res.writeHead(404); res.end('Unknown repo'); return true; }
    if (!filename.endsWith('.md') || filename.includes('..')) { res.writeHead(400); res.end('Invalid filename'); return true; }
    const docPath = pathMod.join(dir, filename);
    try {
      const content = fs.readFileSync(docPath, 'utf8');
      json({ repo: repoId, filename, content });
    } catch { res.writeHead(404); res.end('Not found'); }
    return true;
  }

  return false;
}

module.exports = { handleCodexRequest };
