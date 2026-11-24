'use strict';

// Dependency-free TextMate-grammar fixture probes. This verifies the repository's
// declared regexes and scopes, not VS Code's Oniguruma/renderer implementation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const grammar = JSON.parse(fs.readFileSync(path.join(root, 'syntaxes/tuflow.tmLanguage.json'), 'utf8'));
const config = JSON.parse(fs.readFileSync(path.join(root, 'language-configuration.json'), 'utf8'));
const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/grammar-cases.json'), 'utf8'));

function jsRegex(onigurumaExpression, global = false) {
    // Grammar fragments intentionally use only syntax shared by Oniguruma and
    // JavaScript, apart from the Oniguruma (?i) case-insensitivity prefix.
    const ignoreCase = onigurumaExpression.startsWith('(?i)');
    const source = ignoreCase ? onigurumaExpression.slice(4) : onigurumaExpression;
    return new RegExp(source, `${ignoreCase ? 'i' : ''}${global ? 'g' : ''}`);
}

// Language-configuration regexes use JavaScript RegExp syntax, not TextMate
// Oniguruma syntax. Match VS Code's loader so invalid '(?i)' flags fail tests.
function vscodeConfigRegex(value) {
    if (typeof value === 'string') return new RegExp(value, '');
    assert.equal(typeof value.pattern, 'string');
    assert.equal(typeof value.flags, 'string');
    return new RegExp(value.pattern, value.flags);
}

function matchRules(group) {
    return grammar.repository[group].patterns.filter(rule => typeof rule.match === 'string');
}

function firstMatch(group, source) {
    for (const rule of matchRules(group)) {
        const result = jsRegex(rule.match).exec(source);
        if (result) return { rule, result };
    }
    return null;
}

function outsideQuoted(line, until) {
    const comments = [];
    const quotes = [];
    const quoteOpeners = grammar.repository['quoted-strings'].patterns.map(rule => jsRegex(rule.begin, true));
    const canOpenQuote = (char, position) => {
        const index = char === '"' ? 0 : 1;
        const pattern = quoteOpeners[index];
        pattern.lastIndex = position;
        return pattern.exec(line)?.index === position;
    };
    let quote = null;
    let quotedAt = -1;
    for (let i = 0; i < until; i++) {
        const char = line[i];
        if (quote) {
            if (char === '\\' && line[i + 1] === quote) { i++; continue; }
            if (char === quote) {
                quotes.push({ start: quotedAt, end: i + 1, quote });
                quote = null;
            }
        } else if ((char === '"' || char === "'") && canOpenQuote(char, i)) {
            quote = char;
            quotedAt = i;
        } else if (char === '!' || char === '#') {
            comments.push(i);
            break;
        }
    }
    if (quote) quotes.push({ start: quotedAt, end: until, quote });
    return { commentAt: comments.length ? comments[0] : until, quotes };
}

function grammarProbe(line) {
    const { commentAt, quotes } = outsideQuoted(line, line.length);
    const code = line.slice(0, commentAt);
    const tokens = [];
    const add = (scope, text, start, end = start + text.length) => {
        if (text.trim()) tokens.push({ scope, text: text.trim(), start, end });
    };
    const covered = [];
    const cover = (start, end) => covered.push({ start, end });
    const overlaps = (start, end) => covered.some(span => start < span.end && end > span.start);

    let delimiter = -1;
    for (let i = 0; i < code.length - 1; i++) {
        if (code.slice(i, i + 2) === '==' && !quotes.some(q => i >= q.start && i < q.end)) {
            delimiter = i;
            break;
        }
    }
    const commandGroup = grammar.repository['command-header'].patterns[0];
    const hasHeader = delimiter >= 0 && jsRegex(commandGroup.begin).test(code);
    const flow = firstMatch('control-flow', code);
    if (flow) add(flow.rule.name, flow.result[0], flow.result.index);
    if (hasHeader && !flow) {
        const end = code.slice(0, delimiter).trimEnd().length;
        add(commandGroup.name, code.slice(0, end), 0, end);
        const known = firstMatch('known-commands', code);
        if (known) add(known.rule.name, known.result[0], known.result.index);
        for (const match of code.slice(0, delimiter).matchAll(jsRegex(matchRules('command-modifiers')[0].match, true))) {
            add(matchRules('command-modifiers')[0].name, match[0], match.index);
        }
    }
    if (delimiter >= 0) {
        const rule = matchRules('operators').find(r => r.match === '==');
        add(rule.name, '==', delimiter);
        cover(0, delimiter + 2);
    } else if (flow) {
        cover(flow.result.index, flow.result.index + flow.result[0].length);
    }

    // Quoted text shields exclamation marks and path-like contents from other rules.
    for (const quote of quotes) {
        if (quote.start >= commentAt) continue;
        const scope = quote.quote === '"' ? 'string.quoted.double.tuflow' : 'string.quoted.single.tuflow';
        add(scope, line.slice(quote.start, quote.end), quote.start, quote.end);
        cover(quote.start, quote.end);
    }

    // Check value tokens in precedence order; the expressions come from grammar.json.
    for (const group of ['placeholders', 'paths', 'numbers', 'values']) {
        for (const rule of matchRules(group)) {
            for (const match of code.matchAll(jsRegex(rule.match, true))) {
                const start = match.index;
                const end = start + match[0].length;
                if (delimiter >= 0 && start < delimiter + 2) continue;
                if (overlaps(start, end)) continue;
                add(rule.name, match[0], start, end);
                cover(start, end);
            }
        }
    }
    // Inside a quote, placeholders receive an additional nested scope.
    for (const quote of quotes) {
        for (const match of code.slice(quote.start, quote.end).matchAll(jsRegex(matchRules('placeholders')[0].match, true))) {
            add(matchRules('placeholders')[0].name, match[0], quote.start + match.index);
        }
    }
    for (const op of matchRules('operators').slice(1)) {
        for (const match of code.matchAll(jsRegex(op.match, true))) {
            if (delimiter >= 0 && match.index < delimiter + 2) continue;
            if (!overlaps(match.index, match.index + match[0].length)) {
                add(op.name, match[0], match.index);
            }
        }
    }
    if (commentAt < line.length) {
        const fragment = line.slice(commentAt);
        const rule = matchRules('comments').find(item => jsRegex(item.match).test(fragment));
        if (rule) {
            const comment = jsRegex(rule.match).exec(fragment);
            if (comment) add(rule.name, comment[0], commentAt);
        }
    }
    return tokens.sort((a, b) => a.start - b.start || b.end - a.end || a.scope.localeCompare(b.scope))
        .map(({ scope, text }) => [scope, text]);
}

if (process.env.UPDATE_GRAMMAR_SNAPSHOTS === '1') {
    const updated = fixtures.map(({ name, line }) => ({ name, line, expected: grammarProbe(line) }));
    fs.writeFileSync(path.join(__dirname, 'fixtures/grammar-cases.json'), JSON.stringify(updated, null, 2) + '\n');
}

test('grammar rules compile, have stable standard TextMate scopes and resolvable includes', () => {
    assert.equal(grammar.scopeName, 'source.tuflow');
    assert.equal(grammar.repository['known-commands'].patterns.length, 1);
    const validScopes = /^(?:comment|keyword|meta|support|variable|constant|string)\./;
    const visit = (items) => {
        for (const item of items) {
            if (item.include) assert.ok(grammar.repository[item.include.slice(1)], `missing ${item.include}`);
            if (item.name) assert.match(item.name, validScopes);
            for (const key of ['match', 'begin', 'end']) {
                if (item[key]) assert.doesNotThrow(() => jsRegex(item[key]), item[key]);
            }
            if (item.patterns) visit(item.patterns);
        }
    };
    visit(grammar.patterns);
    for (const group of Object.values(grammar.repository)) visit(group.patterns);
    assert.ok(grammar.repository['comments']);
    assert.equal(grammar.patterns[0].include, '#comments');
    assert.ok(grammar.repository['known-commands'].patterns[0].match.length < 1000, 'keep the whitelist small');
});

test('fixtures: command headers, comments, paths, placeholders, numeric values', () => {
    for (const { name, line, expected } of fixtures) {
        const observed = grammarProbe(line);
        assert.deepEqual(observed, expected, `${name}: ${JSON.stringify(observed)}`);
    }
});

test('indentation: only conditional blocks, not scenario/event declarations', () => {
    const increase = vscodeConfigRegex(config.indentationRules.increaseIndentPattern);
    const decrease = vscodeConfigRegex(config.indentationRules.decreaseIndentPattern);
    assert.equal(config.indentationRules.increaseIndentPattern.flags, 'i');
    assert.equal(config.indentationRules.decreaseIndentPattern.flags, 'i');
    assert.ok(!config.indentationRules.increaseIndentPattern.pattern.includes('(?i)'));
    assert.ok(!config.indentationRules.decreaseIndentPattern.pattern.includes('(?i)'));
    for (const line of ['If Scenario == Flood', 'IF Event == 01p', 'Else If Scenario == Standard', 'Else', 'if (condition == ON) then', 'If Scenario == Flood # End If is commented']) {
        assert.ok(increase.test(line), `must increase: ${line}`);
    }
    for (const line of ['Scenario == Flood', 'Event == 01p', 'Start == AUTO', 'End If', 'Read GIS Z Shape == dem.shp']) {
        assert.ok(!increase.test(line), `must not increase: ${line}`);
    }
    for (const line of ['End If', 'ELSE', 'Else If Scenario == Flood']) assert.ok(decrease.test(line), `must decrease: ${line}`);
    for (const line of ['Start == AUTO', 'Event == 10p', 'Set Code == HPC']) assert.ok(!decrease.test(line), `must not decrease: ${line}`);
});

test('on-enter comment continuation only applies to comment-only lines', () => {
    const rule = vscodeConfigRegex(config.onEnterRules[0].beforeText);
    assert.ok(rule.test('  ! Example'));
    assert.ok(!rule.test('Cell Size == 10 ! inline comment'));
    assert.ok(!rule.test('Output == "file!name"'));
    assert.equal(config.onEnterRules[0].action.appendText, '! ');
    const hashRule = vscodeConfigRegex(config.onEnterRules[1].beforeText);
    assert.ok(hashRule.test('  # Comment'));
    assert.ok(!hashRule.test('Read GIS Z Shape == dem.shp # inline'));
    assert.equal(config.onEnterRules[1].action.appendText, '# ');
    for (const preference of ['editor.tabSize', 'editor.insertSpaces', 'editor.detectIndentation']) {
        assert.ok(!(preference in config), `remove invalid language config property ${preference}`);
    }
});
