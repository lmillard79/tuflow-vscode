# Issue #20 — development dependency and VS Code compatibility qualification

## Scope and policy

- Keep `engines.vscode: ^1.74.0`. The TUFLOW Helper extension host must work under both VS Code **1.74.3** (minimum-family representative) and **1.147.0** (current stable, 23 November 2026).
- Use **Node.js 24** for npm, compilation, linting, packaging and primary CI. The Node version installed by `actions/setup-node` is **not** the Node runtime inside either VS Code extension host.
- Keep `@types/vscode` **exactly 1.74.0** and `@types/node` **16.x**: this prevents development-time types from silently blessing APIs unavailable on the minimum supported extension host. Keep TypeScript output at ES2020/CommonJS and do not change extension activation or package identity.
- The integrated changes update development/test-only dependencies. There are no production `dependencies` in `package.json`, and the VSIX verification script excludes `node_modules`, source and test assets. **This does not mean the dev-toolchain vulnerabilities are irrelevant to CI or packaging security.**
- The qualified versions are TypeScript 5.9.3, the paired TypeScript ESLint packages 8.73.0, ESLint 9.39.2 with its flat configuration, and `@vscode/vsce` 4.1.1. The existing `@vscode/test-cli` 0.0.15 and `@vscode/test-electron` 3.1.0 are already current and are retained.
- Retain four VS Code test configurations, selecting the host version through `TUFLOW_TEST_VSCODE_VERSION`; run both pinned versions on Linux and Windows including installed-VSIX checks.

## Vulnerability audit and acceptance evidence

The prior locked Node 22 CI run recorded **14 advisories** (1 low, 7 moderate, 6 high) in the development toolchain. That historical count is not a claim about the updated graph.

After regenerating `package-lock.json`, run:

```sh
npm ci
npm audit --json > npm-audit-issue20.json
npm audit --omit=dev --json
npm run compile
npm run lint
npm run test:unit
npm run test:fail-closed
npm run package:vsix
```

The audit command can exit nonzero when advisories are found. Record exact vulnerable packages, direct/transitive introduction paths, production/development exposure, patched ranges and justified exceptions; do not blanket-dismiss all advisories or run `npm audit fix --force`.

Final acceptance requires an npm-generated consistent lockfile, all source/installed-VSIX tests passing in both extension hosts on both operating systems, complete current audit results and independent Codex review. The review should include regressions from the ESLint migration and older VS Code hosts. **Do not merge until those gates pass.**

No tag, Marketplace publisher change, release, publication, or Path Validator modification is authorised.

## Executed npm registry audit — 23 November 2026

- Bootstrap: GitHub Actions Node **24.22.3**, npm **11.19.1**; lockfile regenerated with `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` and committed on the issue branch. Full raw `npm audit --json` is retained as the workflow artifact (run 45187500025).
- Initial regenerated graph: **10 advisories (2 high, 7 moderate, 1 low)**. The two high entries were the outdated `brace-expansion` 1.1.12 and `serialize-javascript` 6.0.2.
- The deliberately narrow overrides apply `brace-expansion` **1.1.22** only beneath `minimatch@^3.1.2`, and `serialize-javascript` **7.1.4** only beneath `mocha@^11.7.6`. The latter crosses a dependency major version: source and installed-VSIX Extension Host tests are mandatory to qualify this change.
- Rebuilt and re-audited dependency graph: **0 critical, 0 high, 7 moderate, 1 low (8 total)**. Neither override is carried in the extension's distributed runtime dependencies. The npm lockfile contains 390 package records.
- Remaining advisory roots: `@vscode/test-cli` (moderate), `@vscode/vsce` (moderate), `c8` (moderate), `glob` (moderate), `minimatch` (moderate), `mocha` (moderate), `test-exclude` (moderate), `diff` (low). All occur in development/testing/packaging tooling; none is a direct runtime dependency of the extension.
- `@vscode/test-cli` **0.0.15** and `@vscode/vsce` **4.1.1** are current packages, and the audit currently reports **no nonbreaking fix** for their moderate transitive findings. Downgrading vsce to 3.9.1, as npm audit suggests, would revert packaging upgrades and is not accepted as a verified security improvement.
- Mitigation: no untrusted external files are processed by production `node_modules` because there are no packaged runtime npm dependencies; test fixtures and CI source are controlled. CI still uses these toolchains, so avoid untrusted workflow inputs, keep the residual list visible, and recheck after future upstream releases. The permanent CI security gate `npm audit --audit-level=high` fails future high/critical findings.
- Do **not** treat the moderate findings as remediated. They are residual reviewed toolchain exposure; revisit upstream fixes through [Chain-Frost/tuflow-vscode#31](https://github.com/Chain-Frost/tuflow-vscode/issues/31); the original fork issue #20 is closed.

The historical qualification is complete; each new contribution must re-run the applicable audit and compatibility checks. See [the evidence index](acceptance/EVIDENCE.md).
