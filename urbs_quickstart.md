# URBS Helper Extension Quick Start Guide

Creating an URBS-helper extension would follow a similar pattern to the TUFLOW Helper extension you've just completed. Here's what you would need to do:

## Project Structure
You would need to create a similar directory structure:
```
urbs-helper/
├── src/
│   ├── extension.ts
│   └── commands/
├── syntaxes/
│   └── urbs.tmLanguage.json
├── snippets/
│   └── urbs.json
├── images/
├── .vscode/
├── out/
├── package.json
├── README.md
├── CHANGELOG.md
├── LICENSE
└── language-configuration.json
```

## Key Components to Develop

### 1. **package.json Configuration**
- Set name to "urbs-helper"
- Set publisher to your ID "lmillard79"
- Define URBS file extensions (e.g., .dat, .ctl, .urbs)
- Configure activation events for URBS files
- Set up language contributions with unique identifiers

### 2. **Syntax Highlighting**
- Create `syntaxes/urbs.tmLanguage.json`
- Define URBS-specific keywords, commands, and syntax patterns
- Set appropriate scope names (e.g., "source.urbs")
- Configure comment patterns (typically "!" or "C" for Fortran-based URBS)

### 3. **Language Configuration**
- Create `language-configuration.json`
- Define comment symbols for URBS files
- Set up indentation rules (Fortran typically uses specific patterns)
- Configure bracket matching and auto-closing pairs

### 4. **IntelliSense Support**
- Create URBS command definitions in `src/commands/`
- Implement completion item provider in `extension.ts`
- Add hover support for command descriptions
- Include syntax and examples for each command

### 5. **Snippets**
- Create `snippets/urbs.json`
- Define code snippets for common URBS patterns
- Include parameter placeholders for quick editing

### 6. **Documentation**
- Create comprehensive README.md with URBS-specific features
- Document all supported file types
- Provide usage instructions and examples
- Include development requirements (Node.js, npm)

## Development Process
1. Clone/copy the tuflow-vscode project as a template
2. Rename all references from "tuflow" to "urbs"
3. Update file extensions to URBS-specific ones
4. Replace TUFLOW commands with URBS commands
5. Modify syntax patterns to match URBS format
6. Test locally with F5
7. Package with `npx vsce package`
8. Publish to VS Code Marketplace with `npx vsce publish`

## URBS-Specific Considerations
- URBS files are typically Fortran-based with specific formatting
- Common file extensions: .dat, .ctl, .out
- Commands often follow a pattern like "COMMAND == parameter"
- Comments usually start with "!" or "C" in column 1
- Indentation may be significant for block structures

This would be a great next project that follows the same successful pattern as the TUFLOW Helper extension.
