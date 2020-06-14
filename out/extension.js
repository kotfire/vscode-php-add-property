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
        insertProperty(vscode.window.activeTextEditor, property, phpClass, `${property.getName()};`);
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
        insertProperty(vscode.window.activeTextEditor, property, phpClass, line.text);
    })));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function calculateIndentationLevel(index) {
    return Math.floor(index / configUsingResource('editor.tabSize'));
}
function getLineFirstNonIndentationCharacterIndex(lineText) {
    const tabSize = configUsingResource('editor.tabSize');
    let index = 0;
    for (let i = 0; i < lineText.length; i++) {
        const char = lineText[i];
        if (/[^\s\t]/.test(char)) {
            index++;
            break;
        }
        index += char === "\t" ? tabSize : 1;
    }
    return index;
}
function indentText(text, level = 1) {
    /**
     * Good to have
     * Listen for view options changes and use these values
     * https://github.com/jedmao/tabsanity-vs/blob/faa41a99ccb47c8e7717edfcbdfba4c093e670fe/TabSanity/TabOptionsListener.cs
     */
    let tab = "\t";
    if (configUsingResource('editor.insertSpaces')) {
        const tabSize = configUsingResource('editor.tabSize');
        tab = ' '.repeat(tabSize);
    }
    return tab.repeat(level) + text;
}
function configUsingResource(key) {
    var _a;
    const parts = key.split(/\.(.+)/, 2);
    const configuration = vscode.workspace.getConfiguration(parts[0], (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri);
    return parts[1] ? configuration.get(parts[1]) : configuration;
}
function config(key) {
    return vscode.workspace.getConfiguration().get(key);
}
function escapeForRegExp(text) {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}
function escapeForSnippet(text) {
    return text.replace(/(?<!\\)\$/g, '\\$');
}
function replaceWithSnippet(snippet, range) {
    var _a;
    const rangeLines = range.end.line - range.start.line;
    (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.edit(editBuilder => {
        editBuilder.replace(range, "\n".repeat(rangeLines));
    }, {
        undoStopBefore: true,
        undoStopAfter: false
    }).then(() => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.insertSnippet(new vscode.SnippetString(snippet), range, {
                undoStopBefore: false,
                undoStopAfter: false,
            });
        }
    });
}
function addPropertyStatement(document, phpClass, property, tabStops) {
    var _a;
    const phpClassRange = new vscode.Range(new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column), new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column));
    let newDocumentText = escapeForSnippet(document.getText(phpClassRange));
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
    const propertyStatementText = getPropertyStatementText(property, tabStops);
    if (lastProperty) {
        const lastPropertyLine = document.lineAt(lastProperty.loc.start.line - 1);
        const newPropertyText = escapeForSnippet(`${lastPropertyLine.text}`) + "\n\n" + indentText(propertyStatementText, calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(lastPropertyLine.text)));
        newDocumentText = newDocumentText.replace(escapeForSnippet(lastPropertyLine.text), newPropertyText);
    }
    else if (firstMethod) {
        const firstMethodLine = document.lineAt(firstMethod.loc.start.line - 1);
        const newPropertyText = indentText(propertyStatementText, calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(firstMethodLine.text))) + "\n\n" + escapeForSnippet(firstMethodLine.text);
        newDocumentText = newDocumentText.replace(escapeForSnippet(firstMethodLine.text), newPropertyText);
    }
    else if (lastNode) {
        const lastNodeLine = document.lineAt(lastNode.loc.start.line - 1);
        const newPropertyText = escapeForSnippet(lastNodeLine.text) + "\n\n" + indentText(propertyStatementText, calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(lastNodeLine.text)));
        newDocumentText = newDocumentText.replace(escapeForSnippet(lastNodeLine.text), newPropertyText);
    }
    else {
        const isOneLineClass = phpClass.ast.loc.start.line === phpClass.ast.loc.end.line;
        if (isOneLineClass) {
            const match = phpClass.ast.loc.source.match(/(.*)\}/);
            const newPropertyText = escapeForSnippet(match[1]) + "\n" + indentText(propertyStatementText, 1) + "\n" + '}';
            newDocumentText = newDocumentText.replace(escapeForSnippet(phpClass.ast.loc.source), newPropertyText);
        }
        else {
            const classBodyLine = document.lineAt(phpClass.ast.loc.start.line - 1);
            const classText = escapeForSnippet(phpClass.ast.loc.source);
            const newPropertyText = classText.replace(/{(?:\s|[\r\n]|\s)*}/, "{\n" + indentText(propertyStatementText, calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(classBodyLine.text)) + 1)) + "\n}";
            newDocumentText = newDocumentText.replace(classText, newPropertyText);
        }
    }
    return newDocumentText;
}
function getPropertyStatementText(property, tabStops) {
    let docblockTypeStop = tabStops.propertyDocblockType;
    let dockblockImportStop = tabStops.propertyDocblockImport;
    if (config('phpAddProperty.property.docblock.withParameter') === true) {
        docblockTypeStop = tabStops.constructorParameterType;
        dockblockImportStop = tabStops.constructorParameterStop;
        tabStops.constructorParameterStop++;
    }
    let propertyStatementText = '';
    if (config('phpAddProperty.property.docblock.add') === true) {
        let stopText = '';
        if (config('phpAddProperty.property.docblock.stopToImport') === true) {
            stopText += `$${dockblockImportStop}`;
        }
        stopText += `$${docblockTypeStop}`;
        if (config('phpAddProperty.property.docblock.multiline') === true) {
            propertyStatementText += `/**\n${indentText(' * @var ')}${stopText}\n${indentText(' */')}\n${indentText('')}`;
        }
        else {
            if (config('phpAddProperty.property.docblock.withParameter') === false) {
                stopText += ' ';
            }
            propertyStatementText += `/** @var ${stopText}*/\n${indentText('')}`;
        }
    }
    const visibility = config('phpAddProperty.property.visibility.default');
    propertyStatementText += config('phpAddProperty.property.visibility.choose') === true
        ? `\${${tabStops.propertyVisibility}${getVisibilityChoice(visibility)}} `
        : `${visibility} `;
    if (config('phpAddProperty.property.types') === true) {
        propertyStatementText += `$${tabStops.constructorParameterType}`;
    }
    propertyStatementText += `\\$${property.getName()};`;
    return propertyStatementText;
}
function getVisibilityChoice(defaultValue) {
    let visibilityChoices = ['public', 'protected', 'private'];
    if (visibilityChoices.indexOf(defaultValue) !== -1) {
        visibilityChoices.splice(visibilityChoices.indexOf(defaultValue), 1);
    }
    return `|${[defaultValue, ...visibilityChoices].join(',')}|`;
}
function getParameterText(property, tabStops) {
    let tabStopsText = `$${tabStops.constructorParameterType}`;
    if (property.getType()) {
        tabStopsText = `\${${tabStops.constructorParameterType}:${property.getType()}}`;
    }
    if (config('phpAddProperty.property.stopToImport') === true) {
        tabStopsText += `$${tabStops.constructorParameterStop}`;
    }
    let parameterText = `${tabStopsText}`;
    if (property.getType()) {
        parameterText += ' ';
    }
    parameterText += `\\$${property.getName()}`;
    return parameterText;
}
function getConstructorParamDocblockText(property, tabStops) {
    let docblockTypeStop = tabStops.constructorDocblockType;
    let dockblockImportStop = tabStops.constructorDocblockImport;
    if (config('phpAddProperty.constructor.docblock.withParameter') === true) {
        docblockTypeStop = tabStops.constructorParameterType;
        dockblockImportStop = tabStops.constructorParameterStop;
        tabStops.constructorParameterStop++;
    }
    let constructorParamDocblockText = `\${${docblockTypeStop}}`;
    if (property.getType()) {
        constructorParamDocblockText = `\${${docblockTypeStop}:${property.getType()} }`;
    }
    if (config('phpAddProperty.constructor.docblock.stopToImport') === true) {
        constructorParamDocblockText += `\$${dockblockImportStop}`;
    }
    constructorParamDocblockText += `\\$${property.getName()}`;
    if (config('phpAddProperty.constructor.docblock.stopForDescription') === true) {
        constructorParamDocblockText += `\$${tabStops.constructorDocblockDescription}`;
    }
    return ` * @param ${constructorParamDocblockText}`;
}
function breakConstructorIntoMultiline(text) {
    if (config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.enabled') !== true) {
        return text;
    }
    const regex = /(.*__construct\s*)\(((?:\s|\S)*?)(?=\))\s*\)\s*{/;
    const match = regex.exec(text);
    if (match) {
        const constructorLineText = match[0];
        const maxLineLength = config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.maxLineLength');
        if (constructorLineText.length > maxLineLength) {
            const parametersText = match[2];
            const parameters = parametersText.split(',').map(parameter => indentText(parameter.trim(), 2));
            const multilineConstructorText = match[1]
                + '(\n'
                + `${parameters.join(',\n')}\n`
                + indentText(') {');
            text = text.replace(match[0], multilineConstructorText);
        }
    }
    return text;
}
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
    let newDocumentText = addPropertyStatement(document, phpClass, property, tabStops);
    if (!phpClass.getConstructor()) {
        let snippet = "\n\n";
        if (config('phpAddProperty.constructor.docblock.enable') === true) {
            snippet += indentText("/**\n")
                + indentText(" * Constructor.\n")
                + indentText(`${getConstructorParamDocblockText(property, tabStops)}\n`)
                + indentText(" */\n");
        }
        const visibility = config('phpAddProperty.constructor.visibility.default');
        let constructorText = indentText(config('phpAddProperty.constructor.visibility.choose') === true
            ? `\${${tabStops.constructorVisibility}${getVisibilityChoice(visibility)}} `
            : `${visibility} `);
        const parameterText = getParameterText(property, tabStops);
        constructorText += `function __construct(${parameterText})\n`
            + indentText('{\n')
            + indentText(`\\$this->${property.getName()} = \\$${property.getName()};\$0\n`, 2)
            + indentText('}');
        snippet += constructorText;
        const searchText = escapeForSnippet(anchorText);
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
                    newDocumentText = newDocumentText.replace(escapeForSnippet(lastParamText), escapeForSnippet(lastParamText) + "\n" + indentText(getConstructorParamDocblockText(property, tabStops), calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(docblockClosingLine.text))));
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
            const argumentText = getParameterText(property, tabStops);
            if (constructorHasArgs) {
                const lastArg = constructor.arguments[constructor.arguments.length - 1];
                const lastArgLine = document.lineAt(lastArg.loc.end.line - 1);
                let newArg = escapeForSnippet(`${lastArg.loc.source}`);
                if (isMultiLineConstructor) {
                    newArg += ",\n" + indentText(argumentText, calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(lastArgLine.text)));
                }
                else {
                    newArg += `, ${argumentText}`;
                }
                newConstructorMethodText = escapeForSnippet(constructorMethodText).replace(escapeForSnippet(lastArg.loc.source), newArg);
            }
            else {
                const argsParenthesis = /\(\)/;
                newConstructorMethodText = constructorMethodText.replace(argsParenthesis, `(${argumentText})`);
            }
            newDocumentText = newDocumentText.replace(escapeForSnippet(constructorMethodText), newConstructorMethodText);
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
                const indentationLevel = calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(constructorBodyLine.text));
                newConstructorBodyText = "{\n" + indentText(`\\$this->${property.getName()} = \\$${property.getName()};\$0\n`, indentationLevel + 1) + indentText("}", indentationLevel);
            }
            else {
                const lastChildren = constructor.body.children[constructor.body.children.length - 1];
                const lastChildrenText = lastChildren.loc.source;
                const lastChildrenLine = document.lineAt(lastChildren.loc.end.line - 1);
                const indentationLevel = calculateIndentationLevel(getLineFirstNonIndentationCharacterIndex(lastChildrenLine.text));
                newConstructorBodyText = escapeForSnippet(constructorBodyText).replace(escapeForSnippet(lastChildrenText), escapeForSnippet(lastChildrenText) + "\n" + indentText(`\\$this->${property.getName()} = \\$${property.getName()};\$0`, indentationLevel));
            }
            newDocumentText = newDocumentText.replace(escapeForSnippet(constructorBodyText), newConstructorBodyText);
        }
    }
    newDocumentText = breakConstructorIntoMultiline(newDocumentText);
    if (newDocumentText === escapeForSnippet(document.getText(phpClassRange))) {
        return;
    }
    replaceWithSnippet(newDocumentText, phpClassRange);
}
//# sourceMappingURL=extension.js.map