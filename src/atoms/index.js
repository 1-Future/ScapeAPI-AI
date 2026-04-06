// ══════════════════════════════════════════════════════════════════════════════
// ATOM LIBRARY — The fundamental building blocks of the game engine
//
// Every game system is composed of atoms. An atom is a single, reusable
// mechanic with well-defined inputs, outputs, and tick behavior.
//
// Usage:
//   const { Timer, PeriodicAction, HitCheck } = require('./atoms');
//   const miningTimer = new PeriodicAction({ interval: 3, onTick: mine });
//   const combatRoll = HitCheck.roll(attacker, defender);
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
  // Timing
  Timer:              require('./timer'),
  Countdown:          require('./countdown'),
  Cooldown:           require('./cooldown'),
  TickCycle:          require('./tick-cycle'),

  // Actions
  PeriodicAction:     require('./periodic-action'),
  DelayedAction:      require('./delayed-action'),
  QueuedAction:       require('./queued-action'),

  // Combat
  HitCheck:           require('./hit-check'),
  ProtectionCheck:    require('./protection-check'),
  Flinch:             require('./flinch'),
  ForcedMovement:     require('./forced-movement'),
  StyleMatch:         require('./style-match'),
  SpecBar:            require('./spec-bar'),
  Projectile:         require('./projectile'),
  Freeze:             require('./freeze'),
  Poison:             require('./poison'),
  AttackStyle:        require('./attack-style'),
  SetEffect:          require('./set-effect'),
  BoltProc:           require('./bolt-proc'),
  Reflect:            require('./vengeance'),
  CombatLevel:        require('./combat-level'),
  Aggro:              require('./aggro'),
  CombatState:        require('./combat-state'),

  // Rewards
  XpDrop:             require('./xp-drop'),
  LootDrop:           require('./loot-drop'),
  Broadcast:          require('./broadcast'),

  // Inventory
  DoseSystem:         require('./dose-system'),
  Consume:            require('./consume'),

  // Rounds
  Round:              require('./round'),
  WaveSpawn:          require('./wave-spawn'),
  PhaseTransition:    require('./phase-transition'),

  // Dialogue
  Dialogue:           require('./dialogue'),
};
