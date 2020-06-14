import * as vscode from 'vscode';
import PhpClass from './class';
import Property from './property';
import addPropertyStatement from './addPropertyStatement';
import { config, indentText, getVisibilityChoice, escapeForSnippet, calculateIndentationLevel, getLineFirstNonIndentationCharacterIndex, breakConstructorIntoMultiline, replaceWithSnippet } from './utils';

export default function insertProperty(editor: vscode.TextEditor, property: Property, phpClass: PhpClass, anchorText: string) {
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
	const phpClassRange = new vscode.Range(
		new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column),
		new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column)
	);

	let newDocumentText = addPropertyStatement(document, phpClass, property, tabStops);

	if (!phpClass.getConstructor()) {
		let snippet = "\n\n";

		if (config('phpAddProperty.constructor.docblock.enable') === true) {
			snippet += indentText("/**\n")
				+ indentText(" * Constructor.\n")
				+ indentText(`${property.getConstructorParamDocblockText(tabStops)}\n`)
				+ indentText(" */\n")
		}

		const visibility = (config('phpAddProperty.constructor.visibility.default') as string);
		let constructorText = indentText(
			config('phpAddProperty.constructor.visibility.choose') === true
				? `\${${tabStops.constructorVisibility}${getVisibilityChoice(visibility)}} `
				: `${visibility} `
		);

		const parameterText = property.getParameterText(tabStops);

		constructorText += `function __construct(${parameterText})\n`
			+ indentText('{\n')
			+ indentText(`\\$this->${property.getName()} = \\$${property.getName()};\$0\n`, 2)
			+ indentText('}');

		snippet += constructorText;

		const searchText = escapeForSnippet(anchorText);

		newDocumentText = newDocumentText.replace(searchText, `${searchText}${snippet}`);
	} else {
		const constructor = phpClass.getConstructor()?.ast;

		let docblock;
		for (let i = 0; i < constructor.leadingComments?.length; i++) {
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

					newDocumentText = newDocumentText.replace(
						escapeForSnippet(lastParamText),
						escapeForSnippet(lastParamText) + "\n" + indentText(
							property.getConstructorParamDocblockText(tabStops),
							calculateIndentationLevel(
								getLineFirstNonIndentationCharacterIndex(docblockClosingLine.text)
							)
						)
					);
				}
			}
		}

		let argumentExists = false;
		for (let i = 0; i < constructor.arguments.length; i++) {
			const node = constructor.arguments[i];

			if (node.name?.name == property.getName()) {
				argumentExists = true;
				break;
			}
		}

		if (!argumentExists) {
			const constructorMethodText = (constructor.loc.source as string);
			const constructorHasArgs = constructor.arguments.length > 0;

			let newConstructorMethodText = '';

			const isMultiLineConstructor = (/\(\r\n|\r|\n/.test(constructorMethodText)); //constructor.loc.start.line !== constructor.loc.end.line;

			const argumentText = property.getParameterText(tabStops);
			if (constructorHasArgs) {
				const lastArg = constructor.arguments[constructor.arguments.length - 1];

				const lastArgLine = document.lineAt(lastArg.loc.end.line - 1);

				let newArg = escapeForSnippet(`${lastArg.loc.source}`);

				if (isMultiLineConstructor) {
					newArg += ",\n" + indentText(
						argumentText,
						calculateIndentationLevel(
							getLineFirstNonIndentationCharacterIndex(lastArgLine.text)
						)
					);
				} else {
					newArg += `, ${argumentText}`;
				}

				newConstructorMethodText = escapeForSnippet(constructorMethodText).replace(escapeForSnippet(lastArg.loc.source), newArg);
			} else {
				const argsParenthesis = /\(\)/;

				newConstructorMethodText = constructorMethodText.replace(argsParenthesis, `(${argumentText})`);
			}

			newDocumentText = newDocumentText.replace(escapeForSnippet(constructorMethodText), newConstructorMethodText);
		}

		let assignationExists = false;
		for (let i = 0; i < constructor.body?.children.length; i++) {
			const node = constructor.body.children[i];

			if (node.kind === 'expressionstatement'
				&& node.expression.kind === 'assign'
				&& node.expression.left.kind === 'propertylookup'
				&& node.expression.left.offset.name === property.getName()
			) {
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
				const indentationLevel = calculateIndentationLevel(
					getLineFirstNonIndentationCharacterIndex(constructorBodyLine.text)
				);

				newConstructorBodyText = "{\n" + indentText(
					`\\$this->${property.getName()} = \\$${property.getName()};\$0\n`,
					indentationLevel + 1
				) + indentText("}", indentationLevel);
			} else {
				const lastChildren = constructor.body.children[constructor.body.children.length - 1];
				const lastChildrenText = lastChildren.loc.source;
				const lastChildrenLine = document.lineAt(lastChildren.loc.end.line - 1);

				const indentationLevel = calculateIndentationLevel(
					getLineFirstNonIndentationCharacterIndex(lastChildrenLine.text)
				);

				newConstructorBodyText = escapeForSnippet(constructorBodyText).replace(
					escapeForSnippet(lastChildrenText),
					escapeForSnippet(lastChildrenText) + "\n" + indentText(
						`\\$this->${property.getName()} = \\$${property.getName()};\$0`,
						indentationLevel
					)
				);
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