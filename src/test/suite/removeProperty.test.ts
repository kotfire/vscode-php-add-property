import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import * as fs from 'fs';
import { waitToAssertInSeconds, delay, resetDefaultSettings } from './utils';

const testFolderRelativeLocation = '/../fixtures/remove/';

suite('Remove Property', function () {
    setup(async () => {
        await resetDefaultSettings();
    });

    teardown(async () => {
        await resetDefaultSettings();
    });

    test('Should remove an existing property by name', async () => {
        await runFixture('ConstructorWithMultipleProperties.php');
    });

    test('Should remove the constructor method when the body is empty', async () => {
        await runFixture('EmptyConstructor.php');
    });

    test('Should remove the constructor method when the body is empty after removing the last property', async () => {
        await runFixture('ConstructorWithSingleProperty.php');
    });

    test('Should NOT remove the constructor method when the body is NOT empty after removing the last property', async () => {
        await runFixture('ConstructorWithOneProperty.php');
    });
    
    test('Should NOT remove the constructor argument when the property name does not match', async () => {
        await runFixture('ConstructorWithOtherArgument.php');
    });

    test('Should remove typed properties', async () => {
        await runFixture('TypedProperty.php');
    });

    test('Should remove the property docblock', async () => {
        await runFixture('PropertyWithDocblock.php');
    });
    
    test('Should remove the property from the constructor docblock', async () => {
        await runFixture('ConstructorDocblock.php');
    });

    test('Should remove a property when the cursor is placed in its statement', async () => {
        await runFixture('ConstructorWithMultiplePropertiesCursorInPropertyStatement.php', new vscode.Position(11, 13));
    });

    test('Should remove a property when the cursor is placed in its constructor argument', async () => {
        await runFixture('ConstructorWithMultiplePropertiesCursorInArgument.php', new vscode.Position(13, 35));
    });

    test('Should remove a property when the cursor is placed in its assignment', async () => {
        await runFixture('ConstructorWithMultiplePropertiesCursorInAssignment.php', new vscode.Position(15, 18));
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
        vscode.window.showInputBox = function (
            options?: vscode.InputBoxOptions | undefined,
            token?: vscode.CancellationToken | undefined
        ): Thenable<string | undefined> {
            return Promise.resolve('name');
        };
    } else {
        vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
    }

    await vscode.commands.executeCommand('phpAddProperty.remove');

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
