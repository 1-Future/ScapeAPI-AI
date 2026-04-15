// ══════════════════════════════════════════════════════════════════════════════
// Voting — Community polls
//
// Admin creates polls. Players vote. Results tallied on close.
// Secret ballot: only aggregate counts are exposed; per-voter choices are
// stored locally but never emitted externally.
//
// Poll shape:
//   {
//     id:          integer monotonic
//     title:       string (max 120 chars)
//     options:     [string, ...] (2..8 options)
//     createdBy:   playerId
//     createdByName: string
//     createdAt:   ms epoch
//     closesAt:    ms epoch | null (null = open indefinitely, admin-close only)
//     closed:      boolean
//     closedAt:    ms epoch | null
//     counts:      { [optIdx]: voteCount }
//     voters:      { [playerId]: optIdx }   // kept private — never in snapshots
//     total:       integer
//   }
//
// Privacy contract:
//   - snapshot() strips `voters` from every poll.
//   - getPollResults() returns only counts, percentages, and winner.
// ══════════════════════════════════════════════════════════════════════════════

'use strict';

let persistence = null;
try { persistence = require('./persistence'); } catch (_) { /* optional */ }

const MAX_TITLE_LEN = 120;
const MAX_OPTION_LEN = 80;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 8;
const DEFAULT_DAYS = 7;

const polls = new Map();   // pollId → poll
let nextPollId = 1;
let _saveFile = 'polls.json';

function now() { return Date.now(); }

function _sanitize(s, maxLen) {
  if (typeof s !== 'string') return '';
  return s.replace(/[\x00-\x1f\x7f]/g, '').slice(0, maxLen).trim();
}

// ── Create / close ───────────────────────────────────────────────────────────

/**
 * createPoll({ title, options, createdBy, createdByName, durationDays })
 * Returns { ok, poll } or { ok:false, error }.
 */
function createPoll(spec) {
  spec = spec || {};
  const title = _sanitize(spec.title, MAX_TITLE_LEN);
  if (title.length < 3) return { ok: false, error: 'Title must be at least 3 characters.' };
  if (!Array.isArray(spec.options)) return { ok: false, error: 'Options must be an array.' };
  const opts = spec.options
    .map(o => _sanitize(o, MAX_OPTION_LEN))
    .filter(o => o.length >= 1);
  if (opts.length < MIN_OPTIONS) return { ok: false, error: `Need at least ${MIN_OPTIONS} options.` };
  if (opts.length > MAX_OPTIONS) return { ok: false, error: `No more than ${MAX_OPTIONS} options.` };
  // Deduplicate (case-insensitive).
  const seen = new Set();
  for (const o of opts) {
    const k = o.toLowerCase();
    if (seen.has(k)) return { ok: false, error: `Duplicate option: ${o}` };
    seen.add(k);
  }

  const days = Math.max(1, Math.min(90, spec.durationDays | 0 || DEFAULT_DAYS));
  const closesAt = spec.neverCloses ? null : now() + days * 24 * 60 * 60 * 1000;

  const id = nextPollId++;
  const poll = {
    id,
    title,
    options: opts.slice(),
    createdBy: spec.createdBy != null ? spec.createdBy : null,
    createdByName: _sanitize(spec.createdByName || '', 32) || 'admin',
    createdAt: now(),
    closesAt,
    closed: false,
    closedAt: null,
    counts: Object.fromEntries(opts.map((_, i) => [i, 0])),
    voters: {},
    total: 0,
  };
  polls.set(id, poll);
  return { ok: true, poll: snapshot(poll) };
}

/**
 * closePoll(pollId, by) — admin-close. Seals the poll and marks closedAt.
 */
function closePoll(pollId, by) {
  const p = polls.get(pollId);
  if (!p) return { ok: false, error: 'No such poll.' };
  if (p.closed) return { ok: false, error: 'Already closed.' };
  p.closed = true;
  p.closedAt = now();
  p.closedBy = by != null ? by : null;
  return { ok: true, poll: snapshot(p) };
}

/**
 * Tick — called periodically to auto-close expired polls. Returns an array of
 * polls that just closed (for event emission by callers).
 */
function sweepExpired(atTime = now()) {
  const closed = [];
  for (const p of polls.values()) {
    if (p.closed) continue;
    if (p.closesAt != null && atTime >= p.closesAt) {
      p.closed = true;
      p.closedAt = atTime;
      closed.push(snapshot(p));
    }
  }
  return closed;
}

// ── Voting ───────────────────────────────────────────────────────────────────

/**
 * vote(pollId, playerId, choice)
 *   choice can be an integer index or a string matching an option.
 * Rules: one vote per player; changing vote requires unvote() first.
 */
function vote(pollId, playerId, choice) {
  if (playerId == null) return { ok: false, error: 'No player.' };
  const p = polls.get(pollId);
  if (!p) return { ok: false, error: 'No such poll.' };
  if (p.closed) return { ok: false, error: 'Poll is closed.' };
  if (p.closesAt != null && now() >= p.closesAt) {
    p.closed = true;
    p.closedAt = now();
    return { ok: false, error: 'Poll just closed.' };
  }

  let optIdx = null;
  if (typeof choice === 'number' && Number.isInteger(choice)) {
    optIdx = choice;
  } else if (typeof choice === 'string') {
    // numeric string?
    if (/^\d+$/.test(choice.trim())) {
      optIdx = parseInt(choice, 10);
    } else {
      const low = choice.trim().toLowerCase();
      optIdx = p.options.findIndex(o => o.toLowerCase() === low);
      if (optIdx < 0) {
        // Try startsWith match for convenience.
        optIdx = p.options.findIndex(o => o.toLowerCase().startsWith(low));
      }
    }
  }
  if (optIdx == null || optIdx < 0 || optIdx >= p.options.length) {
    return { ok: false, error: `Unknown option. Valid: ${p.options.map((o, i) => `${i}=${o}`).join(', ')}` };
  }

  if (p.voters[playerId] != null) {
    return { ok: false, error: 'Already voted. Use unvote first.' };
  }
  p.voters[playerId] = optIdx;
  p.counts[optIdx] = (p.counts[optIdx] | 0) + 1;
  p.total++;
  return { ok: true, pollId: p.id, option: p.options[optIdx] };
}

function unvote(pollId, playerId) {
  const p = polls.get(pollId);
  if (!p) return { ok: false, error: 'No such poll.' };
  if (p.closed) return { ok: false, error: 'Poll is closed.' };
  const prev = p.voters[playerId];
  if (prev == null) return { ok: false, error: 'You have not voted.' };
  delete p.voters[playerId];
  p.counts[prev] = Math.max(0, (p.counts[prev] | 0) - 1);
  p.total = Math.max(0, p.total - 1);
  return { ok: true };
}

// ── Read ─────────────────────────────────────────────────────────────────────

function getPoll(pollId) {
  const p = polls.get(pollId);
  return p ? snapshot(p) : null;
}

/**
 * getPollResults(pollId) — results with percentages. Never leaks voter ids.
 */
function getPollResults(pollId) {
  const p = polls.get(pollId);
  if (!p) return null;
  const total = Math.max(0, p.total);
  const results = p.options.map((label, i) => {
    const count = p.counts[i] | 0;
    const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
    return { index: i, label, count, pct };
  });
  let winnerIdx = -1;
  let winnerVotes = -1;
  for (const r of results) {
    if (r.count > winnerVotes) { winnerVotes = r.count; winnerIdx = r.index; }
  }
  const tie = results.filter(r => r.count === winnerVotes).length > 1;
  return {
    pollId: p.id,
    title: p.title,
    options: p.options.slice(),
    total,
    closed: p.closed,
    closesAt: p.closesAt,
    closedAt: p.closedAt,
    results,
    winner: winnerIdx >= 0 && winnerVotes > 0 && !tie ? results[winnerIdx].label : null,
    tie: tie && winnerVotes > 0,
  };
}

/**
 * hasVoted(pollId, playerId) — boolean; does NOT reveal which option.
 */
function hasVoted(pollId, playerId) {
  const p = polls.get(pollId);
  if (!p) return false;
  return p.voters[playerId] != null;
}

/**
 * myVote(pollId, playerId) — allows a player to look up THEIR OWN vote.
 * Never call this for anyone other than the voter themselves.
 */
function myVote(pollId, playerId) {
  const p = polls.get(pollId);
  if (!p) return null;
  const idx = p.voters[playerId];
  if (idx == null) return null;
  return { index: idx, label: p.options[idx] };
}

function listPolls(filter = 'all') {
  let out = [...polls.values()];
  if (filter === 'active' || filter === 'open') {
    out = out.filter(p => !p.closed);
  } else if (filter === 'closed') {
    out = out.filter(p => p.closed);
  }
  // Sweep before returning so status is accurate.
  sweepExpired();
  return out.map(snapshot);
}

function snapshot(p) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    options: p.options.slice(),
    createdBy: p.createdBy,
    createdByName: p.createdByName,
    createdAt: p.createdAt,
    closesAt: p.closesAt,
    closed: p.closed,
    closedAt: p.closedAt,
    counts: Object.assign({}, p.counts),
    total: p.total,
  };
}

// ── Persistence ──────────────────────────────────────────────────────────────

function serialize() {
  return {
    version: 1,
    nextPollId,
    polls: [...polls.values()].map(p => ({
      id: p.id,
      title: p.title,
      options: p.options,
      createdBy: p.createdBy,
      createdByName: p.createdByName,
      createdAt: p.createdAt,
      closesAt: p.closesAt,
      closed: p.closed,
      closedAt: p.closedAt,
      counts: p.counts,
      voters: p.voters, // kept in-file; never leaked via API
      total: p.total,
    })),
  };
}

function deserialize(data) {
  reset();
  if (!data || typeof data !== 'object') return;
  if (data.nextPollId) nextPollId = data.nextPollId;
  if (Array.isArray(data.polls)) {
    for (const raw of data.polls) {
      if (!raw || !raw.id || !raw.title) continue;
      polls.set(raw.id, {
        id: raw.id,
        title: raw.title,
        options: Array.isArray(raw.options) ? raw.options.slice() : [],
        createdBy: raw.createdBy != null ? raw.createdBy : null,
        createdByName: raw.createdByName || 'admin',
        createdAt: raw.createdAt || now(),
        closesAt: raw.closesAt != null ? raw.closesAt : null,
        closed: !!raw.closed,
        closedAt: raw.closedAt || null,
        counts: raw.counts && typeof raw.counts === 'object' ? raw.counts : {},
        voters: raw.voters && typeof raw.voters === 'object' ? raw.voters : {},
        total: raw.total | 0,
      });
    }
  }
}

function save() {
  if (!persistence) return false;
  try { persistence.save(_saveFile, serialize()); return true; }
  catch (e) { console.error('[voting] save error', e.message); return false; }
}

function load() {
  if (!persistence) return false;
  try { deserialize(persistence.load(_saveFile, null)); return true; }
  catch (e) { console.error('[voting] load error', e.message); return false; }
}

function reset() {
  polls.clear();
  nextPollId = 1;
}

function stats() {
  let open = 0, closed = 0, totalVotes = 0;
  for (const p of polls.values()) {
    if (p.closed) closed++; else open++;
    totalVotes += p.total;
  }
  return { polls: polls.size, open, closed, totalVotes };
}

// Auto-register save handler.
if (persistence && typeof persistence.onSave === 'function') {
  persistence.onSave('voting', save);
}

module.exports = {
  // API.
  createPoll, closePoll, sweepExpired,
  vote, unvote,
  getPoll, getPollResults, listPolls,
  hasVoted, myVote,

  // Persistence.
  save, load, serialize, deserialize, reset, stats,

  // Constants.
  MAX_TITLE_LEN, MAX_OPTION_LEN, MIN_OPTIONS, MAX_OPTIONS, DEFAULT_DAYS,
};
