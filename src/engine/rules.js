// ══════════════════════════════════════════════════════════════════════════════
// Rules Registry — data-driven rule definitions for the moderation system.
//
// A "rule" is a pure data object describing:
//   - id            short machine id (e.g. "rwt")
//   - title         human-readable title
//   - description   full description (shown in reports, /rules, etc.)
//   - severity      'minor' | 'major' | 'severe'
//   - default_action what happens on first confirmed strike if no escalation
//                    has been defined: 'warn' | 'mute' | 'tempban' | 'ban'
//   - escalation    ordered list of { strikes, action, duration_days }.
//                   When an incident is upheld, the player's strike count for
//                   that rule is incremented and the matching escalation rung
//                   determines the applied action.
//
// Rules live as data only — they don't apply themselves. moderation.js
// consumes the registry to decide what to do on upheld incidents.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const SEVERITIES = Object.freeze({ minor: 'minor', major: 'major', severe: 'severe' });
const ACTIONS = Object.freeze({
  warn: 'warn',
  mute: 'mute',
  kick: 'kick',
  tempban: 'tempban',
  ban: 'ban',
  rollback: 'rollback',
});

const _rules = new Map();

/**
 * defineRule(id, spec)
 * Registers a rule by id. Rules are idempotent (re-registering same id replaces
 * the prior entry). Throws on malformed spec so broken content is caught early.
 */
function defineRule(id, spec) {
  if (typeof id !== 'string' || !id) {
    throw new Error('defineRule: id must be a non-empty string');
  }
  if (!spec || typeof spec !== 'object') {
    throw new Error(`defineRule(${id}): spec must be an object`);
  }
  const { title, description, severity, default_action, escalation } = spec;
  if (typeof title !== 'string' || !title) {
    throw new Error(`defineRule(${id}): title required`);
  }
  if (typeof description !== 'string' || !description) {
    throw new Error(`defineRule(${id}): description required`);
  }
  if (!SEVERITIES[severity]) {
    throw new Error(`defineRule(${id}): severity must be minor|major|severe`);
  }
  if (!ACTIONS[default_action]) {
    throw new Error(`defineRule(${id}): default_action invalid (${default_action})`);
  }
  if (!Array.isArray(escalation) || escalation.length === 0) {
    throw new Error(`defineRule(${id}): escalation must be a non-empty array`);
  }
  // Validate escalation rungs. strikes must be ascending positive ints.
  let lastStrikes = 0;
  for (let i = 0; i < escalation.length; i++) {
    const rung = escalation[i];
    if (!rung || typeof rung !== 'object') {
      throw new Error(`defineRule(${id}): escalation[${i}] must be an object`);
    }
    if (typeof rung.strikes !== 'number' || !Number.isFinite(rung.strikes)
        || rung.strikes <= lastStrikes) {
      throw new Error(`defineRule(${id}): escalation[${i}].strikes must be ascending positive`);
    }
    if (!ACTIONS[rung.action]) {
      throw new Error(`defineRule(${id}): escalation[${i}].action invalid (${rung.action})`);
    }
    if (rung.duration_days !== null && !(typeof rung.duration_days === 'number' && rung.duration_days >= 0)) {
      throw new Error(`defineRule(${id}): escalation[${i}].duration_days must be null or non-negative number`);
    }
    lastStrikes = rung.strikes;
  }
  const frozen = Object.freeze({
    id,
    title,
    description,
    severity,
    default_action,
    escalation: Object.freeze(escalation.map(r => Object.freeze({
      strikes: r.strikes,
      action: r.action,
      duration_days: r.duration_days,
    }))),
    evidence_required: spec.evidence_required !== false, // default true
    appealable: spec.appealable !== false,               // default true
    tags: Object.freeze(Array.isArray(spec.tags) ? spec.tags.slice() : []),
  });
  _rules.set(id, frozen);
  return frozen;
}

function getRule(id) {
  return _rules.get(id) || null;
}

function hasRule(id) {
  return _rules.has(id);
}

function listRules() {
  return [..._rules.values()];
}

function listBySeverity(severity) {
  return listRules().filter(r => r.severity === severity);
}

function resetRules() {
  _rules.clear();
}

/**
 * resolveAction(rule, strikeCount)
 * Given a rule and the player's updated strike count for that rule (post-
 * increment), return the applicable escalation rung. If the count exceeds
 * the last defined rung, the last rung sticks.
 */
function resolveAction(rule, strikeCount) {
  if (!rule) return null;
  if (!Number.isFinite(strikeCount) || strikeCount <= 0) {
    return { strikes: 1, action: rule.default_action, duration_days: 0 };
  }
  let chosen = null;
  for (const rung of rule.escalation) {
    if (strikeCount >= rung.strikes) chosen = rung;
    else break;
  }
  return chosen || { strikes: 1, action: rule.default_action, duration_days: 0 };
}

module.exports = {
  defineRule, getRule, hasRule, listRules, listBySeverity,
  resolveAction, resetRules,
  SEVERITIES, ACTIONS,
};
