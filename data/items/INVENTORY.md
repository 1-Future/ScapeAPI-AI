# data/items/ — Scape Canonical Item Database (JSON)

Parallel JSON canon to the runtime `src/data/items.js` / `src/content/aelgard/items-*.js`
system. These files are Scape-flavored, Marstead-compliant, and designed to be the
authoritative data source for future loaders, builder UI, codex pages, and hiscores.

## File layout

| File | Scope | ID range |
|---|---|---|
| `equipment.json` | Scape-native tier chains (Tinroot → Aeldra), slot-complete kits per tier | snake_case string IDs |
| `consumables.json` | Regional food (9 regions), potions, cures, teleports, light sources | snake_case |
| `resources.json` | Ores/bars/logs/fish/herbs/seeds/runes/hides/essence per skill | snake_case |
| `quest-items.json` | Keys, letters, relics, plot tokens used by quest agent | snake_case |
| `reagents.json` | Boss-drop reagents + base-item pairs (no content deprecation) | snake_case |
| `recipes.json` | Skill recipes (smithing, herblore, crafting, fletching, cooking) + reagent combine recipes | snake_case |

## ID naming convention

Strings, snake_case. Examples:
- `rune_scimitar`, `coalsteel_platebody`, `aeldra_longsword`
- `super_attack_potion_4`, `saltbrine_brined_mackerel`
- `grimy_ranarr`, `tinroot_ore`, `blood_rune`
- `ember_of_the_mire` (reagent), `scorched_rune_scimitar` (reagent product)

Existing numeric IDs in `src/data/items.js` (1000–99999 range) are NOT touched.
This DB is additive.

## Scape tier progression (not OSRS copy)

| Tier | Skill req | Scape name | OSRS parity |
|---|---|---|---|
| 0 | 1 | Tinroot | Bronze |
| 1 | 1 | Pigiron | Iron |
| 2 | 5 | Coalsteel | Steel |
| 3 | 10 | Brassforge | Black (monster drop only) |
| 4 | 20 | Quicksilver | Mithril |
| 5 | 30 | Blacksteel | Adamant |
| 6 | 40 | Darkiron | (between adamant/rune) |
| 7 | 50 | Runeforge | Rune |
| 8 | 60 | Dragonsteel | Dragon |
| 9 | 70 | Aeldra | post-Dragon / Barrows-tier |
| 10 | 75+ | Wyrmforged | Torva/Masori / god-tier uniques |

Each tier has:
- 10 weapon variants: dagger, shortsword, longsword, scimitar, mace, battleaxe, warhammer, two-hander, halberd, spear
- 9 armor slots: helm, body, legs, boots, gloves, shield, cape, ring, amulet
- Ranged/magic variants where appropriate

## Marstead compliance

Every item answers: **what is its niche? what is the tradeoff?**

- **Sidegrades:** scimitars fast/slash, longswords balanced, daggers stab-BiS, halberds 2-tile reach
- **Encounter-specific BiS:** `scorched_*` (fire-weakness mobs), `brine_blessed_*` (undead), `aeldra_*` (dragonkin)
- **Degradation:** Aeldra+ pieces use `aeldra_charge` (reagent); Wyrmforged degrades without `wyrm_scale`
- **Weight tradeoff:** heavier tiers penalise agility/run energy
- **Skill reqs:** no single-stat gate — most end-tier gear requires combined skills (def+prayer, atk+slayer)
- **Reagent upgrades:** 60+ pairs — new boss drops combine with OLD gear to create BiS-niche variants, never deprecating the base

## Counts (final)

See commit `[burn-wave2] item DB complete` body for exact category counts.
