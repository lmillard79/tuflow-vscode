# TCF and TGC command catalogue audit (issue #4)

This audit covers TCF and TGC **editor suggestions only**. It does not validate model files or reject unknown commands. TUFLOW Path Validator remains responsible for file/dependency checks. No release selector, publishing or merge is in scope.

## Official sources and verification strategy

- [TCF Appendix A, TUFLOW Classic/HPC 2026.3](https://docs.tuflow.com/classic-hpc/manual/2026.3/80-AppendicesA-TCFCommands.html)
- [TGC Appendix C, TUFLOW Classic/HPC 2026.3](https://docs.tuflow.com/classic-hpc/manual/2026.3/82-AppendicesC-TGCCommands.html)
- [TBC Appendix D, for file context distinctions](https://docs.tuflow.com/classic-hpc/manual/2026.3/83-AppendicesD-TBCCommands.html)

Existing names were compared with the corresponding appendix, syntax and documented options. Active entries use the shared Agent C command schema with `provenance.auditStatus = verified`, command-specific section hints, a source URL, contextual category, value kind, enumerations where applicable, and verified syntactic example templates.

This is a **release-specific audit of 2026.3**, not a claim that commands absent from this release are universally invalid. Older / differently contextualized commands remain permissible text; quarantining means the extension will not recommend them as authoritative.

## Original catalogue inventory

Original: **19 TCF** and **32 TGC** entries. Current suggestions: **39 TCF** and **31 TGC** definitions (with optional suffix groups). Some verified entries are new; unsupported and legacy entries are quarantined.

| Original name | Context | Status in new autocomplete | Audit disposition |
| --- | --- | --- | --- |
| `Read GIS` | TCF | Not suggested | Generic suggestion was overbroad; use context-specific documented Read GIS commands. |
| `Write GIS` | TCF | Not suggested | Generic Write GIS command unverified in TCF; map outputs use documented Map Output commands. |
| `Cell Size` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `Set Code` | TCF | Not suggested | Documented TGC cell code, not the TCF solver selection command. |
| `Start Time` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `End Time` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `Timestep` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `Output Interval` | TCF | Not suggested | Legacy / ambiguous; use the documented Time Series Output Interval. |
| `Map Output Interval` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `Write Check Files` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `Write Results` | TCF | Not suggested | Unverified generic command; Map Output Data Types / Map Output Format cover outputs. |
| `BC Event` | TCF | Not suggested | Unverified spelling; documented TCF commands include BC Event Source and BC Event Name. |
| `BC Database` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `Define Source` | TCF | Not suggested | No matching documented TCF command in 2026.3; leave existing model files alone. |
| `Set IWL` | TCF | Verified | Documented in Appendix A; spelling, context and examples corrected. |
| `Set IWC` | TCF | Not suggested | No matching documented TCF command in 2026.3. |
| `Set Mat` | TCF | Not suggested | Documented TGC material ID command; material roughness uses Read Materials File. |
| `Set 2D Domain` | TCF | Not suggested | Unverified spelling; TCF has Start 2D Domain / End 2D Domain. |
| `Set 1D Domain` | TCF | Not suggested | Unverified spelling; TCF has Start 1D Domain / End 1D Domain. |
| `Read GIS Z Shape` | TGC | Verified | Documented in Appendix C; spelling, context and examples corrected. |
| `Read GIS Z Line` | TGC | Not suggested | Legacy command; supported for older models but superseded by Read GIS Z Shape. |
| `Read GIS Z Point` | TGC | Not suggested | No matching documented TGC command; geometry Zpts use Read GIS Zpts or Read GIS Z Shape. |
| `Read GIS Mat` | TGC | Verified | Documented in Appendix C; spelling, context and examples corrected. |
| `Read GIS BC` | TGC | Not suggested | Boundary locations are read in TBC, not TGC. |
| `Read GIS HX` | TGC | Not suggested | 1D/2D boundary locations belong in TBC, not TGC. |
| `Read GIS SX` | TGC | Not suggested | 1D/2D boundary locations belong in TBC, not TGC. |
| `Read GIS SA` | TGC | Not suggested | Source-area boundaries belong in TBC, not TGC. |
| `Read GIS Q` | TGC | Not suggested | No matching documented TGC command; boundary inputs are not TGC. |
| `Read GIS HT` | TGC | Not suggested | No matching documented TGC command. |
| `Read GIS WL` | TGC | Not suggested | No matching documented TGC command. |
| `Read GIS Node` | TGC | Not suggested | 1D node network commands are not TGC commands. |
| `Read GIS Channel` | TGC | Not suggested | 1D network commands are not TGC commands. |
| `Read GIS Pipe` | TGC | Not suggested | 1D network commands are not TGC commands. |
| `Set Z Grid` | TGC | Not suggested | No matching documented TGC command. |
| `Set Z Shape` | TGC | Not suggested | No matching documented TGC command. |
| `Set Z Line` | TGC | Not suggested | No matching documented TGC command. |
| `Set Z Point` | TGC | Not suggested | Documented spelling is Set Zpt. |
| `Set Mat` | TGC | Verified | Documented in Appendix C; spelling, context and examples corrected. |
| `Set BC` | TGC | Not suggested | No matching documented TGC command. |
| `Set HX` | TGC | Not suggested | No matching documented TGC command. |
| `Set SX` | TGC | Not suggested | No matching documented TGC command. |
| `Set SA` | TGC | Not suggested | No matching documented TGC command. |
| `Set Q` | TGC | Not suggested | No matching documented TGC command. |
| `Set HT` | TGC | Not suggested | No matching documented TGC command. |
| `Set WL` | TGC | Not suggested | No matching documented TGC command. |
| `Set Node` | TGC | Not suggested | Not a documented TGC command. |
| `Set Channel` | TGC | Not suggested | Not a documented TGC command. |
| `Set Pipe` | TGC | Not suggested | Not a documented TGC command. |
| `Set Grid` | TGC | Not suggested | Use Cell Size, Grid Size and Origin instead. |
| `Set Origin` | TGC | Not suggested | Documented spelling is Origin. |
| `Set Extent` | TGC | Not suggested | Use Grid Size and Origin or Read GIS Location. |

## Corrections made

- Time commands `Start Time` and `End Time` take numerical **simulation hours** (including fractional/negative hours), not `HH:MM:SS`. Output intervals and timesteps are **seconds**.
- `Read GIS Z Shape` uses **vector** 2d_zsh GIS features; raster TIF/ASC elevations use `Read Grid Zpts`. Documented left-hand modifiers (`RIDGE`, `GULLY`, `ADD`, `MAX`, `MIN`, `XF ...`) are represented as optional registry suffix groups rather than duplicate commands. Check-file INCLUDE/EXCLUDE variants are kept separate because their operand type differs from the base command.
- `Read GIS Layered FC Shape` uses 2d_lfcsh layers, not the older 2d_fcsh layer.
- `Set Mat == 1` in TGC assigns a material ID; roughness is defined using the separate TCF `Read Materials File` command.
- `Solution Scheme == HPC` is the TCF solver selector; TGC `Set Code` assigns cell codes.
- The TCF boundary database is a `.csv`, not a TBC/TMF control file.
- TBC boundary and 1D network entries incorrectly listed in TGC are not suggested; the [other control-file audit](command-audit-issue-5.md) covers those contexts.
- `Write Check Files == <file_prefix>` sets an output folder or check-file prefix. The documented `Write Check Files INCLUDE/EXCLUDE == <prefix_list>` forms instead take space-delimited check-layer prefixes. They are separate audited catalogue entries with `token-list` metadata, preventing incorrect file-path suggestions. `Write Check Files ALL/NONE` and `Output Files ALL/NONE` are documented commands **without `==`**; the current provider always inserts ` == `, so these standalone commands are not added as broken completions. Provider improvements belong to a separate issue.
- Both original entries and new suggestions are covered in the table above. New suggestions also carry the manual version and source URL in their metadata.

## Suggested command example policy

Examples are illustrative **syntax templates** (with placeholder file names and non-universal numerical values), not prevalidated model data. Users must supply appropriate geometry, schemas, projection and physically appropriate values. The test suite checks every suggested example resolves to exactly one command, and rejects known misleading raster/time examples.

## Testing and dependency

Run `npm ci`, `npm run compile`, then `node --test out/test/commandCatalogue.test.js`. Pure Node tests require no VS Code Extension Host. The integrated shared registry and parser are exercised by the maintained catalogue and editor-service tests.

### Pending follow-up

A broader historical-release audit (including legacy aliases and platform/version-specific syntax) is separate; no version picker or unknown-command diagnostics are planned here.
