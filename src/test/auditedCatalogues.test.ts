import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import {
    getCommandsForFile, getControlFileCategory, lookupCommandsForFile, normalizeCommandName
} from '../commands';

const audited: readonly [string, string, number][] = [
    ['.tbc', 'TBC', 19],
    ['.ecf', 'ECF', 30],
    ['.trfc', 'TRFC', 16],
    ['.qcf', 'QCF', 8]
];

test('audited catalogues have no duplicate names and each entry has provenance', () => {
    for (const [extension, category, expectedCount] of audited) {
        const entries = getCommandsForFile(extension);
        assert.equal(entries.length, expectedCount, extension);
        const seen = new Set<string>();
        for (const entry of entries) {
            assert.equal(entry.category, category);
            assert.equal(entry.provenance.auditStatus, 'verified', entry.name);
            assert.match(entry.provenance.url, /docs\.tuflow\.com\/classic-hpc\/manual\/2026\.3/);
            assert.ok(entry.provenance.verifiedFields.includes('valueKind'));
            assert.ok(entry.syntax?.includes('=='));
            const key = normalizeCommandName(entry.canonicalName);
            assert.ok(!seen.has(key), 'duplicate ' + category + ' ' + key);
            seen.add(key);
        }
    }
});

test('unsupported TBC suggestions are not offered as valid commands', () => {
    const entries = getCommandsForFile('.tbc');
    assert.ok(entries.every((command) => !/^(Define|Set)\s/i.test(command.name)));
    assert.equal(lookupCommandsForFile('.tbc', 'Define BC == Inflow Q 100').length, 0);
    assert.equal(lookupCommandsForFile('.tbc', 'Read GIS BC == gis/2d_bc.shp').length, 1);
    assert.equal(lookupCommandsForFile('.tgc', 'Unused HX and SX Connections == ERROR').length, 0);
    assert.equal(lookupCommandsForFile('.ecf', 'Read GIS BC == gis/1d_bc.shp').length, 1);
});

test('every recognised extension has a clear audited or syntax-only catalogue policy', () => {
    const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8')) as {
        contributes: { languages: { extensions: string[] }[] }
    };
    const extensions = pkg.contributes.languages.flatMap((language) => language.extensions);
    assert.equal(new Set(extensions).size, extensions.length);
    const known = new Set(['.tcf', '.tgc', '.tbc', '.ecf', '.trfc', '.qcf']);
    for (const extension of extensions) {
        const entries = getCommandsForFile(extension.toUpperCase());
        if (known.has(extension)) assert.ok(entries.length > 0, extension);
        else {
            assert.equal(getControlFileCategory(extension), undefined, extension);
            assert.deepEqual(entries, [], extension);
            assert.deepEqual(lookupCommandsForFile(extension, 'RF Grid Format == TIF'), [], extension);
        }
    }
});

test('file-specific enumerations do not leak across control files', () => {
    const format = lookupCommandsForFile('.trfc', 'RF Grid Format == TIF');
    assert.deepEqual(format[0].allowedValues, ['ASC', 'FLT', 'NC', 'TIF']);
    assert.equal(lookupCommandsForFile('.ecf', 'RF Grid Format == TIF').length, 0);
    const mesh = lookupCommandsForFile('.qcf', 'Quadtree Mesh Processing Method == FAST');
    assert.deepEqual(mesh[0].allowedValues, ['FAST', 'Memory Efficient']);
    assert.equal(lookupCommandsForFile('.tbc', 'Quadtree Mesh Processing Method == FAST').length, 0);
    const culvert = lookupCommandsForFile('.ecf', 'Culvert Zero Coefficients == OFF');
    assert.deepEqual(culvert[0].allowedValues, ['DEFAULT', 'OFF']);
});

test('documented modifiers and parenthesised command names resolve in context', () => {
    for (const text of [
        'read gis sa == gis/source.shp',
        'Read GIS SA ALL == gis/source.shp',
        'READ GIS SA STREAM ONLY RF == gis/source.shp'
    ]) {
        const match = lookupCommandsForFile('.tbc', text);
        assert.equal(match.length, 1, text);
        assert.equal(match[0].canonicalName, 'Read GIS SA');
    }
    assert.equal(lookupCommandsForFile('.tbc', 'Read GIS SA UNKNOWN == gis/source.shp').length, 0);
    assert.equal(lookupCommandsForFile('.trfc', 'RF Grid Size ( N, M ) == 50, 60')[0].valueKind, 'number-pair');
    assert.equal(lookupCommandsForFile('.qcf', 'Base Cell Size == TGC')[0].valueKind, 'number-or-keyword');
});

test('legacy values have explicit notes rather than being recommended as current defaults', () => {
    for (const name of ['Maximum Hyetograph Points', 'Maximum RF Locations']) {
        const legacy = lookupCommandsForFile('.trfc', name + ' == 1000')[0];
        assert.match(legacy.notes ?? '', /2026\.0/);
    }
});
