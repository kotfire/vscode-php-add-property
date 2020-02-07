const vscode = require('vscode');
const path = require('path');
const assert = require('assert');
const fs = require('fs');
const {waitToAssertInSeconds, delay, resetDefaultSettings} = require('./utils');

const testFolderRelativeLocation = '/../fixtures/new/';

suite('Add Property', function () {
    setup(async () => {
        await resetDefaultSettings();
    });

    teardown(async () => {
        await resetDefaultSettings();
    });

    test('Should insert property and constructor in an empty class', async () => {
        await runFixture('EmptyClass.php');
    });

    test('Should insert a new property and add it to an empty constructor', async () => {
        await runFixture('EmptyConstructor.php');
    });

    test('Should insert a new property and add it to an existing constructor', async () => {
        await runFixture('ExistingConstructor.php');
    });

    test('Should insert a new property in a multiline constructor', async () => {
        await runFixture('MultilineConstructor.php');
    });

    test('Should add a property to the constructor even if the property already exists', async () => {
        await runFixture('ExistingProperty.php');
    });

    test('Should NOT add a property to the constructor if it is already there', async () => {
        await runFixture('ExistingPropertyInConstructor.php');
    });

    test('Should NOT add the property assignation if it is already there', async () => {
        await runFixture('ExistingPropertyAssignation.php');
    });

    test('Should work with tab indentation', async () => {
        await runFixture('TabIndentation.php');
    });

    test('Should work when the class contains extra "class" keywords', async () => {
        await runFixture('ClassKeyword.php');
    });

    test('Should insert property in the first class if the file contains multiple', async () => {
        await runFixture('MultipleClasses.php');
    });

    test('Should add a docblock with @param along with the constructor', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        await runFixture('AddConstructorDocblock.php');
    });

    test('Should update the docblock adding the new @param', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        await runFixture('UpdateConstructorDocblock.php');
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
