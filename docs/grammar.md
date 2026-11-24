# TUFLOW TextMate grammar and indentation

The grammar is deliberately **lexical**, not a TUFLOW command validator. VS Code
provides colouring; the TUFLOW Path Validator handles diagnostics and optional
whole-document formatting. This extension must not duplicate those services.

- The **header** preceding `==` receives the neutral `meta.command.header.tuflow`
  scope, including unrecognised and newer TUFLOW commands. This is not a claim
  that the command is supported, valid, or verified.
- A small, conservative set of well-established command spellings receives
  `support.function.tuflow`. Its regex is intentionally bounded: no arbitrary
  word alternation, no release filter, and no assumptions about filename
  existence or GeoPackage layers. Left-side pipe modifiers are highlighted as
  punctuation, not validated. Unrecognised modifiers remain neutral.
- `!` and `#` start comments outside quoted values (per [TUFLOW 2026.3, §4.1.1 Table 4.2](https://docs.tuflow.com/classic-hpc/manual/2026.3/04-ControlFiles-and-Inputs.html)). Both quote styles, `<<...>>`
  placeholders, `==`, `>>`, common unquoted paths, and signed/decimal/scientific
  numeric values have independent scopes. Path colouring is heuristic;
  filenames with uncommon extensions or spacing may be left neutral.
- Auto-indentation only handles `If`, `Else If`, `Else`, `End If`-style blocks.
  It does not treat `Scenario ==` / `Event ==` declarations as blocks. Only
  full-line `!` or `#` comments are continued on Enter. Indentation width and
  formatting are controlled by VS Code/user settings or Path Validator.

## Fixture tests

Run without npm installation:

```sh
node --test test/grammar.test.cjs
```

`test/fixtures/grammar-cases.json` snapshots the named scopes of representative
control-file lines. The zero-dependency probe reads the actual regexes from
`syntaxes/tuflow.tmLanguage.json` and checks lexical precedence; it is **not**
a complete TextMate engine or a substitute for Extension Development Host
checks. It translates the leading Oniguruma `(?i)` switch for Node's regex
engine; the grammar itself remains Oniguruma-compatible.

CI also installs pinned, **test-only** `vscode-textmate` and `vscode-oniguruma`
packages into an isolated directory and runs `test/textmate.check.cjs` against
all snapshot scopes using the actual VS Code tokeniser and Oniguruma WASM.
These dependencies are not added to the extension or its package lockfile. The file uses the `.check.cjs` suffix so the parent repository's generic `npm test` runner (which only auto-discovers `.test.cjs` and `.spec.cjs`) does not attempt to run this isolated-dependency suite. CI runs it explicitly instead.

To inspect regenerated snapshots locally, run
`UPDATE_GRAMMAR_SNAPSHOTS=1 node --test test/grammar.test.cjs`, then inspect
all differences before committing. Do not regenerate to make a failing test
pass without first checking the intended highlighting.

## Coordinating with the command catalogue

The integrated typed command registry and parser provide authoritative *editor* metadata. The lexical grammar remains independent; future generation may use a small deterministic list of exact canonical audited spellings. Ensure the generated list
is stable, size-limited, and never used as a semantic validator. The lexical
scopes and fixtures must remain useful for legacy and future TUFLOW commands
without requiring a version selector.

This grammar uses the stable TextMate `source.tuflow` scope and does not
hard-code the VS Code language ID. It therefore works with the interoperable
language ID `tuflow` shared with Path Validator.
