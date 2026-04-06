CREATE TABLE IF NOT EXISTS osrs_capture_checklist (
  id            TEXT PRIMARY KEY,
  category      TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INT DEFAULT 0,
  captured      BOOLEAN DEFAULT FALSE,
  captured_at   TIMESTAMPTZ,
  tick_count    INT DEFAULT 0,
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_checklist_category ON osrs_capture_checklist(category);

INSERT INTO osrs_capture_checklist (id, category, name, description, sort_order) VALUES
-- COMBAT
('combat-melee-scim',     'Combat',    'Melee - Scimitar',          'Attack with scimitar (4-tick weapon)', 1),
('combat-melee-whip',     'Combat',    'Melee - Whip',              'Attack with abyssal whip', 2),
('combat-melee-2h',       'Combat',    'Melee - 2H/Godsword',      'Slow 2H weapon (6-7 tick)', 3),
('combat-melee-dagger',   'Combat',    'Melee - Dagger/Claws',     'Fast melee weapon', 4),
('combat-ranged-bow',     'Combat',    'Ranged - Shortbow',         'Shortbow or magic shortbow', 5),
('combat-ranged-xbow',    'Combat',    'Ranged - Crossbow',         'Crossbow (5-6 tick)', 6),
('combat-ranged-bp',      'Combat',    'Ranged - Blowpipe',         'Toxic blowpipe (3 tick)', 7),
('combat-ranged-thrown',  'Combat',    'Ranged - Thrown',            'Darts knives throwing axes', 8),
('combat-magic-standard', 'Combat',    'Magic - Standard',          'Strike bolt blast wave spells', 9),
('combat-magic-ancient',  'Combat',    'Magic - Ancients',          'Ice barrage blood barrage', 10),
('combat-prayer-overhead','Combat',    'Prayer - Overheads',        'Protect from melee range mage', 11),
('combat-prayer-boost',   'Combat',    'Prayer - Stat Boosts',      'Piety rigour augury eagle eye', 12),
('combat-prayer-flick',   'Combat',    'Prayer - Flicking',         'Toggle prayers between ticks', 13),
('combat-specatk',        'Combat',    'Special Attacks',            'DDS AGS dragon dagger specs', 14),
('combat-eat',            'Combat',    'Eating in Combat',           '3-tick eat delay while fighting', 15),
('combat-potion',         'Combat',    'Potions in Combat',          'Brew restore super combat while fighting', 16),
('combat-multi',          'Combat',    'Multi-Combat Area',          'Fight in multi', 17),
('combat-flinch',         'Combat',    'Flinching',                  'Hit and run to reset NPC attack timer', 18),
-- MONSTERS
('monster-low',           'Monsters',  'Low Level (1-50)',           'Cows chickens goblins hill giants', 20),
('monster-mid',           'Monsters',  'Mid Level (50-150)',         'Moss giants fire giants black demons', 21),
('monster-high',          'Monsters',  'High Level (150+)',          'Abyssal demons hydra cerberus', 22),
('monster-slayer',        'Monsters',  'Slayer Task',                'Complete a slayer assignment', 23),
('monster-multi-style',   'Monsters',  'Multi-Style NPC',           'NPC that switches attack styles', 24),
('monster-safespot',      'Monsters',  'Safespotting',               'Safespot melee NPC behind obstacle', 25),
-- BOSSES
('boss-gwd',              'Bosses',    'God Wars Dungeon',          'Any GWD boss', 30),
('boss-zulrah',           'Bosses',    'Zulrah',                     'Full kill with phases', 31),
('boss-vorkath',          'Bosses',    'Vorkath',                    'Kill with specials', 32),
('boss-gauntlet',         'Bosses',    'Gauntlet/CG',               'Corrupted gauntlet run', 33),
('boss-inferno',          'Bosses',    'Inferno',                    'Any inferno attempt', 34),
('boss-jad',              'Bosses',    'Fight Caves',                'Jad attempt', 35),
('boss-barrows',          'Bosses',    'Barrows',                    'Full barrows run', 36),
('boss-cox',              'Bosses',    'Chambers of Xeric',         'Any CoX raid', 37),
('boss-tob',              'Bosses',    'Theatre of Blood',          'Any ToB raid', 38),
('boss-toa',              'Bosses',    'Tombs of Amascut',          'Any ToA raid', 39),
-- SKILLS GATHERING
('skill-mining',          'Skills',    'Mining',                     'Mine any rock', 40),
('skill-fishing',         'Skills',    'Fishing',                    'Fish at any spot', 41),
('skill-woodcutting',     'Skills',    'Woodcutting',                'Chop any tree', 42),
('skill-hunter',          'Skills',    'Hunter',                     'Set and check a trap', 43),
('skill-farming',         'Skills',    'Farming',                    'Plant and harvest', 44),
-- SKILLS PROCESSING
('skill-cooking',         'Skills',    'Cooking',                    'Cook food on range or fire', 50),
('skill-smithing',        'Skills',    'Smithing',                   'Smelt ore or smith bars', 51),
('skill-firemaking',      'Skills',    'Firemaking',                 'Light a log', 52),
('skill-runecraft',       'Skills',    'Runecraft',                  'Craft runes at altar', 53),
('skill-herblore',        'Skills',    'Herblore',                   'Clean herbs make potions', 54),
-- SKILLS COMBINING
('skill-crafting',        'Skills',    'Crafting',                   'Cut gem spin flax craft item', 60),
('skill-fletching',       'Skills',    'Fletching',                  'Fletch bows or arrows', 61),
('skill-construction',    'Skills',    'Construction',               'Build in POH', 62),
-- SKILLS ACTIVITY
('skill-agility',         'Skills',    'Agility',                    'Complete agility course lap', 70),
('skill-thieving',        'Skills',    'Thieving',                   'Pickpocket NPC or open chest', 71),
('skill-prayer-train',    'Skills',    'Prayer Training',            'Bury bones or use altar', 72),
('skill-magic-util',      'Skills',    'Magic - Utility',           'Teleport alchemy enchant', 73),
-- MOVEMENT
('move-walk',             'Movement',  'Walking',                    '1 tile per tick', 80),
('move-run',              'Movement',  'Running',                    '2 tiles per tick energy drain', 81),
('move-pathing',          'Movement',  'Long Pathfinding',           'Click far away watch path calc', 82),
('move-obstacle',         'Movement',  'Obstacles',                  'Jump stile squeeze gap', 83),
('move-stairs',           'Movement',  'Stairs/Ladders',             'Go up down stairs ladder', 84),
('move-teleport',         'Movement',  'Teleport',                   'Spell tab jewelry teleport', 85),
('move-fairy',            'Movement',  'Fairy Ring',                 'Fairy ring transport', 86),
('move-boat',             'Movement',  'Boat/Charter',               'Take a boat or ship', 87),
-- QUESTS
('quest-f2p',             'Quests',    'F2P Quest',                  'Complete any F2P quest', 90),
('quest-short',           'Quests',    'Short P2P Quest',           'Short members quest', 91),
('quest-long',            'Quests',    'Long Quest',                 'Multi-step quest', 92),
('quest-grandmaster',     'Quests',    'Grandmaster Quest',         'Any grandmaster quest', 93),
('quest-speedrun',        'Quests',    'Quest Speedrun',             'Speedrun world with timer', 94),
-- ECONOMY
('econ-shop-buy',         'Economy',   'Buy from Shop',             'Buy items from NPC shop', 100),
('econ-shop-sell',        'Economy',   'Sell to Shop',              'Sell items to NPC shop', 101),
('econ-ge-buy',           'Economy',   'GE Buy',                    'Place and complete GE buy offer', 102),
('econ-ge-sell',          'Economy',   'GE Sell',                   'Place and complete GE sell offer', 103),
('econ-trade',            'Economy',   'Player Trade',              'Trade with another player', 104),
('econ-alch',             'Economy',   'High Alchemy',              'Alch an item', 105),
('econ-drop',             'Economy',   'Drop/Pickup Items',         'Drop and pick up ground items', 106),
-- INVENTORY
('inv-manage',            'Inventory', 'Inventory Manage',          'Move items equip unequip', 110),
('inv-bank',              'Inventory', 'Banking',                    'Deposit withdraw from bank', 111),
('inv-gear-swap',         'Inventory', 'Gear Switching',             'Swap multiple equips fast', 112),
('inv-eat',               'Inventory', 'Eating Food',                'Eat different foods', 113),
-- SOCIAL
('social-chat',           'Social',    'Public Chat',                'Talk in public', 120),
('social-pm',             'Social',    'Private Message',            'Send receive PM', 121),
('social-clan',           'Social',    'Clan Chat',                  'Talk in clan', 122),
('social-emote',          'Social',    'Emotes',                     'Perform emotes', 123),
-- WORLD
('world-door',            'World',     'Doors',                      'Open close doors', 130),
('world-gate',            'World',     'Gates/Fences',               'Open gates climb fences', 131),
('world-search',          'World',     'Search Objects',             'Search crates drawers bookshelves', 132),
('world-npc-talk',        'World',     'NPC Dialogue',               'Talk to NPCs branching dialogue', 133),
('world-npc-shop',        'World',     'NPC Shop Interface',        'Browse and buy from shops', 134),
-- DEATH
('death-pvm',             'Death',     'PvM Death',                  'Die to monster observe gravestone', 140),
('death-poison',          'Death',     'Poison/Venom',               'Get poisoned watch tick damage', 141),
('death-wilderness',      'Death',     'Wilderness',                 'Enter wilderness observe threat', 142),
-- MINIGAMES
('mini-ba',               'Minigames', 'Barbarian Assault',         'Play BA', 150),
('mini-pest',             'Minigames', 'Pest Control',              'Play PC', 151),
('mini-cw',               'Minigames', 'Castle Wars',               'Play CW', 152),
('mini-lms',              'Minigames', 'Last Man Standing',         'Play LMS', 153),
-- MISC
('misc-diary',            'Misc',      'Achievement Diary',          'Complete a diary task', 160),
('misc-clue',             'Misc',      'Clue Scroll',                'Work on a clue step', 161),
('misc-random',           'Misc',      'Random Event',               'Encounter random event', 162),
('misc-music',            'Misc',      'Music Unlock',               'Unlock a music track', 163),
('misc-pet',              'Misc',      'Pet',                         'Receive or interact with pet', 164)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description,
  category = EXCLUDED.category, sort_order = EXCLUDED.sort_order;
