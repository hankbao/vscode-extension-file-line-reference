// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let imp = function (guessFunctionName: boolean) {
        let msg = 'Unable to find a file name';

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(msg);
            return '';
        }

        let doc = editor.document;
        if (doc.isUntitled) {
            vscode.window.showErrorMessage(msg);
            return '';
        }

        let output = '';
        output += getFileName(doc.fileName);

        let lineNumber = '';
        if (editor.selection.isEmpty) {
            lineNumber += editor.selection.active.line + 1;
        } else {
            let start = editor.selection.start.line + 1;
            let end = editor.selection.end.line + 1;
            lineNumber += start + '-' + end;
        }

        output += ':' + lineNumber;

        if (guessFunctionName) {
            let lines = editor.document.getText(editor.selection).split('\n');
            for (const line of lines) {
                let regex = /\s*\b(?:public|private)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g;
                let match = regex.exec(line);
                if (match) {
                    output += ':' + match[1] + '()';
                    break;
                }
            }
        }

        return output;
    };

    let getFileName = function (path: string) {
        let separator = (path.indexOf('\\') !== -1) ? '\\' : '/';
        return path.split(separator).pop();
    };

    let showMessage = function (msg: string) {
        vscode.window.setStatusBarMessage('"' + msg + '"' + 'copied', 3000);
    };

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "file-line-reference" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let copyFileLine = vscode.commands.registerCommand('file-line-reference.copy-file-line', () => {
        let msg = imp(false);
        if (msg !== '') {
            vscode.env.clipboard.writeText(msg).then(() => {
                showMessage(msg);
            });
        }
	});

    let copyFileLineFunction = vscode.commands.registerCommand('file-line-reference.copy-file-line-function', () => {
        let msg = imp(true);
        if (msg !== '') {
            vscode.env.clipboard.writeText(msg).then(() => {
                showMessage(msg);
            });
        }
    });

	context.subscriptions.push(copyFileLine, copyFileLineFunction);
}

// This method is called when your extension is deactivated
export function deactivate() {}
