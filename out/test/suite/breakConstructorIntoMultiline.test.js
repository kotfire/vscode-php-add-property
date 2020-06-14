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
const testFolderRelativeLocation = '/../fixtures/breakConstructorIntoMultiline/';
suite('Customizations', function () {
    setup(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        yield utils_1.resetDefaultSettings();
    }));
    test('Should break the constructor into multiline regardless of the settings', () => __awaiter(this, void 0, void 0, function* () {
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.enabled', false, true);
        yield vscode.workspace.getConfiguration('phpAddProperty').update('constructor.breakIntoMultilineIfLengthExceeded.maxLineLength', 999, true);
        yield runFixture('Constructor.php');
    }));
});
function runFixture(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const uri = vscode.Uri.file(getInputFilePath(fileName));
        const document = yield vscode.workspace.openTextDocument(uri);
        yield vscode.window.showTextDocument(document);
        yield vscode.commands.executeCommand('phpAddProperty.breakConstructorIntoMultiline');
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
//# sourceMappingURL=breakConstructorIntoMultiline.test.js.map