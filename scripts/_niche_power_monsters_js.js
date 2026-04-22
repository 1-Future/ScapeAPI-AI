// ══════════════════════════════════════════════════════════════════════════════
// _niche_power_monsters_js.js — adds class_tags field to every inline monster
// definition in src/content/aelgard/monsters-*.js.
//
// Handles both:
//   mob('id', { name: '...', tags: [...], examine: '...', weakness: '...', ... }, ...)
//   mega({ id: '...', name: '...', tags: [...], examine: '...', ... })
//
// Insertion policy: class_tags is appended immediately after the `tags: [...]`
// token within each def body, so the format stays:
//   tags: ['demon'], class_tags: ['demon','slayer']
//
// If the def already has class_tags (idempotent re-run), update-in-place.
// If the def has no `tags` field, append class_tags right after the `examine`
// field. If neither present, skip (should never happen in practice).
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const AELGARD = path.join(__dirname, '..', 'src', 'content', 'aelgard');
const TARGETS = ['monsters-blitz.js', 'monsters-blitz2.js', 'monsters-expanded.js', 'monsters-mega.js'];

// Tag inference — same vocab as the bestiary pass. Works on name+examine+tags.
function inferClassTags({ name, examine, tags, attackStyle, weakness, level, slayerLevelRequired }) {
  const out = new Set();
  const lower = (s) => String(s || '').toLowerCase();
  const n = lower(name);
  const e = lower(examine);
  const text = `${n} ${e}`;
  const has = (re) => re.test(text);

  // Seed with the author's existing tags (map any we recognise into class vocab).
  // Existing tag vocab observed: human, beast, undead, demon, vampyre, dragon,
  // kalphite, elemental, construct, plant, armoured, shadow, spirit, goblinoid,
  // slayer, boss, magic_user, ranged_user.
  const CLASS_VOCAB = new Set([
    'demon', 'undead', 'dragon', 'kalphite', 'vampyre', 'magic_user',
    'ranged_user', 'human', 'beast', 'plant', 'construct', 'elemental',
    'shadow', 'shade', 'goblinoid', 'armoured', 'slayer', 'boss', 'giant',
  ]);
  for (const t of (tags || [])) {
    const tl = lower(t);
    // Map author conventions
    if (tl === 'spirit') { out.add('shadow'); continue; }
    if (CLASS_VOCAB.has(tl)) out.add(tl);
  }

  // demon
  if (has(/\bdemon|\bimp\b|\binfernal\b|hellhound|\babyssal\b|tzhaar|tzrek|kril|bloodveld|nechry|\bhellrat\b|\bglass[\s-]?imp/)) out.add('demon');

  // undead
  if (has(/\bundead\b|\bskeleton|\bskeletal\b|\bzombie|\bghoul|\blich\b|\bwraith\b|\bghost\b|\bmummy\b|\bghast\b|\bbarrow|\brevenant|\bbanshee|\bcrypt\b|\bgrave[\s-]?spawn|\brisen\b|\bbone[\s-]?(?:dragon|warrior|servant|guard|scarab|shade|king|lord)|\bfunerary|\bankou\b|\bnazgûl|\bspectre|\bsunking/)) out.add('undead');

  // dragon
  if (has(/\bdragon|\bwyrm\b|\bwyvern|\bdrake\b|\bhydra\b|\bhatchling/)) out.add('dragon');

  // kalphite — strict
  if (has(/\bkalphite\b|\bscarab\b|\bkhepri\b|\bhive[\s-]?(queen|soldier|worker|guardian)/)) out.add('kalphite');

  // vampyre
  if (has(/\bvampyre\b|\bvampire\b|\bjuvinate\b|\bjuvenate\b|\bnosferatu|\bblood[\s-]?(?:lord|priest|count|servant|veld|archon)|\bstrigoi\b/)) out.add('vampyre');

  // magic_user
  if (attackStyle === 'magic'
      || has(/\bmage\b|\bsorcer|\bwarlock|\bwitch\b|\bhexen\b|\bchanter\b|\bincanter\b|\bnecromancer|\bwizard\b|\bconjur|\boracle\b|\benchanter|\bspellwright|\bscholar\b/)) {
    out.add('magic_user');
  }

  // ranged_user
  if (attackStyle === 'ranged'
      || has(/\barcher\b|\branger\b|\bcrossbow|\bshooter\b|\bgunner\b|\bskirmisher\b|\bslinger\b|\bhighwayman\b/)) {
    out.add('ranged_user');
  }

  // human
  const humanRe = /\bbandit\b|\bbrigand\b|\bsoldier\b|\bguard\b|\bcaptain\b|\bknight\b|\bpirate\b|\boutlaw\b|\bthief\b|\bassassin\b|\bmercenary\b|\bwarden\b|\bmonk\b|\bpriest\b|\bpriestess\b|\bdruid\b|\bsailor\b|\bmarauder\b|\bnomad\b|\bchampion\b|\bgladiator\b|\bfarmer\b|\bfarmhand\b|\bmilitia\b|\bcultist\b|\brogue\b|\bberserker\b|\bfanatic\b|\belven\b|\belf\b|\bdwarf\b|\bhuman\b/;
  if (has(humanRe) && !has(/\bundead\b|\bghost\b|\bghoul\b|\bskeleton|\bzombie\b|\bwraith\b|\bmummy\b|\blich\b|\bspectre/)) {
    out.add('human');
  }

  // giant
  if (has(/\bgiant\b|\bogre\b|\btroll\b|\bcyclops\b|\bcolossus\b|\bbehemoth\b|\btitan\b/)) out.add('giant');

  // beast
  if (has(/\brat\b|\bwolf\b|\bboar\b|\bbear\b|\bcrocodile\b|\bhorror\b|\bspider\b|\bstalker\b|\bscorpion\b|\bhound\b|\bcat\b|\bfox\b|\blizard\b|\bsnake\b|\bserpent\b|\bfrog\b|\bshark\b|\bkraken\b|\boyster\b|\btentacle\b|\bslug\b|\bworm\b|\bgoat\b|\bjackal\b|\beagle\b|\braven\b|\bcrab\b|\bmogre\b|\blurker\b|\btoad\b|\bhare\b|\bwyvern\b/)) {
    out.add('beast');
  }

  // plant
  if (has(/\btreant\b|\bent\b|\bvine\b|\bsapling\b|\bmandrake\b|\bspriggan\b|\bbloom\b|\bfungus\b|\bfungal\b|\bspore\b|\bmoss[\s-]?(knight|warrior)|\bliving[\s-]?vine\b|\bmushroom\b/)) {
    out.add('plant');
  }

  // construct
  if (has(/\bgolem\b|\bconstruct\b|\bautomat|\bgargoyle\b|\bmechan|\bclockwork\b|\bstatue\b|\banimated|\bdrone\b/)) out.add('construct');

  // elemental
  if (has(/\belemental\b|\bfire[\s-]?(?:giant|imp|sprite|wisp|drake|serpent)|\bice[\s-]?(?:giant|warrior|spirit)|\bmagma[\s-]?(?:serpent|drake|beast)|\blava[\s-]?(?:beast|drake|spider)|\btempest[\s-]?(?:spirit)|\bstorm[\s-]?(?:spirit|elemental)|\bfrost[\s-]?(?:spirit|wraith)|\bsand[\s-]?(?:wraith|genie)|\brune[\s-]?(?:elemental|spider)/)) {
    out.add('elemental');
  }

  // shadow
  if (has(/\bshade\b|\bshadow\b|\bshadowhide|\bumbra\b|\beclipse\b|\bnightstalker|\bgloom|\bnightmare|\bphantasm|\bmemory[\s-]?devour/)) out.add('shadow');

  // goblinoid
  if (has(/\bgoblin\b|\bhobgoblin|\borc\b|\bgnoll\b|\bkobold/)) out.add('goblinoid');

  // armoured
  if (has(/\barmou?red\b|\bplate\b|\bfortress|\bcarapace\b|\bchitin\b|\bchurch[\s-]?gargoyle|\bturtle\b|\bscarab\b|\bcrab\b/)) out.add('armoured');

  // slayer
  if (slayerLevelRequired && Number(slayerLevelRequired) > 0) out.add('slayer');
  if (has(/\bgargoyle\b|\babyssal\b|\bbloodveld\b|\bnechry|\bdark[\s-]?beast\b|\bskele[td]al[\s-]?wyvern|\brock[\s-]?slug\b|\bcockatrice\b|\bkurask\b|\bturoth\b|\bbasilisk\b/)) {
    out.add('slayer');
  }

  // boss — combat level (approximate "level" in mob() is `combat` field)
  const lvl = Number(level || 0);
  if (lvl >= 300) out.add('boss');
  if ((tags || []).map(lower).includes('boss')) out.add('boss');
  if (lvl >= 180 && has(/\bboss\b|\boverlord\b|\bwarden\b|\bpatriarch\b|\bmatriarch\b|\barchon\b|\bavatar\b|\btyrant\b|\bchaos[\s-]?(fanatic|elemental)|\bscorpia\b|\bqueen\b/)) {
    out.add('boss');
  }

  // Fallback
  if (out.size === 0) {
    if (attackStyle === 'magic') out.add('magic_user');
    else if (attackStyle === 'ranged') out.add('ranged_user');
    else out.add('beast');
  }

  return [...out].sort();
}

// Parse a single def-body chunk of { ... }. Returns { name, examine, tags, attackStyle,
// weakness, level, slayerLevelRequired, tagsMatch, classTagsMatch }.
function readDefFields(body) {
  const out = {};
  let m;
  if ((m = body.match(/\bname:\s*(['"])([^'"]+?)\1/))) out.name = m[2];
  if ((m = body.match(/\bexamine:\s*(['"])([^'"]+?)\1/))) out.examine = m[2];
  if ((m = body.match(/\battackStyle:\s*['"]([^'"]+)['"]/))) out.attackStyle = m[1];
  if ((m = body.match(/\bcombat_style:\s*['"]([^'"]+)['"]/))) out.attackStyle = m[1];
  if ((m = body.match(/\bweakness:\s*['"]([^'"]+)['"]/))) out.weakness = m[1];
  if ((m = body.match(/\bcombat:\s*(\d+)/))) out.level = Number(m[1]);
  if ((m = body.match(/\blevel:\s*(\d+)/))) out.level = Number(m[1]);
  if ((m = body.match(/\bslayer_level_required:\s*(\d+)/))) out.slayerLevelRequired = Number(m[1]);

  // tags array
  const tagsMatch = body.match(/\btags:\s*\[([^\]]*)\]/);
  if (tagsMatch) {
    out.tagsMatch = tagsMatch;
    out.tags = tagsMatch[1].split(',').map(t => t.replace(/['"\s]/g, '')).filter(Boolean);
  } else {
    out.tags = [];
  }
  // existing class_tags (for idempotent re-run)
  out.classTagsMatch = body.match(/\bclass_tags:\s*\[([^\]]*)\]/);
  return out;
}

// Render class_tags array as JS source literal
function renderClassTags(arr) {
  return `[${arr.map(t => `'${t}'`).join(', ')}]`;
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  let changed = 0;
  let skipped = 0;

  // Collect all candidate def bodies. The caller patterns are `mob('id', {...},`
  // and `mega({...})`. We find the braces around each def body by balanced-brace
  // scanning after matching the keyword.
  const PATTERNS = [
    { name: 'mob', re: /(?<![a-zA-Z_.])mob\(\s*'[a-z0-9_]+'\s*,\s*/g },
    { name: 'mega', re: /(?<![a-zA-Z_.])mega\(\s*/g },
  ];

  // Build a list of edit ranges to apply (in reverse so indices don't shift).
  const edits = [];

  for (const { name: kind, re } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      // After the matched prefix, next char should be '{'
      const braceStart = src.indexOf('{', m.index + m[0].length - 1);
      if (braceStart === -1) continue;
      // Ensure braceStart is the immediate start of the body (allow only whitespace between)
      const between = src.slice(m.index + m[0].length, braceStart);
      if (between.trim() !== '') continue;

      // Balanced brace scan to find body end
      let depth = 0; let end = braceStart;
      for (let i = braceStart; i < src.length; i++) {
        const ch = src[i];
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) { end = i; break; } }
        else if (ch === '/' && src[i+1] === '/') {
          // skip to end of line
          while (i < src.length && src[i] !== '\n') i++;
        } else if (ch === '/' && src[i+1] === '*') {
          i += 2;
          while (i < src.length - 1 && !(src[i] === '*' && src[i+1] === '/')) i++;
          i++;
        } else if (ch === "'" || ch === '"') {
          // skip string
          const q = ch; i++;
          while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; }
        }
      }
      const body = src.slice(braceStart + 1, end);

      const fields = readDefFields(body);
      if (!fields.name && !fields.examine) { skipped++; continue; }

      const classTags = inferClassTags({
        name: fields.name, examine: fields.examine,
        tags: fields.tags, attackStyle: fields.attackStyle,
        weakness: fields.weakness, level: fields.level,
        slayerLevelRequired: fields.slayerLevelRequired,
      });

      const rendered = renderClassTags(classTags);
      if (fields.classTagsMatch) {
        // Replace-in-place
        const ctStart = braceStart + 1 + fields.classTagsMatch.index;
        const ctEnd = ctStart + fields.classTagsMatch[0].length;
        edits.push({ start: ctStart, end: ctEnd, text: `class_tags: ${rendered}` });
        changed++;
      } else if (fields.tagsMatch) {
        // Insert after the tags: [...] field
        const tStart = braceStart + 1 + fields.tagsMatch.index;
        const tEnd = tStart + fields.tagsMatch[0].length;
        edits.push({ start: tEnd, end: tEnd, text: `, class_tags: ${rendered}` });
        changed++;
      } else {
        // Insert at end of body, before the closing brace. Preserve trailing
        // comma style if the last non-whitespace is a comma.
        const lastTrim = body.replace(/\s+$/, '');
        const needsComma = lastTrim.length > 0 && !lastTrim.endsWith(',') && !lastTrim.endsWith('{');
        const insertionText = `${needsComma ? ',' : ''} class_tags: ${rendered}`;
        edits.push({ start: end, end: end, text: insertionText });
        changed++;
      }
    }
  }

  // Apply edits in reverse order
  edits.sort((a, b) => b.start - a.start);
  for (const e of edits) {
    src = src.slice(0, e.start) + e.text + src.slice(e.end);
  }

  fs.writeFileSync(filePath, src);
  return { changed, skipped };
}

function main() {
  let totalChanged = 0;
  let totalSkipped = 0;
  for (const f of TARGETS) {
    const full = path.join(AELGARD, f);
    if (!fs.existsSync(full)) continue;
    const { changed, skipped } = processFile(full);
    totalChanged += changed;
    totalSkipped += skipped;
    console.log(`[niche-monsters-js] ${f}: tagged ${changed} defs (skipped ${skipped})`);
  }
  console.log(`[niche-monsters-js] total ${totalChanged} monster defs tagged (skipped ${totalSkipped})`);
}

main();
