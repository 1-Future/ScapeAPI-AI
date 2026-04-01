// ── Command Parser (0.2) ──────────────────────────────────────────────────────
// Text input → parsed command → game action → text response

const commands = new Map(); // name → { fn, help, aliases, category }
const aliases = new Map();  // alias → canonical name

function register(name, opts) {
  const entry = {
    fn: opts.fn,
    help: opts.help || '',
    aliases: opts.aliases || [],
    category: opts.category || 'General',
    admin: opts.admin || false,
  };
  commands.set(name, entry);
  for (const alias of entry.aliases) {
    aliases.set(alias, name);
  }
}

function parse(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\s+/);
  const verb = parts[0].toLowerCase();
  const args = parts.slice(1);
  return { verb, args, raw: trimmed };
}

// Expand repeated directions: nn→n twice, www→w three times, ssee→s twice+e twice
const DIR_CHARS = { n: 'n', s: 's', e: 'e', w: 'w' };

function expandDirs(input) {
  const lower = input.trim().toLowerCase();
  if (lower.length < 2 || lower.length > 6) return null;
  // Check if entire input is just direction chars (n/s/e/w)
  if (!/^[nsew]+$/.test(lower)) return null;
  // Split into runs: "nnww" → [["n",2],["w",2]]
  const runs = [];
  let i = 0;
  while (i < lower.length) {
    const ch = lower[i];
    let count = 0;
    while (i < lower.length && lower[i] === ch) { count++; i++; }
    if (count > 3) return null; // max 3 repeats
    runs.push([ch, Math.min(count, 3)]);
  }
  // Expand to array of single directions
  const dirs = [];
  for (const [dir, count] of runs) {
    for (let j = 0; j < count; j++) dirs.push(dir);
  }
  return dirs;
}

function execute(player, input) {
  // Check for repeated directions first (nn, www, ssee, etc)
  const dirs = expandDirs(input);
  if (dirs && dirs.length > 1) {
    const results = [];
    for (const dir of dirs) {
      const parsed = parse(dir);
      const name = aliases.get(parsed.verb) || parsed.verb;
      const cmd = commands.get(name);
      if (cmd) {
        try {
          const r = cmd.fn(player, parsed.args, parsed.raw);
          if (r && typeof r === 'string' && r.includes('Blocked')) { results.push(r); break; }
          if (r) results.push(r);
        } catch (e) { break; }
      }
    }
    return results[results.length - 1] || ''; // Return last result (final position/map)
  }

  const parsed = parse(input);
  if (!parsed) return 'Type `help` for commands.';

  const name = aliases.get(parsed.verb) || parsed.verb;
  const cmd = commands.get(name);
  if (!cmd) return { unknown: true, input: parsed.raw };
  if (cmd.admin && !player.admin) return 'Admin only.';

  try {
    const result = cmd.fn(player, parsed.args, parsed.raw);
    return result !== undefined ? String(result) : '';
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

function getHelp(category) {
  const entries = [];
  for (const [name, cmd] of commands) {
    if (category && cmd.category !== category) continue;
    if (cmd.admin) continue;
    const aliasStr = cmd.aliases.length ? ` (${cmd.aliases.join(', ')})` : '';
    entries.push(`  ${name}${aliasStr} — ${cmd.help}`);
  }
  return entries;
}

function getCategories() {
  const cats = new Set();
  for (const cmd of commands.values()) cats.add(cmd.category);
  return [...cats].sort();
}

module.exports = { register, execute, parse, getHelp, getCategories, commands };
