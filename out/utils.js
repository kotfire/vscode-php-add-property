"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function getVisibilityChoice(defaultValue) {
    let visibilityChoices = ['public', 'protected', 'private'];
    if (visibilityChoices.indexOf(defaultValue) !== -1) {
        visibilityChoices.splice(visibilityChoices.indexOf(defaultValue), 1);
    }
    return `|${[defaultValue, ...visibilityChoices].join(',')}|`;
}
exports.getVisibilityChoice = getVisibilityChoice;
function extractConstructorParts(text) {
    const regex = /(.*__construct\s*)\(((?:\s|\S)*?)(?=\))\s*\)\s*{/;
    const match = regex.exec(text);
    return match;
}
function getMultilineConstructorText(text, functionDefinition, parametersText) {
    const parameters = parametersText.split(',').map(parameter => indentText(parameter.trim(), 2));
    const multilineConstructorText = functionDefinition
        + '(\n'
        + `${parameters.join(',\n')}\n`
        + indentText(') {');
    return text.replace(text, multilineConstructorText);
}
function breakConstructorIntoMultiline(text) {
    if (config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.enabled') !== true) {
        return text;
    }
    const match = extractConstructorParts(text);
    if (!match) {
        return text;
    }
    const constructorLineText = match[0];
    const maxLineLength = config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.maxLineLength');
    if (constructorLineText.length <= maxLineLength) {
        return text;
    }
    return text.replace(constructorLineText, getMultilineConstructorText(constructorLineText, match[1], match[2]));
}
exports.breakConstructorIntoMultiline = breakConstructorIntoMultiline;
function forceBreakConstructorIntoMultiline(text) {
    const match = extractConstructorParts(text);
    if (!match) {
        return text;
    }
    return text.replace(match[0], getMultilineConstructorText(match[0], match[1], match[2]));
}
exports.forceBreakConstructorIntoMultiline = forceBreakConstructorIntoMultiline;
function getPropertyNameFromLineText(lineText, document, phpEngine, cursorPosition) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    const paramRegex = /@param(?:\s+\S+)?\s+\$(\S+).*/;
    const matchParam = paramRegex.exec(lineText);
    if (matchParam) {
        return matchParam[1];
    }
    else {
        const lineAst = phpEngine.parseEval(`class A { ${lineText} }`);
        const selectedWord = document.getText(document.getWordRangeAtPosition(cursorPosition)).replace(/^\$/, '');
        if (((_b = (_a = lineAst.children[0]) === null || _a === void 0 ? void 0 : _a.body[0]) === null || _b === void 0 ? void 0 : _b.kind) === 'propertystatement') {
            const properties = lineAst.children[0].body[0].properties;
            const propertyAst = (_c = properties.find((propertyAst) => { var _a; return ((_a = propertyAst.name) === null || _a === void 0 ? void 0 : _a.name) === selectedWord; })) !== null && _c !== void 0 ? _c : properties[0];
            let propertyName = (_d = propertyAst.name) === null || _d === void 0 ? void 0 : _d.name;
            if (propertyName === 'this') {
                const assignmentAst = phpEngine.parseEval(`class A { public function __construct() { ${lineText} } }`);
                if (((_h = (_g = (_f = (_e = assignmentAst.children[0]) === null || _e === void 0 ? void 0 : _e.body[0]) === null || _f === void 0 ? void 0 : _f.body) === null || _g === void 0 ? void 0 : _g.children[0]) === null || _h === void 0 ? void 0 : _h.kind) === 'expressionstatement') {
                    propertyName = (_j = assignmentAst.children[0].body[0].body.children[0].expression.right) === null || _j === void 0 ? void 0 : _j.name;
                }
            }
            return propertyName;
        }
        else if (((_l = (_k = lineAst.children[0]) === null || _k === void 0 ? void 0 : _k.body[0]) === null || _l === void 0 ? void 0 : _l.kind) === 'method') {
            const constructorArgs = lineAst.children[0].body[0].arguments;
            const argumentAst = (_m = constructorArgs.find((propertyAst) => { var _a; return ((_a = propertyAst.name) === null || _a === void 0 ? void 0 : _a.name) === selectedWord; })) !== null && _m !== void 0 ? _m : constructorArgs[0];
            return (_o = argumentAst.name) === null || _o === void 0 ? void 0 : _o.name;
        }
    }
}
exports.getPropertyNameFromLineText = getPropertyNameFromLineText;
function calculateIndentationLevel(index) {
    return Math.floor(index / configUsingResource('editor.tabSize'));
}
exports.calculateIndentationLevel = calculateIndentationLevel;
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
exports.getLineFirstNonIndentationCharacterIndex = getLineFirstNonIndentationCharacterIndex;
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
exports.indentText = indentText;
function configUsingResource(key) {
    var _a;
    const parts = key.split(/\.(.+)/, 2);
    const configuration = vscode.workspace.getConfiguration(parts[0], (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri);
    return parts[1] ? configuration.get(parts[1]) : configuration;
}
exports.configUsingResource = configUsingResource;
function config(key) {
    return vscode.workspace.getConfiguration().get(key);
}
exports.config = config;
function escapeForRegExp(text) {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}
exports.escapeForRegExp = escapeForRegExp;
function escapeForSnippet(text) {
    return text.replace(/(?<!\\)\$/g, '\\$');
}
exports.escapeForSnippet = escapeForSnippet;
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
exports.replaceWithSnippet = replaceWithSnippet;
//# sourceMappingURL=utils.js.map