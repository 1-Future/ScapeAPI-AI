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

function execute(player, input) {
  const parsed = parse(input);
  if (!parsed) return 'Type `help` for commands.';

  const name = aliases.get(parsed.verb) || parsed.verb;
  const cmd = commands.get(name);
  if (!cmd) return `Unknown command: ${parsed.verb}. Type \`help\` for commands.`;
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
