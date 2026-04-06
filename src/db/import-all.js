#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════════════════════
// Import everything into the Scape database
// - 43 test files from ScapeTests (500 individual tests)
// - 941 lines of mechanics from IMPLEMENTATION.md (18 tiers)
// - Test results from ScapeTests/results/
// ══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const db = require('./index');

const TESTS_DIR = path.join(__dirname, '..', '..', '..', 'ScapeTests', 'tests');
const RESULTS_DIR = path.join(__dirname, '..', '..', '..', 'ScapeTests', 'results');
const IMPL_FILE = path.join(__dirname, '..', '..', 'IMPLEMENTATION.md');

// ── Map test file numbers to categories ─────────────────────────────────────
const FILE_CATEGORY_MAP = {
  '01': 'engine',     '02': 'movement',    '03': 'combat',
  '04': 'combat',     '05': 'combat',      '06': 'defense',
  '07': 'combat',     '08': 'combat',      '09': 'defense',
  '10': 'skills',     '11': 'skills',      '12': 'skills',
  '13': 'skills',     '14': 'skills',      '15': 'economy',
  '16': 'economy',    '17': 'economy',     '18': 'economy',
  '19': 'economy',    '20': 'targeting',   '21': 'combat',
  '22': 'combat',     '23': 'spawning',    '24': 'combat',
  '25': 'defense',    '26': 'defense',     '27': 'movement',
  '28': 'economy',    '29': 'movement',    '30': 'targeting',
  '31': 'visual',     '32': 'spawning',    '33': 'economy',
  '34': 'spawning',   '35': 'visual',      '36': 'visual',
  '37': 'targeting',  '38': 'skills',      '39': 'visual',
  '40': 'defense',    '41': 'combat',      '42': 'visual',
  '43': 'economy',
};

async function run() {
  console.log('═══ Scape Database Import ═══\n');

  // ── Add missing categories ──
  const extraCategories = [
    { id: 'engine', name: 'Engine', description: 'Core engine systems: tick, commands, persistence, events', sort_order: 0 },
  ];
  for (const c of extraCategories) {
    await db.query(
      'INSERT INTO mechanic_categories (id, name, description, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
      [c.id, c.name, c.description, c.sort_order]
    );
  }
  console.log('[1/4] Categories updated');

  // ── Import test files as mechanic test entries ──
  let totalTests = 0;
  let totalFiles = 0;

  const testFiles = fs.readdirSync(TESTS_DIR).filter(f => f.endsWith('.md')).sort();
  for (const file of testFiles) {
    const content = fs.readFileSync(path.join(TESTS_DIR, file), 'utf8');
    const fileNum = file.slice(0, 2);
    const category = FILE_CATEGORY_MAP[fileNum] || 'engine';

    // Extract file title
    const titleMatch = content.match(/^# (.+)$/m);
    const fileTitle = titleMatch ? titleMatch[1] : file.replace('.md', '');

    // Extract individual tests
    const testMatches = content.matchAll(/### (TEST-\d{4}): (.+)\n/g);
    const tests = [...testMatches];

    // Create a mechanic for each test file (the test suite as a mechanic group)
    const mechId = file.replace('.md', '');
    await db.query(
      `INSERT INTO mechanics (id, category_id, name, description, status, test_file, source_files, notes)
       VALUES ($1, $2, $3, $4, 'implemented', $5, '{}', $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, description = EXCLUDED.description,
         test_file = EXCLUDED.test_file, category_id = EXCLUDED.category_id,
         updated_at = NOW()`,
      [mechId, category, fileTitle, `${tests.length} tests covering ${fileTitle.toLowerCase()}`,
       `tests/${file}`, `Test suite ${fileNum}/${testFiles.length}`]
    );

    // Store test IDs
    const testIds = tests.map(t => t[1]);
    if (testIds.length > 0) {
      await db.query(
        'UPDATE mechanics SET test_ids = $2 WHERE id = $1',
        [mechId, testIds]
      );
    }

    totalTests += tests.length;
    totalFiles++;
  }
  console.log(`[2/4] Imported ${totalTests} tests from ${totalFiles} test files`);

  // ── Import test results ──
  let totalResults = 0;
  let passCount = 0, failCount = 0, skipCount = 0;

  const resultFiles = fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith('.json')).sort();
  for (const file of resultFiles) {
    try {
      const content = fs.readFileSync(path.join(RESULTS_DIR, file), 'utf8');
      const results = JSON.parse(content);
      const fileNum = file.slice(0, 2);
      const mechId = file.replace('-results.json', '');

      // Look up the matching mechanic
      const mechMatch = testFiles.find(f => f.startsWith(fileNum));
      const mechanic = mechMatch ? mechMatch.replace('.md', '') : null;

      // Determine overall status from results
      let allPass = true;
      let anyFail = false;

      for (const r of results) {
        const status = r.status?.toLowerCase() || 'pending';
        if (status === 'pass' || status === 'soft pass') passCount++;
        else if (status === 'fail') { failCount++; anyFail = true; allPass = false; }
        else if (status === 'skip' || status === 'blocked') { skipCount++; allPass = false; }
        else allPass = false;

        // Store individual test result
        await db.query(
          `INSERT INTO mechanic_tests (mechanic_id, test_name, status, expected, actual, notes)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [mechanic, r.id || r.name, status === 'pass' || status === 'soft pass' ? 'passed' : status === 'fail' ? 'failed' : 'skipped',
           null, null, r.details || r.findings || null]
        );
        totalResults++;
      }

      // Update mechanic status based on results
      if (mechanic) {
        let newStatus = 'implemented';
        if (allPass && results.length > 0) newStatus = 'tested';
        else if (anyFail) newStatus = 'implemented'; // has failures
        await db.query(
          `UPDATE mechanics SET status = $2, updated_at = NOW() WHERE id = $1 AND status NOT IN ('verified', 'signed_off')`,
          [mechanic, newStatus]
        );
      }
    } catch (err) {
      console.error(`  Error importing ${file}:`, err.message);
    }
  }
  console.log(`[3/4] Imported ${totalResults} test results (${passCount} pass, ${failCount} fail, ${skipCount} skip)`);

  // ── Import IMPLEMENTATION.md mechanics ──
  let implCount = 0;
  try {
    const content = fs.readFileSync(IMPL_FILE, 'utf8');

    // Extract tier sections
    const tierRegex = /## (TIER \d+ — .+)\n\n(.+?)(?=\n## TIER|\n---\n|$)/gs;
    const mechRegex = /### (\d+\.\d+) (.+)\n- \*\*What\*\*: (.+?)(?=\n- \*\*|$)/gs;

    // Map tiers to categories
    const tierCategoryMap = {
      '0': 'engine', '1': 'movement', '2': 'movement', '3': 'targeting',
      '4': 'combat', '5': 'skills', '6': 'economy', '7': 'defense',
      '8': 'economy', '9': 'combat', '10': 'spawning', '11': 'visual',
      '12': 'skills', '13': 'movement', '14': 'targeting', '15': 'visual',
      '16': 'economy', '17': 'visual', '18': 'visual',
    };

    // Parse all mechanics from implementation doc
    const allMechs = content.matchAll(/### (\d+)\.(\d+) (.+)\n- \*\*What\*\*: (.+)/g);
    for (const match of allMechs) {
      const tier = match[1];
      const sub = match[2];
      const name = match[3];
      const what = match[4].trim();
      const id = `impl-${tier}-${sub}`;
      const category = tierCategoryMap[tier] || 'engine';

      await db.query(
        `INSERT INTO mechanics (id, category_id, name, description, status, notes)
         VALUES ($1, $2, $3, $4, 'implemented', $5)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, description = EXCLUDED.description,
           category_id = EXCLUDED.category_id, updated_at = NOW()`,
        [id, category, name, what, `Tier ${tier}.${sub} from IMPLEMENTATION.md`]
      );
      implCount++;
    }
  } catch (err) {
    console.error('  Error importing IMPLEMENTATION.md:', err.message);
  }
  console.log(`[4/4] Imported ${implCount} mechanics from IMPLEMENTATION.md`);

  // ── Summary ──
  const total = await db.queryOne('SELECT COUNT(*) as count FROM mechanics');
  const overview = await db.queryAll(`
    SELECT status, COUNT(*) as count FROM mechanics GROUP BY status ORDER BY status
  `);

  console.log(`\n═══ Import Complete ═══`);
  console.log(`Total mechanics in database: ${total.count}`);
  overview.forEach(r => console.log(`  ${r.status}: ${r.count}`));

  const testTotal = await db.queryOne('SELECT COUNT(*) as count FROM mechanic_tests');
  console.log(`Total test results: ${testTotal.count}`);

  process.exit(0);
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
