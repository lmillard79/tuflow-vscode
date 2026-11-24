import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
    allTuflowCommands, createCommandRegistry, getCommandsByName, getCommandsForFile,
    getControlFileCategory, lookupCommandsForFile, normalizeCommandName, parseTuflowLine
} from '../commands';
import type { CommandDefinition } from '../commands';

test('assignment and comment preserve half-open UTF-16 source ranges', () => {
    const text = '  Read   GIS Z Shape  ==  "gis/road ! bank.gpkg"   ! description';
    const parsed = parseTuflowLine(text, 7);
    assert.equal(parsed.kind, 'assignment');
    assert.equal(parsed.leftHand?.text, 'Read   GIS Z Shape');
    assert.equal(parsed.value?.text, '"gis/road ! bank.gpkg"');
    assert.equal(parsed.comment?.text, '! description');
    const equals = text.indexOf('==');
    assert.deepEqual(parsed.delimiter?.range, {
        start: { line: 7, character: equals },
        end: { line: 7, character: equals + 2 }
    });
    assert.equal(parsed.value?.range.start.character, text.indexOf('"'));
    assert.equal(parsed.comment?.range.end.character, text.length);
});

test('quoted == and ! are not mistaken for syntax', () => {
    const single = parseTuflowLine("Read GIS BC == 'a!b==c.gpkg' ! trailing");
    assert.equal(single.value?.text, "'a!b==c.gpkg'");
    assert.equal(single.comment?.text, '! trailing');
    const quotedText = '"strange == phrase" == x ! note';
    const parsed = parseTuflowLine(quotedText);
    assert.equal(parsed.leftHand?.text, '"strange == phrase"');
    assert.equal(parsed.delimiter?.range.start.character, quotedText.indexOf(' == x') + 1);
    assert.equal(parseTuflowLine('Cmd == "a""!b" ! comment').value?.text, '"a""!b"');
});

test('blank, comments, incomplete and unknown entries never claim errors', () => {
    assert.equal(parseTuflowLine('\t  ').kind, 'empty');
    assert.equal(parseTuflowLine('   ! a note').kind, 'comment');
    assert.equal(parseTuflowLine('Read GIS').kind, 'incomplete');
    assert.equal(parseTuflowLine('  ==  ').kind, 'incomplete');
    assert.equal(parseTuflowLine('Start Time == ! pending').value, null);
    assert.equal(lookupCommandsForFile('.tgc', 'Unlisted Future Command == anything').length, 0);
    assert.equal(lookupCommandsForFile('.tef', 'Set Mat == 1').length, 0);
    assert.equal(lookupCommandsForFile('.tcf', '! Set Mat == 1').length, 0);
});

test('both documented comment delimiters ignore whole-line and trailing directives', () => {
    for (const marker of ['#', '!']) {
        const wholeLine = '  ' + marker + ' Read GIS Z Shape == absent.gpkg';
        const commented = parseTuflowLine(wholeLine, 4);
        assert.equal(commented.kind, 'comment');
        assert.equal(commented.leftHand, null);
        assert.equal(commented.delimiter, null);
        assert.equal(commented.value, null);
        assert.equal(commented.comment?.text, marker + ' Read GIS Z Shape == absent.gpkg');
        assert.deepEqual(commented.comment?.range, {
            start: { line: 4, character: 2 },
            end: { line: 4, character: wholeLine.length }
        });
        assert.equal(lookupCommandsForFile('model.tgc', wholeLine).length, 0);

        const trailing = 'Start Time == 0  ' + marker + ' end of command';
        const parsed = parseTuflowLine(trailing, 9);
        assert.equal(parsed.kind, 'assignment');
        assert.equal(parsed.leftHand?.text, 'Start Time');
        assert.equal(parsed.value?.text, '0');
        assert.equal(parsed.comment?.text, marker + ' end of command');
        assert.deepEqual(parsed.comment?.range, {
            start: { line: 9, character: trailing.indexOf(marker) },
            end: { line: 9, character: trailing.length }
        });

        const emptyValue = parseTuflowLine('Start Time ==  ' + marker + ' pending');
        assert.equal(emptyValue.value, null);
        assert.equal(emptyValue.comment?.text, marker + ' pending');
    }
});

test('quoted comment markers remain in values and earliest unquoted marker wins', () => {
    for (const marker of ['#', '!']) {
        const other = marker === '#' ? '!' : '#';
        const line = 'Read GIS Z Shape == "model/' + marker + other + '.gpkg" ' +
            marker + ' first ' + other + ' second';
        const parsed = parseTuflowLine(line, 3);
        assert.equal(parsed.value?.text, '"model/' + marker + other + '.gpkg"');
        assert.equal(parsed.comment?.text, marker + ' first ' + other + ' second');
        assert.equal(parsed.comment?.range.start.character, line.indexOf(marker + ' first'));
        assert.equal(parsed.comment?.range.end.character, line.length);

        const quotedSingle = "Read GIS Z Shape == 'a" + marker + "b.gpkg' " + other + ' ignored';
        const single = parseTuflowLine(quotedSingle);
        assert.equal(single.value?.text, "'a" + marker + "b.gpkg'");
        assert.equal(single.comment?.text, other + ' ignored');
    }
    const doubledQuotes = parseTuflowLine('Command == "a""#b" # trailing');
    assert.equal(doubledQuotes.value?.text, '"a""#b"');
    assert.equal(doubledQuotes.comment?.text, '# trailing');
    const commentBeforeDelimiter = parseTuflowLine('Start Time # disabled == 0');
    assert.equal(commentBeforeDelimiter.delimiter, null);
    assert.equal(commentBeforeDelimiter.leftHand?.text, 'Start Time');
    assert.equal(commentBeforeDelimiter.comment?.text, '# disabled == 0');
});

test('complete multiword lookup is case-insensitive and whitespace tolerant', () => {
    const matches = lookupCommandsForFile('folder\\MODEL.TGC', ' \t read   GIS   Z   sHaPe == gis/terrain.shp');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].name, 'Read GIS Z Shape');
    assert.equal(lookupCommandsForFile('.tgc', 'Read GIS Z Shape Extra == file').length, 0);
    assert.equal(normalizeCommandName(' RF  Grid Size ( N , M ) '), 'rf grid size (n,m)');
});

test('documented optional modifier groups are recognized only in order', () => {
    assert.equal(lookupCommandsForFile('.tgc', 'Read GIS Z Shape RIDGE XF ON == test.shp').length, 1);
    assert.equal(lookupCommandsForFile('.tgc', 'Read GIS Z Shape Write TIN == test.shp').length, 1);
    assert.equal(lookupCommandsForFile('.tgc', 'Read GIS Z Shape RIDGE == test.shp').length, 1);
    assert.equal(lookupCommandsForFile('.tgc', 'Read GIS Z Shape XF ON RIDGE == test.shp').length, 0);
    assert.equal(lookupCommandsForFile('.tgc', 'Read GIS Z Shape WRONG == test.shp').length, 0);
});

test('parentheses and numerical command names match', () => {
    const matches = lookupCommandsForFile('.trfc', 'RF Grid Size ( N, M ) == 50, 60');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].name, 'RF Grid Size (N,M)');
    assert.equal(createCommandRegistry([fixture('1D 2D Area (N,M)', 'TCF')])
        .lookup('.tcf', '1d  2d  AREA ( N, M ) == 5').length, 1);
});

test('duplicate names from different control files retain their context', () => {
    const tcf = lookupCommandsForFile('.tcf', 'Set IWL == 2');
    const tgc = lookupCommandsForFile('.TGC', 'Set IWL == 2');
    assert.equal(tcf.length, 1);
    assert.equal(tgc.length, 1);
    assert.equal(tcf[0].category, 'TCF');
    assert.equal(tgc[0].category, 'TGC');
    assert.notEqual(tcf[0].id, tgc[0].id);
    assert.ok(getCommandsByName('Set IWL').length >= 2);
    assert.equal(getControlFileCategory('C:\\runs\\MODEL.TGC'), 'TGC');
    assert.equal(getControlFileCategory('rainfall.tef'), undefined);
    assert.equal(getCommandsForFile('.tef').length, 0);
});

test('multiple matching definitions in one category remain distinct', () => {
    const registry = createCommandRegistry([fixture('Source', 'TCF', 'a'), fixture('Source', 'TCF', 'b')]);
    assert.deepEqual(registry.lookup('model.tcf', 'Source == x').map(value => value.id), ['a', 'b']);
    assert.equal(registry.lookup('model.tgc', 'Source == x').length, 0);
});

test('provenance and verified metadata do not silently certify legacy fields', () => {
    assert.ok(allTuflowCommands.length > 50);
    for (const command of allTuflowCommands) {
        assert.match(command.provenance.url, /^https:\/\/docs\.tuflow\.com\//);
        assert.match(command.provenance.section, /Appendix/);
        assert.equal(command.provenance.auditStatus, 'verified');
        assert.ok(command.canonicalName.length > 0);
    }
    const format = lookupCommandsForFile('.trfc', 'RF Grid Format == TIF')[0];
    assert.deepEqual(format.allowedValues, ['ASC', 'FLT', 'NC', 'TIF']);
    assert.ok(format.safeExamples.includes('RF Grid Format == TIF'));
    assert.equal(format.parameters, undefined);
    assert.equal(lookupCommandsForFile('.tcf', 'Define Source == something').length, 0);
    const auditedTBC = getCommandsForFile('.tbc')[0];
    assert.equal(auditedTBC.provenance.auditStatus, 'verified');
    assert.deepEqual(
        lookupCommandsForFile('.trfc', 'RF Grid Origin == 1, 2')[0].parameters,
        ['<OX>', '<OY>']
    );
    assert.deepEqual(
        lookupCommandsForFile('.ecf', 'BC Event Name == RAIN')[0].parameters,
        ['<bc_event_name>']
    );
});

function fixture(name: string, category: CommandDefinition['category'], id = 'example'): CommandDefinition {
    return {
        id, name, canonicalName: name, category, categories: [category],
        description: 'Test fixture', suffixGroups: [], valueKind: 'unknown',
        safeExamples: [], provenance: {
            url: 'https://docs.tuflow.com/classic-hpc/manual/2025.1/',
            section: 'fixture', auditStatus: 'needs-audit', verifiedFields: []
        }
    };
}


const expectedAudited = {
    TCF: ["Start Time","End Time","Timestep","Cell Size","Map Output Interval","Time Series Output Interval","Start Map Output","End Map Output","Geometry Control File","BC Control File","ESTRY Control File","Event File","Quadtree Control File","Rainfall Control File","BC Database","Read Materials File","Read Soils File","Read GIS PO","Read GIS IWL","Set IWL","Solution Scheme","Hardware","GIS Format","GPKG Projection","SHP Projection","Output Folder","Log Folder","Map Output Data Types","Map Output Format","Time Series Output Format","Timestep Maximum","Read File","Write Check Files","Write Check Files EXCLUDE","Write Check Files INCLUDE","Output Files EXCLUDE","Output Files INCLUDE","XMDF Map Output Interval","TIF Map Output Data Types"],
    TGC: ["Cell Size","Grid Size (N,M)","Grid Size (X,Y)","Origin","Orientation","Orientation Angle","Read GIS Location","Read Grid Location","Read GIS Code","Set Code","Set Code and Clean Zpt","Set Zpt","Read Grid Zpts","Read GIS Z Shape","Read GIS Mat","Read Grid Mat","Set Mat","Read GIS Soil","Read Grid Soil","Read GIS IWL","Read Grid IWL","Set IWL","Read GIS FLC","Read GIS FLC/L","Read GIS SRF","Read GIS WrF","Read GIS Layered FC Shape","Read GIS Variable Z Shape","Read TIN Zpts","Create TIN Zpts","Read File"]
} as const;

test('audited completion names are stable, context-specific and unique', () => {
    for (const category of ['TCF', 'TGC'] as const) {
        const commands = getCommandsForFile('.' + category.toLowerCase());
        assert.deepEqual(commands.map(cmd => cmd.name), [...expectedAudited[category]]);
        assert.equal(new Set(commands.map(cmd => cmd.name.toLowerCase())).size, commands.length);
        assert.ok(commands.every(cmd => cmd.category === category));
    }
});

test('TCF and TGC examples resolve against the audited registry', () => {
    for (const category of ['TCF', 'TGC'] as const) {
        const commands = getCommandsForFile('.' + category.toLowerCase());
        for (const command of commands) {
            assert.equal(command.provenance.auditStatus, 'verified');
            assert.ok(command.provenance.url.includes('/manual/2026.3/'));
            assert.ok(command.provenance.section.includes('Appendix'));
            assert.ok(command.safeExamples.length > 0, command.name);
            assert.ok(command.syntax?.startsWith(command.name + ' == '));
            for (const example of command.safeExamples) {
                assert.ok(example.includes(' == '), example);
                assert.ok(example.split(' == ')[1].trim(), example);
                assert.equal(
                    lookupCommandsForFile('.' + category.toLowerCase(), example).length,
                    1, 'No matching documented example: ' + example
                );
            }
        }
    }
});

test('TCF hours and output intervals are not misrepresented as clock times', () => {
    for (const name of ['Start Time', 'End Time']) {
        const matches = lookupCommandsForFile('.tcf', name + ' == 0');
        assert.equal(matches.length, 1);
        assert.match(matches[0].syntax ?? '', /time_in_hours/);
        assert.ok(matches[0].safeExamples.every(x => !/\d+:\d+/.test(x)));
    }
    assert.match(lookupCommandsForFile('.tcf', 'Map Output Interval == 900')[0].syntax ?? '',
        /time_in_seconds/);
    assert.equal(lookupCommandsForFile('.tcf', 'Solution Scheme == HPC')[0].valueKind,
        'keyword');
    assert.equal(lookupCommandsForFile('.tcf', 'Set Code == HPC').length, 0);
});

test('output token lists do not masquerade as free-text file paths', () => {
    for (const name of ['Map Output Data Types', 'Map Output Format',
        'Output Files EXCLUDE', 'TIF Map Output Data Types']) {
        const command = lookupCommandsForFile('.tcf', name + ' == example')[0];
        assert.ok(command, name);
        assert.equal(command.valueKind, 'token-list', name);
        assert.notEqual(command.valueKind, 'file-path', name);
        assert.notEqual(command.valueKind, 'free-text', name);
    }
    assert.equal(lookupCommandsForFile('.tcf', 'BC Database == file.csv')[0].valueKind,
        'file-path');
});

test('Write Check Files variants have different operand semantics', () => {
    const folder = lookupCommandsForFile('.tcf', 'Write Check Files == ..\\check\\');
    assert.equal(folder.length, 1);
    assert.equal(folder[0].valueKind, 'file-path');
    assert.deepEqual(folder[0].safeExamples, ['Write Check Files == ..\\check\\']);

    for (const [variant, example] of [
        ['EXCLUDE', 'Write Check Files EXCLUDE == zpt uvpt'],
        ['INCLUDE', 'Write Check Files INCLUDE == DEM_Z']
    ]) {
        const matching = lookupCommandsForFile('.tcf', example);
        assert.equal(matching.length, 1, example);
        assert.equal(matching[0].canonicalName, 'Write Check Files ' + variant);
        assert.equal(matching[0].valueKind, 'token-list');
        assert.equal(matching[0].syntax, 'Write Check Files ' + variant + ' == <prefix_list>');
        assert.deepEqual(matching[0].safeExamples, [example]);
    }
    // A misplaced folder path must not become a recommended value for suffix variants.
    assert.equal(getCommandsForFile('.tcf').filter(
        command => command.name.startsWith('Write Check Files')
    ).length, 3);
});

test('TGC raster guidance, vector Z Shapes and left-hand modifier groups', () => {
    const shape = lookupCommandsForFile('.tgc', 'Read GIS Z Shape == model.shp')[0];
    assert.ok(shape.safeExamples.every(x => !/\.(?:tif|asc)\b/i.test(x)));
    const grid = lookupCommandsForFile('.tgc', 'Read Grid Zpts == model.tif')[0];
    assert.ok(grid.safeExamples.some(x => x.endsWith('.tif')));
    assert.ok(grid.safeExamples.some(x => x.endsWith('.asc')));
    for (const suffix of ['ADD', 'MAX', 'MIN']) {
        assert.equal(lookupCommandsForFile('.tgc', 'Read Grid Zpts ' + suffix + ' == test.tif')
            .length, 1);
    }
    for (const suffix of ['RIDGE', 'GULLY', 'Write TIN', 'RIDGE XF ON']) {
        assert.equal(lookupCommandsForFile('.tgc', 'Read GIS Z Shape ' + suffix + ' == test.shp')
            .length, 1);
    }
    assert.ok(lookupCommandsForFile('.tgc', 'Read GIS Layered FC Shape == test.shp')[0]
        .safeExamples.some(x => x.includes('2d_lfcsh.shp')));
    assert.deepEqual(lookupCommandsForFile('.tgc', 'Set Mat == 1')[0].safeExamples,
        ['Set Mat == 1']);
});

test('quarantined invented or misplaced commands are not offered as suggestions', () => {
    for (const name of ['Read GIS', 'Write GIS', 'Write Results', 'Set Code', 'Define Source',
        'Set 1D Domain', 'Set 2D Domain', 'Set Mat']) {
        assert.equal(lookupCommandsForFile('.tcf', name + ' == sample').length, 0, name);
    }
    for (const name of ['Read GIS BC', 'Read GIS SX', 'Read GIS SA', 'Read GIS Pipe',
        'Set Grid', 'Set Extent', 'Set Origin', 'Set Node', 'Set Pipe']) {
        assert.equal(lookupCommandsForFile('.tgc', name + ' == sample').length, 0, name);
    }
    assert.equal(lookupCommandsForFile('.tgc', 'Future Unknown == sample').length, 0);
    assert.equal(parseTuflowLine('Future Unknown == sample').kind, 'assignment');
});

test('embedded apostrophes are not quote openers and do not hide comments', () => {
    for (const marker of ['!', '#']) {
        const line = "Output Folder == results/O'Brien " + marker + ' preserved comment';
        const parsed = parseTuflowLine(line);
        assert.equal(parsed.value?.text, "results/O'Brien");
        assert.equal(parsed.comment?.text, marker + ' preserved comment');
        assert.equal(parsed.comment?.range.start.character, line.indexOf(marker));
        assert.equal(parsed.kind, 'assignment');
    }
    const escaped = parseTuflowLine("Output Folder == 'results/O''Brien' ! note");
    assert.equal(escaped.value?.text, "'results/O''Brien'");
    assert.equal(escaped.comment?.text, '! note');
});

test('registry takes a deep frozen snapshot of mutable supplied metadata', () => {
    const input = {
        ...fixture('Original', 'TCF'),
        categories: ['TCF'] as CommandDefinition['category'][],
        suffixGroups: [{ optional: true, alternatives: ['MODIFIER'] }],
        safeExamples: ['Original == value'],
        allowedValues: ['ON'],
        provenance: {
            ...fixture('Original', 'TCF').provenance,
            verifiedFields: ['canonicalName']
        }
    };
    const registry = createCommandRegistry([input]);
    input.canonicalName = 'Changed';
    input.categories[0] = 'TGC';
    input.suffixGroups[0].alternatives[0] = 'ALTERED';
    input.safeExamples[0] = 'mutated';
    input.allowedValues[0] = 'OFF';
    input.provenance.verifiedFields[0] = 'mutated';
    const record = registry.lookup('.tcf', 'Original MODIFIER == value')[0];
    assert.equal(record.canonicalName, 'Original');
    assert.deepEqual(record.categories, ['TCF']);
    assert.deepEqual(record.suffixGroups[0].alternatives, ['MODIFIER']);
    assert.deepEqual(record.safeExamples, ['Original == value']);
    assert.deepEqual(record.allowedValues, ['ON']);
    assert.deepEqual(record.provenance.verifiedFields, ['canonicalName']);
    assert.equal(registry.lookup('.tcf', 'Changed MODIFIER == value').length, 0);
    assert.equal(registry.lookup('.tgc', 'Original MODIFIER == value').length, 0);
    assert.ok(Object.isFrozen(record));
    assert.ok(Object.isFrozen(record.provenance));
    assert.ok(Object.isFrozen(record.suffixGroups[0].alternatives));
});
