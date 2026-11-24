// Match the verified Extension Host release in CI; keep this config dependency-free.
export default {
  version: process.env.TUFLOW_TEST_VSCODE_VERSION || '1.147.0',
  files: 'test/extension/**/*.test.cjs',
  mocha: { timeout: 30000 }
};
