// ══════════════════════════════════════════════════════════════════════════════
// SLAYER EXTENDED: Unlockables, rewards, superior monsters, boss variants
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

// Slayer unlockables (purchased with slayer reward points)
const UNLOCKS = [
  { id: 'slayer-unlock-broader',    name: 'Broader Fletching',       cost: 300, desc: 'Fletch broad arrows and bolts' },
  { id: 'slayer-unlock-slayer-helm',name: 'Malevolent Masquerade',   cost: 400, desc: 'Create slayer helmet' },
  { id: 'slayer-unlock-ring',       name: 'Ring Bling',              cost: 300, desc: 'Craft slayer rings' },
  { id: 'slayer-unlock-herb-sack',  name: 'Herb Sack',              cost: 750, desc: 'Store up to 30 of each herb' },
  { id: 'slayer-unlock-extend-tasks',name:'Extend Task',            cost: 100, desc: 'Extend certain task amounts' },
  { id: 'slayer-unlock-block-slot', name: 'Block Task Slot',         cost: 100, desc: 'Permanently block a task' },
  { id: 'slayer-unlock-gargoyle',   name: 'Gargoyle Smasher',       cost: 120, desc: 'Auto-smash gargoyles' },
  { id: 'slayer-unlock-rockslug',   name: 'Slug Salter',            cost: 80,  desc: 'Auto-salt rock slugs' },
  { id: 'slayer-unlock-lizard',     name: 'Reptile Freezer',        cost: 90,  desc: 'Auto-ice lizards' },
  { id: 'slayer-unlock-bigger-boss',name: 'Bigger and Badder',      cost: 150, desc: 'Chance to spawn superior variants' },
  { id: 'slayer-unlock-boss-tasks', name: 'Like a Boss',            cost: 200, desc: 'Receive boss slayer tasks' },
  { id: 'slayer-unlock-red-dragon', name: 'Seeing Red',             cost: 50,  desc: 'Assigned red dragon tasks' },
  { id: 'slayer-unlock-mithril-d',  name: 'I Hope You Mith Me',     cost: 80,  desc: 'Assigned mithril dragon tasks' },
  { id: 'slayer-unlock-aviansie',   name: 'Watch the Birdie',       cost: 80,  desc: 'Assigned aviansie tasks' },
  { id: 'slayer-unlock-tzhaar',     name: 'Hot Stuff',              cost: 100, desc: 'TzHaar tasks give option for Fight Caves/Inferno' },
  { id: 'slayer-unlock-basilisk',   name: 'Basilocked',             cost: 80,  desc: 'Assigned basilisk tasks' },
  { id: 'slayer-unlock-fossil-island',name:'Fossil Gotcha',         cost: 100, desc: 'Assigned fossil island wyvern tasks' },
  { id: 'slayer-unlock-rune-pouch', name: 'Rune Pouch',             cost: 750, desc: 'Store 3 types of runes' },
];

// Superior slayer monsters
const SUPERIORS = [
  { id: 'mob-sup-crawling-hand', name: 'Crushing Hand',           hp: 200, maxHit: 12, slayerReq: 5 },
  { id: 'mob-sup-rock-slug',     name: 'Giant Rockslug',          hp: 250, maxHit: 13, slayerReq: 20 },
  { id: 'mob-sup-cockatrice',    name: 'Cockathrice',             hp: 280, maxHit: 14, slayerReq: 25 },
  { id: 'mob-sup-pyrefiend',     name: 'Flaming Pyrelord',        hp: 300, maxHit: 15, slayerReq: 30 },
  { id: 'mob-sup-basilisk',      name: 'Monstrous Basilisk',      hp: 350, maxHit: 18, slayerReq: 40 },
  { id: 'mob-sup-infernal-mage', name: 'Malevolent Mage',         hp: 320, maxHit: 16, slayerReq: 45 },
  { id: 'mob-sup-bloodveld',     name: 'Insatiable Bloodveld',    hp: 400, maxHit: 17, slayerReq: 50 },
  { id: 'mob-sup-aberrant',      name: 'Abhorrent Spectre',       hp: 400, maxHit: 20, slayerReq: 60 },
  { id: 'mob-sup-gargoyle',      name: 'Marble Gargoyle',         hp: 450, maxHit: 22, slayerReq: 75 },
  { id: 'mob-sup-nechryael',     name: 'Nechryarch',              hp: 500, maxHit: 24, slayerReq: 80 },
  { id: 'mob-sup-abyssal-demon', name: 'Greater Abyssal Demon',   hp: 550, maxHit: 22, slayerReq: 85 },
  { id: 'mob-sup-dark-beast',    name: 'Night Beast',             hp: 600, maxHit: 26, slayerReq: 90 },
  { id: 'mob-sup-smoke-devil',   name: 'Nuclear Smoke Devil',     hp: 600, maxHit: 28, slayerReq: 93 },
  { id: 'mob-sup-dust-devil',    name: 'Choke Devil',             hp: 450, maxHit: 20, slayerReq: 65 },
  { id: 'mob-sup-kurask',        name: 'King Kurask',             hp: 400, maxHit: 18, slayerReq: 70 },
  { id: 'mob-sup-turoth',        name: 'Spiked Turoth',           hp: 350, maxHit: 16, slayerReq: 55 },
  { id: 'mob-sup-jelly',         name: 'Vitreous Jelly',          hp: 350, maxHit: 15, slayerReq: 52 },
  { id: 'mob-sup-wyrm',          name: 'Shadow Wyrm',             hp: 500, maxHit: 20, slayerReq: 62 },
  { id: 'mob-sup-drake',         name: 'Guardian Drake',          hp: 600, maxHit: 25, slayerReq: 84 },
  { id: 'mob-sup-hydra',         name: 'Colossal Hydra',          hp: 800, maxHit: 30, slayerReq: 95 },
];

// Slayer equipment
const SLAYER_GEAR = [
  { id: 'equip-slayer-helm',      name: 'Slayer Helmet',          reqs: { slayer: 1 } },
  { id: 'equip-slayer-helm-i-melee',name:'Slayer Helm (i) Melee', reqs: { slayer: 1 } },
  { id: 'equip-black-mask',       name: 'Black Mask',             reqs: {} },
  { id: 'equip-black-mask-i',     name: 'Black Mask (i)',         reqs: {} },
  { id: 'equip-nose-peg',         name: 'Nose Peg',               reqs: { slayer: 60 } },
  { id: 'equip-earmuffs',         name: 'Earmuffs',               reqs: { slayer: 15 } },
  { id: 'equip-face-mask',        name: 'Face Mask',              reqs: { slayer: 10 } },
  { id: 'equip-mirror-shield',    name: 'Mirror Shield',          reqs: { slayer: 25, defence: 20 } },
  { id: 'equip-leaf-bladed-sword',name: 'Leaf-bladed Sword',      reqs: { slayer: 55, attack: 50 } },
  { id: 'equip-leaf-bladed-axe',  name: 'Leaf-bladed Battleaxe',  reqs: { slayer: 55, attack: 65 } },
  { id: 'equip-boots-of-brimstone',name:'Boots of Brimstone',    reqs: { slayer: 44, defence: 70 } },
  { id: 'equip-drakes-claw',      name: "Drake's Claw",           reqs: { slayer: 84 } },
  { id: 'equip-brimstone-ring',   name: 'Brimstone Ring',         reqs: {} },
  { id: 'equip-bonecrusher',      name: 'Bonecrusher',            reqs: {} },
  { id: 'equip-ash-sanctifier',   name: 'Ash Sanctifier',         reqs: {} },
];

let count = 0;
for (const u of UNLOCKS) {
  define({ id: u.id, name: u.name, type: 'unlockable', atoms: {}, config: { cost: u.cost, description: u.desc } });
  count++;
}
for (const s of SUPERIORS) {
  define({
    id: s.id, name: s.name, type: 'monster',
    requires: { levels: { slayer: s.slayerReq } },
    atoms: { cooldown: { duration: 4 }, hitCheck: { maxHit: s.maxHit, style: 'melee' }, flinch: { attackSpeed: 4 } },
    config: { hp: s.hp, superior: true }
  });
  count++;
}
for (const g of SLAYER_GEAR) {
  define({ id: g.id, name: g.name, type: 'equipment', requires: { levels: g.reqs }, atoms: {}, config: { slot: 'head' } });
  count++;
}

console.log(`[defs] Slayer Extended: ${UNLOCKS.length} unlocks, ${SUPERIORS.length} superiors, ${SLAYER_GEAR.length} gear = ${count} mechanics`);
