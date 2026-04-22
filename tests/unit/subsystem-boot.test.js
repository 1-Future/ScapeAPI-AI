// Smoke-test that orphan subsystems previously unwired now load clean and
// expose a register() shape compatible with what server.js passes in.

import { describe, it, expect } from 'vitest';

const modules = [
  'accessibility', 'accessibility-commands',
  'account', 'account-security', 'save-states', 'account-commands',
  'bot-detection', 'bot-detection-commands',
  'channels', 'channels-commands',
  'moderation', 'rules', 'mod-commands',
  'clue-runner', 'clue-commands',
  'housing', 'housing-commands',
  'clan', 'clan-hall', 'clan-territory', 'clan-bingo', 'clan-commands',
  'random-events', 'daily-challenge', 'random-events-commands',
  'raid-invocations',
  'ge-events',
  'collection-log', 'diary',
];

describe('orphan subsystem boot smoke', () => {
  for (const m of modules) {
    it(`loads engine/${m}`, async () => {
      const mod = await import(`../../src/engine/${m}.js`);
      expect(mod).toBeTruthy();
    });
  }

  it('accessibility-commands exports register function', async () => {
    const mod = await import('../../src/engine/accessibility-commands.js');
    expect(typeof mod.default.register).toBe('function');
  });

  it('channels-commands exports register function', async () => {
    const mod = await import('../../src/engine/channels-commands.js');
    expect(typeof mod.default.register).toBe('function');
  });

  it('mod-commands exports register function', async () => {
    const mod = await import('../../src/engine/mod-commands.js');
    expect(typeof mod.default.register).toBe('function');
  });

  it('clan-commands exports register function', async () => {
    const mod = await import('../../src/engine/clan-commands.js');
    expect(typeof mod.default.register).toBe('function');
  });
});
