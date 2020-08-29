import * as vscode from 'vscode';
import PhpEngine from 'php-parser';
import Locator from './locator';
import Property from './property';
import insertProperty from './insertProperty';
import { removeProperty } from './removeProperty';
import { forceBreakConstructorIntoMultiline, getPropertyNameFromLineText } from './utils';
import { renameProperty } from './renameProperty';
import { changePropertyType } from './changePropertyType';
import { extensionQualifiedId, GlobalState } from './constants';

export async function activate(context: vscode.ExtensionContext) {
	const extension = vscode.extensions.getExtension(extensionQualifiedId)!;
	const version = extension.packageJSON.version;
	const previousVersion = context.globalState.get<string>(GlobalState.version);

	const versionAsInt = parseInt((version as string).replace(/\./g, ''));
	const previousVersionAsInt = previousVersion ? parseInt((previousVersion as string).replace(/\./g, '')) : 0;

	if (previousVersionAsInt < versionAsInt) {
		try {
			const extensionRoot = context.asAbsolutePath(`webviews/${version}`);
			const filename = `${extensionRoot}/index.html`;
			const doc = await vscode.workspace.openTextDocument(filename);
			const content = doc.getText();

			const html = content.replace(
				/#{root}/g,
				vscode.Uri.file(extensionRoot)
					.with({ scheme: 'vscode-resource' })
					.toString()
			);

			const panel = vscode.window.createWebviewPanel(
				`phpAddPropertyWebView-${version}`,
				`PHP Add Property: What's new in v${version}`,
				vscode.ViewColumn.One,
				{
					localResourceRoots: [vscode.Uri.file(context.extensionPath)],
				}
			);

			panel.iconPath = vscode.Uri.file(context.asAbsolutePath('images/icon.png'));
			panel.webview.html = html;
		} catch (error) {}
	}	

	context.globalState.update(GlobalState.version, version);

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
		vscode.commands.registerCommand('phpAddProperty.rename', async () => {
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
			
			let propertyName = getPropertyNameFromLineText(
				line.text,
				document,
				phpEngine,
				vscode.window.activeTextEditor.selection.active
			);

			if (!propertyName) {
				propertyName = await vscode.window.showInputBox({
					placeHolder: 'Enter the property name you want to rename'
				});
			}

			if (propertyName === undefined || propertyName.trim() === "") {
				return;
			}

			const property = new Property(propertyName);

			const newPropertyName = await vscode.window.showInputBox({
				placeHolder: 'Enter the new property name'
			});

			if (newPropertyName === undefined || newPropertyName.trim() === "") {
				return;
			}

			const newProperty = new Property(newPropertyName);

			renameProperty(vscode.window.activeTextEditor, property, newProperty, phpClass);
		}),
		vscode.commands.registerCommand('phpAddProperty.changeType', async () => {
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
			
			let propertyName = getPropertyNameFromLineText(
				line.text,
				document,
				phpEngine,
				vscode.window.activeTextEditor.selection.active
			);

			if (!propertyName) {
				propertyName = await vscode.window.showInputBox({
					placeHolder: 'Enter the property name you want to change type'
				});
			}

			if (propertyName === undefined || propertyName.trim() === "") {
				return;
			}

			const property = new Property(propertyName);

			const newPropertyType = await vscode.window.showInputBox({
				placeHolder: 'Enter the new property type'
			});

			if (newPropertyType === undefined || newPropertyType.trim() === "") {
				return;
			}

			changePropertyType(vscode.window.activeTextEditor, property, newPropertyType, phpClass);
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
			
			let propertyName = getPropertyNameFromLineText(
				line.text,
				document,
				phpEngine,
				vscode.window.activeTextEditor.selection.active
			);

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
		}),
		vscode.commands.registerCommand('phpAddProperty.breakConstructorIntoMultiline', async () => {
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

			const phpClassRange = new vscode.Range(
				new vscode.Position(phpClass.ast.loc.start.line - 1, phpClass.ast.loc.start.column),
				new vscode.Position(phpClass.ast.loc.end.line - 1, phpClass.ast.loc.end.column)
			);

			const newDocumentText = forceBreakConstructorIntoMultiline(document.getText(phpClassRange));

			if (newDocumentText === document.getText(phpClassRange)) {
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
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
