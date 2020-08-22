"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
function changePropertyType(editor, property, newPropertyType, phpClass) {
    var _a, _b, _c, _d;
    const document = editor.document;
    const phpClassRange = new vscode.Range(new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column), new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column));
    let newDocumentText = document.getText(phpClassRange);
    const astClassBody = phpClass.ast.body;
    for (let i = 0; i < astClassBody.length; i++) {
        const node = astClassBody[i];
        if (node.kind === 'propertystatement') {
            let newPropertyStatementText;
            for (let j = 0; j < node.properties.length; j++) {
                const propertyNode = node.properties[j];
                if (((_a = propertyNode.name) === null || _a === void 0 ? void 0 : _a.name) == property.getName()) {
                    const propertyStatementRange = new vscode.Range(new vscode.Position(node.loc.start.line - 1, 0), new vscode.Position(node.loc.end.line, 0));
                    const propertyStatementText = document.getText(propertyStatementRange);
                    let newPropertyText = `\$${property.getName()}`;
                    if (utils_1.config('phpAddProperty.property.types') === true || propertyNode.type) {
                        newPropertyText = `${newPropertyType} ${newPropertyText}`;
                    }
                    newPropertyStatementText = propertyStatementText.replace(propertyNode.loc.source, newPropertyText);
                    newDocumentText = newDocumentText.replace(propertyStatementText, newPropertyStatementText);
                }
            }
            if (newPropertyStatementText) {
                for (let i = 0; i < ((_b = node.leadingComments) === null || _b === void 0 ? void 0 : _b.length); i++) {
                    const commentNode = node.leadingComments[i];
                    const commentRange = new vscode.Range(new vscode.Position(commentNode.loc.start.line - 1, 0), new vscode.Position(commentNode.loc.end.line, 0));
                    const commentText = document.getText(commentRange);
                    const typeMatch = /@var\s(\S*)/g.exec(commentText);
                    if (typeMatch) {
                        const newCommentText = commentText.replace(typeMatch[1], newPropertyType);
                        const regexp = new RegExp(`${utils_1.escapeForRegExp(commentText)}((?:\s|[\r\n])*)${utils_1.escapeForRegExp(newPropertyStatementText)}`);
                        newDocumentText = newDocumentText.replace(regexp, `${newCommentText}$1${newPropertyStatementText}`);
                    }
                }
                break;
            }
        }
    }
    const constructor = phpClass.getConstructor();
    if (constructor) {
        for (let i = 0; i < constructor.ast.arguments.length; i++) {
            const node = constructor.ast.arguments[i];
            if (((_c = node.name) === null || _c === void 0 ? void 0 : _c.name) == property.getName()) {
                const constructorText = constructor.ast.loc.source;
                const newConstructorText = constructorText.replace(node.loc.source, `${newPropertyType} \$${property.getName()}`);
                newDocumentText = newDocumentText.replace(constructorText, newConstructorText);
                break;
            }
        }
    }
    if (newDocumentText === document.getText(phpClassRange)) {
        return;
    }
    (_d = vscode.window.activeTextEditor) === null || _d === void 0 ? void 0 : _d.edit(editBuilder => {
        editBuilder.replace(phpClassRange, newDocumentText);
    }, {
        undoStopBefore: true,
        undoStopAfter: false
    });
}
exports.changePropertyType = changePropertyType;
//# sourceMappingURL=changePropertyType.js.map