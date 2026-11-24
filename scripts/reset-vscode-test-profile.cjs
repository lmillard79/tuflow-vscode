'use strict';

// Clear ONLY the disposable extension/user-data cache used by @vscode/test-cli.
// The executable downloads under .vscode-test remain to avoid costly re-fetch.
const fs = require('node:fs');
const path = require('node:path');

if (process.env.CI !== 'true') {
  throw new Error('This destructive cache reset is restricted to CI.');
}
const root = path.resolve(__dirname, '..', '.vscode-test');
for (const name of ['extensions', 'user-data']) {
  const target = path.join(root, name);
  fs.rmSync(target, { recursive: true, force: true });
  console.log('Cleared disposable VS Code profile: ' + target);
}
