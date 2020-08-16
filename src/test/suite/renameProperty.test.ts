import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import * as fs from 'fs';
import { waitToAssertInSeconds, delay, resetDefaultSettings } from './utils';

const testFolderRelativeLocation = '/../fixtures/rename/';

suite('Rename Property', function () {
    setup(async () => {
        await resetDefaultSettings();
    });

    teardown(async () => {
        await resetDefaultSettings();
    });

    test('Should rename a property by name', async () => {
        await runFixture('ConstructorWithMultipleProperties.php');
    });

    test('Should rename a single property', async () => {
        await runFixture('ConstructorWithSingleProperty.php');
    });

    test('Should rename a property when the cursor is placed in its statement', async () => {
        await runFixture('ConstructorWithMultiplePropertiesCursorInPropertyStatement.php', new vscode.Position(9, 13));
    });

    test('Should rename a property when the cursor is placed in its constructor argument', async () => {
        await runFixture('ConstructorWithMultiplePropertiesCursorInArgument.php', new vscode.Position(13, 50));
    });

    test('Should rename a property when the cursor is placed in its assignment', async () => {
        await runFixture('ConstructorWithMultiplePropertiesCursorInAssignment.php', new vscode.Position(16, 18));
    });

    test('Should rename all property references', async () => {
        await runFixture('PropertyReferences.php');
    });

    test('Should rename only one property when there are more than one properties per statement', async () => {
        await runFixture('MultiplePropertyStatements.php');
    });

    test('Should rename constructor param docblock', async () => {
        await runFixture('ConstructorDocblock.php');
    });
});

async function runFixture(fileName: string, cursorPosition?: vscode.Position) {
    const uri = vscode.Uri.file(
        getInputFilePath(fileName)
    );
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    if (!vscode.window.activeTextEditor) {
        return;
    }

    if (cursorPosition === undefined) {
        let first = true;
        vscode.window.showInputBox = function (
            options?: vscode.InputBoxOptions | undefined,
            token?: vscode.CancellationToken | undefined
        ): Thenable<string | undefined> {
            if (first === true) {
                first = false;

                return Promise.resolve('name');
            }
            
            return Promise.resolve('newName');
        };
    } else {
        vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];

        vscode.window.showInputBox = function (
            options?: vscode.InputBoxOptions | undefined,
            token?: vscode.CancellationToken | undefined
        ): Thenable<string | undefined> {
            return Promise.resolve('newName');
        };
    }

    await vscode.commands.executeCommand('phpAddProperty.rename');

    const expectedText = fs.readFileSync(getOutputFilePath(fileName)).toString();

    await delay(waitToAssertInSeconds, () => {
        assert.strictEqual(vscode.window.activeTextEditor?.document.getText(), expectedText);
    });
}

function getInputFilePath(name: string) {
    return path.join(__dirname + testFolderRelativeLocation + `inputs/${name}`);
}

function getOutputFilePath(name: string) {
    return path.join(__dirname + testFolderRelativeLocation + `outputs/${name}`);
}
