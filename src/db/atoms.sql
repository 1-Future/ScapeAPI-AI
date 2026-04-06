-- Atoms category
INSERT INTO mechanic_categories (id, name, description, sort_order)
VALUES ('atoms', 'Atoms', 'The fundamental building blocks. Generic, reusable, IP-free mechanics that compose into any game system.', -1)
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO mechanics (id, category_id, name, description, status, verified_against, notes, render_tier) VALUES
-- TIMING
('atom-timer',              'atoms', 'Timer',                'Count down N ticks then trigger an event', 'verified', 'osrs_capture', 'GOTR: 120 second phase timer announced on round start', 'text'),
('atom-countdown-dramatic', 'atoms', 'Dramatic Countdown',   'Per-tick visible countdown (3... 2... 1...) before a moment', 'verified', 'osrs_capture', 'GOTR: 10s warning, 5s warning, then 3-2-1 per tick', 'text'),
('atom-cooldown',           'atoms', 'Cooldown',             'Block an action for N ticks after use', 'verified', 'osrs_capture', 'Potion 3-tick cooldown, eat delay, attack speed', 'text'),
('atom-tick-cycle',         'atoms', 'Tick Cycle',           'Something happens every N ticks automatically', 'verified', 'osrs_capture', 'Prayer drain counter, HP regen every 100 ticks', 'text'),
-- ACTIONS
('atom-periodic-action',    'atoms', 'Periodic Action',      'Repeat every N ticks: attempt, succeed/fail, reward. All skilling.', 'verified', 'osrs_capture', 'GOTR mining: exactly 3 ticks per fragment', 'text'),
('atom-instant-action',     'atoms', 'Instant Action',       'Resolves same tick as input. No delay.', 'verified', 'osrs_capture', 'Prayer switch, drop item, equip gear', 'text'),
('atom-delayed-action',     'atoms', 'Delayed Action',       'Starts now, resolves N ticks later', 'verified', 'osrs_capture', 'Ranged: hitsplat lands ticks after projectile fires', 'text'),
('atom-queued-action',      'atoms', 'Queued Action',        'Waits for current action to finish then executes', 'implemented', NULL, 'Click attack while eating queues until eat finishes', 'text'),
-- COMBAT
('atom-hit-check',          'atoms', 'Hit Check',            'Roll accuracy, hit/miss, calculate damage', 'verified', 'osrs_capture', 'Hitsplat type 16=damage, type 12=miss', 'text'),
('atom-protection-check',   'atoms', 'Protection Check',     'Check matching protection, reduce/negate damage', 'verified', 'osrs_capture', 'Prayer checks on projectile land not on attack', 'text'),
('atom-flinch',             'atoms', 'Flinch',               'First hit on idle NPC has no delay. Attack timer starts after being hit.', 'verified', 'osrs_capture', 'Imp: player hit tick 33, Imp retaliated tick 36 (3 tick flinch)', 'text'),
('atom-auto-retaliate',     'atoms', 'Auto-Retaliate',       'When hit, automatically target attacker', 'verified', 'osrs_capture', 'Imp attacked back after being hit', 'text'),
('atom-multi-style',        'atoms', 'Multi-Style Attack',   'Entity attacks with different styles. Style chosen per attack.', 'verified', 'osrs_capture', 'LMS: 11 unique weapons in one session', 'text'),
-- MOVEMENT
('atom-pathfind-to-target', 'atoms', 'Pathfind to Target',   'Auto-walk toward target until in range. Run=2 tiles/tick, walk=1.', 'verified', 'osrs_capture', 'Imp fight: ran 2 tiles/tick to close from distance 5', 'text'),
('atom-teleport',           'atoms', 'Teleport',             'Instantly move to new location with system message', 'verified', 'osrs_capture', 'GOTR: You step through the portal', 'text'),
-- REWARDS
('atom-xp-drop',            'atoms', 'XP Drop',             'Award experience in a skill on action tick', 'verified', 'osrs_capture', 'Multiple skills same tick (Strength+HP on melee hit)', 'text'),
('atom-loot-drop',          'atoms', 'Loot Drop',           'Generate items from weighted drop table on death', 'implemented', NULL, 'Standard drop table pattern', 'text'),
('atom-broadcast-loot',     'atoms', 'Loot Broadcast',      'Announce rare drop to all nearby players in colored chat', 'verified', 'osrs_capture', 'GOTR: green text PlayerName received a drop: ItemName', 'text'),
-- ROUNDS/PHASES
('atom-round',              'atoms', 'Round',               'Timed gameplay segment: start, active, end, reward', 'verified', 'osrs_capture', 'GOTR: countdown then active then creatures then reward', 'text'),
('atom-phase-transition',   'atoms', 'Phase Transition',    'Switch behavior set on trigger (HP, timer, event)', 'implemented', NULL, 'Boss phases, minigame stages', 'text'),
('atom-wave-spawn',         'atoms', 'Wave Spawn',          'Spawn entity group at defined locations', 'verified', 'osrs_capture', 'Inferno waves, GOTR creature spawns', 'text'),
-- DIALOGUE
('atom-npc-dialogue',       'atoms', 'NPC Dialogue',        'NPC speaks via chat type 114. Format: NPCName|message. 1 line per tick.', 'verified', 'osrs_capture', 'Cook and Sir Amik Varze dialogue captured', 'text'),
('atom-player-choice',      'atoms', 'Player Choice',       'Player selects from dialogue options', 'verified', 'osrs_capture', 'Poti|I laugh in the face of danger!', 'text'),
('atom-dialogue-branch',    'atoms', 'Dialogue Branch',     'NPC response changes based on choice or game state', 'verified', 'osrs_capture', 'Cook: different response on second visit', 'text'),
-- SESSION
('atom-session-init',       'atoms', 'Session Init',        'Batch state dump on login. All XP, welcome, notifications.', 'verified', 'osrs_capture', 'Tick 1: all 23 skill XP values dumped at once', 'text'),
('atom-system-announcement','atoms', 'System Announcement', 'Server or area message. Different types for different scopes.', 'verified', 'osrs_capture', 'Type 0=game, 105=skill, 108=welcome, 114=dialogue, 117=tip', 'text'),
('atom-achievement-trigger','atoms', 'Achievement Trigger',  'Completing tracked action fires colored notification', 'verified', 'osrs_capture', 'Thieving triggered diary task completion', 'text'),
-- INVENTORY
('atom-dose-system',        'atoms', 'Dose System',         'Consumable with N charges. Each use decrements. Empty leaves container.', 'verified', 'osrs_capture', 'Potions: 4 doses, vial when empty', 'text'),
('atom-consume',            'atoms', 'Consume',             'Use item to modify player state. HP, prayer, stats, buffs. Has cooldown.', 'verified', 'osrs_capture', 'Food heals, potions boost, restores PP. Shared cooldown tracks.', 'text'),
('atom-equip-swap',         'atoms', 'Equipment Swap',      'Change equipped item instantly. Stats update same tick.', 'verified', 'osrs_capture', 'LMS: constant gear switching, instant effect', 'text')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  status = EXCLUDED.status, verified_against = EXCLUDED.verified_against,
  notes = EXCLUDED.notes, render_tier = EXCLUDED.render_tier,
  category_id = EXCLUDED.category_id, updated_at = NOW();
