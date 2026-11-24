import * as vscode from 'vscode';
import { planCompletions, planHover, planSignature } from './commandModel';
import type { TextRangePlan } from './commandModel';

function toRange(plan: TextRangePlan): vscode.Range {
    return new vscode.Range(
        new vscode.Position(plan.line, plan.start),
        new vscode.Position(plan.line, plan.end)
    );
}

/** Editor adapters only. All recognition and replacement decisions stay pure. */
export function registerCommandEditorServices(languageId: string): vscode.Disposable[] {
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        languageId,
        {
            provideCompletionItems(
                document: vscode.TextDocument, position: vscode.Position,
                token: vscode.CancellationToken
            ) {
                if (token.isCancellationRequested) return [];
                const plans = planCompletions(
                    document.fileName, document.lineAt(position.line).text,
                    position.character, position.line
                );
                return plans.map(plan => {
                    const kind = plan.kind === 'command' ? vscode.CompletionItemKind.Keyword
                        : plan.kind === 'file' ? vscode.CompletionItemKind.File
                            : vscode.CompletionItemKind.Value;
                    const item = new vscode.CompletionItem(plan.label, kind);
                    item.detail = plan.description;
                    item.documentation = new vscode.MarkdownString(plan.documentation);
                    item.range = toRange(plan.range);
                    item.insertText = plan.snippet
                        ? new vscode.SnippetString(plan.insertText) : plan.insertText;
                    return item;
                });
            }
        },
        ' ', '='
    );

    const hoverProvider = vscode.languages.registerHoverProvider(
        languageId,
        {
            provideHover(
                document: vscode.TextDocument, position: vscode.Position,
                token: vscode.CancellationToken
            ) {
                if (token.isCancellationRequested) return;
                const plan = planHover(
                    document.fileName, document.lineAt(position.line).text,
                    position.character, position.line
                );
                return plan
                    ? new vscode.Hover(new vscode.MarkdownString(plan.documentation), toRange(plan.range))
                    : undefined;
            }
        }
    );

    const signatureProvider = vscode.languages.registerSignatureHelpProvider(
        languageId,
        {
            provideSignatureHelp(
                document: vscode.TextDocument, position: vscode.Position,
                token: vscode.CancellationToken
            ) {
                if (token.isCancellationRequested) return null;
                const plan = planSignature(
                    document.fileName, document.lineAt(position.line).text,
                    position.character, position.line
                );
                if (!plan) return null;
                const signature = new vscode.SignatureInformation(
                    plan.label, new vscode.MarkdownString(plan.documentation)
                );
                signature.parameters = plan.parameters.map(label =>
                    new vscode.ParameterInformation(label)
                );
                const help = new vscode.SignatureHelp();
                help.signatures = [signature];
                help.activeSignature = 0;
                help.activeParameter = plan.activeParameter;
                return help;
            }
        },
        ' ', '=', ',', '|'
    );

    return [completionProvider, hoverProvider, signatureProvider];
}
