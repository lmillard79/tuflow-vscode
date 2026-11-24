# Issue #5 — control-file command catalogue audit

Reviewed: 2026-11-22. Reference baseline: the **official TUFLOW Classic/HPC 2026.3 manual**. This is an editor suggestion audit, **not** a model-syntax validator, version-selection feature, or promise of a complete language definition.

| Catalogue | Previously suggested | Audited suggestions | Disposition | Source |
| --- | ---: | ---: | --- | --- |
| `.tbc` | 28 | 19 | Removed 28 unsupported `Define ...` and `Set ...` suggestions; replaced with the documented Appendix D command set | [Appendix D](https://docs.tuflow.com/classic-hpc/manual/2026.3/83-AppendicesD-TBCCommands.html) |
| `.ecf` | 10 | 30 | Verified ten original names against Appendix B; corrected incomplete value metadata and added twenty documented, frequently used entries; **partial** catalogue | [Appendix B](https://docs.tuflow.com/classic-hpc/manual/2026.3/81-AppendicesB-ECFCommands.html) |
| `.trfc` | 14 | 16 | Verified entries, added `If Event` and `If Scenario`; flagged the two maximum-point commands as legacy since 2026.0 | [Appendix F](https://docs.tuflow.com/classic-hpc/manual/2026.3/85-AppendicesF-TRFCCommands.html) |
| `.qcf` | 6 | 8 | Verified entries, added `If Event` and `If Scenario`; corrected context-dependent default note for `Model Origin and Extent` | [Appendix H](https://docs.tuflow.com/classic-hpc/manual/2026.3/87-AppendicesH-QCFCommands.html) |

Each active scoped command has an official appendix URL, a checked canonical command name and `==` syntax, an audited value kind, and **only explicitly documented literal choices**. Names repeated in two file types retain two file-context definitions. New value completions do not imply that numerical ranges, data paths, or unknown future syntax are invalid.

## Removed from TBC suggestions (no evidence in the official TBC appendix)

- `Define Event`, `Define Source`, `Define BC`, `Define HT`, `Define WL`, `Define Q`, `Define RF`, `Define Na`, `Define QH`
- `Set Database`, `Set Time Series`, `Set Rating`, `Set Boundary`, `Set Inflow`, `Set Outflow`, `Set Wall`, `Set Weir`, `Set Culvert`, `Set Bridge`, `Set Pump`, `Set Gate`, `Set Orifice`, `Set Time`, `Set Units`, `Set Factor`, `Set Offset`, `Set Lag`, `Set Interpolate`

These names are **not** classified as invalid syntax; the extension simply stops presenting them as verified TBC commands.

## Verified non-enumerated inputs and legacy records

- File inputs are only advertised for commands such as `BC Database`, `Read GIS BC`, `Read GIS Network` and `Read GIS RF Point`, with no path discovery or existence testing.
- `Read GIS SA` has documented left-side modifiers. The registry supports the common spatial and special-option groups, but is not a strict grammar for every possible combination.
- `RF Grid Origin`, `RF Grid Size (N,M)` and `RF Grid Size (X,Y)` have explicitly documented comma-separated numeric pairs.
- `BC Event Name`, `BC Event Text` and `Apply All Inverts` are documented legacy commands; their presence in the catalogue is **not** a recommendation to use them for new models.
- `Maximum Hyetograph Points` and `Maximum RF Locations` are retained for older simulations. TUFLOW 2026.0 and later ignore these limits and issue CHECK 2624.

## Registered extensions versus audited catalogue coverage

| Mode | Extensions | Behaviour |
| --- | --- | --- |
| Audited by this issue | `.tbc`, `.ecf`, `.trfc`, `.qcf` | Context-specific, source-linked command suggestions |
| Separate [TCF/TGC audit](tcf-tgc-command-audit.md) | `.tcf`, `.tgc` | Context-specific audited entries; not exhaustive |
| Syntax-only (no command catalogue) | `.tef`, `.tmf`, `.ebc`, `.egf`, `.rdf`, `.trd`, `.erd`, `.elf`, `.tlf`, `.trfcf`, `.toc`, `.fvc`, `.fvm`, `.fvsed`, `.fvptm`, `.mcf`, `.fvwq` | Syntax highlighting and applicable snippets; **no global/unrelated command completions**. Exact-name hover may still provide documentation |

Having no scoped command catalogue is not evidence that a file has no valid commands. For hover, TEF permits inherited TCF/ECF matches; other unscoped contexts can show exact-name help without inferring the including-file context. Any expansion requires a separate official-documentation audit and tests.

## Maintainer notes

- Command metadata is stored in the file-specific arrays using the shared source-aware adapter `src/commands/audited.ts`; the #3 registry maps these entries into typed `CommandDefinition` records. Values and examples not verified by the official source must not be inferred.
- The editor services use `getCommandsForFile`, `lookupCommandsForFile` and `parseTuflowLine` to provide editor assistance. It must never fall back to an `allTuflowCommands` union for unrecognised categories.
- Out of scope: validation of arbitrary model syntax, file existence, model execution, boundary parsing, TUFLOW release-specific command filtering and QGIS integration.
