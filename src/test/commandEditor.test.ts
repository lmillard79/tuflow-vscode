import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { getCommandsForFile } from '../commands';
import { documentationForCommand, planCompletions, planHover, planSignature } from '../editor/commandModel';
import type { CompletionPlan } from '../editor/commandModel';

function apply(line: string, plan: CompletionPlan): string {
    return line.slice(0, plan.range.start) + plan.insertText +
        line.slice(plan.range.end);
}

test('multiword hover covers every character of the complete command and modifier', () => {
    const line = '   Read GIS Z Shape MAX == gis/zones.shp  ! explanatory comment';
    const start = line.indexOf('Read');
    const end = line.indexOf('MAX') + 3;
    for (let character = start; character < end; character++) {
        const hover = planHover('model.TGC', line, character, 12);
        assert.ok(hover, 'hover missing at offset ' + character);
        assert.deepEqual(hover.range, { line: 12, start, end });
        assert.match(hover.documentation, /Read GIS Z Shape/);
        assert.match(hover.documentation, /Official TUFLOW documentation/);
    }
    assert.equal(planHover('model.tgc', line, line.indexOf('==') + 3), undefined);
    assert.equal(planHover('model.tgc', line, line.indexOf('!') + 3), undefined);
});

test('unmodified multiword hover handles whitespace and case', () => {
    const line = '\tmap  OUTPUT interval  == 120';
    const hover = planHover('MODEL.TCF', line, line.indexOf('OUTPUT') + 3, 7);
    assert.ok(hover);
    assert.deepEqual(hover.range, {
        line: 7, start: line.indexOf('map'), end: line.indexOf('==') - 2
    });
    assert.match(hover.documentation, /Map Output Interval/);
});

const hasMapOutputFormat = getCommandsForFile('.tcf')
    .some(command => command.canonicalName === 'Map Output Format');

test('multiword Map Output Format hover is available once the #4 TCF audit is stacked', {
    skip: !hasMapOutputFormat && 'TCF catalogue issue #4 is a parallel PR'
}, () => {
    const line = '  Map Output Format == XMDF';
    const hover = planHover('run.tcf', line, line.indexOf('Output') + 2);
    assert.ok(hover);
    assert.equal(hover.range.start, 2);
    assert.equal(hover.range.end, '  Map Output Format'.length);
});

test('partly typed command replaces only the command text and keeps indentation', () => {
    const line = '  Read GIS Z Sh';
    const candidate = planCompletions('.tgc', line, line.length, 2)
        .find(item => item.label === 'Read GIS Z Shape');
    assert.ok(candidate);
    assert.deepEqual(candidate.range, { line: 2, start: 2, end: line.length });
    assert.equal(apply(line, candidate), '  Read GIS Z Shape == ');
});

test('space-triggered completion ranges contain the cursor and preserve delimiter layout', () => {
    const pending = 'Read GIS ';
    const cursor = pending.length;
    const item = planCompletions('.tgc', pending, cursor)
        .find(plan => plan.label === 'Read GIS Z Shape');
    assert.ok(item);
    assert.ok(item.range.start <= cursor && item.range.end >= cursor);
    assert.equal(item.range.end, cursor);
    assert.equal(apply(pending, item), 'Read GIS Z Shape == ');

    const hasDelimiter = 'Read GIS Z Sh   == gis/zones.shp ! note';
    const beforeDelimiter = hasDelimiter.indexOf('==');
    const existing = planCompletions('.tgc', hasDelimiter, beforeDelimiter)
        .find(plan => plan.label === 'Read GIS Z Shape');
    assert.ok(existing);
    assert.ok(existing.range.end >= beforeDelimiter);
    assert.equal(apply(hasDelimiter, existing),
        'Read GIS Z Shape == gis/zones.shp ! note');

    // A completion request between the two equals signs must not fabricate
    // a replacement range that fails to cover the cursor.
    assert.deepEqual(planCompletions('.tgc', hasDelimiter, beforeDelimiter + 1), []);
});

test('existing delimiter, value and comment survive completing the left side', () => {
    const line = 'Read GIS Z Sh   == gis/test.shp  ! reference';
    const cursor = line.indexOf('Sh') + 2;
    const candidate = planCompletions('.tgc', line, cursor)
        .find(item => item.label === 'Read GIS Z Shape');
    assert.ok(candidate);
    assert.equal(candidate.insertText, 'Read GIS Z Shape');
    assert.equal(apply(line, candidate),
        'Read GIS Z Shape   == gis/test.shp  ! reference');
    assert.equal((apply(line, candidate).match(/==/g) ?? []).length, 1);
});

test('modifier completion uses audited suffixes without duplicating typed text', () => {
    const line = 'Read GIS Z Shape RI';
    const candidate = planCompletions('.tgc', line, line.length)
        .find(item => item.label === 'Read GIS Z Shape RIDGE');
    assert.ok(candidate);
    assert.equal(apply(line, candidate), 'Read GIS Z Shape RIDGE == ');
    const modified = 'Read GIS SA STREAM ON';
    const sa = planCompletions('.tbc', modified, modified.length)
        .find(item => item.label === 'Read GIS SA STREAM ONLY');
    assert.ok(sa);
    assert.equal(apply(modified, sa), 'Read GIS SA STREAM ONLY == ');
});

test('comments and unknown command assignments never trigger invented suggestions', () => {
    assert.deepEqual(planCompletions('.tgc', '! Read GIS Z Shape', 12), []);
    assert.deepEqual(planCompletions('.tgc', '# Read GIS Z Shape', 12), []);
    const annotated = 'Read GIS Z Shape == gis/dem.shp ! do not complete';
    assert.deepEqual(planCompletions('.tgc', annotated, annotated.length), []);
    const hashAnnotated = 'Read GIS Z Shape == gis/dem.shp # do not complete';
    assert.deepEqual(planCompletions('.tgc', hashAnnotated, hashAnnotated.length), []);
    assert.equal(planHover('.tgc', hashAnnotated, hashAnnotated.indexOf('#') + 2), undefined);
    assert.equal(planSignature('.trfc', 'RF Grid Origin == 1, 2 # comment', 32), undefined);
    assert.deepEqual(planCompletions('.tbc', 'Undefined Command == ', 21), []);
    assert.equal(planHover('.tbc', 'Undefined Command == X', 4), undefined);
    assert.equal(planSignature('.tbc', 'Undefined Command == 1', 22), undefined);
    assert.deepEqual(planCompletions('model.tef', 'Read GIS Z', 10), []);
    assert.deepEqual(planCompletions('model.xyz', 'Read GIS Z', 10), []);
});

test('enumerated values are only suggested after the documented matching command', () => {
    const trfc = 'RF Grid Format == ';
    assert.deepEqual(
        planCompletions('.trfc', trfc, trfc.length)
            .map(item => item.label).sort(),
        ['ASC', 'FLT', 'NC', 'TIF'].sort()
    );
    assert.deepEqual(planCompletions('.ecf', trfc, trfc.length), []);
    const qcf = 'Quadtree Mesh Processing Method == ';
    assert.deepEqual(
        planCompletions('.qcf', qcf, qcf.length).map(item => item.label).sort(),
        ['FAST', 'Memory Efficient'].sort()
    );
    const number = 'RF Grid Cell Size == ';
    assert.deepEqual(planCompletions('.trfc', number, number.length), []);
});

test('partial multiword value uses full value replacement range without duplication', () => {
    const line = 'Quadtree Mesh Processing Method == Memory E';
    const plan = planCompletions('.qcf', line, line.length, 4)
        .find(item => item.label === 'Memory Efficient');
    assert.ok(plan);
    assert.equal(plan.range.start, line.indexOf('Memory E'));
    assert.equal(plan.range.end, line.length);
    assert.equal(apply(line, plan),
        'Quadtree Mesh Processing Method == Memory Efficient');
    assert.equal(plan.range.line, 4);
});

test('no completion is offered outside a populated value range', () => {
    const line = 'RF Grid Format ==  TIF  ! comment';
    assert.deepEqual(planCompletions('.trfc', line, line.indexOf('TIF') - 1), []);
    assert.deepEqual(planCompletions('.trfc', line, line.indexOf('TIF') + 5), []);
});

test('file placeholders require an audited file kind and empty value', () => {
    const fileLine = 'BC Database == ';
    const values = planCompletions('.tbc', fileLine, fileLine.length);
    assert.equal(values.length, 1);
    assert.equal(values[0].kind, 'file');
    assert.equal(values[0].snippet, true);
    assert.equal(values[0].insertText, '$' + '{1:filename}');
    const existing = 'BC Database == rainfall/bc.csv';
    assert.deepEqual(planCompletions('.tbc', existing, existing.length), []);
    const existingAtStart = 'BC Database == old.csv';
    const startOfExistingPath = existingAtStart.indexOf('old.csv');
    assert.deepEqual(planCompletions('.tbc', existingAtStart, startOfExistingPath), []);
    assert.deepEqual(planCompletions('.tbc', existingAtStart, startOfExistingPath + 2), []);
    const numeric = 'Global Rainfall Initial Loss == ';
    assert.deepEqual(planCompletions('.tbc', numeric, numeric.length), []);
    const freeText = 'BC Event Name == ';
    assert.deepEqual(planCompletions('.ecf', freeText, freeText.length), []);
});

test('signature help shows only documented comma-separated pairs with correct active index', () => {
    const first = 'RF Grid Origin == 100';
    const firstHelp = planSignature('.trfc', first, first.length);
    assert.ok(firstHelp);
    assert.equal(firstHelp.activeParameter, 0);
    assert.deepEqual(firstHelp.parameters, ['<OX>', '<OY>']);
    const second = 'RF Grid Origin == 100, 200';
    const secondHelp = planSignature('.trfc', second, second.length);
    assert.ok(secondHelp);
    assert.equal(secondHelp.activeParameter, 1);
    assert.equal(planSignature('.ecf', second, second.length), undefined);
    assert.equal(planSignature('.trfc', second + ' ! note', (second + ' ! note').length), undefined);
});

test('signature help avoids fabricated parameter counts for keywords and unknown syntax', () => {
    const format = 'RF Grid Format == TIF';
    assert.equal(planSignature('.trfc', format, format.length), undefined);
    const unknown = 'Future New Command == 100, 200';
    assert.equal(planSignature('.tgc', unknown, unknown.length), undefined);
    const start = 'Start Time == 0';
    assert.equal(planSignature('.tcf', start, start.length), undefined);
    const noStructure = 'Culvert Zero Coefficients == OFF';
    assert.equal(planSignature('.ecf', noStructure, noStructure.length), undefined);
});

test('explicit multi-argument forms advance at the correct separator', () => {
    const bc = 'BC Event Source == RAIN | event_5';
    const bcPlan = planSignature('.ecf', bc, bc.length);
    assert.ok(bcPlan);
    assert.equal(bcPlan.activeParameter, 1);
    assert.deepEqual(bcPlan.parameters, ['<bc_event_text>', '<bc_event_name>']);
    const coefficients = 'Culvert Zero Coefficients == 1.0, 0.6, 0.9';
    const coefficientPlan = planSignature('.ecf', coefficients, coefficients.length);
    assert.ok(coefficientPlan);
    assert.equal(coefficientPlan.activeParameter, 2);
    assert.equal(coefficientPlan.parameters.length, 5);
});

test('long control-file lines are processed without scanning the rest of the document', () => {
    const line = 'Read GIS Z Shape == ' + 'x'.repeat(50000);
    const start = Date.now();
    for (let index = 0; index < 100; index++) {
        const result = planHover('.tgc', line, 6);
        assert.ok(result);
        assert.equal(planCompletions('.tgc', line, line.length).length, 0);
    }
    assert.ok(Date.now() - start < 5000, 'editor assistance unexpectedly slow');
});

test('verified syntax displays Markdown metacharacters as literal code', () => {
    const verified = getCommandsForFile('.trfc')
        .find(command => command.canonicalName === 'RF Grid Origin');
    assert.ok(verified, 'audited rainfall grid command must be present');
    const source = documentationForCommand(verified);
    assert.ok(source.includes('**Syntax:** `RF Grid Origin == <OX>, <OY>`'));
    assert.ok(source.includes('[Official TUFLOW documentation]('));

    // The TCF catalogue's hours-based definition is supplied by issue #4.
    // Test rendering independently here so the fix is effective before #4 merges.
    const time = documentationForCommand({
        ...verified,
        canonicalName: 'End Time',
        syntax: 'End Time == <time_in_hours>',
        description: 'Simulation finish time in hours'
    });
    assert.ok(time.includes('**Syntax:** `End Time == <time_in_hours>`'));
    assert.doesNotMatch(time, /\*\*Syntax:\*\* End Time == <time_in_hours>/);

    // Delimiters must also remain balanced if syntax itself contains backticks.
    const ticks = documentationForCommand({ ...verified, syntax: 'Read File == `<path>`' });
    assert.ok(ticks.includes('**Syntax:** `` Read File == `<path>` ``'));
});

test('integrated TEF and extensionless hovers inherit audited command help without false completions', () => {
    for (const file of ['events.tef', 'included.trd', 'Untitled-1']) {
        const hover = planHover(file, 'End Time == 12', 4);
        assert.ok(hover, 'expected inherited End Time hover in ' + file);
        assert.match(hover.documentation, /End Time/);
        assert.match(hover.documentation, /hour/i);
        assert.match(hover.documentation, /80-AppendicesA-TCFCommands\.html/);
        assert.doesNotMatch(hover.documentation, /HH:MM:SS/);
        assert.match(hover.documentation, /\*\*Syntax:\*\* `End Time == <time_in_hours>`/);
    }
    assert.deepEqual(planCompletions('events.tef', 'End T', 5), []);
    assert.equal(planHover('model.tgc', 'End Time == 12', 4), undefined);
});

test('signature argument scanner preserves embedded apostrophes and quoted separators', () => {
    const noSeparator = "BC Event Source == O'Brien";
    const first = planSignature('.ecf', noSeparator, noSeparator.length);
    assert.ok(first);
    assert.equal(first.activeParameter, 0);
    const unquoted = "BC Event Source == O'Brien | design";
    const second = planSignature('.ecf', unquoted, unquoted.length);
    assert.ok(second);
    assert.equal(second.activeParameter, 1);
    const quoted = "BC Event Source == 'O''Brien | retained' | design";
    const third = planSignature('.ecf', quoted, quoted.length);
    assert.ok(third);
    assert.equal(third.activeParameter, 1);
});

test('source-audited TGC grid and origin pairs expose two signature arguments', () => {
    const pairs: readonly [string, readonly string[]][] = [
        ['Grid Size (N,M)', ['<rows>', '<columns>']],
        ['Grid Size (X,Y)', ['<X_length>', '<Y_length>']],
        ['Origin', ['<OX>', '<OY>']],
        ['Orientation', ['<XX>', '<YX>']]
    ];
    for (const [name, expected] of pairs) {
        const beginning = name + ' == 100';
        const first = planSignature('.tgc', beginning, beginning.length);
        assert.ok(first, 'first argument missing: ' + name);
        assert.equal(first.activeParameter, 0, name);
        assert.deepEqual(first.parameters, expected, name);
        const complete = beginning + ', 200';
        const second = planSignature('.tgc', complete, complete.length);
        assert.ok(second, 'second argument missing: ' + name);
        assert.equal(second.activeParameter, 1, name);
        assert.deepEqual(second.parameters, expected, name);
        assert.equal(second.label, name + ' == ' + expected.join(', '));
        assert.match(second.documentation, /Official TUFLOW documentation/);
        assert.equal(planSignature('.tcf', complete, complete.length), undefined,
            'TGC signature leaked to TCF: ' + name);
    }
    const single = 'Orientation Angle == 45';
    assert.equal(planSignature('.tgc', single, single.length), undefined);
    const path = 'Read GIS Z Shape == model/line.shp';
    assert.equal(planSignature('.tgc', path, path.length), undefined);
});
