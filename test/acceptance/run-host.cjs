'use strict';

// Runs the real VS Code Extension Host against pinned source-built VSIX files.
// Called from CI with @vscode/test-electron installed in NODE_PATH.
// This script installs nothing globally, runs no solver, and writes JSON only.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const {isFreshInvocationReport} = require('./assertions.cjs');
const {
  downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests
} = require('@vscode/test-electron');

const [helperArg, validatorArg, acceptanceArg] = process.argv.slice(2);
if (!helperArg || !validatorArg || !acceptanceArg) {
  throw new Error('Usage: node run-host.cjs helper.vsix validator.vsix acceptance-checkout');
}
const helper = path.resolve(helperArg);
const validator = path.resolve(validatorArg);
const acceptance = path.resolve(acceptanceArg);
const actualAcceptanceCommit = cp.spawnSync('git', ['-C', acceptance, 'rev-parse', 'HEAD'], {encoding: 'utf8'});
if (actualAcceptanceCommit.status !== 0 || !/^[a-f0-9]{40}\s*$/.test(actualAcceptanceCommit.stdout || '')) {
  throw new Error('Could not verify the acceptance checkout commit: ' +
    (actualAcceptanceCommit.stderr || actualAcceptanceCommit.error || actualAcceptanceCommit.status));
}
const acceptanceSha = actualAcceptanceCommit.stdout.trim();
if (process.env.TUFLOW_HOST_ACCEPTANCE_SHA &&
    process.env.TUFLOW_HOST_ACCEPTANCE_SHA !== acceptanceSha) {
  throw new Error('Acceptance source identity mismatch: claimed ' +
    process.env.TUFLOW_HOST_ACCEPTANCE_SHA + ', actual ' + acceptanceSha);
}
const fixtures = path.resolve(process.env.TUFLOW_ACCEPT_FIXTURES || path.join(acceptance, 'test', 'acceptance', 'fixtures'));
const runner = path.join(acceptance, 'test', 'acceptance', 'vscode-runner.cjs');
const outputDir = path.resolve(process.env.TUFLOW_ACCEPT_ARTIFACTS || 'acceptance-host-reports');
const profiles = [
  {name: 'validator-only', extensions: [validator]},
  {name: 'helper-only', extensions: [helper]},
  {name: 'combined', extensions: [helper, validator]},
  {name: 'full', extensions: [
    helper, validator, 'Fr43nk.seito-openfile', 'usernamehw.errorlens'
  ]}
];
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function save(filename, object) {
  fs.mkdirSync(outputDir, {recursive: true});
  fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(object, null, 2) + '\n');
}
function install(cli, prefix, profile, target, user, extensions) {
  const processArgs = [...prefix, '--user-data-dir', user,
    '--extensions-dir', extensions, '--install-extension', target, '--force'];
  const result = cp.spawnSync(cli, processArgs, {
    encoding: 'utf8', timeout: 180000,
    env: {...process.env, ELECTRON_RUN_AS_NODE: ''},
    shell: process.platform === 'win32'
  });
  console.log('[install ' + profile + '] ' + path.basename(target) +
    ' status=' + result.status + '\n' +
    (result.stdout || '').slice(-500) + '\n' + (result.stderr || '').slice(-500));
  if (result.status !== 0) {
    throw new Error('Unable to install ' + target + ': ' +
      (result.error || result.stderr || result.stdout || result.status));
  }
}
async function main() {
  if (![helper, validator, runner, path.join(fixtures, 'model.tcf')]
    .every(file => fs.existsSync(file))) throw new Error('Missing test input');
  fs.mkdirSync(outputDir, {recursive: true});
  // A rerun must not upload or classify evidence from an earlier invocation.
  fs.rmSync(path.join(outputDir, 'summary.json'), {force: true});
  for (const profile of profiles) {
    fs.rmSync(path.join(outputDir, 'host-' + profile.name + '.json'), {force: true});
  }
  const installDir = path.join(outputDir, 'installed-profiles');
  const driver = path.join(outputDir, 'test-driver');
  fs.mkdirSync(driver, {recursive: true});
  fs.writeFileSync(path.join(driver, 'package.json'), JSON.stringify({
    name: 'tuflow-acceptance-host', publisher: 'local-test',
    version: '0.0.0', engines: {vscode: '^1.74.0'},
    main: './extension.js'
  }));
  fs.writeFileSync(path.join(driver, 'extension.js'), 'exports.activate = () => {};\n');
  const executable = await downloadAndUnzipVSCode(process.env.TUFLOW_ACCEPT_VSCODE_VERSION || '1.147.0');
  const [cli, ...cliPrefix] = resolveCliArgsFromVSCodeExecutablePath(
    executable, {reuseMachineInstall: true});
  const summary = {
    schemaVersion: 1, timestamp: new Date().toISOString(),
    platform: process.platform, arch: process.arch, node: process.version,
    vscodeExecutable: executable,
    pinnedSourceSHAs: {
      helper: process.env.TUFLOW_HOST_HELPER_SHA,
      validator: process.env.TUFLOW_HOST_VALIDATOR_SHA,
      acceptance: acceptanceSha
    },
    vsixSha256: {helper: sha256(helper), validator: sha256(validator)},
    profiles: []
  };
  let unexpectedFailures = 0;
  for (const profile of profiles) {
    const base = path.join(installDir, profile.name);
    fs.rmSync(base, {recursive: true, force: true});
    const user = path.join(base, 'user');
    const extensions = path.join(base, 'extensions');
    fs.mkdirSync(path.join(user, 'User'), {recursive: true});
    fs.mkdirSync(extensions, {recursive: true});
    fs.writeFileSync(path.join(user, 'User', 'settings.json'), JSON.stringify({
      'tuflowValidator.diagnosticLevel': 'hint',
      'tuflowValidator.enableIfStatementChecks': true,
      'tuflowValidator.enableLatestVersionChecks': true,
      'tuflowValidator.enableIfStatementFormatting': false
    }));
    const reportFile = path.join(outputDir, 'host-' + profile.name + '.json');
    fs.rmSync(reportFile, {force: true});
    const invocationId = crypto.randomUUID();
    let runError = null;
    try {
      for (const target of profile.extensions) {
        install(cli, cliPrefix, profile.name, target, user, extensions);
      }
      await runTests({
        vscodeExecutablePath: executable,
        reuseMachineInstall: true,
        extensionDevelopmentPath: driver,
        extensionTestsPath: runner,
        launchArgs: [fixtures,
          '--user-data-dir', user, '--extensions-dir', extensions,
          '--disable-gpu', '--no-sandbox'],
        extensionTestsEnv: {
          TUFLOW_ACCEPT_PROFILE: profile.name,
          TUFLOW_ACCEPT_PHASE: process.env.TUFLOW_ACCEPT_PHASE || 'integrated',
          TUFLOW_ACCEPT_REVISION: process.env.TUFLOW_HOST_HELPER_SHA || 'unrecorded',
          TUFLOW_ACCEPT_OUTPUT: reportFile,
          TUFLOW_ACCEPT_INVOCATION: invocationId,
          TUFLOW_ACCEPT_REPEATS: process.env.TUFLOW_ACCEPT_REPEATS || '30',
          TUFLOW_ACCEPT_LINES: process.env.TUFLOW_ACCEPT_LINES || '10000',
          TUFLOW_ACCEPT_SETTLE_MS: '1800',
          TUFLOW_ACCEPT_FIXTURES: fixtures
        }
      });
    } catch (error) {
      runError = String(error);
      console.log('[host ' + profile.name + '] ' + runError);
    }
    const parsedReport = fs.existsSync(reportFile) ?
      JSON.parse(fs.readFileSync(reportFile, 'utf8')) : null;
    const fresh = isFreshInvocationReport(parsedReport, invocationId);
    const report = fresh ? parsedReport : null;
    const failures = (report?.checks || [])
      .filter(item => item.status === 'fail').map(item => item.id);
    const known = [];
    const unexpected = failures;
    if (!report || unexpected.length || (runError && !failures.length)) unexpectedFailures++;
    const result = {
      profile: profile.name, reportRecorded: Boolean(report),
      reportFresh: fresh, invocationId,
      hostVscodeVersion: report?.environment?.vscodeVersion || null,
      installed: report?.extensions || null,
      failedChecks: failures, knownBaselineFailures: known,
      unexpectedFailures: unexpected,
      blocked: (report?.checks || []).filter(item => item.status === 'blocked').map(item => item.id),
      runError, reportFile: report ? path.basename(reportFile) : null
    };
    summary.profiles.push(result);
    console.log('[result] ' + JSON.stringify(result));
    // Keep existing reports intact for independent review.
    save('summary.json', summary);
  }
  save('summary.json', {...summary, unexpectedFailures});
  console.log('[acceptance] unexpected failures: ' + unexpectedFailures);
  // Every failed assertion fails integrated acceptance; there are no historical exemptions.
  if (unexpectedFailures) process.exitCode = 1;
}
main().catch(error => {
  console.error(error && error.stack || error);
  process.exitCode = 1;
});
