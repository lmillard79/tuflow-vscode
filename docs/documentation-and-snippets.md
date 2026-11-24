# Official help links and audited snippets

TUFLOW: Open Documentation uses the [official TUFLOW Classic/HPC User Manual 2026.3](https://docs.tuflow.com/classic-hpc/manual/2026.3/) and opens an external browser. Its trusted appendix mapping covers .tcf, .ecf, .tgc, .tbc, .toc, .trfc, .tesf, .qcf, .tscf, .adcf and .tef. A known, audited command on the current line also resolves to its authoritative appendix. We intentionally do not create guessed URL fragments.

The edition is pinned to 2026.3. When modelling with older builds, consult the documentation for the applicable TUFLOW release; the extension does not select model versions or require a TUFLOW binary. Unknown extensions and TUFLOW FV files fall back to the Classic/HPC manual index rather than to an unsupported documentation URL.

## Snippet provenance

These templates insert partial commands, not runnable models. The paths are examples relative to the control-file location, and the user must supply real files and values. The commands below are checked against the official references:

| Prefix | File | Initial expansion | Official syntax source |
| --- | --- | --- | --- |
| `tcf-geometry` | .tcf | Geometry Control File == ../model/model.tgc | [Appendix A](https://docs.tuflow.com/classic-hpc/manual/2026.3/80-AppendicesA-TCFCommands.html) |
| `tcf-boundaries` | .tcf | BC Control File == ../model/model.tbc | [Appendix A](https://docs.tuflow.com/classic-hpc/manual/2026.3/80-AppendicesA-TCFCommands.html) |
| `tcf-end-time` | .tcf | End Time == 12 (hours) | [Appendix A](https://docs.tuflow.com/classic-hpc/manual/2026.3/80-AppendicesA-TCFCommands.html) |
| `tgc-cell-size` | .tgc | Cell Size == 10 | [Appendix C](https://docs.tuflow.com/classic-hpc/manual/2026.3/82-AppendicesC-TGCCommands.html) |
| `tgc-z-shape` | .tgc | Read GIS Z Shape == ../model/gis/2d_zsh_001.shp | [Appendix C](https://docs.tuflow.com/classic-hpc/manual/2026.3/82-AppendicesC-TGCCommands.html) |
| `tbc-database` | .tbc | BC Database == ../bc_dbase/bc_dbase.csv | [Appendix D](https://docs.tuflow.com/classic-hpc/manual/2026.3/83-AppendicesD-TBCCommands.html) |
| `ecf-network` | .ecf | Read GIS Network == ../model/gis/1d_nwk_001.shp | [Appendix B](https://docs.tuflow.com/classic-hpc/manual/2026.3/81-AppendicesB-ECFCommands.html) |
| `qcf-base-cell-size` | .qcf | Base Cell Size == 20 | [Appendix H](https://docs.tuflow.com/classic-hpc/manual/2026.3/87-AppendicesH-QCFCommands.html) |
| `trfc-interpolation` | .trfc | RF Interpolation Method == IDW (choice: IDW/POLYGON/TIN) | [Appendix F](https://docs.tuflow.com/classic-hpc/manual/2026.3/85-AppendicesF-TRFCCommands.html) |
| `tef-event` | .tef | Define Event / End Time / End Define block | [Appendix K](https://docs.tuflow.com/classic-hpc/manual/2026.3/90-AppendicesK-TEFCommands.html), [Appendix A](https://docs.tuflow.com/classic-hpc/manual/2026.3/80-AppendicesA-TCFCommands.html) |

The TEF command section explicitly permits TCF and ECF commands in event blocks. The End Time parameter is an hour value; Read GIS Z Shape expects a vector 2d_zsh layer, not a TIFF/ASC raster. The snippets do not install, open, create, or validate referenced input files.

All control-file extensions share one VS Code language ID. Type-prefixed snippet names communicate their intended file context; users must insert them in the correct file type. The curated snippet list is deliberately small; command catalogue coverage is documented separately in [the shared registry guide](command-catalogue.md).

## Verification

After compiling, run `npm run test:unit` to verify the official URL mapping, audited-command lookup, snippet prefixes, placeholder forms and expected initial expansions. Actual VS Code tabstop and choice expansion, plus optional companion-extension coexistence, are covered by [the editor smoke-test protocol](co-installation-smoke-test.md). Those manual checks are not automatically run in CI.

The old captured `doc/` snapshots are not needed: help uses `vscode.env.openExternal` with official HTTPS links. No captured manuals belong in tracked source or the VSIX. The [packaging and CI checks](DEVELOPMENT.md) enforce that boundary.
