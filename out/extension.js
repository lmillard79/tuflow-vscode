"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const commands_1 = require("./commands");
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
            if (!hasCommandPrefix) {
                // Add command completions
                commands_1.allTuflowCommands.forEach(cmd => {
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
            // Match command names with spaces
            const commandMatch = textBeforeCursor.match(/^\s*([A-Za-z\s]+?)(?:\s*==\s*)?$/);
            if (commandMatch) {
                const commandName = commandMatch[1].trim();
                const command = commands_1.allTuflowCommands.find(cmd => cmd.name.toLowerCase() === commandName.toLowerCase());
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
    context.subscriptions.push(provider, hoverProvider, signatureProvider);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map