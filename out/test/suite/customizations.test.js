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
const testFolderRelativeLocation = '/../fixtures/customizations/';
suite('Customizations', function () {
    setup(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    test('Should use the specified property default visibility', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('property.visibility.default', 'public', true);
        yield runFixture('PropertyDefaultVisibility.php');
    }));
    test('Should add the docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('property.docblock.add', true, true);
        yield runFixture('PropertyAddDocblock.php');
    }));
    test('Should add a multiline docblock', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('property.docblock.add', true, true);
        yield vscode.workspace.getConfiguration('phpAddProperty').update('property.docblock.multiline', true, true);
        yield runFixture('PropertyMultilineDocblock.php');
    }));
    test('Should use the specified constructor default visibility', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.visibility.default', 'private', true);
        yield runFixture('ConstructorDefaultVisibility.php');
    }));
    test('Should break constructor into multiple lines', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.enabled', true, true);
        yield runFixture('ConstructorBreakIntoMultiline.php');
    }));
    test('Should break constructor into multiple lines at a specified length', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.enabled', true, true);
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.maxLineLength', 40, true);
        yield runFixture('ConstructorBreakIntoMultilineLength.php');
    }));
});
function runFixture(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode.window.showInputBox = function (options, token) {
            return Promise.resolve('name');
        };
        const uri = vscode.Uri.file(getInputFilePath(fileName));
        const document = yield vscode.workspace.openTextDocument(uri);
        yield vscode.window.showTextDocument(document);
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
//# sourceMappingURL=customizations.test.js.map