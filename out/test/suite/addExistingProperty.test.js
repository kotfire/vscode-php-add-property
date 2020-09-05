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
const testFolderRelativeLocation = '/../fixtures/existing/';
suite('Add Existing Property', function () {
    setup(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    test('Should add an existing property and constructor in an empty class', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('EmptyClass.php', new vscode.Position(7, 0));
    }));
    test('Should add an existing property to an empty constructor', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('EmptyConstructor.php', new vscode.Position(7, 0));
    }));
    test('Should add an existing property to an existing constructor', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('ExistingConstructor.php', new vscode.Position(9, 0));
    }));
    test('Should add an existing property using type from docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('UseDocblock.php', new vscode.Position(8, 0));
    }));
    test('Should add an existing property using its PHP7.4+ type', () => __awaiter(this, void 0, void 0, function* () {
        yield runFixture('UseType.php', new vscode.Position(8, 0));
    }));
    test('Should add a docblock with @param using type from property docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        yield runFixture('ConstructorDocblockUsingDocblock.php', new vscode.Position(8, 0));
    }));
    test('Should NOT add an extra space when adding property type and docblock type at the same type', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.enable', true, true);
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.docblock.withParameter', true, true);
        yield runFixture('DocblockTypeWithParameter.php', new vscode.Position(10, 22));
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
        vscode.window.activeTextEditor.selections = [new vscode.Selection(cursorPosition, cursorPosition)];
        yield vscode.commands.executeCommand('phpAddProperty.append');
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
//# sourceMappingURL=addExistingProperty.test.js.map