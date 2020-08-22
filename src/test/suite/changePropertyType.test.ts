import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import * as fs from 'fs';
import { waitToAssertInSeconds, delay, resetDefaultSettings } from './utils';

const testFolderRelativeLocation = '/../fixtures/changePropertyType/';

suite('Change Property Type', function () {
    setup(async () => {
        await resetDefaultSettings();
    });

    teardown(async () => {
        await resetDefaultSettings();
    });

    test('Should change a property type by name', async () => {
        await runFixture('ConstructorWithMultipleProperties.php');
    });

    test('Should change the property statement type if already exists', async () => {
        await runFixture('TypedPropertyStatement.php');
    });
    
    test('Should change the property statement type if typed properties is enabled', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('property.types', true, true);
        await runFixture('PropertyWithoutType.php');
    });

    test('Should change property statement docblock type', async () => {
        await runFixture('PropertyStatementDocblock.php');
    });

    test('Should NOT change other properties statement docblock type', async () => {
        await runFixture('OtherPropertiesStatementDocblock.php');
    });

    test('Should change property type in constructor docblock', async () => {
        await runFixture('ConstructorDocblock.php');
    });

    test('Should rename a property when the cursor is placed in its constructor docblock param', async () => {
        await runFixture('ConstructorWithMultiplePropertiesCursorInConstructorDocblock.php', new vscode.Position(15, 17));
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
            
            return Promise.resolve('Name');
        };
    } else {
        vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];

        vscode.window.showInputBox = function (
            options?: vscode.InputBoxOptions | undefined,
            token?: vscode.CancellationToken | undefined
        ): Thenable<string | undefined> {
            return Promise.resolve('Name');
        };
    }

    await vscode.commands.executeCommand('phpAddProperty.changeType');

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
