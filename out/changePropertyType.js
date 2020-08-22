"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
function changePropertyType(editor, property, newPropertyType, phpClass) {
    var _a, _b, _c;
    const document = editor.document;
    const phpClassRange = new vscode.Range(new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column), new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column));
    let newDocumentText = document.getText(phpClassRange);
    const astClassBody = phpClass.ast.body;
    for (let i = 0; i < astClassBody.length; i++) {
        const node = astClassBody[i];
        if (node.kind === 'propertystatement') {
            for (let j = 0; j < node.properties.length; j++) {
                const propertyNode = node.properties[j];
                if (((_a = propertyNode.name) === null || _a === void 0 ? void 0 : _a.name) == property.getName()) {
                    const propertyStatementRange = new vscode.Range(new vscode.Position(node.loc.start.line - 1, 0), new vscode.Position(node.loc.end.line, 0));
                    const propertyStatementText = document.getText(propertyStatementRange);
                    let newPropertyText = `\$${property.getName()}`;
                    if (utils_1.config('phpAddProperty.property.types') === true || propertyNode.type) {
                        newPropertyText = `${newPropertyType} ${newPropertyText}`;
                    }
                    const newPropertyStatementText = propertyStatementText.replace(propertyNode.loc.source, newPropertyText);
                    newDocumentText = newDocumentText.replace(propertyStatementText, newPropertyStatementText);
                }
            }
        }
    }
    const constructor = phpClass.getConstructor();
    if (constructor) {
        for (let i = 0; i < constructor.ast.arguments.length; i++) {
            const node = constructor.ast.arguments[i];
            if (((_b = node.name) === null || _b === void 0 ? void 0 : _b.name) == property.getName()) {
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
    (_c = vscode.window.activeTextEditor) === null || _c === void 0 ? void 0 : _c.edit(editBuilder => {
        editBuilder.replace(phpClassRange, newDocumentText);
    }, {
        undoStopBefore: true,
        undoStopAfter: false
    });
}
exports.changePropertyType = changePropertyType;
//# sourceMappingURL=changePropertyType.js.map