import * as vscode from 'vscode';
import PhpEngine from 'php-parser';
import Locator from './locator';
import Property from './property';
import insertProperty from './insertProperty';
import { removeProperty } from './removeProperty';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('phpAddProperty.add', async () => {
			if (vscode.window.activeTextEditor === undefined) {
				return;
			}

			const document = vscode.window.activeTextEditor.document;

			const phpEngine = new PhpEngine({
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

			const locator = new Locator(ast);

			const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;

			const phpClass = locator.findClass(selectionLineNumber + 1);

			if (!phpClass) {
				vscode.window.showInformationMessage('No class found');

				return;
			}

			const name = await vscode.window.showInputBox({
				placeHolder: 'Enter the property name'
			});

			if (name === undefined || name.trim() === "") {
				return;
			}

			const property = new Property(name);

			insertProperty(vscode.window.activeTextEditor, property, phpClass, `${property.getName()};`);
		}),
		vscode.commands.registerCommand('phpAddProperty.append', async () => {
			if (vscode.window.activeTextEditor === undefined) {
				return;
			}

			const document = vscode.window.activeTextEditor.document;

			const phpEngine = new PhpEngine({
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

			const locator = new Locator(ast);

			const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;

			const phpClass = locator.findClass(selectionLineNumber + 1);

			if (!phpClass) {
				vscode.window.showInformationMessage('No class found');

				return;
			}

			const line = document.lineAt(selectionLineNumber);

			const lineAst = (phpEngine.parseEval(`class A { ${line.text} }`) as any);

			if (lineAst.children[0]?.body[0]?.kind !== 'propertystatement') {
				return;
			}

			const selectedWord = document.getText(document.getWordRangeAtPosition(vscode.window.activeTextEditor.selection.active)).replace(/^\$/, '');

			const properties = (lineAst.children[0].body[0].properties as any[]);

			const propertyAst = properties.find((propertyAst) => propertyAst.name?.name === selectedWord) ?? properties[0];

			const propertyName = propertyAst.name?.name;

			const propertyStatementAst = phpClass.ast.body.find((node: any) => {
				if (node.kind !== 'propertystatement') {
					return false
				}

				return node.properties.find((propertyAst: any) => propertyAst.name?.name === propertyName);
			});

			if (!propertyStatementAst) {
				return;
			}

			let docblockType;
			for (let i = 0; i < propertyStatementAst.leadingComments?.length; i++) {
				const node = propertyStatementAst.leadingComments[i];

				if (node.kind !== 'commentblock') {
					continue;
				}

				const typeMatch = /@var\s(\S*)/g.exec(node.value);

				if (typeMatch) {
					docblockType = typeMatch[1];
				}
			}

			const property = new Property(propertyName, propertyAst.type?.name ?? docblockType);

			insertProperty(vscode.window.activeTextEditor, property, phpClass, line.text);
		}),
		vscode.commands.registerCommand('phpAddProperty.remove', async () => {
			if (vscode.window.activeTextEditor === undefined) {
				return;
			}

			const document = vscode.window.activeTextEditor.document;

			const phpEngine = new PhpEngine({
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

			const locator = new Locator(ast);

			const selectionLineNumber = vscode.window.activeTextEditor.selection.active.line;

			const phpClass = locator.findClass(selectionLineNumber);

			if (!phpClass) {
				vscode.window.showInformationMessage('No class found');

				return;
			}

			const line = document.lineAt(selectionLineNumber);

			const lineAst = (phpEngine.parseEval(`class A { ${line.text} }`) as any);

			const selectedWord = document.getText(document.getWordRangeAtPosition(vscode.window.activeTextEditor.selection.active)).replace(/^\$/, '');

			let propertyName;
			if (lineAst.children[0]?.body[0]?.kind === 'propertystatement') {
				const properties = (lineAst.children[0].body[0].properties as any[]);

				const propertyAst = properties.find((propertyAst) => propertyAst.name?.name === selectedWord) ?? properties[0];
				propertyName = propertyAst.name?.name;

				if (propertyName === 'this') {
					const assignmentAst = (phpEngine.parseEval(`class A { public function __construct() { ${line.text} } }`) as any);

					if (assignmentAst.children[0]?.body[0]?.body?.children[0]?.kind === 'expressionstatement') {
						propertyName = assignmentAst.children[0].body[0].body.children[0].expression.right?.name;
					}
				}
			} else if (lineAst.children[0]?.body[0]?.kind === 'method') {
				const constructorArgs = (lineAst.children[0].body[0].arguments as any[]);

				const argumentAst = constructorArgs.find((propertyAst) => propertyAst.name?.name === selectedWord) ?? constructorArgs[0];
				propertyName = argumentAst.name?.name;
			}

			if (!propertyName) {
				propertyName = await vscode.window.showInputBox({
					placeHolder: 'Enter the property name you want to remove'
				});
			}

			if (propertyName === undefined || propertyName.trim() === "") {
				return;
			}

			const property = new Property(propertyName);

			removeProperty(vscode.window.activeTextEditor, property, phpClass);
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }