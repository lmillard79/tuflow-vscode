# Shared command catalogue and TUFLOW line parser (issue #3)

This is an **editor-only** metadata source, not a control-file validator. Filesystem reads, dependency traversal and supported diagnostics are outside Helper and belong to [TUFLOW Path Validator](https://github.com/Chain-Frost/tuflow_validator) where implemented. Neither Helper nor the tested Validator supports internal GeoPackage layer-existence checking. No release/version selector is provided.

## API

- **parseTuflowLine(text, zeroBasedLineNumber?)**: pure single-line parser with nullable leftHand, delimiter, value, comment and kind fields. Source ranges are half-open UTF-16 line/character coordinates compatible with VS Code. Both unquoted `#` and `!` initiate comments (including when commenting out an entire line), while quoted markers remain content; incomplete commands and non-assignment directives are not treated as errors. Comment semantics follow [TUFLOW 2026.3, Section 4.1.1, Table 4.2](https://docs.tuflow.com/classic-hpc/manual/2026.3/04-ControlFiles-and-Inputs.html#rules-and-notation).
- **getCommandsForFile(fileNameOrExtension)**: registry entries for a recognized control-file extension; unknown contexts return an empty list.
- **lookupCommandsForFile(fileNameOrExtension, completeLineOrParsedLine)**: all matching definitions for the *complete* left-hand phrase in that file context. Ignores case, extra whitespace and parentheses layout. Supports documented optional suffix groups in order. Unknowns produce no errors.
- **getCommandsByName(name)**: returns all contextual matches, not a global arbitrary first match.
- **createCommandRegistry(definitions)**: pure registry builder for tests and catalogue extensions.

TCF and TGC use source-audited metadata from [issue #4](tcf-tgc-command-audit.md); TBC, ECF, TRFC and QCF use source-audited metadata from [issue #5](command-audit-issue-5.md). Unverified legacy descriptions and examples are **not necessarily correct**; unaudited entries retain a needs-audit status. Audited entries are checked against the 2026.3 appendices, with individually verified fields listed under verifiedFields.

The editor's exact-name hover may provide documentation in contexts without a scoped catalogue (for TEF, inherited TCF/ECF commands only); this is not including-file context resolution or a global completion fallback.

## Catalogue maintenance guide

1. Consult the [official TUFLOW Classic/HPC manual](https://docs.tuflow.com/classic-hpc/manual/2026.3/) at each entry's provenance URL. Confirm its exact name, allowed file contexts, full left-hand syntax, suffixes and right-hand parameters. Some inherited records appear approximate or in the wrong control-file category.
2. Preserve distinct definitions for identical names in different categories. ECF syntax in TCF, TEF event files and TRD/ERD include files require their including-file context; do not guess from the extension.
3. Only supply allowedValues where an authoritative enumeration is given. Commands accepting numbers *or* named options require a mixed value kind. A suggested keyword is not proof that numbers are invalid.
4. Populate suffixGroups only for documented optional left-side modifiers in the documented order. Never derive them from right-hand parameter placeholders.
5. Add safeExamples only when an official example or syntax confirms them. Do not invent paths, layer names, numerical values or version behaviour. Existing legacy examples need separate audit and may require correction or retirement.
6. Mark auditStatus as verified only after checking the entire entry. A single field-level override does not certify an inherited description or example.
7. Reconcile provider and grammar coverage against the registry without introducing strict unknown-command rejection or Path Validator diagnostics.

Initial field-level checks cover TGC Read GIS Z Shape modifiers, ECF Apply All Inverts / CSV Time, TRFC grid format/interpolation/size, and QCF common keywords. Their inherited legacy descriptions are not certified.

## Tests without VS Code

Run npm ci, then npm run compile, followed by:

    node --test out/test/commandCatalogue.test.js

The tests compile from src/test/commandCatalogue.test.ts. The common unit-test runner executes the compiled tests in Extension CI.
