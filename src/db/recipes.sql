-- Recipe table: maps features to their atom ingredients
CREATE TABLE IF NOT EXISTS mechanic_recipes (
  id            SERIAL PRIMARY KEY,
  mechanic_id   TEXT NOT NULL,        -- the feature/system
  atom_id       TEXT NOT NULL,        -- the atom it uses
  notes         TEXT,                 -- how this atom is used in this feature
  UNIQUE(mechanic_id, atom_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_mechanic ON mechanic_recipes(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_recipe_atom ON mechanic_recipes(atom_id);

-- ═══════════════════════════════════════════════════════════════
-- RECIPES: Decompose major systems into their atom ingredients
-- ═══════════════════════════════════════════════════════════════

-- ── MINING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-mining', 'atom-periodic-action', 'Mine attempt every 3-5 ticks depending on pickaxe'),
('skill-mining', 'atom-xp-drop', 'Mining XP on successful mine'),
('skill-mining', 'atom-cooldown', 'Cannot mine again until swing completes'),
('skill-mining', 'atom-loot-drop', 'Ore appears in inventory')
ON CONFLICT DO NOTHING;

-- ── FISHING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-fishing', 'atom-periodic-action', 'Catch attempt every 5 ticks'),
('skill-fishing', 'atom-xp-drop', 'Fishing XP per catch'),
('skill-fishing', 'atom-loot-drop', 'Fish appears in inventory')
ON CONFLICT DO NOTHING;

-- ── WOODCUTTING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-woodcutting', 'atom-periodic-action', 'Chop attempt every 4-8 ticks depending on axe'),
('skill-woodcutting', 'atom-xp-drop', 'WC XP per log'),
('skill-woodcutting', 'atom-loot-drop', 'Log appears in inventory')
ON CONFLICT DO NOTHING;

-- ── COOKING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-cooking', 'atom-periodic-action', 'Cook every 4 ticks on range'),
('skill-cooking', 'atom-xp-drop', 'Cooking XP per item'),
('skill-cooking', 'atom-consume', 'Uses raw food, produces cooked food'),
('skill-cooking', 'atom-hit-check', 'Success/burn roll based on level vs food tier')
ON CONFLICT DO NOTHING;

-- ── SMITHING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-smithing', 'atom-periodic-action', 'Smith action every 3-4 ticks'),
('skill-smithing', 'atom-xp-drop', 'Smithing XP per bar used'),
('skill-smithing', 'atom-consume', 'Uses bars, produces equipment')
ON CONFLICT DO NOTHING;

-- ── THIEVING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-thieving', 'atom-periodic-action', 'Pickpocket attempt every 4 ticks'),
('skill-thieving', 'atom-xp-drop', 'Thieving XP on success'),
('skill-thieving', 'atom-hit-check', 'Success/fail roll, fail = stun + damage'),
('skill-thieving', 'atom-cooldown', 'Stun locks player for N ticks on fail'),
('skill-thieving', 'atom-loot-drop', 'Coins or items on success'),
('skill-thieving', 'atom-achievement-trigger', 'Diary task on first pickpocket')
ON CONFLICT DO NOTHING;

-- ── AGILITY ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-agility', 'atom-periodic-action', 'Obstacle crossing takes N ticks'),
('skill-agility', 'atom-xp-drop', 'XP per obstacle + lap bonus'),
('skill-agility', 'atom-hit-check', 'Fail chance on some obstacles = fall damage'),
('skill-agility', 'atom-pathfind-to-target', 'Auto-run between obstacles'),
('skill-agility', 'atom-round', 'Full lap = one round, gives bonus XP + marks'),
('skill-agility', 'atom-loot-drop', 'Marks of grace spawn on course')
ON CONFLICT DO NOTHING;

-- ── PRAYER TRAINING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('skill-prayer-train', 'atom-instant-action', 'Bury bones instantly'),
('skill-prayer-train', 'atom-xp-drop', 'Prayer XP per bone type'),
('skill-prayer-train', 'atom-consume', 'Bone consumed on use'),
('skill-prayer-train', 'atom-cooldown', 'Bury delay between bones')
ON CONFLICT DO NOTHING;

-- ── MELEE COMBAT ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('combat-melee-scim', 'atom-hit-check', 'Accuracy roll + damage roll'),
('combat-melee-scim', 'atom-xp-drop', 'Attack/Strength/Defence + HP XP per hit'),
('combat-melee-scim', 'atom-cooldown', 'Weapon speed determines ticks between attacks'),
('combat-melee-scim', 'atom-pathfind-to-target', 'Auto-walk to melee range'),
('combat-melee-scim', 'atom-flinch', 'First hit on idle NPC has no delay'),
('combat-melee-scim', 'atom-auto-retaliate', 'NPC fights back after being hit')
ON CONFLICT DO NOTHING;

-- ── RANGED COMBAT ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('combat-ranged-xbow', 'atom-hit-check', 'Accuracy + damage roll'),
('combat-ranged-xbow', 'atom-delayed-action', 'Projectile flight time before damage lands'),
('combat-ranged-xbow', 'atom-xp-drop', 'Ranged + HP XP, fires before hitsplat'),
('combat-ranged-xbow', 'atom-cooldown', 'Weapon speed between shots'),
('combat-ranged-xbow', 'atom-consume', 'Ammo consumed per shot'),
('combat-ranged-xbow', 'atom-pathfind-to-target', 'Auto-walk to weapon range'),
('combat-ranged-xbow', 'atom-protection-check', 'Prayer checked when projectile lands')
ON CONFLICT DO NOTHING;

-- ── PRAYER OVERHEAD ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('combat-prayer-overhead', 'atom-instant-action', 'Prayer activates same tick as click'),
('combat-prayer-overhead', 'atom-protection-check', 'Matching prayer negates damage'),
('combat-prayer-overhead', 'atom-tick-cycle', 'Prayer drains PP every N ticks based on drain rate'),
('combat-prayer-overhead', 'atom-consume', 'Restores refill PP using dose system')
ON CONFLICT DO NOTHING;

-- ── EATING IN COMBAT ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('combat-eat', 'atom-consume', 'Food heals HP'),
('combat-eat', 'atom-cooldown', '3-tick eat delay'),
('combat-eat', 'atom-queued-action', 'Attack queues behind eat'),
('combat-eat', 'atom-instant-action', 'HP change is instant on eat tick')
ON CONFLICT DO NOTHING;

-- ── SPECIAL ATTACKS ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('combat-specatk', 'atom-hit-check', 'Modified accuracy/damage roll'),
('combat-specatk', 'atom-consume', 'Uses special attack energy'),
('combat-specatk', 'atom-cooldown', 'Spec energy regenerates over time'),
('combat-specatk', 'atom-instant-action', 'Spec toggle is instant')
ON CONFLICT DO NOTHING;

-- ── POTIONS IN COMBAT ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('combat-potion', 'atom-consume', 'Potion modifies stats/HP/PP'),
('combat-potion', 'atom-dose-system', '4 doses per potion'),
('combat-potion', 'atom-cooldown', '3-tick potion cooldown'),
('combat-potion', 'atom-tick-cycle', 'Boost decays 1 level per 60 ticks')
ON CONFLICT DO NOTHING;

-- ── SLAYER TASK ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('monster-slayer', 'atom-hit-check', 'Combat with assigned monster'),
('monster-slayer', 'atom-xp-drop', 'Slayer XP on kill in addition to combat XP'),
('monster-slayer', 'atom-loot-drop', 'Monster drops + slayer-specific drops'),
('monster-slayer', 'atom-timer', 'Task count decrements per kill'),
('monster-slayer', 'atom-achievement-trigger', 'Task completion notification'),
('monster-slayer', 'atom-npc-dialogue', 'Get task from slayer master')
ON CONFLICT DO NOTHING;

-- ── QUEST (SHORT) ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('quest-short', 'atom-npc-dialogue', 'Talk to NPCs for quest steps'),
('quest-short', 'atom-player-choice', 'Choose dialogue options'),
('quest-short', 'atom-dialogue-branch', 'NPC responds based on quest state'),
('quest-short', 'atom-phase-transition', 'Quest advances through stages'),
('quest-short', 'atom-achievement-trigger', 'Quest complete notification + rewards'),
('quest-short', 'atom-xp-drop', 'XP reward on completion'),
('quest-short', 'atom-loot-drop', 'Item rewards on completion')
ON CONFLICT DO NOTHING;

-- ── QUEST SPEEDRUN ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('quest-speedrun', 'atom-timer', 'Speedrun timer tracks completion time'),
('quest-speedrun', 'atom-system-announcement', 'Quest speedrun started/completed messages'),
('quest-speedrun', 'atom-npc-dialogue', 'Same quest dialogue as normal'),
('quest-speedrun', 'atom-phase-transition', 'Quest stages'),
('quest-speedrun', 'atom-achievement-trigger', 'Personal best notification')
ON CONFLICT DO NOTHING;

-- ── GUARDIANS OF THE RIFT ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('doc-crafting-system', 'atom-round', 'Game round with start, active phase, end'),
('doc-crafting-system', 'atom-dramatic-countdown', '10s, 5s, 3-2-1 countdown before round'),
('doc-crafting-system', 'atom-timer', '120 second creature attack phase'),
('doc-crafting-system', 'atom-periodic-action', 'Mining fragments every 3 ticks'),
('doc-crafting-system', 'atom-xp-drop', 'Mining, Crafting, Runecraft XP'),
('doc-crafting-system', 'atom-teleport', 'Portal to altar and back'),
('doc-crafting-system', 'atom-broadcast-loot', 'Rare drop announcements to all players'),
('doc-crafting-system', 'atom-wave-spawn', 'Creatures spawn at timer end'),
('doc-crafting-system', 'atom-session-init', 'XP batch dump on login')
ON CONFLICT DO NOTHING;

-- ── BARROWS ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('boss-barrows', 'atom-hit-check', 'Combat with 6 brothers'),
('boss-barrows', 'atom-multi-style', 'Each brother uses different attack style'),
('boss-barrows', 'atom-protection-check', 'Prayer protects against each style'),
('boss-barrows', 'atom-phase-transition', 'Dig at mound -> tunnel -> chest'),
('boss-barrows', 'atom-teleport', 'Enter tunnel from surface'),
('boss-barrows', 'atom-loot-drop', 'Chest reward roll based on brothers killed'),
('boss-barrows', 'atom-wave-spawn', 'Random brother spawns in tunnel')
ON CONFLICT DO NOTHING;

-- ── FIGHT CAVES / JAD ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('boss-jad', 'atom-wave-spawn', '63 waves of increasingly difficult mobs'),
('boss-jad', 'atom-hit-check', 'Combat throughout'),
('boss-jad', 'atom-protection-check', 'Jad prayer switching is the core mechanic'),
('boss-jad', 'atom-multi-style', 'Jad uses mage and range'),
('boss-jad', 'atom-delayed-action', 'Jad attack animation tells you which prayer'),
('boss-jad', 'atom-instant-action', 'Prayer switch must be instant'),
('boss-jad', 'atom-consume', 'Brews and restores for sustain'),
('boss-jad', 'atom-dose-system', 'Potion management across 63 waves'),
('boss-jad', 'atom-achievement-trigger', 'Fire cape on completion')
ON CONFLICT DO NOTHING;

-- ── INFERNO ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('boss-inferno', 'atom-wave-spawn', '69 waves with specific mob compositions'),
('boss-inferno', 'atom-hit-check', 'Combat with multiple mob types'),
('boss-inferno', 'atom-protection-check', 'Prayer switching between multiple attackers'),
('boss-inferno', 'atom-multi-style', 'Blob scans prayer and attacks opposite'),
('boss-inferno', 'atom-delayed-action', 'Projectile flight determines prayer timing'),
('boss-inferno', 'atom-instant-action', 'Prayer flicking between attacks'),
('boss-inferno', 'atom-pathfind-to-target', 'Player and NPC movement around pillars'),
('boss-inferno', 'atom-consume', 'Sara brew + super restore management'),
('boss-inferno', 'atom-dose-system', 'Supply management across 69 waves'),
('boss-inferno', 'atom-cooldown', 'Eat/drink cooldowns'),
('boss-inferno', 'atom-phase-transition', 'Jad phase, Zuk phase, healers'),
('boss-inferno', 'atom-timer', 'Zuk set timer, shield movement'),
('boss-inferno', 'atom-equip-swap', 'Weapon switching between ACB and blowpipe'),
('boss-inferno', 'atom-flinch', 'NPC flinch mechanics'),
('boss-inferno', 'atom-tick-cycle', 'Prayer drain, HP regen'),
('boss-inferno', 'atom-achievement-trigger', 'Infernal cape on completion')
ON CONFLICT DO NOTHING;

-- ── LMS (Last Man Standing) ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('mini-lms', 'atom-round', 'Match with shrinking zone'),
('mini-lms', 'atom-hit-check', 'PvP combat'),
('mini-lms', 'atom-multi-style', 'Switching between mage/range/melee'),
('mini-lms', 'atom-equip-swap', 'Rapid gear switching'),
('mini-lms', 'atom-protection-check', 'Prayer switching against players'),
('mini-lms', 'atom-instant-action', 'Prayer and gear instant switches'),
('mini-lms', 'atom-consume', 'Eating and potting during fights'),
('mini-lms', 'atom-cooldown', 'Eat and spec cooldowns'),
('mini-lms', 'atom-timer', 'Zone shrink timer'),
('mini-lms', 'atom-wave-spawn', 'Loot crates spawn periodically'),
('mini-lms', 'atom-broadcast-loot', 'Kill feed announcements'),
('mini-lms', 'atom-achievement-trigger', 'Win notification')
ON CONFLICT DO NOTHING;

-- ── SHOPS ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('econ-shop-buy', 'atom-npc-dialogue', 'Talk to shopkeeper to open'),
('econ-shop-buy', 'atom-consume', 'Coins consumed for purchase'),
('econ-shop-buy', 'atom-loot-drop', 'Item added to inventory'),
('econ-shop-buy', 'atom-tick-cycle', 'Shop stock replenishes over time')
ON CONFLICT DO NOTHING;

-- ── GRAND EXCHANGE ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('econ-ge-buy', 'atom-queued-action', 'Offer sits until matched'),
('econ-ge-buy', 'atom-system-announcement', 'Notification when offer completes'),
('econ-ge-buy', 'atom-consume', 'Coins held until purchase'),
('econ-ge-buy', 'atom-loot-drop', 'Items delivered to GE collect box')
ON CONFLICT DO NOTHING;

-- ── BANKING ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('inv-bank', 'atom-instant-action', 'Deposit and withdraw are instant'),
('inv-bank', 'atom-npc-dialogue', 'Talk to banker or use booth')
ON CONFLICT DO NOTHING;

-- ── DOORS ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('world-door', 'atom-instant-action', 'Door toggles open/closed instantly'),
('world-door', 'atom-phase-transition', 'Door state changes from closed to open')
ON CONFLICT DO NOTHING;

-- ── NPC DIALOGUE ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('world-npc-talk', 'atom-npc-dialogue', 'Core dialogue display'),
('world-npc-talk', 'atom-player-choice', 'Player picks response'),
('world-npc-talk', 'atom-dialogue-branch', 'NPC reacts to choice and game state')
ON CONFLICT DO NOTHING;

-- ── DEATH ──
INSERT INTO mechanic_recipes (mechanic_id, atom_id, notes) VALUES
('death-pvm', 'atom-timer', 'Gravestone timer before items lost'),
('death-pvm', 'atom-loot-drop', 'Items dropped at death location'),
('death-pvm', 'atom-teleport', 'Respawn at set location'),
('death-pvm', 'atom-system-announcement', 'Oh dear you are dead message')
ON CONFLICT DO NOTHING;

-- Show recipe summary
SELECT a.name as atom, COUNT(r.mechanic_id) as used_in_features
FROM mechanics a
JOIN mechanic_recipes r ON r.atom_id = a.id
WHERE a.category_id = 'atoms'
GROUP BY a.name
ORDER BY used_in_features DESC;
