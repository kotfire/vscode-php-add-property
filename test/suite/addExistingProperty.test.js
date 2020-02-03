const vscode = require('vscode');
const path = require('path');
const assert = require('assert');
const fs = require('fs');
const {waitToAssertInSeconds, delay, resetDefaultSettings} = require('./utils');

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

    test('Should add an existing property to an existing constructor', async () => {
        await runFixture('ExistingConstructor.php', new vscode.Position(9, 0));
    });

    test('Should add an existing property using type from docblock', async () => {
        await runFixture('UseDocblock.php', new vscode.Position(8, 0));
    });

    test('Should add a docblock with @param using type from property docblock', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        await runFixture('ConstructorDocblockUsingDocblock.php', new vscode.Position(8, 0));
    });
});

async function runFixture(fileName, cursorPosition) {
    const uri = vscode.Uri.file(
        getInputFilePath(fileName)
    );
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];

    await vscode.commands.executeCommand('phpAddProperty.append');

    const expectedText = fs.readFileSync(getOutputFilePath(fileName)).toString();

    await delay(waitToAssertInSeconds, () => {
        assert.strictEqual(vscode.window.activeTextEditor.document.getText(), expectedText);
    });
}

function getInputFilePath(name) {
    return path.join(__dirname + testFolderRelativeLocation + `inputs/${name}`);
}

function getOutputFilePath(name) {
    return path.join(__dirname + testFolderRelativeLocation + `outputs/${name}`);
}
