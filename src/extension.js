const vscode = require('vscode');
const AddProperty = require('./AddProperty');

function activate(context) {
    let addProperty = new AddProperty();

    context.subscriptions.push(
        vscode.commands.registerCommand('phpAddProperty.add', () => {
            if (vscode.window.activeTextEditor !== undefined) {
                addProperty.add();
            }
        }),
        vscode.commands.registerCommand('phpAddProperty.append', () => {
            if (vscode.window.activeTextEditor !== undefined) {
                addProperty.append();
            }
        })
    );

    context.subscriptions.push(addProperty);
}

exports.activate = activate;