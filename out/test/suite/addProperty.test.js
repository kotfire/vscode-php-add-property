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
const testFolderRelativeLocation = '/../fixtures/new/';
suite('Add Property', function () {
    setup(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    test('Should insert property and constructor in an empty class', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('EmptyClass.php');
    }));
    test('Should insert a new property and add it to an empty constructor', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('EmptyConstructor.php');
    }));
    test('Should insert a new property and add it to an existing constructor', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ExistingConstructor.php');
    }));
    test('Should insert a new property in a multiline constructor', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('MultilineConstructor.php');
    }));
    test('Should add a property to the constructor even if the property already exists', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ExistingProperty.php');
    }));
    test('Should NOT add a property to the constructor if it is already there', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ExistingPropertyInConstructor.php');
    }));
    test('Should NOT add the property assignation if it is already there', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ExistingPropertyAssignation.php');
    }));
    test('Should work with tab indentation', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('TabIndentation.php');
    }));
    test('Should work when the class contains extra "class" keywords', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ClassKeyword.php');
    }));
    test('Should insert property in the first class if the file contains multiple', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('MultipleClasses.php');
    }));
    test('Should insert property in the first class if the cursor is placed there', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('MultipleClassesCursorInFirst.php', new vscode.Position(8, 0));
    }));
    test('Should insert property in the last class if the cursor is placed there', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('MultipleClassesCursorInLast.php', new vscode.Position(13, 0));
    }));
    test('Should add a docblock with @param along with the constructor', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        yield runFixture('AddConstructorDocblock.php');
    }));
    test('Should update the docblock adding the new @param', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        yield runFixture('UpdateConstructorDocblock.php');
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
        yield vscode.commands.executeCommand('phpAddProperty.add');
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
//# sourceMappingURL=addProperty.test.js.map