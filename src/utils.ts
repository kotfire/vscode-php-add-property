import * as vscode from 'vscode';
import PhpEngine from 'php-parser';
import { debugEnvName } from './constants';

export function getVisibilityChoice(defaultValue: string): string {
    let visibilityChoices = ['public', 'protected', 'private'];
    if (visibilityChoices.indexOf(defaultValue) !== -1) {
        visibilityChoices.splice(visibilityChoices.indexOf(defaultValue), 1);
    }
    return `|${[defaultValue, ...visibilityChoices].join(',')}|`;
}

function extractConstructorParts(text: string): RegExpExecArray | null {
    const regex = /(.*__construct\s*)\(((?:\s|\S)*?)(?=\))\s*\)\s*{/;
    const match = regex.exec(text);

    return match;
}

function getMultilineConstructorText(text: string, functionDefinition: string, parametersText: string) {
    const parameters = parametersText.split(',').map(parameter => indentText(parameter.trim(), 2));

    const multilineConstructorText = functionDefinition
        + '(\n'
        + `${parameters.join(',\n')}\n`
        + indentText(') {');

    return text.replace(text, multilineConstructorText);
}

export function breakConstructorIntoMultiline(text: string): string {
    if (config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.enabled') !== true) {
        return text;
    }

    const match = extractConstructorParts(text);

    if (!match) {
        return text;
    }

    const constructorLineText = match[0];
    const maxLineLength = config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.maxLineLength') as Number;

    if (constructorLineText.length <= maxLineLength) {
        return text;
    }

    return text.replace(constructorLineText, getMultilineConstructorText(constructorLineText, match[1], match[2]));
}

export function forceBreakConstructorIntoMultiline(text: string): string {
    const match = extractConstructorParts(text);

    if (!match) {
        return text;
    }

    return text.replace(match[0], getMultilineConstructorText(match[0], match[1], match[2]));
}

export function getPropertyNameFromLineText(
    lineText: string,
    document: vscode.TextDocument,
    phpEngine: PhpEngine,
    cursorPosition: vscode.Position
): string|undefined {
    const paramRegex = /@param(?:\s+\S+)?\s+\$(\S+).*/;

    const matchParam = paramRegex.exec(lineText);

    if (matchParam) {
        return matchParam[1];
    } else {
        const lineAst = (phpEngine.parseEval(`class A { ${lineText} }`) as any);

        const selectedWord = document.getText(document.getWordRangeAtPosition(cursorPosition)).replace(/^\$/, '');
        
        if (lineAst.children[0]?.body[0]?.kind === 'propertystatement') {
            const properties = (lineAst.children[0].body[0].properties as any[]);

            const propertyAst = properties.find((propertyAst) => propertyAst.name?.name === selectedWord) ?? properties[0];
            let propertyName = propertyAst.name?.name;

            if (propertyName === 'this') {
                const assignmentAst = (phpEngine.parseEval(`class A { public function __construct() { ${lineText} } }`) as any);

                if (assignmentAst.children[0]?.body[0]?.body?.children[0]?.kind === 'expressionstatement') {
                    propertyName = assignmentAst.children[0].body[0].body.children[0].expression.right?.name;
                }
            }

            return propertyName;
        } else if (lineAst.children[0]?.body[0]?.kind === 'method') {
            const constructorArgs = (lineAst.children[0].body[0].arguments as any[]);

            const argumentAst = constructorArgs.find((propertyAst) => propertyAst.name?.name === selectedWord) ?? constructorArgs[0];
            return argumentAst.name?.name;
        }
    }
}

export function calculateIndentationLevel(index: number): number {
    return Math.floor(index / configUsingResource('editor.tabSize'));
}

export function getLineFirstNonIndentationCharacterIndex(lineText: string): number {
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

export function indentText(text: string, level: number = 1) {
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

export function configUsingResource(key: string): any {
    const parts = key.split(/\.(.+)/, 2);
    const configuration = vscode.workspace.getConfiguration(
        parts[0],
        vscode.window.activeTextEditor?.document.uri
    );

    return parts[1] ? configuration.get(parts[1]) : configuration;
}

export function config(key: string) {
    return vscode.workspace.getConfiguration().get(key);
}

export function escapeForRegExp(text: string): string {
    return text.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

export function escapeForSnippet(text: string): string {
    return text.replace(/(?<!\\)\$/g, '\\$');
}

export function replaceWithSnippet(snippet: string, range: vscode.Range) {
    const rangeLines = range.end.line - range.start.line;

    vscode.window.activeTextEditor?.edit(
        editBuilder => {
            editBuilder.replace(range, "\n".repeat(rangeLines));
        },
        {
            undoStopBefore: true,
            undoStopAfter: false
        }
    ).then(() => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            editor.insertSnippet(
                new vscode.SnippetString(snippet),
                range,
                {
                    undoStopBefore: false,
                    undoStopAfter: false,
                }
            );
        }
    });
}

export function isDebugMode() {
    return process.env[debugEnvName] === "true";
}
