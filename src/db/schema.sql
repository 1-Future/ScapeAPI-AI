-- ══════════════════════════════════════════════════════════════════════════════
-- Scape Engine — Database Schema
-- Structured tick event system + mechanic registry + training analytics
-- Matches ScapeTickTracker TickData contract
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════════════════════════════
-- LAYER 1: TICK EVENT SYSTEM
-- Every tick emits a structured snapshot. This is the source of truth.
-- ══════════════════════════════════════════════════════════════════════════════

-- Sessions represent a continuous engine run (server start → stop)
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  session_type  TEXT NOT NULL DEFAULT 'training', -- training, live, test
  config        JSONB DEFAULT '{}',              -- RL hyperparams, gear loadout, etc.
  notes         TEXT
);

-- Episodes represent one game instance (one Inferno attempt, one play session)
CREATE TABLE IF NOT EXISTS episodes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID REFERENCES sessions(id),
  episode_num   INT NOT NULL,
  replay_id     TEXT,                             -- 6-char replay ID (e.g. R6G6WR)
  challenge     TEXT DEFAULT 'full',              -- full, wave35, jads, zuk, etc.
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  outcome       TEXT,                             -- died, complete, timeout
  final_wave    INT DEFAULT 0,
  final_hp      INT DEFAULT 0,
  damage_taken  INT DEFAULT 0,
  ticks_survived INT DEFAULT 0,
  supplies_used JSONB DEFAULT '{}',              -- {brews: 2, restores: 4, ...}
  max_wave      INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_episodes_session ON episodes(session_id);
CREATE INDEX IF NOT EXISTS idx_episodes_replay ON episodes(replay_id);
CREATE INDEX IF NOT EXISTS idx_episodes_outcome ON episodes(outcome);

-- Ticks are the atomic unit. One row per game tick per episode.
CREATE TABLE IF NOT EXISTS ticks (
  id            BIGSERIAL PRIMARY KEY,
  episode_id    UUID REFERENCES episodes(id),
  tick_num      INT NOT NULL,

  -- Player state (matches ScapeTickTracker.PlayerState)
  player_x      INT,
  player_y      INT,
  player_hp     INT,
  player_max_hp INT,
  player_pp     INT,
  player_max_pp INT,
  player_run    INT,
  player_weapon TEXT,

  -- Combat state (matches ScapeTickTracker.CombatState)
  in_combat         BOOLEAN DEFAULT FALSE,
  target_name       TEXT,
  target_x          INT,
  target_y          INT,
  target_hp         INT,
  target_max_hp     INT,
  distance_to_target INT,
  player_attack_cd  INT,                          -- ticks until next attack
  active_prayers    TEXT[],                        -- {'rigour','protect_from_missiles'}

  -- Wave state
  wave              INT DEFAULT 0,
  mob_count         INT DEFAULT 0,

  -- RL action taken this tick
  action_id         INT,
  action_name       TEXT
);

CREATE INDEX IF NOT EXISTS idx_ticks_episode ON ticks(episode_id);
CREATE INDEX IF NOT EXISTS idx_ticks_episode_num ON ticks(episode_id, tick_num);

-- Events are discrete things that happen during a tick
CREATE TABLE IF NOT EXISTS tick_events (
  id            BIGSERIAL PRIMARY KEY,
  episode_id    UUID REFERENCES episodes(id),
  tick_num      INT NOT NULL,
  event_type    TEXT NOT NULL,                    -- hitsplat, projectile, prayer_change,
                                                  -- potion_drink, npc_death, npc_spawn,
                                                  -- wave_start, wave_complete, los_check, etc.
  source_type   TEXT,                             -- player, npc, system
  source_name   TEXT,
  target_type   TEXT,
  target_name   TEXT,
  data          JSONB NOT NULL DEFAULT '{}'       -- event-specific payload
);

CREATE INDEX IF NOT EXISTS idx_events_episode ON tick_events(episode_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON tick_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_episode_tick ON tick_events(episode_id, tick_num);

-- NPC snapshots per tick (matches ScapeTickTracker.NearbyNpc)
CREATE TABLE IF NOT EXISTS tick_npcs (
  id            BIGSERIAL PRIMARY KEY,
  episode_id    UUID REFERENCES episodes(id),
  tick_num      INT NOT NULL,
  npc_name      TEXT NOT NULL,
  npc_id        INT,
  x             INT,
  y             INT,
  hp            INT,
  max_hp        INT,
  size          INT DEFAULT 1,
  attack_style  TEXT,
  attack_delay  INT,
  has_los       BOOLEAN,
  dying         BOOLEAN DEFAULT FALSE,
  target        TEXT                              -- who is this NPC targeting
);

CREATE INDEX IF NOT EXISTS idx_npcs_episode ON tick_npcs(episode_id);
CREATE INDEX IF NOT EXISTS idx_npcs_episode_tick ON tick_npcs(episode_id, tick_num);

-- Projectiles in flight per tick
CREATE TABLE IF NOT EXISTS tick_projectiles (
  id            BIGSERIAL PRIMARY KEY,
  episode_id    UUID REFERENCES episodes(id),
  tick_num      INT NOT NULL,
  source_name   TEXT,
  target_name   TEXT,
  style         TEXT,                             -- ranged, magic, melee
  damage        INT,
  remaining_delay INT,
  total_delay   INT
);

CREATE INDEX IF NOT EXISTS idx_proj_episode ON tick_projectiles(episode_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- LAYER 2: MECHANIC REGISTRY
-- Every game mechanic is a registered, testable unit.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mechanic_categories (
  id            TEXT PRIMARY KEY,                 -- combat, movement, defense, spawning, targeting
  name          TEXT NOT NULL,
  description   TEXT,
  sort_order    INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mechanics (
  id            TEXT PRIMARY KEY,                 -- los-camping, prayer-scan, hitbox-distance
  category_id   TEXT REFERENCES mechanic_categories(id),
  name          TEXT NOT NULL,                    -- "LoS Camping" (IP-free label)
  description   TEXT,                             -- what this mechanic does

  -- Status tracking
  status        TEXT DEFAULT 'not_implemented',   -- not_implemented, implemented, tested, verified, signed_off
  verified_against TEXT,                          -- inferno_trainer, scape_tick_tracker, manual
  verified_at   TIMESTAMPTZ,
  signed_off    BOOLEAN DEFAULT FALSE,            -- human manually approved
  signed_off_at TIMESTAMPTZ,
  signed_off_by TEXT,

  -- Links
  test_file     TEXT,                             -- ScapeTests/tests/06-combat-prayer.md
  test_ids      TEXT[],                           -- {TEST-0601, TEST-0602}
  source_files  TEXT[],                           -- {src/world/npcs.js, src/combat/combat.js}

  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mechanics_category ON mechanics(category_id);
CREATE INDEX IF NOT EXISTS idx_mechanics_status ON mechanics(status);

-- Which mobs/systems use which mechanics
CREATE TABLE IF NOT EXISTS mechanic_usages (
  id            SERIAL PRIMARY KEY,
  mechanic_id   TEXT REFERENCES mechanics(id),
  entity_type   TEXT NOT NULL,                    -- npc, player, system
  entity_name   TEXT NOT NULL,                    -- jal_mejrah, jal_ak, player_combat
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_usage_mechanic ON mechanic_usages(mechanic_id);

-- Test runs for mechanics
CREATE TABLE IF NOT EXISTS mechanic_tests (
  id            SERIAL PRIMARY KEY,
  mechanic_id   TEXT REFERENCES mechanics(id),
  test_name     TEXT NOT NULL,
  status        TEXT DEFAULT 'pending',           -- pending, running, passed, failed, skipped
  run_at        TIMESTAMPTZ DEFAULT NOW(),
  duration_ms   INT,
  expected      JSONB,
  actual        JSONB,
  diff          JSONB,                            -- what didn't match
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_mech_tests_mechanic ON mechanic_tests(mechanic_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- LAYER 3: TRAINING ANALYTICS
-- Aggregated stats for RL training progress.
-- ══════════════════════════════════════════════════════════════════════════════

-- Materialized view for episode analytics (refreshed periodically)
-- We'll create this as a regular view first, can materialize later
CREATE OR REPLACE VIEW training_summary AS
SELECT
  s.id as session_id,
  s.session_type,
  s.started_at as session_start,
  COUNT(e.id) as total_episodes,
  AVG(e.final_wave) as avg_wave,
  MAX(e.max_wave) as best_wave,
  AVG(e.ticks_survived) as avg_ticks,
  AVG(e.damage_taken) as avg_damage,
  COUNT(CASE WHEN e.outcome = 'complete' THEN 1 END) as completions,
  COUNT(CASE WHEN e.outcome = 'died' THEN 1 END) as deaths,
  COUNT(CASE WHEN e.outcome = 'timeout' THEN 1 END) as timeouts
FROM sessions s
LEFT JOIN episodes e ON e.session_id = s.id
GROUP BY s.id, s.session_type, s.started_at;

-- Wave progression over time
CREATE OR REPLACE VIEW wave_progression AS
SELECT
  e.session_id,
  e.episode_num,
  e.max_wave,
  e.final_hp,
  e.damage_taken,
  e.ticks_survived,
  e.outcome,
  e.started_at
FROM episodes e
ORDER BY e.started_at;

-- ══════════════════════════════════════════════════════════════════════════════
-- LAYER 4: GAME CONTENT REGISTRY
-- Items, NPCs, and content definitions — queryable, not hardcoded JS.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS item_defs (
  id            INT PRIMARY KEY,
  name          TEXT NOT NULL,
  examine       TEXT,
  category      TEXT,                             -- weapon, armour, potion, food, etc.
  equip_slot    TEXT,                             -- head, body, legs, weapon, shield, etc.
  speed         INT,
  weight        NUMERIC(6,2),
  value         INT DEFAULT 0,
  stats         JSONB DEFAULT '{}',              -- {ranged: 100, prayer: 1, def_stab: 6, ...}
  equip_reqs    JSONB DEFAULT '{}',              -- {ranged: 70, defence: 70}
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS npc_defs (
  id            TEXT PRIMARY KEY,                 -- jal_mejrah, jal_ak, etc.
  name          TEXT NOT NULL,
  examine       TEXT,
  combat_level  INT DEFAULT 0,
  max_hp        INT DEFAULT 1,
  size          INT DEFAULT 1,
  attack_speed  INT DEFAULT 4,
  attack_range  INT DEFAULT 1,
  attack_style  TEXT DEFAULT 'melee',
  max_hit       INT DEFAULT 1,
  aggressive    BOOLEAN DEFAULT FALSE,
  aggro_range   INT DEFAULT 3,
  stats         JSONB DEFAULT '{}',              -- full stat block
  mechanics     TEXT[],                           -- {los-camping, ranged-attack, stat-drain}
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Mechanic Categories
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO mechanic_categories (id, name, description, sort_order) VALUES
  ('combat',    'Combat',     'Attack mechanics, damage, accuracy, special attacks', 1),
  ('movement',  'Movement',   'NPC and player movement, pathing, collision', 2),
  ('defense',   'Defense',    'Prayer, potions, healing, damage reduction', 3),
  ('spawning',  'Spawning',   'Wave systems, mob spawning, phase transitions', 4),
  ('targeting', 'Targeting',  'Aggro, auto-retaliate, priority targeting', 5),
  ('visual',    'Visual',     'Animations, hitsplats, overhead text', 6),
  ('economy',   'Economy',    'Items, shops, trading, drops', 7),
  ('skills',    'Skills',     'Gathering, processing, experience, levels', 8)
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DATA: Known Mechanics (from yesterday's session)
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO mechanics (id, category_id, name, description, status, verified_against, source_files, notes) VALUES
  -- Combat
  ('ranged-attack',     'combat',   'Ranged Attack',        'Projectile-based attack with flight time and prayer check on land', 'implemented', NULL, '{src/combat/combat.js,src/combat/projectiles.js}', NULL),
  ('magic-attack',      'combat',   'Magic Attack',         'Magic-style projectile attack', 'implemented', NULL, '{src/combat/combat.js}', NULL),
  ('melee-attack',      'combat',   'Melee Attack',         'Adjacency-required attack, no projectile', 'implemented', NULL, '{src/combat/combat.js}', NULL),
  ('prayer-scan',       'combat',   'Prayer Scan',          'Read target prayer, attack with opposite style', 'implemented', NULL, '{src/content/inferno/mobs.js}', 'Blob and Jad use this'),
  ('stat-drain',        'combat',   'Stat Drain',           'Reduce target stat on hit (e.g. run energy)', 'implemented', NULL, '{src/content/inferno/mobs.js}', 'Bat drains run energy'),
  ('resurrection',      'combat',   'Resurrection',         'Revive dead ally at reduced HP', 'not_implemented', NULL, '{}', 'Mager mechanic - not yet built'),
  ('aoe-attack',        'combat',   'AoE Attack',           'Hit area, not single target', 'not_implemented', NULL, '{}', 'Healer sparks'),
  ('enrage',            'combat',   'Enrage',               'Change stats/speed at HP threshold', 'not_implemented', NULL, '{}', 'Zuk enrage below 240 HP'),
  ('attack-speed',      'combat',   'Attack Speed',         'Weapon-specific tick delay between attacks', 'verified', 'inferno_trainer', '{src/combat/combat.js}', 'ACB=5, blowpipe inferred'),
  ('accuracy-formula',  'combat',   'Accuracy Formula',     'OSRS max hit and accuracy roll calculations', 'tested', 'scape_tick_tracker', '{src/combat/combat.js}', 'Verified in ScapeTests'),
  ('hitbox-distance',   'combat',   'Hitbox Distance',      'Chebyshev distance from closest tile on multi-tile NPC hitbox', 'verified', 'inferno_trainer', '{src/world/los.js,src/game-loop.js}', 'Fixed Apr 4 2026'),

  -- Movement
  ('los-camping',       'movement', 'LoS Camping',          'Stop moving when line of sight acquired (canMove = !hasLOS)', 'verified', 'inferno_trainer', '{src/world/npcs.js}', 'Matched to osrs-sdk Unit.canMove()'),
  ('cardinal-only',     'movement', 'Cardinal-Only Movement','Large NPCs (size>=2) move one axis at a time, X first', 'implemented', NULL, '{src/world/npcs.js}', 'West lure mechanic'),
  ('west-lure',         'movement', 'West Lure',            'X-axis priority creates predictable NPC pathing', 'implemented', NULL, '{src/world/npcs.js}', NULL),
  ('dig-teleport',      'movement', 'Dig Teleport',         'After N ticks no LoS, teleport to target', 'implemented', NULL, '{src/content/inferno/mobs.js}', 'Meleer mechanic'),
  ('safespot-corner',   'movement', 'Corner Safespot',      'If diagonal blocked, try X-only move (enables corner trapping)', 'implemented', NULL, '{src/world/npcs.js}', NULL),
  ('pillar-collision',  'movement', 'Pillar Collision',     'Multi-tile entities block NPC and player pathing', 'implemented', NULL, '{src/world/npcs.js,src/world/entities.js}', NULL),
  ('player-auto-path',  'movement', 'Player Auto-Pathing',  'Player auto-walks to attack range when targeting NPC', 'verified', 'inferno_trainer', '{src/game-loop.js}', 'Fixed hitbox pathing Apr 4'),

  -- Defense
  ('prayer-protection', 'defense',  'Prayer Protection',    'Reduce damage by style match (protect from X)', 'implemented', NULL, '{src/game-loop.js}', NULL),
  ('prayer-drain',      'defense',  'Prayer Drain',         'Tick-based drain with per-prayer rates and resistance formula', 'verified', 'inferno_trainer', '{src/game-loop.js}', 'OSRS formula: drainRate, counter, 2*bonus+60 resistance'),
  ('potion-healing',    'defense',  'Potion Healing',       'Sara brew: +16 HP, dose system, 3-tick cooldown', 'verified', NULL, '{src/training-bridge.js}', 'Direct drinkPotion() in bridge'),
  ('prayer-restore',    'defense',  'Prayer Restore',       'Super restore: +32 PP at 99 prayer, dose system', 'verified', NULL, '{src/training-bridge.js}', 'Fixed Apr 4 — commands were not registered'),
  ('hp-regen',          'defense',  'HP Regeneration',      '1 HP per 100 ticks natural regen', 'implemented', NULL, '{src/game-loop.js}', NULL),

  -- Spawning
  ('wave-system',       'spawning', 'Wave System',          'Sequential spawn groups with defined mob compositions', 'implemented', NULL, '{src/content/inferno/waves.js}', '69 waves defined'),
  ('bloblet-split',     'spawning', 'Bloblet Split',        'On blob death, spawn 3 smaller mobs', 'implemented', NULL, '{src/content/inferno/mobs.js}', NULL),
  ('healer-spawn',      'spawning', 'Healer Spawn',         'Spawn healers at HP threshold', 'not_implemented', NULL, '{}', 'Jad spawns healers at 50% HP'),
  ('phase-transition',  'spawning', 'Phase Transition',     'Boss changes behavior at HP percentage', 'not_implemented', NULL, '{}', 'Zuk set timer, shield spawns'),

  -- Targeting
  ('aggro-range',       'targeting','Aggro Range',           'Detect and target player within radius', 'implemented', NULL, '{src/world/npcs.js}', NULL),
  ('auto-retaliate',    'targeting','Auto-Retaliate',        'Attack back when hit', 'implemented', NULL, '{src/game-loop.js}', NULL),
  ('priority-target',   'targeting','Priority Target',       'Nibblers target pillars, not player', 'implemented', NULL, '{src/content/inferno/mobs.js}', NULL),
  ('healer-target',     'targeting','Healer Target',         'Heal ally instead of attack player', 'not_implemented', NULL, '{}', 'Jad healers, Zuk healers')
ON CONFLICT (id) DO NOTHING;

-- Seed mechanic usages
INSERT INTO mechanic_usages (mechanic_id, entity_type, entity_name, notes) VALUES
  ('ranged-attack',     'npc', 'jal_mejrah',  'Bat — ranged attack, drains run energy'),
  ('ranged-attack',     'npc', 'jal_xil',     'Ranger — dual shoulder projectiles'),
  ('magic-attack',      'npc', 'jal_zek',     'Mager — magic attack, can resurrect'),
  ('prayer-scan',       'npc', 'jal_ak',      'Blob — scans prayer, attacks opposite'),
  ('prayer-scan',       'npc', 'jal_tok_jad', 'Jad — scans prayer, mage or range'),
  ('stat-drain',        'npc', 'jal_mejrah',  'Bat — drains 300 run energy per hit'),
  ('los-camping',       'npc', 'jal_mejrah',  NULL),
  ('los-camping',       'npc', 'jal_xil',     NULL),
  ('los-camping',       'npc', 'jal_zek',     NULL),
  ('los-camping',       'npc', 'jal_ak',      NULL),
  ('cardinal-only',     'npc', 'jal_mejrah',  'Size 2'),
  ('cardinal-only',     'npc', 'jal_ak',      'Size 3'),
  ('cardinal-only',     'npc', 'jal_xil',     'Size 3'),
  ('cardinal-only',     'npc', 'jal_imkot',   'Size 4'),
  ('cardinal-only',     'npc', 'jal_zek',     'Size 4'),
  ('cardinal-only',     'npc', 'jal_tok_jad', 'Size 5'),
  ('dig-teleport',      'npc', 'jal_imkot',   'Meleer digs after 50 ticks no LoS'),
  ('priority-target',   'npc', 'jal_nib',     'Nibblers target pillars'),
  ('bloblet-split',     'npc', 'jal_ak',      'Blob spawns 3 bloblets on death'),
  ('prayer-drain',      'player', 'player_combat', 'Per-prayer drain rates with equipment resistance'),
  ('potion-healing',    'player', 'player_combat', 'Sara brew heals 16 HP'),
  ('prayer-restore',    'player', 'player_combat', 'Super restore +32 PP at 99 prayer'),
  ('hitbox-distance',   'player', 'player_combat', 'Player range check uses closest hitbox tile'),
  ('hitbox-distance',   'npc', 'all_npcs',    'NPC movement distance uses closest hitbox tile'),
  ('player-auto-path',  'player', 'player_combat', 'Auto-walk to closest hitbox tile on target')
ON CONFLICT DO NOTHING;
