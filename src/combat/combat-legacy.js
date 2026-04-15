// ── Legacy combat formulas — the pre-OSRS-accurate baseline from the fork ────
// The ScapeAPI fork we branched from had a simpler set of combat formulas
// before they were rewritten to be OSRS-wiki-accurate (the current ones in
// src/combat/combat.js). Keeping the legacy versions in a dedicated module is
// useful for:
//
//   1. Regression: compare current DPS output against the old baseline to
//      confirm the rewrite didn't silently change expected value ranges.
//   2. RL training: the legacy formulas are cheaper and more permissive — RL
//      agents can warm up against them before switching to accurate combat.
//   3. Documentation: they are the exact formulas the early bosses were
//      balanced against, so historical damage logs make sense in context.
//
// Nothing here is wired into the live combat path. Callers that want legacy
// behavior import explicitly. Pure functions, no state mutation.
//
// Source: ScapeAPI fork @ /src/combat/combat.js (pre-wiki rewrite).
// -----------------------------------------------------------------------------

'use strict';

// Legacy effective-level formula — did NOT floor the potion+prayer result
// before adding style/8, which means minor drift at high levels. Kept here so
// we can reproduce the old number exactly when diffing.
function legacyEffectiveLevel(base, potion, prayerMult, styleBonus) {
  return Math.floor((base + potion + styleBonus + 8) * prayerMult);
}

// Legacy max hit (melee). Same shape as current but fed by legacyEffectiveLevel.
function legacyMaxHitMelee(effStr, strBonus) {
  return Math.floor(0.5 + effStr * (strBonus + 64) / 640);
}

// Legacy attack roll.
function legacyAttackRoll(effAtk, equipBonus) {
  return effAtk * (equipBonus + 64);
}

// Legacy NPC defence roll — treats every style the same way (no magic branch).
function legacyNpcDefenceRoll(defLevel, defBonus) {
  return (defLevel + 9) * (defBonus + 64);
}

// Legacy hit-chance — identical to the current one; kept here for symmetry so
// a caller can assemble a complete legacy pipeline from one module.
function legacyAccuracy(atkRoll, defRoll) {
  if (atkRoll > defRoll) return 1 - (defRoll + 2) / (2 * (atkRoll + 1));
  return atkRoll / (2 * (defRoll + 1));
}

// Convenience: end-to-end legacy melee roll for a (base, str, eq) snapshot.
// Returns { maxHit, atkRoll, defRoll, hitChance } — no randomness, purely
// deterministic so tests can pin exact values.
function legacyMeleeSnapshot(attacker, defender, styleBonus = 3) {
  const { atkLevel, strLevel, potionAtk = 0, potionStr = 0, prayerAtk = 1.0, prayerStr = 1.0, atkBonus = 0, strBonus = 0 } = attacker;
  const { defLevel = 1, defBonus = 0 } = defender;
  const effAtk = legacyEffectiveLevel(atkLevel, potionAtk, prayerAtk, styleBonus);
  const effStr = legacyEffectiveLevel(strLevel, potionStr, prayerStr, styleBonus);
  const atkRoll = legacyAttackRoll(effAtk, atkBonus);
  const defRoll = legacyNpcDefenceRoll(defLevel, defBonus);
  const maxHit = legacyMaxHitMelee(effStr, strBonus);
  const hitChance = legacyAccuracy(atkRoll, defRoll);
  return { maxHit, atkRoll, defRoll, hitChance, effAtk, effStr };
}

module.exports = {
  legacyEffectiveLevel,
  legacyMaxHitMelee,
  legacyAttackRoll,
  legacyNpcDefenceRoll,
  legacyAccuracy,
  legacyMeleeSnapshot,
};
