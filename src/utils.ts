import * as vscode from 'vscode';

export function getVisibilityChoice(defaultValue: string): string {
	let visibilityChoices = ['public', 'protected', 'private'];
	if (visibilityChoices.indexOf(defaultValue) !== -1) {
		visibilityChoices.splice(visibilityChoices.indexOf(defaultValue), 1);
	}
	return `|${[defaultValue, ...visibilityChoices].join(',')}|`;
}

export function breakConstructorIntoMultiline(text: string): string {
	if (config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.enabled') !== true) {
		return text;
	}

	const regex = /(.*__construct\s*)\(((?:\s|\S)*?)(?=\))\s*\)\s*{/;
	const match = regex.exec(text);

	if (match) {
		const constructorLineText = match[0];
		const maxLineLength = config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.maxLineLength') as Number;

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
