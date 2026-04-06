// ══════════════════════════════════════════════════════════════════════════════
// WORLD BUILDER — Populate the game world with nodes from mechanic definitions
// Creates resource nodes, NPCs, monsters, and objects at locations.
// ══════════════════════════════════════════════════════════════════════════════

const { list } = require('./mechanic');

function populateWorld(engine) {
  let nodeCount = 0;
  const id = () => `node-${++nodeCount}`;

  // ── LUMBRIDGE (0,0) ─────────────────────────────────────────────────────
  const lumbridge = { baseX: 0, baseY: 0 };
  // Resources
  engine.addNode({ id: id(), type: 'resource', name: 'Tree', x: 2, y: 1, mechanicId: 'chop-tree', respawnTicks: 5 });
  engine.addNode({ id: id(), type: 'resource', name: 'Tree', x: 3, y: 1, mechanicId: 'chop-tree', respawnTicks: 5 });
  engine.addNode({ id: id(), type: 'resource', name: 'Oak tree', x: 4, y: 2, mechanicId: 'chop-oak', respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: -2, y: 3, mechanicId: 'fish-shrimps', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: -3, y: 3, mechanicId: 'fish-trout', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'resource', name: 'Copper rock', x: 5, y: -3, mechanicId: 'mine-copper', respawnTicks: 4 });
  engine.addNode({ id: id(), type: 'resource', name: 'Tin rock', x: 6, y: -3, mechanicId: 'mine-tin', respawnTicks: 4 });
  engine.addNode({ id: id(), type: 'resource', name: 'Iron rock', x: 7, y: -3, mechanicId: 'mine-iron', respawnTicks: 9 });
  // Cooking range
  engine.addNode({ id: id(), type: 'object', name: 'Cooking range', x: -1, y: -1, mechanicId: 'cook-shrimps', data: { cookingStation: true } });
  // NPCs
  engine.addNode({ id: id(), type: 'npc', name: 'Cook', x: -1, y: -2, mechanicId: 'npc-cook' });
  engine.addNode({ id: id(), type: 'npc', name: 'Lumbridge Guide', x: 0, y: 0, mechanicId: 'npc-lumbridge-guide' });
  engine.addNode({ id: id(), type: 'npc', name: 'Hans', x: 1, y: -1, mechanicId: 'npc-hans' });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: -3, y: -1, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'npc', name: 'General Store', x: 2, y: -1, mechanicId: 'npc-general-store' });
  // Monsters
  engine.addNode({ id: id(), type: 'monster', name: 'Chicken', x: 3, y: 4, mechanicId: 'mob-chicken', hp: 3, respawnTicks: 5 });
  engine.addNode({ id: id(), type: 'monster', name: 'Chicken', x: 4, y: 4, mechanicId: 'mob-chicken', hp: 3, respawnTicks: 5 });
  engine.addNode({ id: id(), type: 'monster', name: 'Cow', x: 6, y: 5, mechanicId: 'mob-cow', hp: 8, respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'monster', name: 'Cow', x: 7, y: 5, mechanicId: 'mob-cow', hp: 8, respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'monster', name: 'Cow', x: 7, y: 6, mechanicId: 'mob-cow', hp: 8, respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'monster', name: 'Goblin', x: -5, y: 4, mechanicId: 'mob-goblin', hp: 5, respawnTicks: 6 });
  engine.addNode({ id: id(), type: 'monster', name: 'Giant Rat', x: -4, y: -5, mechanicId: 'mob-rat', hp: 5, respawnTicks: 6 });
  engine.addNode({ id: id(), type: 'monster', name: 'Giant Spider', x: -5, y: -5, mechanicId: 'mob-spider', hp: 4, respawnTicks: 6 });

  // ── VARROCK (50, 0) ─────────────────────────────────────────────────────
  const vx = 50, vy = 0;
  engine.addNode({ id: id(), type: 'resource', name: 'Oak tree', x: vx+3, y: vy+1, mechanicId: 'chop-oak', respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'resource', name: 'Willow tree', x: vx+4, y: vy+3, mechanicId: 'chop-willow', respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'resource', name: 'Iron rock', x: vx-5, y: vy-4, mechanicId: 'mine-iron', respawnTicks: 9 });
  engine.addNode({ id: id(), type: 'resource', name: 'Silver rock', x: vx-5, y: vy-5, mechanicId: 'mine-silver', respawnTicks: 12 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: vx+1, y: vy, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'npc', name: 'Grand Exchange Clerk', x: vx+5, y: vy-2, mechanicId: 'npc-grand-exchange' });
  engine.addNode({ id: id(), type: 'npc', name: 'Zaff', x: vx-2, y: vy+1, mechanicId: 'npc-staff-shop' });
  engine.addNode({ id: id(), type: 'npc', name: 'Aubury', x: vx+3, y: vy-1, mechanicId: 'npc-rune-shop' });
  engine.addNode({ id: id(), type: 'monster', name: 'Guard', x: vx+2, y: vy+3, mechanicId: 'mob-guard', hp: 22, respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'monster', name: 'Dark Wizard', x: vx, y: vy+8, mechanicId: 'mob-dark-wizard', hp: 16, respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'monster', name: 'Man', x: vx-1, y: vy+2, mechanicId: 'mob-man', hp: 7, respawnTicks: 6 });

  // ── FALADOR (100, 0) ────────────────────────────────────────────────────
  const fx = 100, fy = 0;
  engine.addNode({ id: id(), type: 'resource', name: 'Willow tree', x: fx-3, y: fy+2, mechanicId: 'chop-willow', respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'resource', name: 'Coal rock', x: fx+5, y: fy-6, mechanicId: 'mine-coal', respawnTicks: 30 });
  engine.addNode({ id: id(), type: 'resource', name: 'Iron rock', x: fx+4, y: fy-6, mechanicId: 'mine-iron', respawnTicks: 9 });
  engine.addNode({ id: id(), type: 'resource', name: 'Gold rock', x: fx+6, y: fy-6, mechanicId: 'mine-gold', respawnTicks: 60 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: fx+1, y: fy, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'npc', name: 'Gem Trader', x: fx-2, y: fy-1, mechanicId: 'npc-gem-trader' });
  engine.addNode({ id: id(), type: 'monster', name: 'Guard', x: fx+2, y: fy+2, mechanicId: 'mob-guard', hp: 22, respawnTicks: 10 });

  // ── DRAYNOR (20, 10) ────────────────────────────────────────────────────
  const dx = 20, dy = 10;
  engine.addNode({ id: id(), type: 'resource', name: 'Willow tree', x: dx-2, y: dy+1, mechanicId: 'chop-willow', respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'resource', name: 'Willow tree', x: dx-3, y: dy+1, mechanicId: 'chop-willow', respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: dx-4, y: dy+2, mechanicId: 'fish-shrimps', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: dx+1, y: dy, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'monster', name: 'Man', x: dx+2, y: dy+1, mechanicId: 'mob-man', hp: 7, respawnTicks: 6 });

  // ── AL KHARID (30, -10) ─────────────────────────────────────────────────
  const ax = 30, ay = -10;
  engine.addNode({ id: id(), type: 'resource', name: 'Iron rock', x: ax+3, y: ay-2, mechanicId: 'mine-iron', respawnTicks: 9 });
  engine.addNode({ id: id(), type: 'resource', name: 'Silver rock', x: ax+4, y: ay-2, mechanicId: 'mine-silver', respawnTicks: 12 });
  engine.addNode({ id: id(), type: 'resource', name: 'Gold rock', x: ax+5, y: ay-2, mechanicId: 'mine-gold', respawnTicks: 60 });
  engine.addNode({ id: id(), type: 'resource', name: 'Mithril rock', x: ax+3, y: ay-3, mechanicId: 'mine-mithril', respawnTicks: 120 });
  engine.addNode({ id: id(), type: 'resource', name: 'Adamantite rock', x: ax+4, y: ay-3, mechanicId: 'mine-adamantite', respawnTicks: 240 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: ax+1, y: ay, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'npc', name: 'Al-Kharid Crafting Store', x: ax-1, y: ay+1, mechanicId: 'npc-general-store' });
  engine.addNode({ id: id(), type: 'monster', name: 'Al-Kharid Warrior', x: ax+2, y: ay+2, mechanicId: 'mob-al-kharid-war', hp: 19, respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'monster', name: 'Scorpion', x: ax+6, y: ay-4, mechanicId: 'mob-scorpion', hp: 17, respawnTicks: 8 });

  // ── EDGEVILLE (40, -15) ─────────────────────────────────────────────────
  const ex = 40, ey = -15;
  engine.addNode({ id: id(), type: 'resource', name: 'Yew tree', x: ex-2, y: ey+1, mechanicId: 'chop-yew', respawnTicks: 50 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: ex+1, y: ey, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'monster', name: 'Man', x: ex+3, y: ey+1, mechanicId: 'mob-man', hp: 7, respawnTicks: 6 });
  // Wilderness border
  engine.addNode({ id: id(), type: 'monster', name: 'Skeleton', x: ex, y: ey-5, mechanicId: 'mob-skeleton', hp: 24, respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'monster', name: 'Hill Giant', x: ex+5, y: ey-8, mechanicId: 'mob-hill-giant', hp: 35, respawnTicks: 12 });

  // ── KARAMJA (0, 30) ─────────────────────────────────────────────────────
  const kx = 0, ky = 30;
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: kx+2, y: ky+1, mechanicId: 'fish-lobster', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: kx+3, y: ky+1, mechanicId: 'fish-swordfish', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'monster', name: 'Imp', x: kx-2, y: ky+3, mechanicId: 'mob-imp', hp: 8, respawnTicks: 6 });
  engine.addNode({ id: id(), type: 'monster', name: 'Jogre', x: kx+5, y: ky+5, mechanicId: 'mob-jogre', hp: 60, respawnTicks: 10 });

  // ── BARBARIAN VILLAGE (25, -5) ──────────────────────────────────────────
  const bx = 25, by = -5;
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: bx-1, y: by+2, mechanicId: 'fish-trout', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: bx-2, y: by+2, mechanicId: 'fish-salmon', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'resource', name: 'Willow tree', x: bx+3, y: by+1, mechanicId: 'chop-willow', respawnTicks: 10 });

  // ── ARDOUGNE (150, 0) ───────────────────────────────────────────────────
  const arx = 150, ary = 0;
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: arx+1, y: ary, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: arx-5, y: ary+3, mechanicId: 'fish-shark', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'monster', name: 'Man', x: arx+3, y: ary+1, mechanicId: 'mob-man', hp: 7, respawnTicks: 6 });
  engine.addNode({ id: id(), type: 'monster', name: 'Guard', x: arx+2, y: ary-1, mechanicId: 'mob-guard', hp: 22, respawnTicks: 10 });

  // ── SEERS/CAMELOT (130, -10) ────────────────────────────────────────────
  const sx = 130, sy = -10;
  engine.addNode({ id: id(), type: 'resource', name: 'Maple tree', x: sx+2, y: sy+1, mechanicId: 'chop-maple', respawnTicks: 15 });
  engine.addNode({ id: id(), type: 'resource', name: 'Yew tree', x: sx-3, y: sy+2, mechanicId: 'chop-yew', respawnTicks: 50 });
  engine.addNode({ id: id(), type: 'resource', name: 'Flax', x: sx+5, y: sy+3, mechanicId: 'craft-spin-flax', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: sx+1, y: sy, mechanicId: 'npc-banker' });

  // ── CATHERBY (140, 5) ──────────────────────────────────────────────────
  const cx = 140, cy = 5;
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: cx-2, y: cy+2, mechanicId: 'fish-lobster', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: cx-3, y: cy+2, mechanicId: 'fish-shark', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: cx+1, y: cy, mechanicId: 'npc-banker' });

  // ── CANIFIS (80, 30) ───────────────────────────────────────────────────
  const cnx = 80, cny = 30;
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: cnx+1, y: cny, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'monster', name: 'Werewolf', x: cnx+3, y: cny+2, mechanicId: 'mob-werewolf', hp: 100, respawnTicks: 15 });
  engine.addNode({ id: id(), type: 'monster', name: 'Ghast', x: cnx-5, y: cny+5, mechanicId: 'mob-ghast', hp: 30, respawnTicks: 10 });

  // ── RELLEKKA (120, -30) ────────────────────────────────────────────────
  const rx = 120, ry = -30;
  engine.addNode({ id: id(), type: 'resource', name: 'Fishing spot', x: rx-2, y: ry+2, mechanicId: 'fish-shark', respawnTicks: 0 });
  engine.addNode({ id: id(), type: 'npc', name: 'Banker', x: rx+1, y: ry, mechanicId: 'npc-banker' });
  engine.addNode({ id: id(), type: 'monster', name: 'Rock Crab', x: rx+5, y: ry+5, mechanicId: 'mob-rock-crab', hp: 50, respawnTicks: 5 });
  engine.addNode({ id: id(), type: 'monster', name: 'Rock Crab', x: rx+6, y: ry+5, mechanicId: 'mob-rock-crab', hp: 50, respawnTicks: 5 });

  // ── SLAYER TOWER (85, 25) ──────────────────────────────────────────────
  const stx = 85, sty = 25;
  engine.addNode({ id: id(), type: 'monster', name: 'Crawling Hand', x: stx, y: sty, mechanicId: 'mob-crawling-hand', hp: 16, respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'monster', name: 'Banshee', x: stx+1, y: sty+1, mechanicId: 'mob-banshee', hp: 22, respawnTicks: 8 });
  engine.addNode({ id: id(), type: 'monster', name: 'Infernal Mage', x: stx+2, y: sty+2, mechanicId: 'mob-infernal-mage', hp: 60, respawnTicks: 10 });
  engine.addNode({ id: id(), type: 'monster', name: 'Bloodveld', x: stx, y: sty+3, mechanicId: 'mob-bloodveld', hp: 120, respawnTicks: 12 });
  engine.addNode({ id: id(), type: 'monster', name: 'Aberrant Spectre', x: stx+1, y: sty+4, mechanicId: 'mob-aberrant-spec', hp: 90, respawnTicks: 12 });
  engine.addNode({ id: id(), type: 'monster', name: 'Gargoyle', x: stx+2, y: sty+5, mechanicId: 'mob-gargoyle', hp: 105, respawnTicks: 12 });
  engine.addNode({ id: id(), type: 'monster', name: 'Nechryael', x: stx, y: sty+6, mechanicId: 'mob-nechryael', hp: 105, respawnTicks: 12 });
  engine.addNode({ id: id(), type: 'monster', name: 'Abyssal Demon', x: stx+1, y: sty+7, mechanicId: 'mob-abyssal-demon', hp: 150, respawnTicks: 12 });

  console.log(`[world] Populated ${nodeCount} nodes across 12 areas`);
  return nodeCount;
}

module.exports = { populateWorld };
