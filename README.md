# TUFLOW VS Code Extension

This extension provides syntax highlighting and IntelliSense support for TUFLOW files in Visual Studio Code.

TUFLOW is a powerful hydraulic modelling software used for flood simulation. This extension helps improve productivity when working with TUFLOW control files by providing syntax highlighting, command validation, and intelligent code completion.

## Features

- **Syntax Highlighting**: Comprehensive syntax highlighting for all TUFLOW file types
- **Command Validation**: Only valid TUFLOW commands followed by `==` will be highlighted
- **IntelliSense**: Code completion for TUFLOW commands with detailed descriptions
- **Hover Support**: View command descriptions, syntax, and examples by hovering over commands
- **Signature Help**: Get parameter information when typing TUFLOW commands
- **Snippets**: Code snippets for common TUFLOW commands

## Supported File Types

- `.tcf` - TUFLOW Control Files
- `.ecf` - ESTRY Control Files
- `.tbc` - TUFLOW Boundary Condition Files
- `.tef` - TUFLOW Event Files
- `.tgc` - TUFLOW Geometry Control Files
- `.tmf` - TUFLOW Material Files
- `.ebc` - ESTRY Boundary Condition Files
- `.egf` - ESTRY Geometry Files
- `.rdf` - RAINFACE Definition Files
- `.trd` - TUFLOW Read Data Files
- `.erd` - ESTRY Read Data Files
- `.elf` - TUFLOW Log Filter Files
- `.tlf` - TUFLOW Log Filter Files
- `.trfcf` - TUFLOW Read File Check Files
- `.trfc` - TUFLOW Read File Check Files
- `.toc` - TUFLOW Output Control Files
- `.qcf` - Query Control Files
- `.fvc` - Flexible Volume Control Files
- `.fvm` - Flexible Volume Mesh Files
- `.fvsed` - Flexible Volume Sediment Files
- `.fvptm` - Flexible Volume Particle Tracking Module Files
- `.mcf` - Materials Control Files
- `.fvwq` - Flexible Volume Water Quality Files

## Requirements

- VS Code version 1.74.0 or higher

## Installation

1. Install from the VS Code Marketplace:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "TUFLOW"
   - Click Install

2. Manual installation:
   - Download the `.vsix` file from releases
   - In VS Code, go to Extensions
   - Click the "..." menu and select "Install from VSIX"
   - Select the downloaded file

## Usage

### Syntax Highlighting

The extension automatically provides syntax highlighting for all supported TUFLOW file types. Valid commands must be followed by `==` to be properly highlighted.

### IntelliSense

As you type in TUFLOW files, the extension will provide code completion suggestions for commands. Simply start typing a command name and suggestions will appear.

Example:
```tuflow
Read GIS Z Shape ==
Set Mat ==
Define Event ==
```

### Snippets

Type the following prefixes to trigger snippets:
- `Read GIS Z Shape` - Inserts the command with parameter options

## Known Issues

- Currently, optional additional command keywords (such as the "MAX" in "Read GIS Z Shape MAX") are not supported by the syntax highlighting.

## Requirements

- [Node.js](https://nodejs.org/) version 14 or higher
- npm (comes with Node.js)

## Development

To compile the extension:
```bash
npm run compile
```

To package the extension:
```bash
npm run package
npx vsce package -o tuflow-helper.vsix
```

To watch for changes and compile automatically:
```bash
npm run watch
```

## Release Notes

### 0.8.1

- Added Node.js and npm development requirements documentation
- Added development commands information (compile, package, watch)

### 0.8.0

- Enhanced package metadata for marketplace compliance
- Improved README documentation
- Added comprehensive CHANGELOG

### 0.7.0

- Added TUFLOW FV file extensions
- Added TUFLOW 2023-03-AA release keywords

### 0.6.0

- Added additional keywords and extensions for TUFLOW Release 2020-01-AA
- Changed some syntax highlighting settings so "IF Scenario" and "If Event" controls were single colour

### 0.4.0

- Testing of initial example code completion/snippet feature. Try typing "Read GIS Z Shape".

### 0.3.0

- More syntax highlighting improvements.

### 0.2.0

- Minor improvements to syntax highlighting.

### 0.1.0

- Initial release of the TUFLOW Visual Studio Code extension.


