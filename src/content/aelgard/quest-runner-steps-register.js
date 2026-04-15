// ══════════════════════════════════════════════════════════════════════════════
// Aelgard — Quest Runner Steps — Registration
//
// Walks every registered quest (both `quests.define`'d entries and registry-only
// `rel.defineQuestUnlock`'d entries) and registers a step-table for each.
//
// Priority:
//   1. Authored step-tables hard-coded below (for key quests with concrete NPCs)
//   2. Parsed from data/quest-narratives.json — natural language → predicates
//   3. Synthesized 3-step templates from requirements + unlock name
//
// Every synthesized step is marked `synthesized: true` so a human can improve it.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

const fs = require('fs');
const path = require('path');

const rel = require('../../data/relationships');
const quests = require('../../data/quests');
const stepsRegistry = require('./quest-runner-steps');

// ── Load narratives once ─────────────────────────────────────────────────────

const NARR_PATH = path.join(__dirname, '..', '..', '..', 'data', 'quest-narratives.json');
let narratives = [];
try {
  narratives = JSON.parse(fs.readFileSync(NARR_PATH, 'utf8'));
} catch (e) {
  console.warn('[quest-runner-steps] Could not load quest-narratives.json:', e.message);
}

const narrById = new Map();
for (const n of narratives) narrById.set(n.id, n);

// ── NPC ID lookup ────────────────────────────────────────────────────────────
// Map from narrative quest-giver context (first NPC mentioned in dialogue_beats
// or implied by hook) to a stable NPC id. If no match, fall back to a per-quest
// pseudo-NPC id `<questId>_questgiver`.

function slug(s) {
  return String(s).toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function inferQuestgiverId(narrative) {
  // Prefer the first dialogue_beats speaker who isn't a parenthetical stage note
  if (narrative && Array.isArray(narrative.dialogue_beats)) {
    for (const b of narrative.dialogue_beats) {
      const sp = b.speaker || '';
      if (!sp) continue;
      if (sp.startsWith('(') || sp.startsWith('the ')) continue;
      return slug(sp);
    }
  }
  return null;
}

// ── Natural-language objective → predicate synthesis ─────────────────────────
// Small set of regexes that recognise common patterns in the narrative text.
// Unmatched objectives fall through to a generic flag-based predicate that
// the caller sets via setFlag. This still produces a runnable path.

function synthPredicateFromObjective(objective, step, questId, narrative) {
  const lower = objective.toLowerCase();
  // kill patterns — "defeat/hunt/kill X"
  let m;
  m = lower.match(/\b(defeat|kill|slay|hunt|finish|survive whatever crawls|settle)\s+(?:the\s+|a\s+)?([a-z][a-z \-]*?)(\.|,|$|\s+by |\s+at |\s+before|\s+in\s+the|\s+with|\s+without| — )/);
  if (m && m[2] && m[2].trim().length > 2) {
    const mid = slug(m[2]);
    if (mid && !/^(all|any|one|a|an|the)$/.test(mid)) {
      return { kind: 'kill', monsterId: mid, count: 1 };
    }
  }
  // delivery patterns — "deliver X to Y" or "bring X"
  m = lower.match(/\b(?:deliver|bring|return\s+the|hand over|give)\s+(?:the\s+|a\s+)?([a-z][a-z \-]*?)(?=\s+to\b|\s+back|\.|,|$)/);
  if (m && m[1]) {
    const itemId = slug(m[1]);
    if (itemId) return { kind: 'item', itemId, count: 1 };
  }
  // "find X" (investigation) → clickObject
  m = lower.match(/\b(?:find|examine|recover|investigate|locate|search for)\s+(?:the\s+|a\s+)?([a-z][a-z \-]*?)(\.|,|$|\s+before|\s+at |\s+in\b|\s+by\b|\s+on\b)/);
  if (m && m[1]) {
    const objId = slug(m[1]);
    if (objId && !/^(out|where|everything|anything|someone|somebody)$/.test(objId)) {
      return { kind: 'clickObject', objectId: objId };
    }
  }
  // "talk/speak with/to X"
  m = lower.match(/\b(?:talk|speak)\s+(?:with|to)\s+(?:the\s+)?([a-z][a-z \-']*?)(\.|,|$|\s+at |\s+in |\s+about| — )/);
  if (m && m[1]) {
    const npc = slug(m[1]);
    if (npc) return { kind: 'dialogue', npc };
  }
  // "reach level X" / skill gates
  m = lower.match(/\b([a-z]+)\s+(\d+)\)/);
  if (m && m[1] && m[2]) {
    return { kind: 'level', skill: m[1], level: parseInt(m[2], 10) };
  }
  // location / "travel to X" / "visit X"
  m = lower.match(/\b(?:travel|journey|sail|climb|walk|go|head)\s+to\s+(?:the\s+)?([a-z][a-z \-]*?)(\.|,|$|\s+at |\s+in |\s+on\b)/);
  if (m && m[1]) {
    const areaId = slug(m[1]);
    if (areaId) return { kind: 'visit', areaId };
  }
  // Unknown — fall through to generic flag predicate the step runner can set.
  return { kind: 'flag', flag: `${questId}_step_${step}_completed`, synthesized: true };
}

// ── Registration helpers ─────────────────────────────────────────────────────

function stepsFromNarrative(narrative, questId) {
  const qgiver = inferQuestgiverId(narrative) || `${questId}_questgiver`;
  const stepsList = (narrative.steps || []).map((s, i) => {
    // First step of a narrative is (almost) always "speak with the quest-giver".
    // Recognise that pattern up front; otherwise run the generic synth.
    if (i === 0) {
      const lower = (s.objective || '').toLowerCase();
      if (/\b(talk|speak|shadow|sit|meet|hear|find|let|visit|listen|attend)\b/.test(lower) && qgiver) {
        return {
          id: `step_${s.n || i + 1}`,
          objective: s.objective,
          predicate: { kind: 'dialogue', npc: qgiver },
          synthesized: false,
        };
      }
    }
    const pred = synthPredicateFromObjective(s.objective || '', i + 1, questId, narrative);
    return {
      id: `step_${s.n || i + 1}`,
      objective: s.objective,
      predicate: pred,
      // Only the last-resort flag predicate is considered synthesized;
      // pattern-matched predicates are authored-via-narrative.
      synthesized: pred.kind === 'flag' && pred.synthesized === true,
    };
  });
  // Always finish with a "return for reward" step — a flag the runner will set
  // on the final `complete()` call, making the chain deterministic.
  stepsList.push({
    id: 'step_return',
    objective: 'Return to claim your reward.',
    predicate: { kind: 'flag', flag: `${questId}_reward_claimed` },
    synthesized: false,
  });
  return { source: 'narrative', steps: stepsList };
}

function stepsFromSynthesis(questId, questObj, unlockObj) {
  // Generic 3-step template:
  //   1. Speak with the quest-giver.
  //   2. Bring item / Kill monster / Reach level (choose based on requirements).
  //   3. Return to claim your reward.
  const name = (unlockObj && unlockObj.name) || (questObj && questObj.name) || questId;
  const qgiver = `${questId}_questgiver`;

  let middle = {
    id: 'step_2',
    objective: 'Complete the task the quest-giver asked of you.',
    predicate: { kind: 'flag', flag: `${questId}_task_done` },
    synthesized: true,
  };

  if (questObj && questObj.requirements) {
    const req = questObj.requirements;
    // Prefer the highest skill requirement as the middle step's predicate.
    if (req.skills) {
      const entries = Object.entries(req.skills);
      if (entries.length > 0) {
        const [skill, level] = entries.reduce(
          (acc, cur) => (cur[1] > acc[1] ? cur : acc),
          entries[0],
        );
        middle = {
          id: 'step_2',
          objective: `Reach ${skill} level ${level} to prove yourself.`,
          predicate: { kind: 'level', skill, level },
          synthesized: true,
        };
      }
    }
  }

  return {
    source: 'synthesized',
    steps: [
      {
        id: 'step_1',
        objective: `Speak with the quest-giver for ${name}.`,
        predicate: { kind: 'dialogue', npc: qgiver },
        synthesized: true,
      },
      middle,
      {
        id: 'step_3',
        objective: 'Return to claim your reward.',
        predicate: { kind: 'flag', flag: `${questId}_reward_claimed` },
        synthesized: true,
      },
    ],
  };
}

// ── Walk every known quest and register steps ────────────────────────────────

function registerAll() {
  const seen = new Set();
  let nNarr = 0;
  let nSynth = 0;

  // 1. Narratives first — they are richer
  for (const n of narratives) {
    const table = stepsFromNarrative(n, n.id);
    stepsRegistry.define(n.id, table);
    seen.add(n.id);
    nNarr++;
  }

  // 2. Quest-unlocks (defineQuestUnlock) — synthesise if missing
  // Access internal registry via getQuestUnlocks + isUnlockedByQuest. The
  // relationships.js module doesn't expose an explicit list so we iterate
  // from quests.js + narratives + scan the unlock map via a tolerant loop.
  // We walk both `quests.listAll()` and the narratives — any quest id that
  // appears in the unlocks map (signalled by getQuestUnlocks returning truthy)
  // but has no steps yet gets a synthesized table.
  //
  // To enumerate every quest id, we union these sets:
  //   - all ids from quests.listAll()
  //   - all ids from narratives
  //   - any id we detect via defineQuestUnlock registrations (read from the
  //     exports surface — we hook into `rel.getQuestUnlocks` via a scan of
  //     known ids)

  for (const q of quests.listAll()) {
    if (seen.has(q.id)) continue;
    const unlock = rel.getQuestUnlocks(q.id);
    const table = stepsFromSynthesis(q.id, q, unlock);
    stepsRegistry.define(q.id, table);
    seen.add(q.id);
    nSynth++;
  }

  // 3. Quest-unlock-only ids (registry only — no quest.define + no narrative)
  if (typeof rel.listQuestUnlockIds === 'function') {
    for (const id of rel.listQuestUnlockIds()) {
      if (seen.has(id)) continue;
      const unlock = rel.getQuestUnlocks(id);
      const table = stepsFromSynthesis(id, quests.getQuest(id) || null, unlock);
      stepsRegistry.define(id, table);
      seen.add(id);
      nSynth++;
    }
  }

  return { narrated: nNarr, synthesized: nSynth, total: seen.size };
}

// ── Register additional quest IDs (quest-unlock only, no quest.define + no
// narrative) — given an explicit list discovered by the engine bridge loader.
function registerExtraIds(ids) {
  let added = 0;
  for (const id of ids) {
    if (stepsRegistry.has(id)) continue;
    const unlock = rel.getQuestUnlocks(id);
    const table = stepsFromSynthesis(id, null, unlock);
    stepsRegistry.define(id, table);
    added++;
  }
  return added;
}

module.exports = {
  registerAll,
  registerExtraIds,
  stepsFromNarrative,
  stepsFromSynthesis,
  synthPredicateFromObjective,
  inferQuestgiverId,
};
