"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const addPropertyStatement_1 = require("./addPropertyStatement");
const utils_1 = require("./utils");
function insertProperty(editor, property, phpClass, anchorText) {
    var _a, _b, _c, _d;
    let tabStops = {
        propertyDocblockType: 1,
        propertyDocblockImport: 2,
        propertyVisibility: 3,
        constructorDocblockType: 4,
        constructorDocblockImport: 5,
        constructorDocblockDescription: 6,
        constructorVisibility: 7,
        constructorParameterType: 8,
        constructorParameterStop: 9
    };
    const document = editor.document;
    const phpClassRange = new vscode.Range(new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column), new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column));
    let newDocumentText = addPropertyStatement_1.default(document, phpClass, property, tabStops);
    if (!phpClass.getConstructor()) {
        let snippet = "\n\n";
        if (utils_1.config('phpAddProperty.constructor.docblock.enable') === true) {
            snippet += utils_1.indentText("/**\n")
                + utils_1.indentText(" * Constructor.\n")
                + utils_1.indentText(`${property.getConstructorParamDocblockText(tabStops)}\n`)
                + utils_1.indentText(" */\n");
        }
        const visibility = utils_1.config('phpAddProperty.constructor.visibility.default');
        let constructorText = utils_1.indentText(utils_1.config('phpAddProperty.constructor.visibility.choose') === true
            ? `\${${tabStops.constructorVisibility}${utils_1.getVisibilityChoice(visibility)}} `
            : `${visibility} `);
        const parameterText = property.getParameterText(tabStops);
        constructorText += `function __construct(${parameterText})\n`
            + utils_1.indentText('{\n')
            + utils_1.indentText(`\\$this->${property.getName()} = \\$${property.getName()};\$0\n`, 2)
            + utils_1.indentText('}');
        snippet += constructorText;
        const searchText = utils_1.escapeForSnippet(anchorText);
        newDocumentText = newDocumentText.replace(searchText, `${searchText}${snippet}`);
    }
    else {
        const constructor = (_a = phpClass.getConstructor()) === null || _a === void 0 ? void 0 : _a.ast;
        let docblock;
        for (let i = 0; i < ((_b = constructor.leadingComments) === null || _b === void 0 ? void 0 : _b.length); i++) {
            const node = constructor.leadingComments[i];
            if (node.kind === 'commentblock') {
                docblock = node;
                break;
            }
        }
        if (docblock) {
            const paramRegex = /@param(?:\s+\S+)?\s+\$(\S+).*/g;
            let paramExists = false;
            let lastParamText;
            let paramMatch;
            while (paramMatch = paramRegex.exec(docblock.value)) {
                lastParamText = paramMatch[0];
                if (paramMatch[1] === property.getName()) {
                    paramExists = true;
                    break;
                }
            }
            if (!paramExists) {
                if (lastParamText) {
                    const docblockClosingLine = editor.document.lineAt(docblock.loc.start.line - 1);
                    newDocumentText = newDocumentText.replace(utils_1.escapeForSnippet(lastParamText), utils_1.escapeForSnippet(lastParamText) + "\n" + utils_1.indentText(property.getConstructorParamDocblockText(tabStops), utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(docblockClosingLine.text))));
                }
            }
        }
        let argumentExists = false;
        for (let i = 0; i < constructor.arguments.length; i++) {
            const node = constructor.arguments[i];
            if (((_c = node.name) === null || _c === void 0 ? void 0 : _c.name) == property.getName()) {
                argumentExists = true;
                break;
            }
        }
        if (!argumentExists) {
            const constructorMethodText = constructor.loc.source;
            const constructorHasArgs = constructor.arguments.length > 0;
            let newConstructorMethodText = '';
            const isMultiLineConstructor = (/\(\r\n|\r|\n/.test(constructorMethodText)); //constructor.loc.start.line !== constructor.loc.end.line;
            const argumentText = property.getParameterText(tabStops);
            if (constructorHasArgs) {
                const lastArg = constructor.arguments[constructor.arguments.length - 1];
                const lastArgLine = document.lineAt(lastArg.loc.end.line - 1);
                let newArg = utils_1.escapeForSnippet(`${lastArg.loc.source}`);
                if (isMultiLineConstructor) {
                    newArg += ",\n" + utils_1.indentText(argumentText, utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(lastArgLine.text)));
                }
                else {
                    newArg += `, ${argumentText}`;
                }
                newConstructorMethodText = utils_1.escapeForSnippet(constructorMethodText).replace(utils_1.escapeForSnippet(lastArg.loc.source), newArg);
            }
            else {
                const argsParenthesis = /\(\)/;
                newConstructorMethodText = constructorMethodText.replace(argsParenthesis, `(${argumentText})`);
            }
            newDocumentText = newDocumentText.replace(utils_1.escapeForSnippet(constructorMethodText), newConstructorMethodText);
        }
        let assignationExists = false;
        for (let i = 0; i < ((_d = constructor.body) === null || _d === void 0 ? void 0 : _d.children.length); i++) {
            const node = constructor.body.children[i];
            if (node.kind === 'expressionstatement'
                && node.expression.kind === 'assign'
                && node.expression.left.kind === 'propertylookup'
                && node.expression.left.offset.name === property.getName()) {
                assignationExists = true;
                break;
            }
        }
        if (!assignationExists) {
            const constructorBodyText = constructor.body.loc.source;
            const constructorBodyLine = document.lineAt(constructor.body.loc.start.line - 1);
            const constructorBodyIsEmpty = constructor.body.children.length === 0;
            let newConstructorBodyText = '';
            if (constructorBodyIsEmpty) {
                const indentationLevel = utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(constructorBodyLine.text));
                newConstructorBodyText = "{\n" + utils_1.indentText(`\\$this->${property.getName()} = \\$${property.getName()};\$0\n`, indentationLevel + 1) + utils_1.indentText("}", indentationLevel);
            }
            else {
                const lastChildren = constructor.body.children[constructor.body.children.length - 1];
                const lastChildrenText = lastChildren.loc.source;
                const lastChildrenLine = document.lineAt(lastChildren.loc.end.line - 1);
                const indentationLevel = utils_1.calculateIndentationLevel(utils_1.getLineFirstNonIndentationCharacterIndex(lastChildrenLine.text));
                newConstructorBodyText = utils_1.escapeForSnippet(constructorBodyText).replace(utils_1.escapeForSnippet(lastChildrenText), utils_1.escapeForSnippet(lastChildrenText) + "\n" + utils_1.indentText(`\\$this->${property.getName()} = \\$${property.getName()};\$0`, indentationLevel));
            }
            newDocumentText = newDocumentText.replace(utils_1.escapeForSnippet(constructorBodyText), newConstructorBodyText);
        }
    }
    newDocumentText = utils_1.breakConstructorIntoMultiline(newDocumentText);
    if (newDocumentText === utils_1.escapeForSnippet(document.getText(phpClassRange))) {
        return;
    }
    utils_1.replaceWithSnippet(newDocumentText, phpClassRange);
}
exports.default = insertProperty;
//# sourceMappingURL=insertProperty.js.map