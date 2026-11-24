# Development, CI and local VSIX packaging

This repository builds the TUFLOW Helper VS Code extension. The project does not
require a TUFLOW executable or model installation for its test suite.

## Requirements

- Node.js 24 and its npm (the pinned CI development toolchain)
- Network access for `npm ci`, the pinned CLI tools and the VS Code test download
- VS Code 1.147.0 and minimum-family 1.74.3 are tested in CI; the Extension Host runner downloads the selected version when required
- Headless Linux: `xvfb-run` for Extension Host tests

## From a fresh clone

```sh
npm ci
npm run compile
npm run lint
npm test
npm run package:vsix
```

`npm test` compiles, lints, runs Node's built-in pure-logic tests and launches a
real VS Code Extension Host for smoke tests. On headless Linux:

```sh
xvfb-run -a npm test
```

To run suites independently, use `npm run test:unit` or
`npm run test:extension`. The unit runner discovers Node pure-logic tests in
`test/` (except `test/extension/` and fixtures) and compiled `out/test/`.
This includes tests added by parallel feature workstreams without listing files
in the package scripts. The Extension Host tests cover activation, command
registration, language associations, completion and contributed resources.
The tests do not invoke TUFLOW.

## Packaging and installation

`npm run package:vsix` compiles the extension and produces
`tuflow-helper.vsix`; it then inspects the ZIP archive's central directory,
reads the packaged manifest and verifies the compiled runtime, language
configuration, grammar, snippets, icon and documentation command runtime are present.
It rejects test sources, build maps and unrelated development assets, and
reports the VSIX size. A separate `npm run test:vsix` installs that VSIX into
the VS Code test profile and repeats the Extension Host tests against the
installed package rather than the development checkout.

Official online help replaces the captured `doc/` manuals. The VSIX checker requires the documentation runtime and rejects captured documentation, development assets and `node_modules`.

To manually verify the installed package:

1. Open a clean VS Code profile or an Extension Development Host.
2. Run **Extensions: Install from VSIX...** and select `tuflow-helper.vsix`.
3. Open a `.tcf`, `.qcf` and `.toc` file; confirm the **TUFLOW** language.
4. Type `Cell` in a `.tcf`; confirm a **Cell Size** completion is offered.
5. Inspect the extension's commands and verify **Open Documentation** is available.

VS Code testing and packaging tools are pinned as development dependencies
in `package.json` and resolved from the committed `package-lock.json`.
All local and CI commands use `npm ci` for reproducibility.

### Failure-propagation verification

`npm run test:fail-closed` temporarily adds a deliberately invalid TypeScript
source and a deliberately failing Node unit test. It confirms that the normal
`npm run compile` and `npm run test:unit` commands return failure and report
the injected error. Temporary source, test and compiled files are removed in
`finally` blocks. CI runs this verification on Linux and Windows before the
normal full test suite; a failure in detection or cleanup fails the job.

## CI

Three workflows cover the maintained upstream checks:

- [Extension CI](../.github/workflows/ci.yml): Ubuntu and Windows × VS Code 1.74.3 and 1.147.0, locked install, audits, compile/lint, failure propagation, all unit tests (including catalogue, parser, grammar, language registration and acceptance assertions), real Extension Host tests, VSIX audit and installed-VSIX tests. Fixture integrity and script syntax run once per OS in the 1.147.0 jobs. Ubuntu retains its VSIX for manual installation.
- [Grammar and installed coexistence](../.github/workflows/grammar.yml): actual TextMate/Oniguruma tokenisation, exact-source VSIX inspection and the three isolated installed Helper/Validator profiles on both OSs.
- [Integrated host acceptance](../.github/workflows/acceptance-host.yml): four installed-extension profiles per OS, using source-built Helper and a pinned Validator. See the [acceptance runbook](acceptance/README.md).

The first two workflows run on PRs and pushes to `master`; integrated host acceptance runs on PRs and by manual dispatch. Failed assertions fail CI. Historical workstation-specific drivers and their Python workflow are retained in the fork, not required for upstream CI.

**Packaging is not publishing.** This workflow does not push tags, merge code,
release artifacts, or publish to the VS Code Marketplace or Open VSX.
