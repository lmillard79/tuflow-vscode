# Optional extension co-installation smoke test

This is a manual VS Code testing protocol, not an automatic installation requirement. Install TUFLOW Helper from the development VSIX into a clean profile and check each case before claiming the full combination has passed.

Optional companion extensions:

- [Open file (seito-openfile)](https://marketplace.visualstudio.com/items?itemName=Fr43nk.seito-openfile) — opens existing paths under the cursor; Helper must not add a duplicate file opener.
- [TUFLOW Path Validator](https://marketplace.visualstudio.com/items?itemName=Chain-Frost.tuflow-path-validator) — validates references and conditionals and supplies diagnostics; [source repository](https://github.com/Chain-Frost/tuflow_validator).
- [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) — displays existing diagnostics inline without performing validation.

## Manual checks

| Case | Expected observation |
| --- | --- |
| Helper alone in .tcf, .tgc, .tbc | Syntax and typed snippets remain usable; no TUFLOW executable or QGIS is required |
| Help command from .tcf, .tgc, .tbc, .ecf, .qcf, .trfc and .tef | Browser opens the official appendix, not HTML source text in the editor |
| Help command without an active editor | Official manual home page opens in the browser |
| Insert `tgc-z-shape` | Read GIS Z Shape line expands and its path placeholder is editable |
| Insert `trfc-interpolation` | IDW, POLYGON and TIN choices appear in the placeholder |
| Insert `tef-event` | Three-line Define Event / End Time / End Define block appears with two tabstops |
| Enable Open file, open known existing relative path | Open file handles path navigation; no competing Helper opener is introduced |
| Enable Path Validator, open one missing and one valid reference | Only missing reference produces a Path Validator diagnostic, accounting for active conditions |
| Enable Error Lens with Path Validator warning | Diagnostic is displayed inline; Error Lens does not create a duplicate diagnostic |
| Disable each optional extension in turn | Helper highlighting, snippet expansion and online help continue to work |
| All optional extensions enabled in multi-file model | No language-ID takeover or duplicate diagnostics; report integration conflicts in [issue #1](https://github.com/Chain-Frost/tuflow-vscode/issues/1) |

Use a test model with known existing and missing paths. Record the VS Code version, installed extension versions, test results and any observed extension conflicts. This protocol defines co-installation coverage, but does not assert that a third-party integration run has already passed. All companion installs remain optional and manual.
