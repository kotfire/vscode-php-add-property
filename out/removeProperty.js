"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils_1 = require("./utils");
function removeProperty(editor, property, phpClass) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
                    if (node.properties.length === 1) {
                        let nextNotEmptyLine = node.loc.end.line;
                        if (i + 1 < astClassBody.length) {
                            const nextNode = astClassBody[i + 1];
                            const startLine = nextNode.leadingComments
                                ? nextNode.leadingComments[0].loc.start.line
                                : nextNode.loc.start.line;
                            nextNotEmptyLine = startLine - 1;
                        }
                        const propertyStatementRange = new vscode.Range(new vscode.Position(node.loc.start.line - 1, 0), new vscode.Position(nextNotEmptyLine, 0));
                        const propertyStatementText = document.getText(propertyStatementRange);
                        newDocumentText = newDocumentText.replace(propertyStatementText, '');
                    }
                    else {
                        const regexp = new RegExp(`(,\\s*(?!.*,))?${utils_1.escapeForRegExp(propertyNode.loc.source)}(\\s*,\\s*)?`);
                        newDocumentText = newDocumentText.replace(regexp, '');
                    }
                    for (let i = 0; i < ((_b = node.leadingComments) === null || _b === void 0 ? void 0 : _b.length); i++) {
                        const commentNode = node.leadingComments[i];
                        const commentRange = new vscode.Range(new vscode.Position(commentNode.loc.start.line - 1, 0), new vscode.Position(commentNode.loc.end.line, 0));
                        const commentText = document.getText(commentRange);
                        newDocumentText = newDocumentText.replace(commentText, '');
                    }
                    break;
                }
            }
        }
    }
    const constructor = phpClass.getConstructor();
    if (constructor) {
        if (((_c = constructor.ast.body) === null || _c === void 0 ? void 0 : _c.children.length) <= 1) {
            const node = constructor.ast.arguments[0];
            if (constructor.ast.body.children.length == 0 || ((_d = node.name) === null || _d === void 0 ? void 0 : _d.name) == property.getName()) {
                const constructorRange = new vscode.Range(new vscode.Position(constructor.ast.loc.start.line - 1, 0), new vscode.Position(constructor.ast.loc.end.line, 0));
                const constructorText = document.getText(constructorRange);
                newDocumentText = newDocumentText.replace(constructorText, '');
                for (let i = 0; i < ((_e = constructor.ast.leadingComments) === null || _e === void 0 ? void 0 : _e.length); i++) {
                    const commentNode = constructor.ast.leadingComments[i];
                    const commentRange = new vscode.Range(new vscode.Position(commentNode.loc.start.line - 1, 0), new vscode.Position(commentNode.loc.end.line, 0));
                    const commentText = document.getText(commentRange);
                    newDocumentText = newDocumentText.replace(commentText, '');
                }
            }
        }
        else {
            for (let i = 0; i < constructor.ast.arguments.length; i++) {
                const node = constructor.ast.arguments[i];
                if (((_f = node.name) === null || _f === void 0 ? void 0 : _f.name) == property.getName()) {
                    const constructorText = constructor.ast.loc.source;
                    const regexp = new RegExp(`(,\\s*(?!.*,))?${utils_1.escapeForRegExp(node.loc.source)}(\\s*,\\s*)?`);
                    const newConstructorText = constructorText.replace(regexp, '');
                    newDocumentText = newDocumentText.replace(constructorText, newConstructorText);
                    break;
                }
            }
            for (let i = 0; i < ((_g = constructor.ast.body) === null || _g === void 0 ? void 0 : _g.children.length); i++) {
                const node = constructor.ast.body.children[i];
                if (node.kind === 'expressionstatement'
                    && node.expression.kind === 'assign'
                    && node.expression.left.kind === 'propertylookup'
                    && node.expression.left.offset.name === property.getName()) {
                    const propertyAssignmentRange = new vscode.Range(new vscode.Position(node.loc.start.line - 1, 0), new vscode.Position(node.loc.end.line, 0));
                    const propertyAssignmentText = document.getText(propertyAssignmentRange);
                    newDocumentText = newDocumentText.replace(propertyAssignmentText, '');
                    break;
                }
            }
            for (let i = 0; i < ((_h = constructor.ast.leadingComments) === null || _h === void 0 ? void 0 : _h.length); i++) {
                const commentNode = constructor.ast.leadingComments[i];
                const commentRange = new vscode.Range(new vscode.Position(commentNode.loc.start.line - 1, 0), new vscode.Position(commentNode.loc.end.line, 0));
                const commentText = document.getText(commentRange);
                const regexp = new RegExp(`.*\\*.*\\$${property.getName()}\\s*[\r\n]+`);
                const newCommentText = commentText.replace(regexp, '');
                newDocumentText = newDocumentText.replace(commentText, newCommentText);
            }
        }
    }
    if (newDocumentText === document.getText(phpClassRange)) {
        return;
    }
    (_j = vscode.window.activeTextEditor) === null || _j === void 0 ? void 0 : _j.edit(editBuilder => {
        editBuilder.replace(phpClassRange, newDocumentText);
    }, {
        undoStopBefore: true,
        undoStopAfter: false
    });
}
exports.removeProperty = removeProperty;
//# sourceMappingURL=removeProperty.js.map