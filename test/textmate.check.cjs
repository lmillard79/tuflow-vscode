'use strict';

// Real TextMate/Oniguruma tokenisation test; CI installs these test-only tools
// into .grammar-test-deps, without changing the extension's runtime dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vsctm = require('vscode-textmate');
const oniguruma = require('vscode-oniguruma');

const root = path.resolve(__dirname, '..');
const grammarPath = path.join(root, 'syntaxes/tuflow.tmLanguage.json');
const fixtures = require('./fixtures/grammar-cases.json');

async function loadGrammar() {
    const wasm = fs.readFileSync(require.resolve('vscode-oniguruma/release/onig.wasm'));
    await oniguruma.loadWASM(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
    const registry = new vsctm.Registry({
        onigLib: Promise.resolve({
            createOnigScanner: patterns => new oniguruma.OnigScanner(patterns),
            createOnigString: source => new oniguruma.OnigString(source)
        }),
        loadGrammar: async scopeName => scopeName === 'source.tuflow'
            ? vsctm.parseRawGrammar(fs.readFileSync(grammarPath, 'utf8'), grammarPath)
            : null
    });
    return registry.loadGrammar('source.tuflow');
}

function scopesAt(tokens, offset) {
    const token = tokens.find(t => t.startIndex <= offset && t.endIndex > offset);
    assert.ok(token, `no token at offset ${offset}`);
    return token.scopes;
}

test('TextMate lexer produces fixture scopes and keeps unknown commands neutral', async () => {
    const grammar = await loadGrammar();
    assert.ok(grammar);
    for (const fixture of fixtures) {
        const { line, name, expected } = fixture;
        const tokens = grammar.tokenizeLine(line, vsctm.INITIAL).tokens;
        for (const [scope, text] of expected) {
            const at = line.indexOf(text);
            assert.ok(at >= 0, `${name}: expected text not found: ${text}`);
            const scopes = scopesAt(tokens, at + (/^\s*/.exec(text)[0].length));
            assert.ok(scopes.includes(scope), `${name}: ${JSON.stringify({scope, text, scopes, tokens})}`);
        }
        if (name.startsWith('unknown') || name.startsWith('incomplete') || name.startsWith('comments')) {
            assert.ok(!tokens.some(t => t.scopes.includes('support.function.tuflow')),
                `${name}: unknown command was classified as recognised`);
        }
    }
});

test('quote protection and comment precedence survive TextMate tokenisation', async () => {
    const grammar = await loadGrammar();
    const line = 'Read GIS Z Shape == "C:\\model!test\\terrain.tif" ! comment == -2';
    const tokens = grammar.tokenizeLine(line, vsctm.INITIAL).tokens;
    assert.ok(scopesAt(tokens, line.indexOf('!test')).includes('string.quoted.double.tuflow'));
    assert.ok(!scopesAt(tokens, line.indexOf('!test')).includes('comment.line.exclamation.tuflow'));
    assert.ok(scopesAt(tokens, line.indexOf('! comment')).includes('comment.line.exclamation.tuflow'));
    assert.ok(!scopesAt(tokens, line.lastIndexOf('==')).includes('keyword.operator.assignment.tuflow'));
});

test('unquoted apostrophes do not swallow subsequent commands or comments', async () => {
    const grammar = await loadGrammar();
    const first = "Output Folder == results/O'Brien ! a normal comment";
    const line1 = grammar.tokenizeLine(first, vsctm.INITIAL);
    assert.ok(!scopesAt(line1.tokens, first.indexOf("'")).includes('string.quoted.single.tuflow'));
    assert.ok(scopesAt(line1.tokens, first.indexOf('!')).includes('comment.line.exclamation.tuflow'));

    const second = 'Cell Size == -2.5 ! next command';
    const line2 = grammar.tokenizeLine(second, line1.ruleStack);
    assert.ok(scopesAt(line2.tokens, second.indexOf('Cell Size')).includes('support.function.tuflow'));
    assert.ok(scopesAt(line2.tokens, second.indexOf('-2.5')).includes('constant.numeric.tuflow'));
    assert.ok(scopesAt(line2.tokens, second.indexOf('!')).includes('comment.line.exclamation.tuflow'));
});

test('unterminated quoted values end at the current line', async () => {
    const grammar = await loadGrammar();
    for (const quote of ["'", '"']) {
        const first = `Output Folder == ${quote}unfinished filename`;
        const line1 = grammar.tokenizeLine(first, vsctm.INITIAL);
        const quotedScope = quote === "'" ? 'string.quoted.single.tuflow' : 'string.quoted.double.tuflow';
        assert.ok(scopesAt(line1.tokens, first.indexOf('unfinished')).includes(quotedScope));

        const second = 'Cell Size == 10 ! must remain a comment';
        const line2 = grammar.tokenizeLine(second, line1.ruleStack);
        assert.ok(scopesAt(line2.tokens, second.indexOf('Cell Size')).includes('support.function.tuflow'));
        assert.ok(scopesAt(line2.tokens, second.indexOf('10')).includes('constant.numeric.tuflow'));
        assert.ok(scopesAt(line2.tokens, second.indexOf('!')).includes('comment.line.exclamation.tuflow'));
        assert.ok(!scopesAt(line2.tokens, second.indexOf('Cell Size')).includes(quotedScope));
    }
});

test('hash comments and quoted hashes preserve TextMate scopes across lines', async () => {
    const grammar = await loadGrammar();
    const lines = [
        '# Read GIS Z Shape == ignored.shp',
        'Cell Size == -1.5 # End If and 10 are comment text',
        'Read GIS Z Line == "C:\\model#archive\\survey.shp" # after quote',
        'Cell Size == 4.5 ! existing comment syntax'
    ];
    let stack = vsctm.INITIAL;
    for (const line of lines) {
        const result = grammar.tokenizeLine(line, stack);
        stack = result.ruleStack;
        const markerAt = line.includes(' # ') ? line.lastIndexOf('#') : line.startsWith('#') ? 0 : line.lastIndexOf('!');
        const scope = line[markerAt] === '#' ? 'comment.line.number-sign.tuflow' : 'comment.line.exclamation.tuflow';
        assert.ok(scopesAt(result.tokens, markerAt).includes(scope), 'missing comment scope: ' + line);
        if (line.startsWith('#')) {
            assert.ok(!result.tokens.some(t => t.scopes.includes('support.function.tuflow')),
                'commented-out Read GIS must not be recognised as a command');
        }
        if (line.includes('#archive')) {
            const index = line.indexOf('#archive');
            assert.ok(scopesAt(result.tokens, index).includes('string.quoted.double.tuflow'));
            assert.ok(!scopesAt(result.tokens, index).includes('comment.line.number-sign.tuflow'));
        }
    }
    const after = 'Read GIS Z Shape == elevations.shp';
    const tokens = grammar.tokenizeLine(after, stack).tokens;
    assert.ok(scopesAt(tokens, after.indexOf('Read GIS Z Shape')).includes('support.function.tuflow'));
});
