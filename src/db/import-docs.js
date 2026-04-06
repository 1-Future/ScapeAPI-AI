#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Import build-your-own-scape design docs into the database
// 80 docs, ~832 plugins, 31,829 lines of spec
// ══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const db = require('./index');

const DOCS_DIR = path.join(__dirname, '..', '..', '..', 'build-your-own-scape', 'docs');
const REGISTRY_FILE = path.join(DOCS_DIR, 'plugin-registry.md');

// Map doc filenames to mechanic categories
const DOC_CATEGORY_MAP = {
  'tick-system': 'engine',
  'engine-architecture': 'engine',
  'data-persistence': 'engine',
  'combat-system': 'combat',
  'skills-combat': 'combat',
  'bosses-raids': 'combat',
  'monsters': 'combat',
  'pvp-wilderness': 'combat',
  'death-system': 'defense',
  'equipment': 'defense',
  'skills': 'skills',
  'skills-gathering': 'skills',
  'skills-processing': 'skills',
  'skills-combining': 'skills',
  'skills-activity': 'skills',
  'crafting-system': 'skills',
  'player-progression': 'skills',
  'terrain': 'movement',
  'transportation': 'movement',
  'locations': 'movement',
  'buildings': 'movement',
  'structures-catalog': 'movement',
  'npcs': 'targeting',
  'dialogue': 'targeting',
  'pet-companion': 'targeting',
  'quests': 'spawning',
  'random-events': 'spawning',
  'minigames': 'spawning',
  'world-events': 'spawning',
  'dailies': 'spawning',
  'items': 'economy',
  'shops': 'economy',
  'economy': 'economy',
  'inventory-bank': 'economy',
  'monetization': 'economy',
  'games-of-chance': 'economy',
  'treasure-trails': 'economy',
  'animation-system': 'visual',
  'camera-system': 'visual',
  'minimap-worldmap': 'visual',
  'music-audio': 'visual',
  'emote-system': 'visual',
  'collection-log': 'visual',
  'achievements': 'visual',
  'communication': 'visual',
  'friends-social': 'visual',
  'clan-system': 'visual',
  'character-creation': 'visual',
  'character-overview': 'visual',
  'account-management': 'visual',
  'rules-moderation': 'visual',
  'bot-detection': 'engine',
  'security': 'engine',
  'modes': 'engine',
  'accessibility': 'visual',
  'localization': 'visual',
  'content-pipeline': 'engine',
  'content-rating': 'engine',
  'plugin-audit': 'engine',
  'plugin-registry': 'engine',
  'server-stats-voting': 'engine',
  'external-integrations': 'engine',
  'nature-catalog': 'movement',
  'architectural-styles': 'movement',
  'settlement-design': 'movement',
  'asset-system': 'engine',
  'world-builder-tools': 'engine',
  'lore-bible': 'visual',
  'narrative-design': 'visual',
  'philosophy-extractor': 'engine',
  'project-philosophy': 'engine',
  'game2tools': 'engine',
  'game2tools-plus': 'engine',
  'data-miner': 'engine',
  'dm-dashboard': 'engine',
  'puzzles': 'spawning',
  'player-housing': 'skills',
  'tutorial-onboarding': 'visual',
  'multiplayer-scaling': 'engine',
};

async function run() {
  console.log('═══ Build Your Own Scape — Design Doc Import ═══\n');

  // ── Step 1: Import each design doc as a top-level mechanic ──
  const docFiles = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.md')).sort();
  let docCount = 0;
  let pluginCount = 0;

  for (const file of docFiles) {
    const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf8');
    const basename = file.replace('.md', '');
    const category = DOC_CATEGORY_MAP[basename] || 'engine';

    // Extract title
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : basename.replace(/-/g, ' ');

    // Extract description (first non-empty paragraph after title)
    const descMatch = content.match(/^# .+\n+(.+?)(?:\n\n|\n---)/s);
    const desc = descMatch ? descMatch[1].trim().slice(0, 300) : '';

    // Count lines as a rough size indicator
    const lines = content.split('\n').length;

    const docId = `doc-${basename}`;
    await db.query(
      `INSERT INTO mechanics (id, category_id, name, description, status, source_files, notes)
       VALUES ($1, $2, $3, $4, 'implemented', $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description,
         category_id = EXCLUDED.category_id, source_files = EXCLUDED.source_files,
         notes = EXCLUDED.notes, updated_at = NOW()`,
      [docId, category, title, desc,
       [`build-your-own-scape/docs/${file}`],
       `Design doc: ${lines} lines`]
    );
    docCount++;

    // ── Extract plugins from this doc ──
    // Plugins are table rows like: | Plugin Name | Description |
    const pluginLines = content.match(/^\| [A-Z].+\|.+\|$/gm) || [];
    for (const line of pluginLines) {
      const parts = line.split('|').map(s => s.trim()).filter(Boolean);
      if (parts.length < 2) continue;
      const pluginName = parts[0];
      const pluginDesc = parts[1];

      // Skip headers and summary rows
      if (pluginName === 'Plugin' || pluginName === 'Category' ||
          pluginName.startsWith('**') || pluginName.startsWith('---') ||
          pluginName.includes('Count') || pluginName.includes('Total')) continue;

      const pluginId = `plugin-${basename}-${pluginName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;

      await db.query(
        `INSERT INTO mechanics (id, category_id, name, description, status, source_files, notes)
         VALUES ($1, $2, $3, $4, 'not_implemented', $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, description = EXCLUDED.description,
           source_files = EXCLUDED.source_files, updated_at = NOW()`,
        [pluginId, category, pluginName, pluginDesc,
         [`build-your-own-scape/docs/${file}`],
         `Plugin from ${title}`]
      ).catch(() => {}); // Skip duplicates silently

      // Link plugin to parent doc
      await db.query(
        `INSERT INTO mechanic_usages (mechanic_id, entity_type, entity_name, notes)
         VALUES ($1, 'doc', $2, $3)
         ON CONFLICT DO NOTHING`,
        [pluginId, basename, `Defined in ${title}`]
      ).catch(() => {});

      pluginCount++;
    }
  }
  console.log(`[1/2] Imported ${docCount} design docs, ${pluginCount} plugins`);

  // ── Step 2: Import plugin registry categories and counts ──
  let registryCount = 0;
  try {
    const content = fs.readFileSync(REGISTRY_FILE, 'utf8');

    // Parse the summary table for category counts
    const summaryMatch = content.match(/## Summary\n\n\|.+\n\|.+\n([\s\S]+?)(?=\n\n)/);
    if (summaryMatch) {
      const rows = summaryMatch[1].split('\n').filter(r => r.startsWith('|'));
      for (const row of rows) {
        const parts = row.split('|').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3 && !parts[0].startsWith('**')) {
          registryCount++;
        }
      }
    }
  } catch (err) {
    console.error('  Error reading plugin registry:', err.message);
  }
  console.log(`[2/2] Parsed ${registryCount} plugin categories from registry`);

  // ── Summary ──
  const total = await db.queryOne('SELECT COUNT(*) as count FROM mechanics');
  const byCat = await db.queryAll(`
    SELECT category_id, COUNT(*) as count
    FROM mechanics GROUP BY category_id ORDER BY count DESC
  `);
  const byStatus = await db.queryAll(`
    SELECT status, COUNT(*) as count
    FROM mechanics GROUP BY status ORDER BY count DESC
  `);

  console.log(`\n═══ Import Complete ═══`);
  console.log(`Total mechanics in database: ${total.count}`);
  console.log('\nBy category:');
  byCat.forEach(r => console.log(`  ${r.category_id.padEnd(12)} ${r.count}`));
  console.log('\nBy status:');
  byStatus.forEach(r => console.log(`  ${r.status.padEnd(20)} ${r.count}`));

  process.exit(0);
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
