const vscode = require('vscode');
const path = require('path');
const assert = require('assert');
const fs = require('fs');
const {waitToAssertInSeconds, delay, resetDefaultSettings} = require('./utils');

const testFolderRelativeLocation = '/../fixtures/customizations/';

suite('Customizations', function () {
    setup(async () => {
        await resetDefaultSettings();
    });

    teardown(async () => {
        await resetDefaultSettings();
    });

    test('Should use the specified property default visibility', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('property.visibility.default', 'public', true);
        await runFixture('PropertyDefaultVisibility.php');
    });

    test('Should add the docblock', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('property.docblock.add', true, true);
        await runFixture('PropertyAddDocblock.php');
    });

    test('Should add a multiline docblock', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('property.docblock.add', true, true);
        await vscode.workspace.getConfiguration('phpAddProperty').update('property.docblock.multiline', true, true);
        await runFixture('PropertyMultilineDocblock.php');
    });

    test('Should use the specified constructor default visibility', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.visibility.default', 'private', true);
        await runFixture('ConstructorDefaultVisibility.php');
    });

    test('Should break constructor into multiple lines', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.enabled', true, true);
        await runFixture('ConstructorBreakIntoMultiline.php');
    });

    test('Should break constructor into multiple lines at a specified length', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.enabled', true, true);
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.maxLineLength', 40, true);
        await runFixture('ConstructorBreakIntoMultilineLength.php');
    });
});

async function runFixture(fileName) {
    vscode.window.showInputBox = function () {
        return 'name';
    };

    const uri = vscode.Uri.file(
        getInputFilePath(fileName)
    );
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    await vscode.commands.executeCommand('phpAddProperty.add');

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
