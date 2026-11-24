import { resolve } from 'node:path';

export default {
  version: process.env.TUFLOW_TEST_VSCODE_VERSION || '1.147.0',
  files: 'test/extension/coexistence.test.cjs',
  extensionDevelopmentPath: 'test/fixtures/host',
  installExtensions: [resolve('tuflow-path-validator.vsix')],
  env: {
    TUFLOW_TEST_COEXIST_MODE: 'validator-only',
    TUFLOW_TEST_COEXIST_EVIDENCE: resolve('coexist-evidence/validator-only.json'),
    TUFLOW_TEST_SOURCE_SHA: process.env.GITHUB_HEAD_SHA || 'unrecorded'
  },
  mocha: { timeout: 60000 }
};
