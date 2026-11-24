'use strict';

// Runs INSIDE the actual VS Code Extension Host. Exercises the extension's
// public language providers using disposable TCF/TGC files, not real models.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vscode = require('vscode');

function label(item) {
    return typeof item.label === 'string' ? item.label : item.label.label;
}

function markdown(hover) {
    return hover.contents.map(item => {
        if (typeof item === 'string') return item;
        if (typeof item.value === 'string') return item.value;
        return '';
    }).join('\n');
}

async function run() {
    const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'tuflow-catalogue-'));
    let serial = 0;
    const extension = vscode.extensions.getExtension('lmillard79.tuflow-helper');
    assert.ok(extension, 'The extension under test must be installed in the host');
    await extension.activate();
    console.log('VS Code', vscode.version, 'Node', process.version,
        'platform', process.platform, 'extension', extension.id);

    async function open(ext, line) {
        const filename = path.join(folder, 'model-' + (++serial) + '.' + ext);
        fs.writeFileSync(filename, line + '\n', 'utf8');
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filename));
        assert.equal(document.languageId, 'tuflow',
            'Expected the extension language contribution for ' + filename);
        await vscode.window.showTextDocument(document, { preview: false });
        return document;
    }

    async function completions(ext, line) {
        const document = await open(ext, line);
        const items = await vscode.commands.executeCommand(
            'vscode.executeCompletionItemProvider',
            document.uri, new vscode.Position(0, line.length)
        );
        assert.ok(items && Array.isArray(items.items), 'Completion API must return a list');
        // The VS Code editor also contributes word and snippet completions.
        // Only the extension's Keyword/File/Value provider categories are relevant.
        const kinds = new Set([
            vscode.CompletionItemKind.Keyword,
            vscode.CompletionItemKind.File,
            vscode.CompletionItemKind.Value
        ]);
        return items.items.filter(item => kinds.has(item.kind)).map(label);
    }

    async function hovers(ext, line, character) {
        const document = await open(ext, line);
        return (await vscode.commands.executeCommand(
            'vscode.executeHoverProvider',
            document.uri, new vscode.Position(0, character)
        )) || [];
    }

    try {
        const tcfNames = await completions('tcf', '');
        assert.ok(tcfNames.includes('Start Time'));
        assert.ok(tcfNames.includes('Write Check Files EXCLUDE'));
        assert.ok(tcfNames.includes('Write Check Files INCLUDE'));
        assert.ok(!tcfNames.includes('Set Code'),
            'TGC cell-code command must not be suggested as TCF');
        const tgcNames = await completions('tgc', '');
        assert.ok(tgcNames.includes('Read GIS Z Shape'));
        assert.ok(tgcNames.includes('Read Grid Zpts'));
        assert.ok(!tgcNames.includes('Read GIS BC'),
            'TBC boundary location command must not appear in TGC');

        for (const type of ['INCLUDE', 'EXCLUDE']) {
            const values = await completions('tcf', 'Write Check Files ' + type + ' == ');
            assert.ok(!values.includes('file path'),
                'Space-delimited check-layer prefix list is NOT a path: ' + type);
            const command = 'Write Check Files ' + type + ' == prefix';
            const hoverResults = await hovers('tcf', command, 12);
            assert.ok(hoverResults.length > 0, 'Expected hover for ' + type);
            const hoverText = hoverResults.map(markdown).join('\n');
            assert.match(hoverText, /<prefix_list>/,
                'Hover must expose prefix-list syntax, not a folder');
        }

        const base = await completions('tcf', 'Write Check Files == ');
        assert.ok(base.includes('file path'),
            'Unmodified Write Check Files should still accept a folder/prefix');

        for (const type of ['Map Output Data Types', 'Map Output Format']) {
            const values = await completions('tcf', type + ' == ');
            assert.ok(!values.includes('file path'),
                type + ' must not suggest an unrelated file path');
        }

        const grid = await completions('tgc', 'Read Grid Zpts == ');
        assert.ok(grid.includes('file path'), 'Grid Zpts expects a raster path');

        const timeHovers = await hovers('tcf', 'Start Time == 0', 4);
        assert.ok(timeHovers.length > 0);
        assert.match(timeHovers.map(markdown).join('\n'), /time_in_hours/,
            'Start Time syntax must use simulation hours');

        assert.deepEqual(await completions('tgc', '# Read GIS Z Shape == invalid.shp'), []);
        assert.deepEqual(await completions('tcf', '! Start Time == 99'), []);

        console.log('PASS: VS Code TCF/TGC completions, modifier value types, ' +
            'hover syntax, contexts and comments');
    } finally {
        await vscode.commands.executeCommand('workbench.action.closeAllEditors');
        try {
            fs.rmSync(folder, {
                recursive: true, force: true, maxRetries: 15, retryDelay: 250
            });
        } catch (error) {
            // Windows file watchers can temporarily hold VS Code test documents
            // open; never mask a real test assertion with cleanup failure.
            console.warn('Temporary fixture cleanup deferred:', error.message);
        }
    }
}

// Executed by the shared VS Code Mocha Extension Host and installed-VSIX suite.
suite('Audited TCF/TGC command editor integration', () => {
    test('commands, operand types, hovers and comment suppression', async () => {
        await run();
    });
});
