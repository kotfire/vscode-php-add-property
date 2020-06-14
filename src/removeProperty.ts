import * as vscode from 'vscode';
import Property from './property';
import Class from './class';
import { escapeForRegExp } from './utils';

export function removeProperty(editor: vscode.TextEditor, property: Property, phpClass: Class) {
	const document = editor.document;
	const phpClassRange = new vscode.Range(
		new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column),
		new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column)
	);

	let newDocumentText = document.getText(phpClassRange);

	const astClassBody = phpClass.ast.body;
	for (let i = 0; i < astClassBody.length; i++) {
		const node = astClassBody[i];

		if (node.kind === 'propertystatement') {
			for (let j = 0; j < node.properties.length; j++) {
				const propertyNode = node.properties[j];

				if (propertyNode.name?.name === property.getName()) {
					if (node.properties.length === 1) {
						const nextNotEmptyLine = i + 1 < astClassBody.length
							? astClassBody[i + 1].loc.start.line - 1
							: node.loc.end.line;
						const propertyStatementRange = new vscode.Range(
							new vscode.Position(node.loc.start.line - 1, 0),
							new vscode.Position(nextNotEmptyLine, 0)
						);

						const propertyStatementText = document.getText(propertyStatementRange);

						newDocumentText = newDocumentText.replace(propertyStatementText, '');
					} else {
						const regexp = new RegExp(`(,\\s*(?!.*,))?${escapeForRegExp(propertyNode.loc.source)}(\\s*,\\s*)?`);
						newDocumentText = newDocumentText.replace(regexp, '');
					}

					for (let i = 0; i < node.leadingComments?.length; i++) {
						const commentNode = node.leadingComments[i];
		
						const commentRange = new vscode.Range(
							new vscode.Position(commentNode.loc.start.line - 1, 0),
							new vscode.Position(commentNode.loc.end.line, 0)
						);

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
		if (constructor.ast.body?.children.length <= 1) {
			const constructorRange = new vscode.Range(
				new vscode.Position(constructor.ast.loc.start.line - 1, 0),
				new vscode.Position(constructor.ast.loc.end.line, 0)
			);

			const constructorText = document.getText(constructorRange);

			newDocumentText = newDocumentText.replace(constructorText, '');
		} else {
			for (let i = 0; i < constructor.ast.arguments.length; i++) {
				const node = constructor.ast.arguments[i];

				if (node.name?.name == property.getName()) {
					const constructorText = constructor.ast.loc.source;
					const regexp = new RegExp(`(,\\s*(?!.*,))?${escapeForRegExp(node.loc.source)}(\\s*,\\s*)?`);
					const newConstructorText = constructorText.replace(regexp, '');
					newDocumentText = newDocumentText.replace(constructorText, newConstructorText);
					break;
				}
			}

			for (let i = 0; i < constructor.ast.body?.children.length; i++) {
				const node = constructor.ast.body.children[i];

				if (node.kind === 'expressionstatement'
					&& node.expression.kind === 'assign'
					&& node.expression.left.kind === 'propertylookup'
					&& node.expression.left.offset.name === property.getName()
				) {
					const propertyAssignmentRange = new vscode.Range(
						new vscode.Position(node.loc.start.line - 1, 0),
						new vscode.Position(node.loc.end.line, 0)
					);

					const propertyAssignmentText = document.getText(propertyAssignmentRange);

					newDocumentText = newDocumentText.replace(propertyAssignmentText, '');
					break;
				}
			}
		}
	}

	if (newDocumentText === document.getText()) {
		return;
	}

	vscode.window.activeTextEditor?.edit(
		editBuilder => {
			editBuilder.replace(phpClassRange, newDocumentText);
		},
		{
			undoStopBefore: true,
			undoStopAfter: false
		}
	);
}
