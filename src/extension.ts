import * as vscode from 'vscode';
import { registerCommandEditorServices } from './editor/commandProviders';
import * as path from 'path';
import { getDocumentationUrlForLine } from './documentation';

export function activate(context: vscode.ExtensionContext) {
    console.log('TUFLOW extension activated');

    const editorServices = registerCommandEditorServices('tuflow');

    // Open the pinned official TUFLOW manual in the user's external browser.
    // No workspace-relative manual snapshots or local solver installation.
    const openDocumentationCommand = vscode.commands.registerCommand('tuflow-helper.openDocumentation', async () => {
        const editor = vscode.window.activeTextEditor;
        const extension = editor ? path.extname(editor.document.fileName) : '';
        const line = editor ? editor.document.lineAt(editor.selection.active.line).text : '';
        const url = getDocumentationUrlForLine(extension, line);
        try {
            const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
            if (!opened) vscode.window.showWarningMessage('Could not open official TUFLOW documentation in a browser.');
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage('Could not open official TUFLOW documentation: ' + detail);
        }
    });


    context.subscriptions.push(...editorServices, openDocumentationCommand);
}

export function deactivate() { /* Subscriptions are disposed by VS Code. */ }
