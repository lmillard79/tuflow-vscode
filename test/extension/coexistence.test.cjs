'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vscode = require('vscode');

// Runs against *installed* VSIX files through a non-TUFLOW test host. Each mode
// starts in a separate VS Code instance and uses only temporary control files.
const mode = process.env.TUFLOW_TEST_COEXIST_MODE;
if (mode) {
  suite('Installed Helper and Path Validator coexistence (' + mode + ')', () => {
    const helperId = 'lmillard79.tuflow-helper';
    const validatorId = 'Chain-Frost.tuflow-path-validator';
    const hasHelper = mode !== 'validator-only';
    const hasValidator = mode !== 'helper-only';
    const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tuflow-issue7-coexist-'));
    const absent = 'issue7_missing_' + crypto.randomBytes(5).toString('hex') + '.tgc';
    const modelPath = path.join(fixtureDir, 'model.tcf');
    const formatPath = path.join(fixtureDir, 'indentation.tcf');
    const evidence = {
      mode,
      platform: process.platform,
      vscodeVersion: vscode.version,
      sourceSha: process.env.TUFLOW_TEST_SOURCE_SHA || 'unknown',
      expected: { helperId, validatorId },
      observed: {}
    };
    let document;

    suiteSetup(async () => {
      fs.writeFileSync(path.join(fixtureDir, 'exists.tgc'), '! present fixture\n');
      fs.writeFileSync(modelPath, [
        'Geometry Control File == ' + absent,
        'Geometry Control File == exists.tgc',
        'Viscosity Coefficients == 0.2, 0.1',
        'Unknown Experimental Command == 2026'
      ].join('\n') + '\n');
      fs.writeFileSync(formatPath, [
        'If Scenario == Design',
        'Cell Size == 10',
        'End If'
      ].join('\n') + '\n');
      const helper = vscode.extensions.getExtension(helperId);
      const validator = vscode.extensions.getExtension(validatorId);
      assert.equal(Boolean(helper), hasHelper, 'wrong Helper presence for ' + mode);
      assert.equal(Boolean(validator), hasValidator, 'wrong Validator presence for ' + mode);
      if (helper) await helper.activate();
      if (validator) await validator.activate();
      evidence.extensions = {
        helper: helper && { id: helper.id, version: helper.packageJSON.version, location: helper.extensionPath, active: helper.isActive },
        validator: validator && { id: validator.id, version: validator.packageJSON.version, location: validator.extensionPath, active: validator.isActive }
      };
      document = await vscode.workspace.openTextDocument(vscode.Uri.file(modelPath));
      await vscode.window.showTextDocument(document, { preview: false });
    });

    suiteTeardown(async () => {
      const output = process.env.TUFLOW_TEST_COEXIST_EVIDENCE;
      if (output) {
        fs.mkdirSync(path.dirname(output), { recursive: true });
        fs.writeFileSync(output, JSON.stringify(evidence, null, 2) + '\n');
      }
      try { await vscode.commands.executeCommand('workbench.action.closeAllEditors'); }
      finally { fs.rmSync(fixtureDir, { recursive: true, force: true }); }
    });

    test('shared language ID is assigned to overlapping control file extensions', async () => {
      const extensions = ['.tcf', '.tgc', '.tbc', '.ecf', '.trd', '.qcf', '.tef', '.toc', '.trfc'];
      const results = {};
      for (const suffix of extensions) {
        const filepath = path.join(fixtureDir, 'sample' + suffix);
        fs.writeFileSync(filepath, 'Cell Size == 10\n');
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filepath));
        results[suffix] = doc.languageId;
        assert.equal(doc.languageId, 'tuflow', 'unexpected language for ' + suffix);
      }
      evidence.observed.languages = results;
      assert.equal(document.languageId, 'tuflow');
    });

    test('Helper owns command assistance, not file opening or diagnostics', async () => {
      const commands = await vscode.commands.getCommands(true);
      assert.ok(!commands.includes('tuflow-helper.openFileUnderCursor'));
      if (hasHelper) {
        assert.ok(commands.includes('tuflow-helper.openDocumentation'));
        const inputPath = path.join(fixtureDir, 'helper-completion.tcf');
        fs.writeFileSync(inputPath, 'Cell\n', 'utf8');
        const input = await vscode.workspace.openTextDocument(vscode.Uri.file(inputPath));
        const completions = await vscode.commands.executeCommand(
          'vscode.executeCompletionItemProvider', input.uri, new vscode.Position(0, 4)
        );
        assert.ok(completions.items.some(item => item.label === 'Cell Size'), 'Helper completion missing');
      } else {
        assert.ok(!commands.includes('tuflow-helper.openDocumentation'));
      }
      evidence.observed.helperCompletion = hasHelper;
    });

    test('missing paths appear only with Validator, without numeric false positives', async () => {
      const limit = Date.now() + 12000;
      let all = [];
      do {
        all = vscode.languages.getDiagnostics(document.uri);
        if (!hasValidator || all.some(item => item.message.includes(absent))) break;
        await new Promise(resolve => setTimeout(resolve, 250));
      } while (Date.now() < limit);
      const missing = all.filter(item => item.message.includes(absent));
      const sources = all.map(item => ({ source: item.source, code: item.code, message: item.message }));
      evidence.observed.diagnostics = sources;
      if (hasValidator) {
        assert.equal(missing.length, 1, 'expected one, not duplicate, missing input diagnostic');
        assert.equal(missing[0].source, 'TUFLOW Path Validator', 'diagnostic must belong to Validator');
        assert.equal(missing[0].range.start.line, 0);
        assert.equal(missing[0].range.start.character,
          document.lineAt(0).text.indexOf(absent), 'incorrect diagnostic source range');
        assert.equal(missing[0].range.end.character - missing[0].range.start.character, absent.length);
      } else {
        assert.equal(all.length, 0, 'Helper-only profile must not emit diagnostics');
      }
      assert.ok(!all.some(item => /exists\.tgc|Viscosity Coefficients|Unknown Experimental Command/.test(item.message)),
        'present file, numeric setting or unknown command incorrectly diagnosed');
    });

    test('only Validator supplies optional document-formatting edits', async () => {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(formatPath));
      const settings = vscode.workspace.getConfiguration('tuflowValidator', doc.uri);
      const options = { tabSize: 4, insertSpaces: true };
      const format = async () => {
        const result = await vscode.commands.executeCommand(
          'vscode.executeFormatDocumentProvider', doc.uri, options);
        return Array.isArray(result) ? result : [];
      };
      // Validator's formatter is registered but disabled by default.
      if (hasValidator) await settings.update('enableIfStatementFormatting', false, vscode.ConfigurationTarget.Global);
      try {
        const disabled = await format();
        assert.equal(disabled.length, 0, 'disabled formatter must make no edits');
        if (hasValidator) {
          await settings.update('enableIfStatementFormatting', true, vscode.ConfigurationTarget.Global);
          const enabled = await format();
          assert.equal(enabled.length, 1, 'expected exactly one indentation edit');
          assert.equal(enabled[0].range.start.line, 1);
          evidence.observed.format = { disabledEdits: disabled.length, enabledEdits: enabled.length };
        } else {
          const enabled = await format();
          assert.equal(enabled.length, 0, 'Helper must not register a formatter');
          evidence.observed.format = { disabledEdits: disabled.length, enabledEdits: enabled.length };
        }
      } finally {
        if (hasValidator) await settings.update('enableIfStatementFormatting', false, vscode.ConfigurationTarget.Global);
      }
    });

    test('explicit language association retains the shared ID', async () => {
      const settings = vscode.workspace.getConfiguration('files');
      const previous = settings.inspect('associations').globalValue;
      try {
        await settings.update('associations', { '*.tcf': 'tuflow', '*.tgc': 'tuflow' },
          vscode.ConfigurationTarget.Global);
        const filename = path.join(fixtureDir, 'associated.tcf');
        fs.writeFileSync(filename, 'Cell Size == 2\n');
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filename));
        assert.equal(doc.languageId, 'tuflow');
      } finally {
        await settings.update('associations', previous, vscode.ConfigurationTarget.Global);
      }
      evidence.observed.association = 'tuflow';
    });
  });
}
