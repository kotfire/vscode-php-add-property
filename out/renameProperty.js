"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function renameProperty(editor, property, newProperty, phpClass) {
    var _a, _b, _c, _d, _e;
    const document = editor.document;
    const phpClassRange = new vscode.Range(new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column), new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column));
    let newDocumentText = document.getText(phpClassRange);
    const astClassBody = phpClass.ast.body;
    for (let i = 0; i < astClassBody.length; i++) {
        const node = astClassBody[i];
        if (node.kind === 'propertystatement') {
            for (let j = 0; j < node.properties.length; j++) {
                const propertyNode = node.properties[j];
                if (((_a = propertyNode.name) === null || _a === void 0 ? void 0 : _a.name) === property.getName()) {
                    const propertyStatementRange = new vscode.Range(new vscode.Position(node.loc.start.line - 1, 0), new vscode.Position(node.loc.end.line, 0));
                    const propertyStatementText = document.getText(propertyStatementRange);
                    const newPropertyStatementText = propertyStatementText.replace(property.getName(), newProperty.getName());
                    newDocumentText = newDocumentText.replace(propertyStatementText, newPropertyStatementText);
                    break;
                }
            }
        }
    }
    const constructor = phpClass.getConstructor();
    if (constructor) {
        if (constructor.ast.arguments.length == 1) {
            const node = constructor.ast.arguments[0];
            if (((_b = node.name) === null || _b === void 0 ? void 0 : _b.name) == property.getName()) {
                const constructorText = constructor.ast.loc.source;
                const newConstructorText = constructorText.replace(`\$${property.getName()}`, `\$${newProperty.getName()}`);
                newDocumentText = newDocumentText.replace(constructorText, newConstructorText);
            }
        }
        else {
            for (let i = 0; i < constructor.ast.arguments.length; i++) {
                const node = constructor.ast.arguments[i];
                if (((_c = node.name) === null || _c === void 0 ? void 0 : _c.name) == property.getName()) {
                    const constructorText = constructor.ast.loc.source;
                    const newConstructorText = constructorText.replace(`\$${property.getName()},`, `\$${newProperty.getName()},`);
                    newDocumentText = newDocumentText.replace(constructorText, newConstructorText);
                    break;
                }
            }
        }
        for (let i = 0; i < ((_d = constructor.ast.body) === null || _d === void 0 ? void 0 : _d.children.length); i++) {
            const node = constructor.ast.body.children[i];
            if (node.kind === 'expressionstatement'
                && node.expression.kind === 'assign'
                && node.expression.left.kind === 'propertylookup'
                && node.expression.left.offset.name === property.getName()) {
                const propertyAssignmentRange = new vscode.Range(new vscode.Position(node.loc.start.line - 1, 0), new vscode.Position(node.loc.end.line, 0));
                const propertyAssignmentText = document.getText(propertyAssignmentRange);
                let newPropertyAssignmentText = propertyAssignmentText.replace(property.getName(), newProperty.getName());
                if (node.expression.right.kind === 'variable' && node.expression.right.name === property.getName()) {
                    newPropertyAssignmentText = newPropertyAssignmentText.replace(`\$${property.getName()}`, `\$${newProperty.getName()}`);
                }
                newDocumentText = newDocumentText.replace(propertyAssignmentText, newPropertyAssignmentText);
                break;
            }
        }
    }
    const propertyReferences = findPropertyReferences(phpClass.ast, property.getName());
    for (let i = 0; i < propertyReferences.length; i++) {
        const node = propertyReferences[i];
        const propertyReferenceRange = new vscode.Range(new vscode.Position(node.loc.start.line - 1, 0), new vscode.Position(node.loc.end.line, 0));
        const propertyReferenceText = document.getText(propertyReferenceRange);
        const newPropertyReferenceText = propertyReferenceText.replace(`this->${property.getName()}`, `this->${newProperty.getName()}`);
        newDocumentText = newDocumentText.replace(propertyReferenceText, newPropertyReferenceText);
    }
    if (newDocumentText === document.getText(phpClassRange)) {
        return;
    }
    (_e = vscode.window.activeTextEditor) === null || _e === void 0 ? void 0 : _e.edit(editBuilder => {
        editBuilder.replace(phpClassRange, newDocumentText);
    }, {
        undoStopBefore: true,
        undoStopAfter: false
    });
}
exports.renameProperty = renameProperty;
function findPropertyReferences(ast, name) {
    var _a;
    let propertyReferences = [];
    if (Array.isArray(ast)) {
        for (var i = 0; i < ast.length; i++) {
            const newPropertyReferences = findPropertyReferences(ast[i], name);
            for (let i = 0; i < newPropertyReferences.length; i++) {
                propertyReferences.push(newPropertyReferences[i]);
            }
        }
    }
    else {
        if ((ast === null || ast === void 0 ? void 0 : ast.kind) === 'propertylookup' && ((_a = ast.offset) === null || _a === void 0 ? void 0 : _a.name) === name) {
            return [ast];
        }
        for (const node in ast) {
            if (ast.hasOwnProperty(node) && ast[node] !== ast) {
                const newPropertyReferences = findPropertyReferences(ast[node], name);
                for (let i = 0; i < newPropertyReferences.length; i++) {
                    propertyReferences.push(newPropertyReferences[i]);
                }
            }
        }
    }
    return propertyReferences;
}
//# sourceMappingURL=renameProperty.js.map