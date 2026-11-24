const assert = require('node:assert/strict');
const { test } = require('node:test');

const {
  allTuflowCommands,
  tcfCommands,
  tgcCommands,
  tbcCommands,
  ecfCommands,
  trfcCommands,
  qcfCommands,
  commandCategories,
  fileTypeCommands,
  getCommandsByCategory,
  getCommandsByName,
  searchCommands
} = require('../../out/commands');

test('registry includes every command family', () => {
  const families = [tcfCommands, tgcCommands, tbcCommands, ecfCommands, trfcCommands, qcfCommands];
  for (const family of families) {
    assert.ok(family.length > 0, 'a registered command family must not be empty');
  }
  assert.equal(allTuflowCommands.length, families.reduce((sum, family) => sum + family.length, 0));
  assert.equal(Object.keys(fileTypeCommands).length, families.length);
  assert.ok(commandCategories.QCF.includes('Quadtree'));
});

test('case-insensitive name lookup and missing lookup', () => {
  // The typed registry returns all contextual definitions; the legacy registry
  // returned one. This baseline asserts the shared user-facing contract.
  const found = getCommandsByName('cElL sIzE');
  const matches = Array.isArray(found) ? found : found ? [found] : [];
  assert.ok(matches.some(command => command.name === 'Cell Size'));
  const absent = getCommandsByName('not a valid command');
  assert.ok(absent === undefined || (Array.isArray(absent) && absent.length === 0));
});

test('category and file extension registries agree', () => {
  const cases = [
    ['.tcf', 'TCF', tcfCommands],
    ['.tgc', 'TGC', tgcCommands],
    ['.tbc', 'TBC', tbcCommands],
    ['.ecf', 'ECF', ecfCommands],
    ['.trfc', 'TRFC', trfcCommands],
    ['.qcf', 'QCF', qcfCommands]
  ];
  for (const [extension, category, commands] of cases) {
    // A typed registry can wrap legacy records with verified metadata.
    // Check catalogue contents instead of JS reference identity.
    const expectedNames = commands.map(command => command.name);
    assert.deepEqual(fileTypeCommands[extension].map(command => command.name), expectedNames);
    assert.deepEqual(getCommandsByCategory(category).map(command => command.name), expectedNames);
    assert.ok(commands.every(command => command.name && command.description));
  }
});

test('search matches names and descriptions without case sensitivity', () => {
  const byName = searchCommands('rEAd gIs');
  assert.ok(byName.length > 0);
  assert.ok(byName.some(command => command.name.toLowerCase().includes('read gis')));
  const description = allTuflowCommands.find(command => command.description.length > 25);
  assert.ok(description);
  const query = description.description.slice(0, 15);
  assert.ok(searchCommands(query.toUpperCase()).includes(description));
  assert.deepEqual(searchCommands('unmatchable-very-long-query-593728'), []);
});
