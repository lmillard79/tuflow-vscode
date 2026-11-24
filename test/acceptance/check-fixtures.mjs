import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');
const matrix = JSON.parse(fs.readFileSync(path.join(root, 'matrix.json'), 'utf8'));
const extensions = ['.tcf', '.tgc', '.tbc', '.ecf', '.tef', '.trd', '.qcf'];
const kinds = ['existing-relative', 'missing-relative', 'unresolved-macro', 'incomplete', 'conditional', 'inline-comment', 'unknown', 'gpkg-selector', 'unc', 'path-list', 'numeric', 'malformed-delimiter'];
const seen = new Set();
const extensionsSeen = new Set();
const kindsSeen = new Set();

assert.equal(matrix.schemaVersion, 1);
assert.ok(Array.isArray(matrix.cases) && matrix.cases.length >= 30);

for (const item of matrix.cases) {
  assert.match(item.id, /^[a-z0-9-]+$/, 'case id');
  assert.ok(!seen.has(item.id), 'duplicate case id: ' + item.id);
  seen.add(item.id);
  assert.ok(['validator', 'helper', 'shared'].includes(item.owner), 'owner: ' + item.id);
  assert.ok(typeof item.kind === 'string' && item.kind.length, 'kind: ' + item.id);
  const fixture = path.resolve(root, item.file);
  assert.ok(fixture.startsWith(root + path.sep), 'unsafe fixture file: ' + item.file);
  assert.ok(fs.statSync(fixture).isFile(), 'not a fixture file: ' + item.file);
  const matches = fs.readFileSync(fixture, 'utf8').split(/\r?\n/).filter(line => line === item.line);
  assert.equal(matches.length, 1, 'case must match exactly one full line: ' + item.id);
  extensionsSeen.add(path.extname(item.file).toLowerCase());
  kindsSeen.add(item.kind);
  if (item.kind === 'existing-relative' || item.kind === 'missing-relative') {
    assert.ok(typeof item.reference === 'string', 'missing reference: ' + item.id);
    const reference = path.resolve(root, item.reference);
    assert.ok(reference.startsWith(root + path.sep), 'unsafe reference: ' + item.id);
    assert.equal(fs.existsSync(reference), item.kind === 'existing-relative', 'existence mismatch: ' + item.id);
  }
}
for (const extension of extensions) assert.ok(extensionsSeen.has(extension), 'missing coverage for ' + extension);
for (const kind of kinds) assert.ok(kindsSeen.has(kind), 'missing category ' + kind);
console.log('PASS: ' + matrix.cases.length + ' unique acceptance cases in ' + extensionsSeen.size + ' control-file types; all fixture expectations consistent.');
