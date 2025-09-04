"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const commands_1 = require("./commands");
const path = require("path");
function activate(context) {
    console.log('TUFLOW extension activated');
    // Register completion provider for TUFLOW commands
    const provider = vscode.languages.registerCompletionItemProvider('tuflow-helper', {
        provideCompletionItems(document, position, token, context) {
            const completionItems = [];
            // Get current line text
            const lineText = document.lineAt(position).text;
            const textBeforeCursor = lineText.substring(0, position.character);
            // Check if we're providing parameter suggestions after '=='
            const hasCommandPrefix = textBeforeCursor.includes('==');
            const commandMatch = textBeforeCursor.match(/^\s*([A-Za-z\s]+?)(?:\s*==\s*)?$/);
            // Get file extension to filter commands
            const fileExtension = path.extname(document.fileName).toLowerCase();
            if (!hasCommandPrefix) {
                // Add command completions based on file extension
                let filteredCommands = [];
                switch (fileExtension) {
                    case '.tcf':
                        filteredCommands = commands_1.tcfCommands;
                        break;
                    case '.tgc':
                        filteredCommands = commands_1.tgcCommands;
                        break;
                    case '.tbc':
                        filteredCommands = commands_1.tbcCommands;
                        break;
                    case '.ecf':
                        filteredCommands = commands_1.ecfCommands;
                        break;
                    case '.trfc':
                        filteredCommands = commands_1.trfcCommands;
                        break;
                    case '.qcf':
                        filteredCommands = commands_1.qcfCommands;
                        break;
                    default:
                        filteredCommands = commands_1.allTuflowCommands;
                }
                filteredCommands.forEach(cmd => {
                    const item = new vscode.CompletionItem(cmd.name, vscode.CompletionItemKind.Keyword);
                    item.detail = cmd.description;
                    let documentation = `**${cmd.name}**\n\n${cmd.description}`;
                    if (cmd.syntax) {
                        documentation += `\n\n**Syntax:** ${cmd.syntax}`;
                    }
                    if (cmd.parameters && cmd.parameters.length > 0) {
                        documentation += `\n\n**Parameters:** ${cmd.parameters.join(', ')}`;
                    }
                    if (cmd.examples && cmd.examples.length > 0) {
                        documentation += `\n\n**Examples:**\n${cmd.examples.map(ex => `- ${ex}`).join('\n')}`;
                    }
                    if (cmd.notes) {
                        documentation += `\n\n**Notes:** ${cmd.notes}`;
                    }
                    item.documentation = new vscode.MarkdownString(documentation);
                    item.insertText = cmd.name + ' == ';
                    completionItems.push(item);
                });
            }
            else {
                // Add parameter and file suggestions
                const fileItem = new vscode.CompletionItem('file path', vscode.CompletionItemKind.File);
                fileItem.insertText = new vscode.SnippetString('${1:filename}');
                completionItems.push(fileItem);
                // Add common parameter values
                const commonParams = [
                    'ALL', 'NONE', 'AUTO', 'MANUAL', 'ON', 'OFF',
                    'TRUE', 'FALSE', 'YES', 'NO', '0', '1'
                ];
                commonParams.forEach(param => {
                    const paramItem = new vscode.CompletionItem(param, vscode.CompletionItemKind.Value);
                    paramItem.insertText = param;
                    completionItems.push(paramItem);
                });
            }
            return completionItems;
        }
    }, ' ' // Trigger on space
    );
    // Register hover provider for TUFLOW commands
    const hoverProvider = vscode.languages.registerHoverProvider('tuflow-helper', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) {
                return;
            }
            const word = document.getText(range);
            const command = commands_1.allTuflowCommands.find(cmd => cmd.name.toLowerCase() === word.toLowerCase());
            if (command) {
                const markdown = new vscode.MarkdownString();
                if (command.syntax) {
                    markdown.appendCodeblock(command.syntax, 'tuflow');
                }
                let content = `**${command.name}**\n\n${command.description}`;
                if (command.parameters && command.parameters.length > 0) {
                    content += `\n\n**Parameters:** ${command.parameters.join(', ')}`;
                }
                if (command.examples && command.examples.length > 0) {
                    content += `\n\n**Examples:**\n${command.examples.map(ex => `- ${ex}`).join('\n')}`;
                }
                if (command.notes) {
                    content += `\n\n**Notes:** ${command.notes}`;
                }
                markdown.appendMarkdown(content);
                return new vscode.Hover(markdown);
            }
        }
    });
    // Register signature help provider
    const signatureProvider = vscode.languages.registerSignatureHelpProvider('tuflow-helper', {
        provideSignatureHelp(document, position, token, context) {
            const lineText = document.lineAt(position).text;
            const textBeforeCursor = lineText.substring(0, position.character);
            // Get file extension to filter commands
            const fileExtension = path.extname(document.fileName).toLowerCase();
            // Match command names with spaces
            const commandMatch = textBeforeCursor.match(/^\s*([A-Za-z0-9_\s]+?)(?:\s*==\s*)?$/);
            if (commandMatch) {
                const commandName = commandMatch[1].trim();
                // Find command by name, considering file extension
                let command;
                switch (fileExtension) {
                    case '.tcf':
                        command = commands_1.tcfCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
                        break;
                    case '.tgc':
                        command = commands_1.tgcCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
                        break;
                    case '.tbc':
                        command = commands_1.tbcCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
                        break;
                    case '.ecf':
                        command = commands_1.ecfCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
                        break;
                    case '.trfc':
                        command = commands_1.trfcCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
                        break;
                    case '.qcf':
                        command = commands_1.qcfCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
                        break;
                    default:
                        command = commands_1.allTuflowCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
                }
                if (command && command.parameters && command.parameters.length > 0) {
                    const signature = new vscode.SignatureInformation(`${command.name} == ${command.parameters.join(' ')}`, command.description);
                    signature.parameters = command.parameters.map(param => new vscode.ParameterInformation(param, `Parameter: ${param}`));
                    const help = new vscode.SignatureHelp();
                    help.signatures = [signature];
                    help.activeSignature = 0;
                    help.activeParameter = 0;
                    return help;
                }
            }
            return null;
        }
    }, ' ', '(', ',');
    // Register command to open file under cursor
    const openFileCommand = vscode.commands.registerCommand('tuflow-helper.openFileUnderCursor', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        const text = document.getText(selection);
        if (text) {
            // Try to extract a file path from the selected text
            const filePathMatch = text.match(/(?:'|"|\s|^)([\w\\/\-\.]+\.[\w]+)(?:'|"|\s|$)/);
            if (filePathMatch) {
                const filePath = filePathMatch[1];
                vscode.window.showInformationMessage(`Opening file: ${filePath}`);
                // Try to open the file
                vscode.workspace.openTextDocument(filePath).then(doc => {
                    vscode.window.showTextDocument(doc);
                }, error => {
                    // If file doesn't exist, show error message
                    vscode.window.showErrorMessage(`Could not open file: ${filePath}. Error: ${error.message}`);
                });
            }
            else {
                vscode.window.showErrorMessage('No valid file path found in selection or under cursor');
            }
        }
        else {
            // If no text is selected, try to get file path under cursor
            const position = editor.selection.active;
            const lineText = document.lineAt(position.line).text;
            // Extract word under cursor
            const wordRange = document.getWordRangeAtPosition(position);
            if (wordRange) {
                const word = document.getText(wordRange);
                // Try to open as file
                vscode.workspace.openTextDocument(word).then(doc => {
                    vscode.window.showTextDocument(doc);
                }, error => {
                    vscode.window.showErrorMessage(`Could not open file: ${word}. Error: ${error.message}`);
                });
            }
            else {
                vscode.window.showErrorMessage('No text selected or under cursor');
            }
        }
    });
    // Register command to open documentation based on file extension
    const openDocumentationCommand = vscode.commands.registerCommand('tuflow-helper.openDocumentation', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const fileExtension = path.extname(document.fileName).toLowerCase();
        // Mapping of file extensions to documentation files
        const documentationMap = {
            '.tcf': 'doc/Appendix A TCF Commands _ TUFLOW Classic_HPC User Manual 2023-03.html',
            '.tgc': 'doc/Appendix C TGC Commands _ TUFLOW Classic_HPC User Manual 2023-03.html',
            '.tbc': 'doc/Appendix D TBC Commands _ TUFLOW Classic_HPC User Manual 2023-03.html',
            '.ecf': 'doc/Appendix B ECF Commands _ TUFLOW Classic_HPC User Manual 2025.0.htm',
            '.trfc': 'doc/Appendix F TRFC Commands _ TUFLOW Classic_HPC User Manual 2025.0.htm',
            '.qcf': 'doc/Appendix H QCF Commands _ TUFLOW Classic_HPC User Manual 2025.0.htm'
        };
        const docPath = documentationMap[fileExtension];
        if (docPath) {
            const fullDocPath = path.join(vscode.workspace.rootPath || '', docPath);
            vscode.workspace.openTextDocument(fullDocPath).then(doc => {
                vscode.window.showTextDocument(doc);
            }, error => {
                vscode.window.showErrorMessage(`Could not open documentation for ${fileExtension} files. Error: ${error.message}`);
            });
        }
        else {
            vscode.window.showErrorMessage(`No documentation available for ${fileExtension} files`);
        }
    });
    context.subscriptions.push(provider, hoverProvider, signatureProvider, openFileCommand, openDocumentationCommand);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map