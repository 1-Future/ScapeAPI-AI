// ══════════════════════════════════════════════════════════════════════════════
// Agility Skill — Rooftop courses, obstacles, graceful marks
//
// Design Knobs (P13):
//   Beginner: 10k XP/hr, Background attention, free, safe
//   Intermediate: 25k XP/hr, Active attention, free, safe
//   Advanced: 45k XP/hr, Active attention, free, minor fall damage
//   Elite: 60k XP/hr, Max Focus attention, free, significant fall damage
//
// Manifesto P02: covers Background → Max Focus attention range.
// Manifesto P08: breakpoints at 10 (shortcuts), 30 (run energy regen), 50 (graceful), 70 (elite areas)
// ══════════════════════════════════════════════════════════════════════════════

const { xpToLevel } = require('./gathering');

// ── Course definitions ─────────────────────────────────────────────────────

const courses = new Map();

function defineCourse(opts) {
  courses.set(opts.id, {
    id: opts.id,
    name: opts.name,
    region: opts.region,
    level: opts.level,
    obstacles: opts.obstacles, // [{ name, xp, failChance, failDamage, ticks }]
    lapXp: opts.lapXp, // bonus XP for completing full lap
    markChance: opts.markChance || 0, // chance of graceful mark per lap
    attention: opts.attention,
  });
}

function getCourse(id) { return courses.get(id); }
function listCourses() { return [...courses.values()]; }

// ── Run a course lap ───────────────────────────────────────────────────────

function attemptObstacle(player, courseId, obstacleIndex) {
  const course = courses.get(courseId);
  if (!course) return { error: 'unknown_course' };

  const level = player.skills?.agility?.level || 1;
  if (level < course.level) return { error: 'level_too_low', required: course.level };

  const obstacle = course.obstacles[obstacleIndex];
  if (!obstacle) return { error: 'invalid_obstacle' };

  // Fail chance decreases with level above requirement
  const levelAbove = Math.max(0, level - course.level);
  const adjustedFail = Math.max(0, obstacle.failChance - levelAbove * 0.01);
  const failed = Math.random() < adjustedFail;

  if (failed) {
    const damage = obstacle.failDamage || 0;
    if (damage > 0) player.hp = Math.max(1, player.hp - damage);
    return { success: false, damage, obstacle: obstacle.name };
  }

  // Grant XP
  if (!player.skills.agility) player.skills.agility = { level: 1, xp: 0 };
  player.skills.agility.xp += obstacle.xp;
  const newLevel = xpToLevel(player.skills.agility.xp);
  if (newLevel > player.skills.agility.level) {
    player.skills.agility.level = newLevel;
  }

  const isLastObstacle = obstacleIndex === course.obstacles.length - 1;
  let lapBonus = 0;
  let gotMark = false;

  if (isLastObstacle) {
    // Lap complete bonus
    lapBonus = course.lapXp;
    player.skills.agility.xp += lapBonus;
    const lvl2 = xpToLevel(player.skills.agility.xp);
    if (lvl2 > player.skills.agility.level) player.skills.agility.level = lvl2;

    // Graceful mark chance
    if (course.markChance > 0 && Math.random() < course.markChance) {
      gotMark = true;
    }
  }

  return {
    success: true,
    obstacle: obstacle.name,
    xp: obstacle.xp,
    lapComplete: isLastObstacle,
    lapBonus,
    gotMark,
    nextObstacle: isLastObstacle ? 0 : obstacleIndex + 1,
    level: player.skills.agility.level,
  };
}

// ── XP/hr calculator ───────────────────────────────────────────────────────

function computeCourseRate(courseId, level) {
  const course = courses.get(courseId);
  if (!course) return null;
  const totalTicks = course.obstacles.reduce((s, o) => s + o.ticks, 0);
  const totalObstacleXp = course.obstacles.reduce((s, o) => s + o.xp, 0);
  const lapXp = totalObstacleXp + course.lapXp;
  const ticksPerLap = totalTicks;
  const lapsPerHour = Math.floor(6000 / ticksPerLap); // 6000 ticks/hr
  return {
    courseId, courseName: course.name, level,
    ticksPerLap, lapsPerHour,
    xpPerLap: lapXp,
    xpPerHour: lapsPerHour * lapXp,
    attention: course.attention,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// DEFINE COURSES
// ══════════════════════════════════════════════════════════════════════════════

defineCourse({
  id: 'heartlands_rooftop', name: 'Heartlands Rooftop Course', region: 'Heartlands',
  level: 1, lapXp: 8, markChance: 0.3, attention: 'Multitask',
  obstacles: [
    { name: 'Rough wall', xp: 2, failChance: 0.05, failDamage: 0, ticks: 6 },
    { name: 'Clothesline', xp: 2, failChance: 0.03, failDamage: 0, ticks: 5 },
    { name: 'Gap', xp: 3, failChance: 0.08, failDamage: 1, ticks: 4 },
    { name: 'Wall', xp: 2, failChance: 0.05, failDamage: 0, ticks: 5 },
    { name: 'Gap', xp: 3, failChance: 0.08, failDamage: 1, ticks: 4 },
    { name: 'Tightrope', xp: 3, failChance: 0.10, failDamage: 2, ticks: 6 },
  ],
});

defineCourse({
  id: 'saltbrine_rooftop', name: 'Saltbrine Harbour Course', region: 'Saltbrine',
  level: 20, lapXp: 20, markChance: 0.4, attention: 'Active',
  obstacles: [
    { name: 'Cargo net', xp: 5, failChance: 0.08, failDamage: 1, ticks: 5 },
    { name: 'Ship mast', xp: 6, failChance: 0.10, failDamage: 2, ticks: 6 },
    { name: 'Rope swing', xp: 7, failChance: 0.12, failDamage: 3, ticks: 5 },
    { name: 'Gangplank', xp: 5, failChance: 0.06, failDamage: 1, ticks: 4 },
    { name: 'Anchor chain', xp: 8, failChance: 0.10, failDamage: 2, ticks: 6 },
    { name: 'Harbour leap', xp: 8, failChance: 0.15, failDamage: 4, ticks: 4 },
    { name: 'Dock slide', xp: 5, failChance: 0.05, failDamage: 1, ticks: 3 },
  ],
});

defineCourse({
  id: 'sootworks_course', name: 'Sootworks Pipe Network', region: 'Sootworks',
  level: 50, lapXp: 50, markChance: 0.5, attention: 'Active',
  obstacles: [
    { name: 'Steam pipe', xp: 12, failChance: 0.10, failDamage: 3, ticks: 5 },
    { name: 'Gear climb', xp: 15, failChance: 0.12, failDamage: 4, ticks: 6 },
    { name: 'Conveyor jump', xp: 14, failChance: 0.15, failDamage: 5, ticks: 4 },
    { name: 'Piston dodge', xp: 18, failChance: 0.18, failDamage: 6, ticks: 5 },
    { name: 'Exhaust vent', xp: 12, failChance: 0.10, failDamage: 3, ticks: 4 },
    { name: 'Furnace vault', xp: 20, failChance: 0.20, failDamage: 8, ticks: 5 },
  ],
});

defineCourse({
  id: 'inkweald_course', name: 'Inkweald Dreamwalk', region: 'Inkweald',
  level: 70, lapXp: 80, markChance: 0.6, attention: 'Max Focus',
  obstacles: [
    { name: 'Shifting bridge', xp: 20, failChance: 0.15, failDamage: 5, ticks: 5 },
    { name: 'Mirror corridor', xp: 22, failChance: 0.18, failDamage: 6, ticks: 5 },
    { name: 'Gravity flip', xp: 25, failChance: 0.20, failDamage: 8, ticks: 4 },
    { name: 'Ink river swim', xp: 18, failChance: 0.12, failDamage: 4, ticks: 6 },
    { name: 'Dream leap', xp: 28, failChance: 0.22, failDamage: 10, ticks: 4 },
    { name: 'Reality tear', xp: 30, failChance: 0.25, failDamage: 12, ticks: 5 },
    { name: 'Wakeup landing', xp: 15, failChance: 0.08, failDamage: 3, ticks: 3 },
  ],
});

// ── Graceful outfit (mark reward) ──────────────────────────────────────────
// Marks are accumulated and exchanged for graceful armour which reduces weight

const items = require('../data/items');
items.define({ id: 14001, name: 'Mark of grace', examine: 'A token earned from agility courses. Exchange for graceful armour.', value: 0, category: 'agility', stackable: true, weight: 0 });
items.define({ id: 14010, name: 'Graceful hood', examine: 'Lightweight headgear. Part of the graceful set.', value: 10000, category: 'armour', equipSlot: 'head', stats: {}, equipReqs: { agility: 50 }, weight: 0 });
items.define({ id: 14011, name: 'Graceful top', examine: 'Lightweight top. Part of the graceful set.', value: 15000, category: 'armour', equipSlot: 'body', stats: {}, equipReqs: { agility: 50 }, weight: 0 });
items.define({ id: 14012, name: 'Graceful legs', examine: 'Lightweight legs. Part of the graceful set.', value: 12000, category: 'armour', equipSlot: 'legs', stats: {}, equipReqs: { agility: 50 }, weight: 0 });
items.define({ id: 14013, name: 'Graceful gloves', examine: 'Lightweight gloves. Part of the graceful set.', value: 8000, category: 'armour', equipSlot: 'hands', stats: {}, equipReqs: { agility: 50 }, weight: 0 });
items.define({ id: 14014, name: 'Graceful boots', examine: 'Lightweight boots. Part of the graceful set.', value: 8000, category: 'armour', equipSlot: 'feet', stats: {}, equipReqs: { agility: 50 }, weight: 0 });
items.define({ id: 14015, name: 'Graceful cape', examine: 'Lightweight cape. Full graceful set restores run energy 30% faster.', value: 10000, category: 'armour', equipSlot: 'cape', stats: { prayer: 1 }, equipReqs: { agility: 50 }, weight: 0 });

// ══════════════════════════════════════════════════════════════════════════════

module.exports = { defineCourse, getCourse, listCourses, attemptObstacle, computeCourseRate, courses };
