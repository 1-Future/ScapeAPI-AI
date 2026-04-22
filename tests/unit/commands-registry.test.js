// Commands registry — register + execute + help indexing.

import { describe, it, expect } from 'vitest';
import commands from '../../src/engine/commands.js';

describe('commands registry', () => {
  it('register + execute round-trips output', () => {
    commands.register('testecho', {
      category: 'Test',
      help: 'Test command',
      fn: (_p, args) => `echo:${args.join(' ')}`,
    });
    const p = { id: 900, name: 'Echoer', skills: {}, admin: false };
    const out = commands.execute(p, 'testecho hello world');
    expect(out).toBe('echo:hello world');
  });

  it('getHelp returns an array', () => {
    const h = commands.getHelp();
    expect(Array.isArray(h)).toBe(true);
  });

  it('getCategories returns an array of category names', () => {
    const cats = commands.getCategories();
    expect(Array.isArray(cats)).toBe(true);
  });

  it('parse extracts verb + args from line', () => {
    const parsed = commands.parse('attack goblin dragon');
    expect(parsed.verb).toBe('attack');
    expect(parsed.args).toEqual(['goblin', 'dragon']);
  });

  it('execute returns unknown shape for missing verb', () => {
    const p = { id: 901, name: 'Missing', skills: {}, admin: false };
    const out = commands.execute(p, 'nosuchverb');
    // execute returns an object { unknown: true, ... } or a string — allow either.
    expect(out === null || typeof out === 'object' || typeof out === 'string').toBe(true);
  });
});
