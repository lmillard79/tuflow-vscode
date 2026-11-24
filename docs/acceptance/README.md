# Integrated editor acceptance

The [45 indexed editor-only fixtures](../../test/acceptance/fixtures/README.md) cover control-file language association, command editing, comments, directives, relative/missing references, nested includes and GIS selectors. They are not runnable TUFLOW models.

## Automated checks

From a fresh Helper checkout with Node 24:

```sh
npm ci
npm run compile
node test/acceptance/check-fixtures.mjs
npm run test:unit
npm run package:vsix
```

The main Extension CI runs the fixture and script-syntax checks on both Linux and Windows, and the regular unit suite includes the acceptance assertions and report-comparison tests.

The [integrated host workflow](../../.github/workflows/acceptance-host.yml) uses the exact Helper/acceptance source SHA and pinned [Path Validator source](https://github.com/Chain-Frost/tuflow_validator/tree/b8d5f9d42fe0a7f1f5e8d5337e8c9646ffdebfc5). It builds separate VSIX packages, downloads VS Code 1.147.0, runs four isolated installed-extension profiles per OS, and uploads JSON evidence with source identities, package hashes, installed versions and assertion outcomes.

| Profile | Installed extensions |
| --- | --- |
| helper-only | Helper |
| validator-only | Path Validator |
| combined | Helper and Validator |
| full | Helper, Validator, seito-openfile and Error Lens |

## Local reproduction

In a separate checkout of the pinned Validator source, run `npm ci`, `npm run compile` and `npx vsce package --no-dependencies --out validator-test.vsix`. From the Helper root, with the Validator checkout in the sibling `tuflow_validator` directory and both VSIX files built:

```sh
node test/acceptance/run-host.cjs tuflow-helper.vsix ../tuflow_validator/validator-test.vsix .
```

Prefix the command with `xvfb-run -a` on headless Linux. The runner uses disposable profiles; it does not install companions into the normal VS Code profile. Use a fresh output directory via `TUFLOW_ACCEPT_ARTIFACTS` and supply actual source SHAs in `TUFLOW_HOST_HELPER_SHA` and `TUFLOW_HOST_VALIDATOR_SHA` for attributable results. The runner independently verifies its acceptance checkout.

Optional environment settings include `TUFLOW_ACCEPT_VSCODE_VERSION`, `TUFLOW_ACCEPT_FIXTURES`, `TUFLOW_ACCEPT_PHASE`, `TUFLOW_ACCEPT_REPEATS` and `TUFLOW_ACCEPT_LINES`. Compare equivalent profile reports with `node test/acceptance/compare-reports.mjs before.json after.json`. The comparator reports deltas, not automatic performance thresholds.

## Manual checks and limits

Use the [co-installation smoke-test protocol](../co-installation-smoke-test.md) to verify real GUI highlighting, snippets, hover, formatting, documentation navigation and companion file opening. Helper owns editor assistance, Validator owns supported diagnostics/formatting, seito-openfile owns file opening and Error Lens displays existing diagnostics.

A first editor open is not a physical cold-cache measurement. Hosted fixtures do not establish real SMB navigation, internal GeoPackage layer existence or full production-model acceptance. Keep failed, blocked and unverified outcomes distinct. See [qualified evidence and limitations](EVIDENCE.md).
