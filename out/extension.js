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
const php_parser_1 = require("php-parser");
const locator_1 = require("./locator");
const property_1 = require("./property");
const insertProperty_1 = require("./insertProperty");
const removeProperty_1 = require("./removeProperty");
const utils_1 = require("./utils");
const renameProperty_1 = require("./renameProperty");
const changePropertyType_1 = require("./changePropertyType");
const constants_1 = require("./constants");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const extension = vscode.extensions.getExtension(constants_1.extensionQualifiedId);
        const version = extension.packageJSON.version;
        const previousVersion = context.globalState.get(constants_1.GlobalState.version);
        const versionAsInt = parseInt(version.replace(/\./g, ''));
        const previousVersionAsInt = previousVersion ? parseInt(previousVersion.replace(/\./g, '')) : 0;
        const showUpdatesEnabled = utils_1.config('phpAddProperty.showVersionUpdates') === true;
        if (utils_1.isDebugMode() || (showUpdatesEnabled && previousVersionAsInt < versionAsInt)) {
            try {
                const extensionRoot = context.asAbsolutePath(`webviews/${version}`);
                const filename = `${extensionRoot}/index.html`;
                const doc = yield vscode.workspace.openTextDocument(filename);
                const content = doc.getText();
                const html = content.replace(/#{root}/g, vscode.Uri.file(extensionRoot)
                    .with({ scheme: 'vscode-resource' })
                    .toString());
                const panel = vscode.window.createWebviewPanel(`phpAddPropertyWebView-${version}`, `PHP Add Property: What's new in v${version}`, vscode.ViewColumn.One, {
                    localResourceRoots: [vscode.Uri.file(context.extensionPath)],
                });
                panel.iconPath = vscode.Uri.file(context.asAbsolutePath('images/icon.png'));
                panel.webview.html = html;
            }
            catch (error) {
                if (utils_1.isDebugMode()) {
                    console.error(error);
                }
            }
        }
        context.globalState.update(constants_1.GlobalState.version, version);
        context.subscriptions.push(vscode.commands.registerCommand('phpAddProperty.add', () => __awaiter(this, void 0, void 0, function* () {
            if (vscode.window.activeTextEditor === undefined) {
                return;
            }
            const document = vscode.window.activeTextEditor.document;
            const phpEngine = new php_parser_1.default({
                ast: {
                    withPositions: false,
                    withSource: true,
                },
                lexer: {
                    debug: false,
                    all_tokens: true,
                    comment_tokens: true,
                    mode_eval: false,
                    asp_tags: false,
                    short_tags: true,
                },
                parser: {
                    debug: false,
                    extractDoc: true,
                    suppressErrors: true
                },
            });
            const ast = phpEngine.parseCode(document.getText());
            const locator = new locator_1.default(ast);
            const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;
            const phpClass = locator.findClass(selectionLineNumber + 1);
            if (!phpClass) {
                vscode.window.showInformationMessage('No class found');
                return;
            }
            const name = yield vscode.window.showInputBox({
                placeHolder: 'Enter the property name'
            });
            if (name === undefined || name.trim() === "") {
                return;
            }
            const property = new property_1.default(name);
            insertProperty_1.default(vscode.window.activeTextEditor, property, phpClass, `${property.getName()};`);
        })), vscode.commands.registerCommand('phpAddProperty.append', () => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (vscode.window.activeTextEditor === undefined) {
                return;
            }
            const document = vscode.window.activeTextEditor.document;
            const phpEngine = new php_parser_1.default({
                ast: {
                    withPositions: false,
                    withSource: true,
                },
                lexer: {
                    debug: false,
                    all_tokens: true,
                    comment_tokens: true,
                    mode_eval: false,
                    asp_tags: false,
                    short_tags: true,
                },
                parser: {
                    debug: false,
                    extractDoc: true,
                    suppressErrors: true
                },
            });
            const ast = phpEngine.parseCode(document.getText());
            const locator = new locator_1.default(ast);
            const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;
            const phpClass = locator.findClass(selectionLineNumber + 1);
            if (!phpClass) {
                vscode.window.showInformationMessage('No class found');
                return;
            }
            const line = document.lineAt(selectionLineNumber);
            const lineAst = phpEngine.parseEval(`class A { ${line.text} }`);
            if (((_b = (_a = lineAst.children[0]) === null || _a === void 0 ? void 0 : _a.body[0]) === null || _b === void 0 ? void 0 : _b.kind) !== 'propertystatement') {
                return;
            }
            const selectedWord = document.getText(document.getWordRangeAtPosition(vscode.window.activeTextEditor.selection.active)).replace(/^\$/, '');
            const properties = lineAst.children[0].body[0].properties;
            const propertyAst = (_c = properties.find((propertyAst) => { var _a; return ((_a = propertyAst.name) === null || _a === void 0 ? void 0 : _a.name) === selectedWord; })) !== null && _c !== void 0 ? _c : properties[0];
            const propertyName = (_d = propertyAst.name) === null || _d === void 0 ? void 0 : _d.name;
            const propertyStatementAst = phpClass.ast.body.find((node) => {
                if (node.kind !== 'propertystatement') {
                    return false;
                }
                return node.properties.find((propertyAst) => { var _a; return ((_a = propertyAst.name) === null || _a === void 0 ? void 0 : _a.name) === propertyName; });
            });
            if (!propertyStatementAst) {
                return;
            }
            let docblockType;
            for (let i = 0; i < ((_e = propertyStatementAst.leadingComments) === null || _e === void 0 ? void 0 : _e.length); i++) {
                const node = propertyStatementAst.leadingComments[i];
                if (node.kind !== 'commentblock') {
                    continue;
                }
                const typeMatch = /@var\s(\S*)/g.exec(node.value);
                if (typeMatch) {
                    docblockType = typeMatch[1];
                    let types = docblockType.split('|').map(type => type.trim());
                    const nullableTypeIndex = types.indexOf('null');
                    if (nullableTypeIndex !== -1) {
                        types.splice(nullableTypeIndex, 1);
                        docblockType = `?${types.join('|')}`;
                    }
                }
            }
            const property = new property_1.default(propertyName, propertyAst.nullable, (_g = (_f = propertyAst.type) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : docblockType);
            insertProperty_1.default(vscode.window.activeTextEditor, property, phpClass, line.text);
        })), vscode.commands.registerCommand('phpAddProperty.rename', () => __awaiter(this, void 0, void 0, function* () {
            if (vscode.window.activeTextEditor === undefined) {
                return;
            }
            const document = vscode.window.activeTextEditor.document;
            const phpEngine = new php_parser_1.default({
                ast: {
                    withPositions: false,
                    withSource: true,
                },
                lexer: {
                    debug: false,
                    all_tokens: true,
                    comment_tokens: true,
                    mode_eval: false,
                    asp_tags: false,
                    short_tags: true,
                },
                parser: {
                    debug: false,
                    extractDoc: true,
                    suppressErrors: true
                },
            });
            const ast = phpEngine.parseCode(document.getText());
            const locator = new locator_1.default(ast);
            const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;
            const phpClass = locator.findClass(selectionLineNumber);
            if (!phpClass) {
                vscode.window.showInformationMessage('No class found');
                return;
            }
            const line = document.lineAt(selectionLineNumber);
            let propertyName = utils_1.getPropertyNameFromLineText(line.text, document, phpEngine, vscode.window.activeTextEditor.selection.active);
            if (!propertyName) {
                propertyName = yield vscode.window.showInputBox({
                    placeHolder: 'Enter the property name you want to rename'
                });
            }
            if (propertyName === undefined || propertyName.trim() === "") {
                return;
            }
            const property = new property_1.default(propertyName);
            const newPropertyName = yield vscode.window.showInputBox({
                placeHolder: 'Enter the new property name'
            });
            if (newPropertyName === undefined || newPropertyName.trim() === "") {
                return;
            }
            const newProperty = new property_1.default(newPropertyName);
            renameProperty_1.renameProperty(vscode.window.activeTextEditor, property, newProperty, phpClass);
        })), vscode.commands.registerCommand('phpAddProperty.changeType', () => __awaiter(this, void 0, void 0, function* () {
            if (vscode.window.activeTextEditor === undefined) {
                return;
            }
            const document = vscode.window.activeTextEditor.document;
            const phpEngine = new php_parser_1.default({
                ast: {
                    withPositions: false,
                    withSource: true,
                },
                lexer: {
                    debug: false,
                    all_tokens: true,
                    comment_tokens: true,
                    mode_eval: false,
                    asp_tags: false,
                    short_tags: true,
                },
                parser: {
                    debug: false,
                    extractDoc: true,
                    suppressErrors: true
                },
            });
            const ast = phpEngine.parseCode(document.getText());
            const locator = new locator_1.default(ast);
            const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;
            const phpClass = locator.findClass(selectionLineNumber);
            if (!phpClass) {
                vscode.window.showInformationMessage('No class found');
                return;
            }
            const line = document.lineAt(selectionLineNumber);
            let propertyName = utils_1.getPropertyNameFromLineText(line.text, document, phpEngine, vscode.window.activeTextEditor.selection.active);
            if (!propertyName) {
                propertyName = yield vscode.window.showInputBox({
                    placeHolder: 'Enter the property name you want to change type'
                });
            }
            if (propertyName === undefined || propertyName.trim() === "") {
                return;
            }
            const property = new property_1.default(propertyName);
            const newPropertyType = yield vscode.window.showInputBox({
                placeHolder: 'Enter the new property type'
            });
            if (newPropertyType === undefined || newPropertyType.trim() === "") {
                return;
            }
            changePropertyType_1.changePropertyType(vscode.window.activeTextEditor, property, newPropertyType, phpClass);
        })), vscode.commands.registerCommand('phpAddProperty.remove', () => __awaiter(this, void 0, void 0, function* () {
            if (vscode.window.activeTextEditor === undefined) {
                return;
            }
            const document = vscode.window.activeTextEditor.document;
            const phpEngine = new php_parser_1.default({
                ast: {
                    withPositions: false,
                    withSource: true,
                },
                lexer: {
                    debug: false,
                    all_tokens: true,
                    comment_tokens: true,
                    mode_eval: false,
                    asp_tags: false,
                    short_tags: true,
                },
                parser: {
                    debug: false,
                    extractDoc: true,
                    suppressErrors: true
                },
            });
            const ast = phpEngine.parseCode(document.getText());
            const locator = new locator_1.default(ast);
            const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;
            const phpClass = locator.findClass(selectionLineNumber);
            if (!phpClass) {
                vscode.window.showInformationMessage('No class found');
                return;
            }
            const line = document.lineAt(selectionLineNumber);
            let propertyName = utils_1.getPropertyNameFromLineText(line.text, document, phpEngine, vscode.window.activeTextEditor.selection.active);
            if (!propertyName) {
                propertyName = yield vscode.window.showInputBox({
                    placeHolder: 'Enter the property name you want to remove'
                });
            }
            if (propertyName === undefined || propertyName.trim() === "") {
                return;
            }
            const property = new property_1.default(propertyName);
            removeProperty_1.removeProperty(vscode.window.activeTextEditor, property, phpClass);
        })), vscode.commands.registerCommand('phpAddProperty.breakConstructorIntoMultiline', () => __awaiter(this, void 0, void 0, function* () {
            var _h;
            if (vscode.window.activeTextEditor === undefined) {
                return;
            }
            const document = vscode.window.activeTextEditor.document;
            const phpEngine = new php_parser_1.default({
                ast: {
                    withPositions: false,
                    withSource: true,
                },
                lexer: {
                    debug: false,
                    all_tokens: true,
                    comment_tokens: true,
                    mode_eval: false,
                    asp_tags: false,
                    short_tags: true,
                },
                parser: {
                    debug: false,
                    extractDoc: true,
                    suppressErrors: true
                },
            });
            const ast = phpEngine.parseCode(document.getText());
            const locator = new locator_1.default(ast);
            const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;
            const phpClass = locator.findClass(selectionLineNumber + 1);
            if (!phpClass) {
                vscode.window.showInformationMessage('No class found');
                return;
            }
            const phpClassRange = new vscode.Range(new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column), new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column));
            const newDocumentText = utils_1.forceBreakConstructorIntoMultiline(document.getText(phpClassRange));
            if (newDocumentText === document.getText(phpClassRange)) {
                return;
            }
            (_h = vscode.window.activeTextEditor) === null || _h === void 0 ? void 0 : _h.edit(editBuilder => {
                editBuilder.replace(phpClassRange, newDocumentText);
            }, {
                undoStopBefore: true,
                undoStopAfter: false
            });
        })));
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map