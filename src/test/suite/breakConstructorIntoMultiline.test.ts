import * as vscode from 'vscode';
import * as path from 'path';
import * as assert from 'assert';
import * as fs from 'fs';
import { waitToAssertInSeconds, delay, resetDefaultSettings } from './utils';

const testFolderRelativeLocation = '/../fixtures/breakConstructorIntoMultiline/';

suite('Break Constructor Into Multilines', function () {
    setup(async () => {
        await resetDefaultSettings();
    });

    teardown(async () => {
        await resetDefaultSettings();
    });

    test('Should break the constructor into multiline regardless of the settings', async () => {
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.enabled', false, true);
        await vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.maxLineLength', 999, true);
        await runFixture('Constructor.php');
    });
});

async function runFixture(fileName: string) {
    const uri = vscode.Uri.file(
        getInputFilePath(fileName)
    );
    const document = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(document);

    await vscode.commands.executeCommand('phpAddProperty.breakConstructorIntoMultiline');

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

