const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vscode = require('vscode');

// Read contributions from the manifest so the coexistence workstream can
// migrate the language ID and remove legacy commands without breaking this suite.
const projectManifest = require('../../package.json');
const extensionId = `${projectManifest.publisher}.${projectManifest.name}`;
const languageId = projectManifest.contributes.languages[0].id;

suite('TUFLOW Helper Extension Host smoke tests', () => {
  test('extension activates and contributes required resources', async () => {
    const extension = vscode.extensions.getExtension(extensionId);
    assert.ok(extension, `extension ${extensionId} should be installed or loaded for development`);
    if (process.env.TUFLOW_TEST_INSTALLED === '1') {
      assert.notEqual(
        path.resolve(extension.extensionPath),
        path.resolve(__dirname, '../..'),
        'installed-VSIX test must not load the development checkout'
      );
    }
    await extension.activate();
    assert.ok(extension.isActive);
    assert.ok((await vscode.languages.getLanguages()).includes(languageId));

    const manifest = extension.packageJSON;
    const language = manifest.contributes.languages.find(item => item.id === languageId);
    assert.ok(language);
    assert.ok(language.extensions.includes('.qcf'));
    assert.ok(language.extensions.includes('.toc'));
    const resources = [
      manifest.main,
      language.configuration,
      ...manifest.contributes.grammars.map(grammar => grammar.path),
      ...manifest.contributes.snippets.map(snippet => snippet.path)
    ];
    for (const resource of resources) {
      assert.ok(fs.existsSync(path.resolve(extension.extensionPath, resource)), `missing contribution: ${resource}`);
    }
    // Only require captured HTML when the installed runtime still uses it.
    const runtime = fs.readFileSync(path.join(extension.extensionPath, manifest.main), 'utf8');
    if (runtime.includes('doc/Appendix ')) {
      assert.ok(fs.existsSync(path.join(extension.extensionPath, 'doc')));
    }
    const commands = await vscode.commands.getCommands(true);
    for (const { command } of manifest.contributes.commands || []) {
      assert.ok(commands.includes(command), `command not registered: ${command}`);
    }
    assert.ok(!commands.includes('tuflow-helper.openFileUnderCursor'),
      'legacy Helper file opener must not be registered');
    assert.ok(commands.includes('tuflow-helper.openDocumentation'),
      'official documentation command must remain registered');
  });

  test('TUFLOW file extensions resolve to the contributed language', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tuflow-helper-test-'));
    try {
      for (const extension of ['.tcf', '.ecf', '.tgc', '.tbc', '.tef', '.trd', '.qcf', '.toc', '.trfc']) {
        const file = path.join(directory, `model${extension}`);
        fs.writeFileSync(file, 'Cell Size == 10\n', 'utf8');
        const document = await vscode.workspace.openTextDocument(vscode.Uri.file(file));
        assert.equal(document.languageId, languageId, `wrong language for ${extension}`);
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test('activation exposes a contextual TCF command completion', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tuflow-completion-'));
    try {
      const filename = path.join(directory, 'model.tcf');
      fs.writeFileSync(filename, 'Cell\n', 'utf8');
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filename));
      const completions = await vscode.commands.executeCommand(
        'vscode.executeCompletionItemProvider', document.uri, new vscode.Position(0, 4)
      );
      assert.ok(completions && completions.items.some(item => item.label === 'Cell Size'),
        'TCF command completion must be scoped to the source file');
    } finally {
      await vscode.commands.executeCommand('workbench.action.closeAllEditors');
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
  test('audited multiword command hover exposes its official TUFLOW reference', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tuflow-help-hover-'));
    try {
      const filename = path.join(directory, 'sample.tcf');
      fs.writeFileSync(filename, 'End Time == 12\n', 'utf8');
      const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filename));
      const hovers = await vscode.commands.executeCommand(
        'vscode.executeHoverProvider', document.uri, new vscode.Position(0, 3)
      );
      assert.ok(Array.isArray(hovers) && hovers.length > 0, 'missing End Time hover');
      const markdown = hovers.flatMap(hover => hover.contents)
        .map(content => typeof content === 'string' ? content : content.value || '')
        .join('\n');
      assert.match(markdown, /Official TUFLOW (?:command reference|documentation)/);
      assert.match(markdown, /https:\/\/docs\.tuflow\.com\/classic-hpc\/manual\/2026\.3\/80-AppendicesA-TCFCommands\.html/);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test('TEF and extensionless commands preserve context-appropriate hover', async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tuflow-hover-context-'));
    try {
      const samples = [
        { filename: path.join(directory, 'events.tef'), text: 'End Time == 12\n', expected: /80-AppendicesA-TCFCommands\.html/ },
        { filename: path.join(directory, 'timestep.tef'), text: 'Timestep == 1\n', expected: /Timestep/ },
        { filename: path.join(directory, 'shared.trd'), text: 'Timestep == 1\n', expected: /Timestep/ },
        { filename: path.join(directory, 'geometry.tgc'), text: 'Read GIS Z Shape == terrain.shp\n', expected: /Read GIS Z Shape/ }
      ];

      for (const sample of samples) {
        fs.writeFileSync(sample.filename, sample.text, 'utf8');
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(sample.filename));
        const hovers = await vscode.commands.executeCommand(
          'vscode.executeHoverProvider', doc.uri, new vscode.Position(0, 3)
        );
        const contents = (hovers || []).flatMap(hover => hover.contents)
          .map(content => typeof content === 'string' ? content : content.value || '')
          .join('\n');
        assert.match(contents, sample.expected, 'missing context hover for ' + sample.filename);
      }

      const untitled = await vscode.workspace.openTextDocument({
        language: languageId, content: 'Timestep == 1\n'
      });
      const hovers = await vscode.commands.executeCommand(
        'vscode.executeHoverProvider', untitled.uri, new vscode.Position(0, 3)
      );
      const contents = (hovers || []).flatMap(hover => hover.contents)
        .map(content => typeof content === 'string' ? content : content.value || '')
        .join('\n');
      assert.match(contents, /Timestep/, 'untitled TUFLOW command lost hover');
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test('curated snippets expand with VS Code editable placeholders', async () => {
    const extension = vscode.extensions.getExtension(extensionId);
    assert.ok(extension);
    const snippets = require(path.join(extension.extensionPath, 'snippets/tuflow.json'));
    const expected = {
      'tcf-geometry': 'Geometry Control File == ../model/model.tgc',
      'tcf-boundaries': 'BC Control File == ../model/model.tbc',
      'tcf-end-time': 'End Time == 12',
      'tgc-cell-size': 'Cell Size == 10',
      'tgc-z-shape': 'Read GIS Z Shape == ../model/gis/2d_zsh_001.shp',
      'tbc-database': 'BC Database == ../bc_dbase/bc_dbase.csv',
      'ecf-network': 'Read GIS Network == ../model/gis/1d_nwk_001.shp',
      'qcf-base-cell-size': 'Base Cell Size == 20',
      'trfc-interpolation': 'RF Interpolation Method == IDW',
      'tef-event': 'Define Event == design_event\n    End Time == 12\nEnd Define'
    };
    for (const item of Object.values(snippets)) {
      const doc = await vscode.workspace.openTextDocument({ language: languageId, content: '' });
      const editor = await vscode.window.showTextDocument(doc);
      const inserted = await editor.insertSnippet(
        new vscode.SnippetString(Array.isArray(item.body) ? item.body.join('\n') : item.body)
      );
      assert.equal(inserted, true, 'snippet did not insert: ' + item.prefix);
      assert.equal(doc.getText().replace(/\r\n/g, '\n'), expected[item.prefix], 'incorrect expansion: ' + item.prefix);
    }
  });

});
