#!/usr/bin/env node
'use strict';

// Fail-closed CI verification. Neither intentionally broken fixture is
// committed; both are removed even if an assertion or tool invocation fails.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const npmCli = process.env.npm_execpath;
assert.ok(npmCli && fs.existsSync(npmCli),
  'Run this script using npm run test:fail-closed (npm_execpath is required)');

function npmRun(scriptName, expectedMarker) {
  const child = spawnSync(process.execPath, [npmCli, 'run', scriptName], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024
  });
  if (child.error) throw child.error;
  const output = (child.stdout || '') + (child.stderr || '');
  assert.notEqual(child.status, null, `${scriptName} terminated unexpectedly: ${output}`);
  assert.notEqual(child.status, 0, `${scriptName} accepted deliberately broken input: ${output}`);
  assert.ok(output.includes(expectedMarker),
    `${scriptName} failed for an unexpected reason, not the injected fixture:\n${output}`);
  console.log(`PASS: ${scriptName} rejected the intentional defect (exit ${child.status})`);
}

const brokenSource = path.join(root, 'src', '__ci_negative_compilation__.ts');
const brokenTest = path.join(root, 'test', 'unit', '__ci_negative_test__.test.cjs');
for (const candidate of [brokenSource, brokenTest]) {
  assert.ok(!fs.existsSync(candidate), `Refusing to overwrite an existing file: ${candidate}`);
}

try {
  fs.writeFileSync(brokenSource, 'export const CI_NEGATIVE_COMPILATION = ;\n', { flag: 'wx' });
  npmRun('compile', '__ci_negative_compilation__.ts');
} finally {
  fs.rmSync(brokenSource, { force: true });
  for (const suffix of ['.js', '.js.map']) {
    fs.rmSync(path.join(root, 'out', '__ci_negative_compilation__' + suffix), { force: true });
  }
}

try {
  fs.writeFileSync(brokenTest,
    "const { test } = require('node:test'); test('CI_NEGATIVE_TEST_MUST_FAIL', () => { throw new Error('CI_NEGATIVE_TEST_MUST_FAIL'); });\n",
    { flag: 'wx' });
  npmRun('test:unit', 'CI_NEGATIVE_TEST_MUST_FAIL');
} finally {
  fs.rmSync(brokenTest, { force: true });
}

console.log('PASS: CI correctly propagates build and unit-test failures; fixtures removed');
