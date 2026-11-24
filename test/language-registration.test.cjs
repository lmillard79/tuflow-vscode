'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('package.json'));

const overlappingExtensions = ['.tcf', '.tgc', '.tbc', '.ecf', '.trd', '.qcf', '.tef', '.trfc', '.toc'];

test('language, grammar, snippets, configuration and activation share the tuflow ID', () => {
    assert.equal(manifest.contributes.languages.length, 1);
    const language = manifest.contributes.languages[0];
    assert.equal(language.id, 'tuflow');
    assert.equal(language.configuration, './language-configuration.json');
    assert.ok(fs.existsSync(path.join(root, language.configuration)));
    for (const ext of overlappingExtensions) {
        assert.ok(language.extensions.includes(ext), 'missing overlapping extension: ' + ext);
    }
    assert.ok(manifest.activationEvents.includes('onLanguage:tuflow'));
    assert.ok(!manifest.activationEvents.includes('onLanguage:tuflow-helper'));
    assert.ok(manifest.contributes.grammars.some(g => g.language === 'tuflow' && g.scopeName === 'source.tuflow'));
    assert.ok(manifest.contributes.snippets.some(s => s.language === 'tuflow'));
    for (const contribution of [...manifest.contributes.grammars, ...manifest.contributes.snippets]) {
        assert.notEqual(contribution.language, 'tuflow-helper');
        assert.ok(fs.existsSync(path.join(root, contribution.path)));
    }
    assert.equal(JSON.parse(read('syntaxes/tuflow.tmLanguage.json')).scopeName, 'source.tuflow');
});

test('no duplicate file opening, diagnostic or formatting contributions in Helper', () => {
    const commands = manifest.contributes.commands.map(c => c.command);
    assert.deepEqual(commands, ['tuflow-helper.openDocumentation']);
    const menus = Object.values(manifest.contributes.menus || {}).flat();
    assert.ok(!menus.some(c => c.command.includes('openFileUnderCursor')));
    assert.ok(menus.some(c => c.command === 'tuflow-helper.openDocumentation'
        && c.when.includes('editorLangId == tuflow')), 'documentation context menu must use the shared language ID');
    for (const file of ['src/extension.ts', 'out/extension.js']) {
        const text = read(file);
        assert.doesNotMatch(text, /openFileUnderCursor|openFileCommand|createDiagnosticCollection|registerDocumentFormattingEditProvider/);
    }
});

function activateHelperOnly() {
    const registrations = { completion: [], hover: [], signature: [], commands: [] };
    const disposable = () => ({ dispose() {} });
    const makeProvider = type => (language, provider) => {
        registrations[type].push({ language, provider });
        return disposable();
    };
    const mockVSCode = {
        languages: {
            registerCompletionItemProvider: makeProvider('completion'),
            registerHoverProvider: makeProvider('hover'),
            registerSignatureHelpProvider: makeProvider('signature'),
        },
        commands: {
            registerCommand(id, command) {
                registrations.commands.push({ id, command });
                return disposable();
            },
        },
        CompletionItemKind: { Keyword: 1, File: 2, Value: 3 },
        CompletionItem: class {
            constructor(label, kind) { this.label = label; this.kind = kind; }
        },
        SnippetString: class { constructor(value) { this.value = value; } },
        MarkdownString: class {
            constructor(value = '') { this.value = value; }
            appendCodeblock(value) { this.value += value; }
            appendMarkdown(value) { this.value += value; }
        },
        Hover: class { constructor(contents, range) { this.contents = contents; this.range = range; } },
        Range: class { constructor(line, start, endLine, end) { this.start = { line, character: start }; this.end = { line: endLine, character: end }; } },
        SignatureInformation: class {
            constructor(label, documentation) { this.label = label; this.documentation = documentation; }
        },
        ParameterInformation: class {
            constructor(label, documentation) { this.label = label; this.documentation = documentation; }
        },
        SignatureHelp: class {},
    };
    const sampleCommand = {
        name: 'Test',
        category: 'TCF',
        description: 'Fixture command',
        syntax: 'Test == VALUE',
        parameters: ['VALUE'],
        examples: ['Test == 1'],
    };
    const tgcCommand = { ...sampleCommand, category: 'TGC' };
    const tbcCommand = { ...sampleCommand, category: 'TBC' };
    const ecfCommand = { ...sampleCommand, category: 'ECF' };
    const trfcCommand = { ...sampleCommand, category: 'TRFC' };
    const qcfCommand = { ...sampleCommand, category: 'QCF' };
    const commands = {
        allTuflowCommands: [sampleCommand, tgcCommand, tbcCommand, ecfCommand, trfcCommand, qcfCommand],
        tcfCommands: [sampleCommand],
        tgcCommands: [tgcCommand],
        tbcCommands: [tbcCommand],
        ecfCommands: [ecfCommand],
        trfcCommands: [trfcCommand],
        qcfCommands: [qcfCommand],
    };
    const module = { exports: {} };
    vm.runInNewContext(read('out/extension.js'), {
        module,
        exports: module.exports,
        require(id) {
            if (id === 'vscode') return mockVSCode;
            if (id === './editor/commandProviders') return {
                registerCommandEditorServices(language) {
                    // Test the activation adapter only. Provider behaviour is
                    // exercised in the real VS Code Extension Host suites.
                    return ['completion', 'hover', 'signature'].map(type =>
                        makeProvider(type)(language, {}));
                },
            };
            if (id === './commands') return commands;
            if (id === './documentation') return {
                getAuditedCommandDocumentationUrl() { return undefined; },
                getDocumentationUrlForLine() { return 'https://docs.tuflow.com/classic-hpc/manual/2026.3/'; },
            };
            if (id === 'path') return path;
            throw Error('unexpected module: ' + id);
        },
        console: { log() {} },
    }, { filename: 'out/extension.js' });
    const context = { subscriptions: [] };
    module.exports.activate(context);
    return { registrations, context };
}

test('Helper-only activation registers its three providers against tuflow', () => {
    const { registrations, context } = activateHelperOnly();
    for (const type of ['completion', 'hover', 'signature']) {
        assert.equal(registrations[type].length, 1);
        assert.equal(registrations[type][0].language, 'tuflow');
    }
    assert.deepEqual(registrations.commands.map(c => c.id), ['tuflow-helper.openDocumentation']);
    assert.equal(context.subscriptions.length, 4);
});

test('all overlapping file types retain shared provider registration', () => {
    const { registrations } = activateHelperOnly();
    const contributed = new Set(manifest.contributes.languages[0].extensions);
    for (const ext of overlappingExtensions) {
        assert.ok(contributed.has(ext), 'missing extension association for ' + ext);
    }
    for (const type of ['completion', 'hover', 'signature']) {
        assert.equal(registrations[type].length, 1);
        assert.equal(registrations[type][0].language, 'tuflow');
    }
    // Real completion, hover, signature and contextual values are asserted by
    // test/extension/commandEditor.test.cjs in both source and installed VSIX.
});
