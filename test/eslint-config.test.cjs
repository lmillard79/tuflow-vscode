'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {ESLint} = require('eslint');

test('ESLint 9 flat config retains both core and TypeScript recommendations', async () => {
  const lint = new ESLint();
  const config = await lint.calculateConfigForFile('src/extension.ts');

  assert.equal(config.rules['no-debugger'][0], 2, 'core no-debugger must stay an error');
  assert.equal(config.rules['no-constant-condition'][0], 2, 'core recommended rules must be active');
  assert.equal(config.rules['@typescript-eslint/no-unused-vars'][0], 1,
    'legacy unused callback arguments remain warnings');
  assert.equal(config.rules['@typescript-eslint/no-explicit-any'][0], 0,
    'the existing explicit-any policy is unchanged');
});
