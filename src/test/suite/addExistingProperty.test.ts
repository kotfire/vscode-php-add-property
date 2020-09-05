import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import * as fs from 'fs';
import { waitToAssertInSeconds, delay, resetDefaultSettings } from './utils';

const testFolderRelativeLocation = '/../fixtures/existing/';

suite('Add Existing Property', function () {
    setup(async () => {
        await resetDefaultSettings();
    });

    teardown(async () => {
        await resetDefaultSettings();
    });

    test('Should add an existing property and constructor in an empty class', async () => {
        await runFixture('EmptyClass.php', new vscode.Position(7, 0));
    });

    test('Should add an existing property to an empty constructor', async () => {
        await runFixture('EmptyConstructor.php', new vscode.Position(7, 0));
    });

    test('Should add an existing property to an existing constructor', async () => {
        await runFixture('ExistingConstructor.php', new vscode.Position(9, 0));
    });

    test('Should add an existing property using type from docblock', async () => {
        await runFixture('UseDocblock.php', new vscode.Position(8, 0));
    });

    test('Should add an existing property using its PHP7.4+ type', async () => {
        await runFixture('UseType.php', new vscode.Position(8, 0));
    });

    test('Should add a docblock with @param using type from property docblock', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        await runFixture('ConstructorDocblockUsingDocblock.php', new vscode.Position(8, 0));
    });

    test('Should NOT add an extra space when adding property type and docblock type at the same type', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.withParameter', true, true);
        await runFixture('DocblockTypeWithParameter.php', new vscode.Position(10, 22));
    });

    test('Should add an existing property with a nullable type', async() => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        await runFixture('NullableType.php', new vscode.Position(10, 0));
    });
});

async function runFixture(fileName: string, cursorPosition: vscode.Position) {
    const uri = vscode.Uri.file(
        getInputFilePath(fileName)
    );
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    if (!vscode.window.activeTextEditor) {
        return;
    }

    vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];

    await vscode.commands.executeCommand('phpAddProperty.append');

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
