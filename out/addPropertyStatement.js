"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
function addPropertyStatement(document, phpClass, property, tabStops) {
    var _a;
    const phpClassRange = new vscode.Range(new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column), new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column));
    let newDocumentText = utils_1.escapeForSnippet(document.getText(phpClassRange));
    let lastProperty;
    let firstMethod;
    let lastNode;
    const astClassBody = phpClass.ast.body;
    for (let i = 0; i < astClassBody.length; i++) {
        const node = astClassBody[i];
        lastNode = node;
        if (node.kind === 'propertystatement') {
            lastProperty = node;
            // Check that property does not already exist
            for (let j = 0; j < node.properties.length; j++) {
                const propertyNode = node.properties[j];
                if (((_a = propertyNode.name) === null || _a === void 0 ? void 0 : _a.name) === property.getName()) {
                    return newDocumentText;
                }
            }
        }
        else if (!firstMethod && node.kind === 'method' && node.name !== '__construct') {
            firstMethod = node;
        }
    }
    const propertyStatementText = property.getStatementText(tabStops);
    if (lastProperty) {
        const lastPropertyLine = document.lineAt(lastProperty.loc.start.line - 1);
        const newPropertyText = utils_1.escapeForSnippet(`${lastPropertyLine.text}`) + "\n\n" + utils_1.indentText(propertyStatementText, utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(lastPropertyLine.text)));
        newDocumentText = newDocumentText.replace(utils_1.escapeForSnippet(lastPropertyLine.text), newPropertyText);
    }
    else if (firstMethod) {
        const firstMethodLine = document.lineAt(firstMethod.loc.start.line - 1);
        const newPropertyText = utils_1.indentText(propertyStatementText, utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(firstMethodLine.text))) + "\n\n" + utils_1.escapeForSnippet(firstMethodLine.text);
        newDocumentText = newDocumentText.replace(utils_1.escapeForSnippet(firstMethodLine.text), newPropertyText);
    }
    else if (lastNode) {
        const lastNodeLine = document.lineAt(lastNode.loc.start.line - 1);
        const newPropertyText = utils_1.escapeForSnippet(lastNodeLine.text) + "\n\n" + utils_1.indentText(propertyStatementText, utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(lastNodeLine.text)));
        newDocumentText = newDocumentText.replace(utils_1.escapeForSnippet(lastNodeLine.text), newPropertyText);
    }
    else {
        const isOneLineClass = phpClass.ast.loc.start.line === phpClass.ast.loc.end.line;
        if (isOneLineClass) {
            const match = phpClass.ast.loc.source.match(/(.*)\}/);
            const newPropertyText = utils_1.escapeForSnippet(match[1]) + "\n" + utils_1.indentText(propertyStatementText, 1) + "\n" + '}';
            newDocumentText = newDocumentText.replace(utils_1.escapeForSnippet(phpClass.ast.loc.source), newPropertyText);
        }
        else {
            const classBodyLine = document.lineAt(phpClass.ast.loc.start.line - 1);
            const classText = utils_1.escapeForSnippet(phpClass.ast.loc.source);
            const newPropertyText = classText.replace(/{(?:\s|[\r\n]|\s)*}/, "{\n" + utils_1.indentText(propertyStatementText, utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(classBodyLine.text)) + 1)) + "\n}";
            newDocumentText = newDocumentText.replace(classText, newPropertyText);
        }
    }
    return newDocumentText;
}
exports.default = addPropertyStatement;
//# sourceMappingURL=addPropertyStatement.js.map