# TUFLOW UX acceptance fixtures

These are **editor-only inputs** for integrated acceptance. They are intentionally incomplete and must **never be submitted to a TUFLOW solver**. They contain deliberately missing files, unreal UNC paths, unexpanded macros, and examples whose engineering validity is *not* asserted. They do not contain GIS datasets or GeoPackage layers.

The authoritative test-case inventory is `matrix.json` in this directory. Every case identifies its exact source line, category, ownership and expectation. `existing-relative` only means the linked *fixture text file* exists; it does not mean the model is solvable. `missing-relative` means the input path was intentionally not created. `unknown` and `incomplete` must not automatically be treated as syntax errors by TUFLOW Helper.

For GIS selector tests, `>>` denotes a layer suffix, and `|` separates multiple paths. The Path Validator owns path diagnostics, while internal layer-existence and layer-content checks are outside supported scope. UNC paths are examples and are not expected to resolve outside a configured Windows network environment.

Open this directory as the VS Code workspace when exercising validator's `workspaceContains` activation condition. See the [acceptance runbook](../../../docs/acceptance/README.md) for the integration matrix and reproducible measurement procedure.
