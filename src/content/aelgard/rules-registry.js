// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Code of Conduct (rules registry)
//
// 26 rules across three severities. Each rule defines its escalation ladder so
// moderators have a predictable response curve. Severe rules (RWT, bug abuse,
// doxxing, bot use) start with a tempban instead of a warning; minor rules
// (chat spam, lowercase-swearing clan chat) warn first.
//
// Bot policy note: we ban on bot use. This matches the Manifesto principle
// that Scape is a game for humans to play — scripted farming corrodes the
// economy and destroys the sense of earned progression for everyone else.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const rules = require('../../engine/rules');

function escalate(list) {
  // Helper: each list is already in the shape rules.js expects.
  return list;
}

// ── Severe ──────────────────────────────────────────────────────────────────

rules.defineRule('rwt', {
  title: 'Real-World Trading',
  description: 'Buying, selling, or exchanging in-game items, coins, or accounts for real money, goods, or services outside Scape. RWT corrodes every player\'s effort; it is the single most-policed offence.',
  severity: 'severe',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'tempban', duration_days: 14 },
    { strikes: 2, action: 'ban',     duration_days: null },
  ]),
  tags: ['economy', 'severe'],
});

rules.defineRule('bug_abuse', {
  title: 'Bug Abuse',
  description: 'Deliberately exploiting an engine or content bug for profit (item duplication, wall-clipping through gates, recipe exploits). Report bugs; do not farm them.',
  severity: 'severe',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'tempban', duration_days: 7 },
    { strikes: 2, action: 'tempban', duration_days: 30 },
    { strikes: 3, action: 'ban',     duration_days: null },
  ]),
  tags: ['integrity', 'severe'],
});

rules.defineRule('bot_use', {
  title: 'Botting / Scripting',
  description: 'Running any automated client, input script, or macro that plays for you. Scape is a game for humans. First offence is a ban — appeals are heard but the baseline is zero tolerance.',
  severity: 'severe',
  default_action: 'ban',
  escalation: escalate([
    { strikes: 1, action: 'ban', duration_days: null },
  ]),
  tags: ['integrity', 'severe'],
});

rules.defineRule('doxxing', {
  title: 'Doxxing / Personal Info',
  description: 'Publishing or threatening to publish another player\'s real-world identifying information (address, phone, workplace, photos of their home or family).',
  severity: 'severe',
  default_action: 'ban',
  escalation: escalate([
    { strikes: 1, action: 'ban', duration_days: null },
  ]),
  tags: ['safety', 'severe'],
  appealable: false,
});

rules.defineRule('threats_violence', {
  title: 'Threats of Violence',
  description: 'Credible threats of physical harm, sexual violence, or self-harm encouragement directed at another player or group.',
  severity: 'severe',
  default_action: 'ban',
  escalation: escalate([
    { strikes: 1, action: 'ban', duration_days: null },
  ]),
  tags: ['safety', 'severe'],
  appealable: false,
});

rules.defineRule('account_sharing', {
  title: 'Account Sharing / Selling',
  description: 'Logging into an account that is not yours, or trading access to your account. Accounts are personal — you play your character, no one else.',
  severity: 'severe',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'tempban', duration_days: 14 },
    { strikes: 2, action: 'ban',     duration_days: null },
  ]),
  tags: ['integrity', 'severe'],
});

rules.defineRule('alt_abuse', {
  title: 'Alt Account Abuse',
  description: 'Using alternate characters to evade a ban, inflate your own trading volume, farm GE flips across characters, or circumvent account-bound unlocks.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'tempban', duration_days: 7 },
    { strikes: 3, action: 'tempban', duration_days: 30 },
    { strikes: 4, action: 'ban',     duration_days: null },
  ]),
  tags: ['integrity'],
});

// ── Major ───────────────────────────────────────────────────────────────────

rules.defineRule('harassment', {
  title: 'Harassment',
  description: 'Targeted, repeated unwanted contact: stalking through the world, following to training spots, spam-messaging after being asked to stop, coordinated abuse by a group.',
  severity: 'major',
  default_action: 'mute',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'mute',    duration_days: 3 },
    { strikes: 3, action: 'tempban', duration_days: 14 },
    { strikes: 4, action: 'ban',     duration_days: null },
  ]),
  tags: ['safety', 'social'],
});

rules.defineRule('hate_speech', {
  title: 'Hate Speech',
  description: 'Slurs or attacks targeting protected classes (race, religion, gender, sexuality, disability). Includes server-wide broadcasts, clan chat, and yell. Context does not excuse intent.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'mute',    duration_days: 7 },
    { strikes: 2, action: 'tempban', duration_days: 14 },
    { strikes: 3, action: 'ban',     duration_days: null },
  ]),
  tags: ['safety'],
});

rules.defineRule('pk_luring', {
  title: 'PK Luring Outside the Wilderness',
  description: 'Tricking another player into entering the Wilderness under false pretences (fake trade, fake quest step, fake clan invite). Wilderness-internal combat is expected — the lure itself is what is banned.',
  severity: 'major',
  default_action: 'mute',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'mute',    duration_days: 3 },
    { strikes: 3, action: 'tempban', duration_days: 7 },
    { strikes: 4, action: 'ban',     duration_days: null },
  ]),
  tags: ['social'],
});

rules.defineRule('scamming', {
  title: 'Scamming',
  description: 'Deceiving another player into a loss of items or coins via trust-trades, fake wealth displays, misleading duel stakes, or rigged "doubling" offers. Player-vs-player economy is fair game; fraud is not.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'tempban', duration_days: 7 },
    { strikes: 3, action: 'tempban', duration_days: 30 },
    { strikes: 4, action: 'ban',     duration_days: null },
  ]),
  tags: ['economy', 'social'],
});

rules.defineRule('api_abuse', {
  title: 'API Abuse',
  description: 'Overloading public endpoints, circumventing rate limits, scraping player data at scale, or using official read APIs to feed automation.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'tempban', duration_days: 7 },
    { strikes: 3, action: 'ban',     duration_days: null },
  ]),
  tags: ['integrity'],
});

rules.defineRule('clan_ragging', {
  title: 'Clan Ragging',
  description: 'Repeatedly crashing another clan\'s events, training spots, or boss instances to deny progression rather than compete. A single scuffle is not ragging; sustained griefing is.',
  severity: 'major',
  default_action: 'mute',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'mute',    duration_days: 3 },
    { strikes: 3, action: 'tempban', duration_days: 14 },
  ]),
  tags: ['social'],
});

rules.defineRule('shop_exploitation', {
  title: 'Shop Exploitation',
  description: 'Using shop stock bugs, restock timing exploits, or multi-client buyouts to manipulate shop prices for profit beyond intended design.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'tempban', duration_days: 7 },
    { strikes: 3, action: 'ban',     duration_days: null },
  ]),
  tags: ['economy'],
});

rules.defineRule('impersonation', {
  title: 'Impersonation',
  description: 'Creating characters with names designed to mimic moderators, Jagex-era branding, or specific players to deceive others.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'tempban', duration_days: 7 },
    { strikes: 3, action: 'ban',     duration_days: null },
  ]),
  tags: ['integrity'],
});

rules.defineRule('offensive_name', {
  title: 'Offensive Character Name',
  description: 'Names containing slurs, graphic sexual terms, or deliberate circumvention of the name filter.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'tempban', duration_days: 3 },
    { strikes: 3, action: 'ban',     duration_days: null },
  ]),
  tags: ['safety'],
});

rules.defineRule('trade_manipulation', {
  title: 'Market Manipulation',
  description: 'Coordinating with other players to ramp or crash GE prices, spoofing offers at volume, or deliberate price-fixing in cartels.',
  severity: 'major',
  default_action: 'tempban',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'tempban', duration_days: 7 },
    { strikes: 3, action: 'ban',     duration_days: null },
  ]),
  tags: ['economy'],
});

rules.defineRule('boss_instance_grief', {
  title: 'Boss Instance Griefing',
  description: 'Joining a public boss instance with the intent to sabotage the kill (pulling adds into others, tagging without participating, deliberately wiping mechanics).',
  severity: 'major',
  default_action: 'mute',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'mute',    duration_days: 3 },
    { strikes: 3, action: 'tempban', duration_days: 14 },
  ]),
  tags: ['social'],
});

// ── Minor ───────────────────────────────────────────────────────────────────

rules.defineRule('chat_spam', {
  title: 'Chat Spam',
  description: 'Repeating the same message, flooding a channel, or posting gibberish walls of text. One ALL CAPS tirade is fine; sustained flooding is not.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'mute',    duration_days: 1 },
    { strikes: 3, action: 'mute',    duration_days: 3 },
    { strikes: 4, action: 'tempban', duration_days: 7 },
  ]),
  tags: ['social'],
});

rules.defineRule('advertising', {
  title: 'Unsolicited Advertising',
  description: 'Spamming clan recruitment, external Discord/YouTube links, or off-topic services in public chat or yell.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'mute',    duration_days: 1 },
    { strikes: 3, action: 'mute',    duration_days: 3 },
    { strikes: 4, action: 'tempban', duration_days: 3 },
  ]),
  tags: ['social'],
});

rules.defineRule('language_minor', {
  title: 'Excessive Profanity',
  description: 'Mild profanity is allowed; sustained, hostile use in public channels is not. Moderators use context, not a word list.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn', duration_days: 0 },
    { strikes: 2, action: 'mute', duration_days: 1 },
    { strikes: 3, action: 'mute', duration_days: 3 },
  ]),
  tags: ['social'],
});

rules.defineRule('begging', {
  title: 'Begging',
  description: 'Sustained asking for free items, coins, or gear from strangers. One-off "any bronze?" at Lumbridge is fine; camping other players and demanding drops is not.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn', duration_days: 0 },
    { strikes: 2, action: 'mute', duration_days: 1 },
    { strikes: 3, action: 'mute', duration_days: 3 },
  ]),
  tags: ['social'],
});

rules.defineRule('afk_farming', {
  title: 'AFK / Low-engagement Farming',
  description: 'Staying logged in at a training spot to accrue rewards while unattended. Not as severe as botting (you\'re still there), but still discouraged at high-value spots.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn', duration_days: 0 },
    { strikes: 2, action: 'warn', duration_days: 0 },
    { strikes: 3, action: 'mute', duration_days: 1 },
  ]),
  tags: ['integrity'],
});

rules.defineRule('false_reporting', {
  title: 'False Reporting',
  description: 'Filing reports you know to be unfounded to harass another player or clog the moderator queue.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn',    duration_days: 0 },
    { strikes: 2, action: 'mute',    duration_days: 1 },
    { strikes: 3, action: 'tempban', duration_days: 3 },
  ]),
  tags: ['integrity'],
});

rules.defineRule('minor_grief', {
  title: 'Minor Griefing',
  description: 'Blocking doorways, luring low-level NPCs onto other players\' training spots, stealing kills at low-density resources.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn', duration_days: 0 },
    { strikes: 2, action: 'mute', duration_days: 1 },
    { strikes: 3, action: 'mute', duration_days: 3 },
  ]),
  tags: ['social'],
});

rules.defineRule('off_topic', {
  title: 'Off-topic Public Chat',
  description: 'Sustained, loud real-life political or controversial discussion in public channels where it derails gameplay chat.',
  severity: 'minor',
  default_action: 'warn',
  escalation: escalate([
    { strikes: 1, action: 'warn', duration_days: 0 },
    { strikes: 2, action: 'warn', duration_days: 0 },
    { strikes: 3, action: 'mute', duration_days: 1 },
  ]),
  tags: ['social'],
});

// ── Export the id list for convenience ──────────────────────────────────────
const RULE_IDS = [
  'rwt', 'bug_abuse', 'bot_use', 'doxxing', 'threats_violence',
  'account_sharing', 'alt_abuse',
  'harassment', 'hate_speech', 'pk_luring', 'scamming', 'api_abuse',
  'clan_ragging', 'shop_exploitation', 'impersonation', 'offensive_name',
  'trade_manipulation', 'boss_instance_grief',
  'chat_spam', 'advertising', 'language_minor', 'begging', 'afk_farming',
  'false_reporting', 'minor_grief', 'off_topic',
];

module.exports = { RULE_IDS };
