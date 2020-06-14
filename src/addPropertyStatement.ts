import * as vscode from 'vscode';
import Class from './class';
import Property from './property';
import { escapeForSnippet, indentText, calculateIndentationLevel, getLineFirstNonIndentationCharacterIndex } from './utils';

export default function addPropertyStatement(document: vscode.TextDocument, phpClass: Class, property: Property, tabStops: any): string {
	const phpClassRange = new vscode.Range(
		new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column),
		new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column)
	);

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

				if (propertyNode.name?.name === property.getName()) {
					return newDocumentText;
				}
			}
		} else if (!firstMethod && node.kind === 'method' && node.name !== '__construct') {
			firstMethod = node;
		}
	}

	const propertyStatementText = property.getStatementText(tabStops);

	if (lastProperty) {
		const lastPropertyLine = document.lineAt(lastProperty.loc.start.line - 1);

		const newPropertyText = escapeForSnippet(`${lastPropertyLine.text}`) + "\n\n" + indentText(
			propertyStatementText,
			calculateIndentationLevel(
				getLineFirstNonIndentationCharacterIndex(lastPropertyLine.text)
			)
		);

		newDocumentText = newDocumentText.replace(escapeForSnippet(lastPropertyLine.text), newPropertyText);
	} else if (firstMethod) {
		const firstMethodLine = document.lineAt(firstMethod.loc.start.line - 1);

		const newPropertyText = indentText(
			propertyStatementText,
			calculateIndentationLevel(
				getLineFirstNonIndentationCharacterIndex(firstMethodLine.text)
			)
		) + "\n\n" + escapeForSnippet(firstMethodLine.text);

		newDocumentText = newDocumentText.replace(escapeForSnippet(firstMethodLine.text), newPropertyText);
	} else if (lastNode) {
		const lastNodeLine = document.lineAt(lastNode.loc.start.line - 1);

		const newPropertyText = escapeForSnippet(lastNodeLine.text) + "\n\n" + indentText(
			propertyStatementText,
			calculateIndentationLevel(
				getLineFirstNonIndentationCharacterIndex(lastNodeLine.text)
			)
		);

		newDocumentText = newDocumentText.replace(escapeForSnippet(lastNodeLine.text), newPropertyText);
	} else {
		const isOneLineClass = phpClass.ast.loc.start.line === phpClass.ast.loc.end.line;

		if (isOneLineClass) {
			const match = phpClass.ast.loc.source.match(/(.*)\}/);

			const newPropertyText = escapeForSnippet(match[1]) + "\n" + indentText(
				propertyStatementText,
				1
			) + "\n" + '}';

			newDocumentText = newDocumentText.replace(escapeForSnippet(phpClass.ast.loc.source), newPropertyText);
		} else {
			const classBodyLine = document.lineAt(phpClass.ast.loc.start.line - 1);
			const classText = escapeForSnippet(phpClass.ast.loc.source);

			const newPropertyText = classText.replace(/{(?:\s|[\r\n]|\s)*}/, "{\n" + indentText(
				propertyStatementText,
				calculateIndentationLevel(
					getLineFirstNonIndentationCharacterIndex(classBodyLine.text)
				) + 1
			)) + "\n}";

			newDocumentText = newDocumentText.replace(classText, newPropertyText);
		}
	}

	return newDocumentText;
}
