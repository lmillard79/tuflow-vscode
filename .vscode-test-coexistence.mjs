import { resolve } from 'node:path';

export default {
  version: process.env.TUFLOW_TEST_VSCODE_VERSION || '1.147.0',
  files: 'test/extension/**/*.test.cjs',
  extensionDevelopmentPath: 'test/fixtures/host',
  installExtensions: [resolve('tuflow-helper.vsix'), resolve('tuflow-path-validator.vsix')],
  env: {
    TUFLOW_TEST_INSTALLED: '1',
    TUFLOW_TEST_COEXIST_MODE: 'combined',
    TUFLOW_TEST_COEXIST_EVIDENCE: resolve('coexist-evidence/combined.json'),
    TUFLOW_TEST_SOURCE_SHA: process.env.GITHUB_HEAD_SHA || 'unrecorded'
  },
  mocha: { timeout: 60000 }
};
