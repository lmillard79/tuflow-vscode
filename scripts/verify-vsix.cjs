#!/usr/bin/env node
// Validate the actual archive rather than assuming .vscodeignore patterns worked.
// Uses Node built-ins only: VSIX is a ZIP archive with a central directory.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const filename = process.argv[2] || 'tuflow-helper.vsix';
const archive = fs.readFileSync(filename);
const zipEndSignature = 0x06054b50;
const entrySignature = 0x02014b50;
const localSignature = 0x04034b50;

let end = -1;
for (let offset = archive.length - 22; offset >= Math.max(0, archive.length - 65557); offset--) {
  if (archive.readUInt32LE(offset) === zipEndSignature) {
    end = offset;
    break;
  }
}
assert.notEqual(end, -1, 'VSIX is missing the ZIP end-of-central-directory record');

const expectedCount = archive.readUInt16LE(end + 10);
const centralSize = archive.readUInt32LE(end + 12);
const centralOffset = archive.readUInt32LE(end + 16);
const entries = new Map();
let offset = centralOffset;
while (offset < centralOffset + centralSize) {
  assert.equal(archive.readUInt32LE(offset), entrySignature, 'invalid VSIX central directory');
  const method = archive.readUInt16LE(offset + 10);
  const compressedSize = archive.readUInt32LE(offset + 20);
  const nameLength = archive.readUInt16LE(offset + 28);
  const extraLength = archive.readUInt16LE(offset + 30);
  const commentLength = archive.readUInt16LE(offset + 32);
  const localOffset = archive.readUInt32LE(offset + 42);
  const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');
  entries.set(name, { method, compressedSize, localOffset });
  offset += 46 + nameLength + extraLength + commentLength;
}
assert.equal(offset, centralOffset + centralSize, 'VSIX central-directory length mismatch');
assert.equal(entries.size, expectedCount, 'VSIX central-directory entry-count mismatch');

function readEntry(name) {
  const entry = entries.get(name);
  assert.ok(entry, `required VSIX file missing: ${name}`);
  const { localOffset, compressedSize, method } = entry;
  assert.equal(archive.readUInt32LE(localOffset), localSignature);
  const nameLength = archive.readUInt16LE(localOffset + 26);
  const extraLength = archive.readUInt16LE(localOffset + 28);
  const start = localOffset + 30 + nameLength + extraLength;
  const data = archive.subarray(start, start + compressedSize);
  if (method === 0) return data;
  assert.equal(method, 8, 'unsupported ZIP compression method');
  return zlib.inflateRawSync(data);
}

const manifest = JSON.parse(readEntry('extension/package.json').toString('utf8'));
const packagedPath = relative => path.posix.join('extension', relative.replace(/^\.\//, ''));
const resources = [
  manifest.main,
  manifest.icon,
  ...manifest.contributes.languages.map(language => language.configuration),
  ...manifest.contributes.grammars.map(grammar => grammar.path),
  ...manifest.contributes.snippets.map(snippet => snippet.path)
].filter(Boolean);
for (const resource of resources) readEntry(packagedPath(resource));
for (const resource of [
  'extension/readme.md',
  'extension/changelog.md',
  'extension/LICENSE.txt',
  'extension/out/commands/index.js'
]) readEntry(resource);

// Online documentation does not require captured HTML; protect the package boundary.
readEntry('extension/out/documentation.js');
assert.ok(![...entries.keys()].some(name => name.startsWith('extension/doc/')),
  'captured documentation unexpectedly present in VSIX');
const snippets = JSON.parse(readEntry('extension/snippets/tuflow.json').toString('utf8'));
assert.equal(Object.keys(snippets).length, 10, 'curated snippets missing from VSIX');
for (const name of entries.keys()) {
  assert.ok(!/^extension\/(src|test|scripts|docs|node_modules|\.github|\.vscode-test)\//.test(name),
    `unwanted file in VSIX: ${name}`);
  assert.ok(!/^extension\/out\/test\//.test(name), `compiled test in VSIX: ${name}`);
  assert.ok(!/\.js\.map$/.test(name), `source map in VSIX: ${name}`);
  assert.ok(!/^extension\/(package-lock\.json|tsconfig\.json)$/.test(name),
    `development asset in VSIX: ${name}`);
  // Root-level sample model files must never ship, regardless of filename.
  assert.ok(!/^extension\/[^/]+\.tcf$/i.test(name),
    `root-level TUFLOW control file in VSIX: ${name}`);
}
console.log(`VSIX verified: ${path.basename(filename)}; ${entries.size} files; ${(archive.length / 1048576).toFixed(2)} MiB`);
