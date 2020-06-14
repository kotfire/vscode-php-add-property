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
function activate(context) {
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
            }
        }
        const property = new property_1.default(propertyName, (_g = (_f = propertyAst.type) === null || _f === void 0 ? void 0 : _f.name) !== null && _g !== void 0 ? _g : docblockType);
        insertProperty_1.default(vscode.window.activeTextEditor, property, phpClass, line.text);
    })), vscode.commands.registerCommand('phpAddProperty.remove', () => __awaiter(this, void 0, void 0, function* () {
        var _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
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
        const lineAst = phpEngine.parseEval(`class A { ${line.text} }`);
        const selectedWord = document.getText(document.getWordRangeAtPosition(vscode.window.activeTextEditor.selection.active)).replace(/^\$/, '');
        let propertyName;
        if (((_j = (_h = lineAst.children[0]) === null || _h === void 0 ? void 0 : _h.body[0]) === null || _j === void 0 ? void 0 : _j.kind) === 'propertystatement') {
            const properties = lineAst.children[0].body[0].properties;
            const propertyAst = (_k = properties.find((propertyAst) => { var _a; return ((_a = propertyAst.name) === null || _a === void 0 ? void 0 : _a.name) === selectedWord; })) !== null && _k !== void 0 ? _k : properties[0];
            propertyName = (_l = propertyAst.name) === null || _l === void 0 ? void 0 : _l.name;
            if (propertyName === 'this') {
                const assignmentAst = phpEngine.parseEval(`class A { public function __construct() { ${line.text} } }`);
                if (((_q = (_p = (_o = (_m = assignmentAst.children[0]) === null || _m === void 0 ? void 0 : _m.body[0]) === null || _o === void 0 ? void 0 : _o.body) === null || _p === void 0 ? void 0 : _p.children[0]) === null || _q === void 0 ? void 0 : _q.kind) === 'expressionstatement') {
                    propertyName = (_r = assignmentAst.children[0].body[0].body.children[0].expression.right) === null || _r === void 0 ? void 0 : _r.name;
                }
            }
        }
        else if (((_t = (_s = lineAst.children[0]) === null || _s === void 0 ? void 0 : _s.body[0]) === null || _t === void 0 ? void 0 : _t.kind) === 'method') {
            const constructorArgs = lineAst.children[0].body[0].arguments;
            const argumentAst = (_u = constructorArgs.find((propertyAst) => { var _a; return ((_a = propertyAst.name) === null || _a === void 0 ? void 0 : _a.name) === selectedWord; })) !== null && _u !== void 0 ? _u : constructorArgs[0];
            propertyName = (_v = argumentAst.name) === null || _v === void 0 ? void 0 : _v.name;
        }
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
    })));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map