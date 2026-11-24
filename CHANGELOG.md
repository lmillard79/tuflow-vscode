# Change Log

All notable changes to the "TUFLOW" extension will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/),
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added

- Shared typed command catalogue and pure, reusable line parser with audited TCF, TGC, TBC, ECF, TRFC and QCF command metadata linked to official TUFLOW manual appendices.
- File-context-sensitive command editing, source-backed value suggestions and structured signature help.
- Conservative TextMate grammar fixtures, conditional indentation, and ten curated command snippets.
- Locked build and test tooling, Linux/Windows CI at VS Code 1.74.3 and 1.147.0, VSIX content audits, installed-extension tests and companion-extension acceptance.

### Changed

- Official online TUFLOW help replaces captured bundled manuals. The documentation command opens the pinned manual or relevant appendix in the browser.
- Shared VS Code language ID is now `tuflow` instead of `tuflow-helper`. Update custom file associations and language-specific settings as described in the [migration guide](docs/coexistence.md). The extension identity and documentation command ID are unchanged.
- Updated development dependencies and reproducible packaging; retained minimum VS Code compatibility and development/production audit gates.

### Fixed

- Multiword command hover, literal operand placeholders in documentation, whole-command completion replacement, duplicate delimiters, and argument-aware signature help.
- Suppressed unrelated command and generic value suggestions in unsupported file contexts, comments and path operands; unknown syntax is not treated as an error.
- Canonical repository links and development instructions.

### Removed

- `tuflow-helper.openFileUnderCursor` and its editor-menu action; remove custom bindings to it and use seito-openfile for navigation.
- Captured HTML manual assets and obsolete root sample files. Maintained acceptance fixtures remain in the repository.

## [0.8.2] - date not recorded

- Version indicated by the existing package manifest; historical release changes were not recorded.

## [0.8.1] - 2023-04-05

### Added

- Node.js and npm development requirements documentation
- Development commands information (compile, package, watch)

## [0.8.0] - 2023-04-05

### Changed

- Enhanced package metadata for marketplace compliance
- Improved README documentation with comprehensive usage instructions
- Updated CHANGELOG format to follow Keep a Changelog recommendations

## [0.7.0] - 2023-03-22

### Added

- TUFLOW FV file extensions
- TUFLOW 2023-03-AA release keywords

## [0.6.0] - 2020-01-15

### Added

- Additional keywords and extensions for TUFLOW Release 2020-01-AA

### Changed

- Syntax highlighting settings for "IF Scenario" and "If Event" controls

## [0.4.0] - 2019-05-10

### Added

- Initial example code completion/snippet feature

## [0.3.0] - 2019-04-20

### Added

- More syntax highlighting improvements

## [0.2.0] - 2019-03-15

### Added

- Minor improvements to syntax highlighting

## [0.1.0] - 2019-01-10

### Added

- Initial release
- Basic syntax highlighting for TUFLOW commands
- Validation of TUFLOW commands (only valid commands followed by "==" are highlighted)