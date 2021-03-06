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
const testFolderRelativeLocation = '/../fixtures/remove/';
suite('Remove Property', function () {
    setup(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    test('Should remove an existing property by name', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultipleProperties.php');
    }));
    test('Should remove the constructor method when the body is empty', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('EmptyConstructor.php');
    }));
    test('Should remove the constructor method when the body is empty after removing the last property', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithSingleProperty.php');
    }));
    test('Should NOT remove the constructor method when the body is NOT empty after removing the last property', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithOneProperty.php');
    }));
    test('Should NOT remove the constructor argument when the property name does not match', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithOtherArgument.php');
    }));
    test('Should remove the constructor docblock along with the constructor', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithSinglePropertyAndDocblock.php');
    }));
    test('Should remove typed properties', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('TypedProperty.php');
    }));
    test('Should remove the property docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('PropertyWithDocblock.php');
    }));
    test('Should remove the property from the constructor docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorDocblock.php');
    }));
    test('Should remove a property when the cursor is placed in its statement', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultiplePropertiesCursorInPropertyStatement.php', new vscode.Position(11, 13));
    }));
    test('Should remove a property when the cursor is placed in its constructor argument', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultiplePropertiesCursorInArgument.php', new vscode.Position(13, 35));
    }));
    test('Should remove a property when the cursor is placed in its assignment', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultiplePropertiesCursorInAssignment.php', new vscode.Position(15, 18));
    }));
    test('Should remove a property when the cursor is placed in its constructor docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ConstructorWithMultiplePropertiesCursorInConstructorDocblock.php', new vscode.Position(16, 24));
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
            vscode.window.showInputBox = function (options, token) {
                return Promise.resolve('name');
            };
        }
        else {
            vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
        }
        yield vscode.commands.executeCommand('phpAddProperty.remove');
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
//# sourceMappingURL=removeProperty.test.js.map