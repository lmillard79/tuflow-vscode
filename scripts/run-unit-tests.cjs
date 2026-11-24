#!/usr/bin/env node
// Discover pure Node tests, including compiled TypeScript tests from parallel
// workstreams, without accidentally running Mocha Extension Host suites here.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const testFiles = [];

function discover(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (directory === path.join(root, 'test') && ['extension', 'fixtures'].includes(entry.name)) {
        continue;
      }
      discover(full);
    } else if (entry.isFile() && /\.(test|spec)\.(cjs|mjs|js)$/.test(entry.name)) {
      testFiles.push(path.relative(root, full));
    }
  }
}

discover(path.join(root, 'test'));
discover(path.join(root, 'out', 'test'));
testFiles.sort();

if (testFiles.length === 0) {
  console.error('No pure-logic test files found. Check compilation and test discovery.');
  process.exit(1);
}

console.log(`Running ${testFiles.length} pure-logic test files: ${testFiles.join(', ')}`);
const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  cwd: root,
  stdio: 'inherit',
  env: process.env
});
if (result.error) {
  console.error(result.error);
}
process.exit(result.status ?? 1);
