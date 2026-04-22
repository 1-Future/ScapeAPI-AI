// Vitest config — burn-wave0 test harness.
// Keeps test files near source and out of node_modules / build artefacts.

export default {
  test: {
    // Collect specs from the dedicated tests directory at repo root.
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules', 'dist', 'build', 'coverage'],
    environment: 'node',
    testTimeout: 10_000,
    // Serial — the engine is heavily singleton (tick loop, registries).
    // Running tests in parallel causes cross-contamination on module state.
    pool: 'forks',
    forks: { singleFork: true },
    reporters: ['default'],
  },
};
