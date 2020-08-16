"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path = require("path");
const assert = require("assert");
const fs = require("fs");
const utils_1 = require("./utils");
const testFolderRelativeLocation = '/../fixtures/rename/';
suite('Rename Property', function () {
    setup(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    test('Should rename a property by name', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultipleProperties.php');
    }));
    test('Should rename a single property', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithSingleProperty.php');
    }));
    test('Should rename a property when the cursor is placed in its statement', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultiplePropertiesCursorInPropertyStatement.php', new vscode.Position(9, 13));
    }));
    test('Should rename a property when the cursor is placed in its constructor argument', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultiplePropertiesCursorInArgument.php', new vscode.Position(13, 50));
    }));
    test('Should rename a property when the cursor is placed in its assignment', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultiplePropertiesCursorInAssignment.php', new vscode.Position(16, 18));
    }));
    test('Should rename all property references', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('PropertyReferences.php');
    }));
    test('Should rename only one property when there are more than one properties per statement', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('MultiplePropertyStatements.php');
    }));
    test('Should rename constructor param docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorDocblock.php');
    }));
});
function runFixture(fileName, cursorPosition) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = vscode.Uri.file(getInputFilePath(fileName));
        const document = yield vscode.workspace.openTextDocument(uri);
        yield vscode.window.showTextDocument(document);
        if (!vscode.window.activeTextEditor) {
            return;
        }
        if (cursorPosition === undefined) {
            let first = true;
            vscode.window.showInputBox = function (options, token) {
                if (first === true) {
                    first = false;
                    return Promise.resolve('name');
                }
                return Promise.resolve('newName');
            };
        }
        else {
            vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
            vscode.window.showInputBox = function (options, token) {
                return Promise.resolve('newName');
            };
        }
        yield vscode.commands.executeCommand('phpAddProperty.rename');
        const expectedText = fs.readFileSync(getOutputFilePath(fileName)).toString();
        yield utils_1.delay(utils_1.waitToAssertInSeconds, () => {
            var _a;
            assert.strictEqual((_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.getText(), expectedText);
        });
    });
}
function getInputFilePath(name) {
    return path.join(__dirname + testFolderRelativeLocation + `inputs/${name}`);
}
function getOutputFilePath(name) {
    return path.join(__dirname + testFolderRelativeLocation + `outputs/${name}`);
}
//# sourceMappingURL=renameProperty.test.js.map