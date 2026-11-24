# Co-installation and language-ID migration

TUFLOW Helper and [TUFLOW Path Validator](https://github.com/Chain-Frost/tuflow_validator) can share the VS Code language ID `tuflow`. Both extensions independently contribute TUFLOW file associations. TUFLOW Helper remains usable without Path Validator installed.

## Responsibility boundaries

| Extension | Responsibility |
| --- | --- |
| [TUFLOW Helper](https://github.com/lmillard79/tuflow-vscode) | Syntax highlighting, snippets, command completion, hover descriptions, signature help and its documentation command |
| [TUFLOW Path Validator](https://marketplace.visualstudio.com/items?itemName=Chain-Frost.tuflow-path-validator) | Control-file reference diagnostics, dependency checks and optional conditional-statement formatting |
| [Open file (seito-openfile)](https://marketplace.visualstudio.com/items?itemName=Fr43nk.seito-openfile) | Opening referenced files from the editor |
| [Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens) | Displaying diagnostics produced by other extensions |

TUFLOW Helper deliberately registers **no** path-existence diagnostics, document formatter, Error Lens integration or custom open-file command. Its existing `tuflow-helper.openDocumentation` command remains registered and retains its command ID.

## Migration from earlier TUFLOW Helper versions

The language ID changed from `tuflow-helper` to `tuflow`; the extension identifier and command namespace are unchanged. Most users need no action: VS Code automatically associates supported file extensions. If you have a custom `files.associations` entry such as `"*.tcf": "tuflow-helper"`, remove it or update its language value to `"tuflow"`. Do the same for other affected patterns. Also check any language-specific settings in `"[tuflow-helper]"` blocks and change the key to `"[tuflow]"`. If you manually selected the old language mode in an open editor, reselect **TUFLOW** using **Change Language Mode** and reload the window.

The `tuflow-helper.openFileUnderCursor` command and its context-menu entry have been removed. Delete any custom keybindings referring to that command and use seito-openfile for file navigation instead.

## Extension Development Host smoke test

After `npm ci` and `npm run compile`, open this repository in VS Code and run **Run Extension** (F5); install Path Validator and, optionally, the other companions into the Extension Development Host. Run the following checks twice: once with both TUFLOW extensions enabled and once with Path Validator disabled. Reload the window between configurations.

1. Open one sample file of each overlapping type: `.tcf`, `.tgc`, `.tbc`, `.ecf`, `.trd`, `.qcf` and `.tef`. Check that **Change Language Mode** reports `TUFLOW` and `document.languageId` is `tuflow`. Other extensions such as `.trfc` and `.toc` can also be checked.
2. Use **Developer: Inspect Editor Tokens and Scopes** to verify that the Helper TextMate grammar supplies `source.tuflow` highlighting. Confirm the `Read GIS Z Shape` snippet is offered in an applicable control file.
3. In each file, request command completion, then test hover and signature help on commands supported by its command catalog. For `.trd` and `.tef`, there is no global command-completion fallback; exact-name documentation hover can still be available. TEF hover is limited to inherited TCF/ECF commands.
4. With Validator enabled, use an invalid referenced file path to confirm one set of Path Validator diagnostics and verify any enabled formatting behavior. Error Lens may display those same diagnostics inline; it does not create its own. With Validator disabled, Helper completion/highlighting must remain available, but the Validator diagnostics and formatter should be absent.
5. Check that no **Open File Under Cursor** action is contributed by TUFLOW Helper. Confirm that the unrelated **Open Documentation** command still appears and opens the official TUFLOW documentation in a browser. Test referenced-file opening with seito-openfile if installed.
6. Use **Developer: Show Running Extensions** to confirm that the intended extensions activate without errors.

The automated regression tests (`npm run test:registration` or `npm test`) check manifest IDs, overlap, activation and provider registration without requiring Validator at runtime. **They do not replace the two-configuration Extension Development Host smoke test.**

## Caveats

TUFLOW Helper covers more file extensions than Path Validator. For types supported by Helper alone, syntax/editor assistance is available but Validator-specific diagnostics may not apply. Other extensions or user-defined `files.associations` entries can override VS Code's automatic language choice. Recheck the effective language mode if assistance appears missing.
