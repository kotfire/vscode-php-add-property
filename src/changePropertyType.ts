import * as vscode from 'vscode';
import Property from './property';
import Class from './class';
import { config, escapeForRegExp } from './utils';

export function changePropertyType(editor: vscode.TextEditor, property: Property, newPropertyType: string, phpClass: Class) {
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
            let newPropertyStatementText;

			for (let j = 0; j < node.properties.length; j++) {
                const propertyNode = node.properties[j];
                
                if (propertyNode.name?.name == property.getName()) {
                    const propertyStatementRange = new vscode.Range(
                        new vscode.Position(node.loc.start.line - 1, 0),
                        new vscode.Position(node.loc.end.line, 0)
                    );

                    const propertyStatementText = document.getText(propertyStatementRange);

                    let newPropertyText = `\$${property.getName()}`;

                    if (config('phpAddProperty.property.types') === true || propertyNode.type) {
                        newPropertyText = `${newPropertyType} ${newPropertyText}`;
                    }
	
                    newPropertyStatementText = propertyStatementText.replace(
                        propertyNode.loc.source,
                        newPropertyText
                    );

                    newDocumentText = newDocumentText.replace(propertyStatementText, newPropertyStatementText);
                }
            }
            
            if (newPropertyStatementText) {
                for (let i = 0; i < node.leadingComments?.length; i++) {
                    const commentNode = node.leadingComments[i];
        
                    const commentRange = new vscode.Range(
                        new vscode.Position(commentNode.loc.start.line - 1, 0),
                        new vscode.Position(commentNode.loc.end.line, 0)
                    );
        
                    const commentText = document.getText(commentRange);
        
                    const typeMatch = /@var\s(\S*)/g.exec(commentText);

                    if (typeMatch) {
                        const newCommentText = commentText.replace(typeMatch[1], newPropertyType);

                        const regexp = new RegExp(
                            `${escapeForRegExp(commentText)}((?:\s|[\r\n])*)${escapeForRegExp(newPropertyStatementText)}`
                        );
                        newDocumentText = newDocumentText.replace(
                            regexp,
                            `${newCommentText}$1${newPropertyStatementText}`
                        );
                    }
                }

                break;
            }
		}
    }
    
    const constructor = phpClass.getConstructor();

	if (constructor) {
        for (let i = 0; i < constructor.ast.arguments.length; i++) {
            const node = constructor.ast.arguments[i];

            if (node.name?.name == property.getName()) {
                const constructorText = constructor.ast.loc.source;
                const newConstructorText = constructorText.replace(
                    node.loc.source,
                    `${newPropertyType} \$${property.getName()}`
                );
                newDocumentText = newDocumentText.replace(constructorText, newConstructorText);
                break;
            }
		}
	}

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
}
