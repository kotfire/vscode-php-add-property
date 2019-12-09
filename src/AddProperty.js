const vscode = require('vscode');

class AddProperty {
    async add() {
        this.reset();
        const document = this.activeEditor().document;

        if (document.uri === undefined) {
            return;
        }

        for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
            const line = document.lineAt(lineNumber);
            const textLine = line.text;
            
            if (/class\s+\w+/.test(textLine)) {
                this.classLine = line;
                if (! /{/.test(textLine)) {
                    for (let nextLineNumber = lineNumber + 1; nextLineNumber < document.lineCount; nextLineNumber++) {
                        const nextLine = document.lineAt(nextLineNumber);
                        if (/{/.test(nextLine.text)) {
                            this.classLine = nextLine;
                            break;
                        }
                    }
                }
            }

            if (this.classLine && /use\s+\w+/.test(textLine)) {
                this.lastTraitLine = line;
            }

            if (/(public|protected|private|static)\s+\$\w+.*;/.test(textLine) || /const\s+\w+.*;/.test(textLine)) {
                this.lastPropertyLine = line;
            }

            if (/function __construct/.test(textLine)) {
                this.constructorStartLine = line;
                let previousLineNumber = lineNumber - 1;
                if (previousLineNumber > 0) {
                    let previousLine = document.lineAt(previousLineNumber);
                    
                    if (/\*\//.test(previousLine.text)) {
                        for (previousLineNumber--; previousLineNumber > 0; previousLineNumber--) {
                            previousLine = document.lineAt(previousLineNumber);
                            if (/\/\*\*/.test(previousLine.text)) {
                                this.constructorStartLine = previousLine;
                                break;
                            }
                        }
                    }
                }

                for (let ln = lineNumber; ln < document.lineCount; ln++) {
                    const l = document.lineAt(ln);
                    const tl = l.text;

                    if (/\$\w+/.test(tl)) {
                        this.constructorLastParameterLine = l;
                    }

                    if (/\)(?!\))/.test(tl)) {
                        this.constructorParametersCloseLine = l;
                    }

                    if (/{/.test(tl)) {
                        this.isMultiLineConstructor = this.constructorParametersCloseLine.lineNumber !== lineNumber;
                        break;
                    }
                }
                

                for (let nextLineNumber = lineNumber + 1; nextLineNumber < document.lineCount; nextLineNumber++) {
                    const nextLine = document.lineAt(nextLineNumber);
                    if (/}/.test(nextLine.text)) {
                        this.constructorEndLine = nextLine;
                        break;
                    }
                }
            } 
        }

        if (!this.classLine) {
            return;
        }

        this.name = await vscode.window.showInputBox({
            placeHolder: 'Enter the property name'
        });

        if (this.name === undefined || this.name.trim() === "") {
            return;
        }

        if (! /function __construct/gm.test(document.getText())) {
            this.insertConstructor();
        } else {
            this.insertProperty();
        }
    }

    insertConstructor() {
        let insertLine = this.classLine;

        if (this.lastTraitLine) {
            insertLine = this.lastTraitLine;
        }

        if (this.lastPropertyLine) {
            insertLine = this.lastPropertyLine;
        }

        let snippet = this.escapeForSnippet(this.activeEditor().document.getText(insertLine.range)) + "\n";

        if (this.lastTraitLine || this.lastPropertyLine) {
            snippet += "\n";
        }

        snippet += this.indentText(this.getPropertyStatementText());

        const visibility = this.config('phpAddProperty.constructor.visibility.default');
        let constructorText = this.indentText(
            this.config('phpAddProperty.constructor.visibility.choose') === true
                ? `\${${this.tabStops.constructorVisibility}${this.getVisibilityChoice(visibility)}} `
                : `${visibility} `
            );

        let tabStopsText = `\$${this.tabStops.constructorParameterType}`;
        if (this.config('phpAddProperty.property.stopToImport') === true) {
            tabStopsText += `\$${this.tabStops.constructorParameterStop}`;
        }

        constructorText += `function __construct(${tabStopsText}\\$${this.name})\n`
            + this.indentText('{\n')
            + this.indentText(`\\$this->${this.name} = \\$${this.name};\$0\n`, 2)
            + this.indentText('}');

        snippet += constructorText;

        let range = insertLine.range;

        for (let nextLineNumber = insertLine.range.end.line + 1; nextLineNumber < this.activeEditor().document.lineCount; nextLineNumber++) {
            const nextLine = this.activeEditor().document.lineAt(nextLineNumber);
            
            if (!nextLine.isEmptyOrWhitespace) {
                if (!/}/.test(nextLine.text)) {
                    snippet += "\n";
                }
                break;
            }

            range = new vscode.Range(
                range.start,
                nextLine.range.end
            );
        }

        this.replaceWithSnippet(snippet, range);
    }

    insertProperty() {
        // Add property statement;
        let text = this.indentText(this.getPropertyStatementText());

        // Add property to constructor parameters
        let constructorText = this.escapeForSnippet(
            this.activeEditor().document.getText(
                new vscode.Range(
                    this.constructorStartLine.range.start,
                    this.constructorEndLine.rangeIncludingLineBreak.start
                )
            )
        );

        const constructorLastParameterText = this.escapeForSnippet(
            this.activeEditor().document.getText(this.constructorLastParameterLine.range)
        );

        let position = this.constructorLastParameterLine.range.end.character;
        if (this.constructorLastParameterLine.lineNumber === this.constructorParametersCloseLine.lineNumber) {
            const match = /\)(?!\))/.exec(constructorLastParameterText);
            if (match) {
                position = match.index - 1;
            }
        }

        // Zero-based to one-based
        position++;

        let tabStopsText = `$${this.tabStops.constructorParameterType}`;
        if (this.config('phpAddProperty.property.stopToImport') === true) {
            tabStopsText += `$${this.tabStops.constructorParameterStop}`;
        }

        const newParameterText = `$${tabStopsText}\\$${this.name}`;
        let newParameterWrapper = ',';
        if (this.isMultiLineConstructor) {
            newParameterWrapper += "\n" + this.indentText(
                newParameterText,
                this.calculateIndentationLevel(this.constructorLastParameterLine.firstNonWhitespaceCharacterIndex)
            );
        } else {
            newParameterWrapper += ` ${newParameterText}`;
        }

        const output = [
            constructorLastParameterText.slice(0, position),
            newParameterWrapper,
            constructorLastParameterText.slice(position)
        ].join('');

        constructorText = constructorText.replace(constructorLastParameterText, output);

        if (!this.isMultiLineConstructor) {
            constructorText = this.breakIntoMultiline(constructorText);
        }

        text += constructorText;
        
        // Initialize property to parameter
        text += this.indentText(`\\$this->${this.name} = \\$${this.name};\$0\n`, 2);

        // Close constructor
        text += this.constructorEndLine.text;

        const range = new vscode.Range(
            this.constructorStartLine.range.start,
            this.constructorEndLine.range.end
        );

        this.replaceWithSnippet(text, range);
    }

    breakIntoMultiline(constructorText) {
        if (this.config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.enabled') === true) {
            const regex = /((public|protected|private)\s+function\s+__construct\s*\(((?:\s|\S)*)(?=\))\s*\))\s*{/;
            const match = regex.exec(constructorText);
            if (match) {
                const constructorLineText = match[1];

                if (constructorLineText.length > this.config('phpAddProperty.constructor.breakIntoMultilineIfLengthExceeded.maxLineLength')) {
                    const visibilityText = match[2];
                    const parametersText = match[3];
                    const parameters = parametersText.split(',').map(parameter => this.indentText(parameter.trim(), 2));

                    const multilineConstructorText = `${visibilityText} function __construct(\n`
                        + `${parameters.join(',\n')}\n`
                        + this.indentText(') {');

                    constructorText = constructorText.replace(match[0], multilineConstructorText);
                }
            }
        }

        return constructorText;
    }

    indentText(text, level = 1) {
        /**
         * Good to have
         * Listen for view options changes and use these values
         * https://github.com/jedmao/tabsanity-vs/blob/faa41a99ccb47c8e7717edfcbdfba4c093e670fe/TabSanity/TabOptionsListener.cs
         */
        let tab = "\t";
        if (this.configUsingResource('editor.insertSpaces')) {
            const tabSize = this.configUsingResource('editor.tabSize');
            tab = ' '.repeat(tabSize);
        }
        return tab.repeat(level) + text;
    }

    getVisibilityChoice(defaultValue) {
        let visibilityChoices = ['public', 'protected', 'private'];
        if (visibilityChoices.indexOf(defaultValue) !== -1) {
            visibilityChoices.splice(visibilityChoices.indexOf(defaultValue), 1);
        }
        return `|${[defaultValue, ...visibilityChoices].join(',')}|`;
    }

    getPropertyStatementText() {
        let docblockTypeStop = this.tabStops.propertyDocblockType;
        let dockblockImportStop = this.tabStops.propertyDocblockImport;

        if (this.config('phpAddProperty.property.docblock.withParameter') === true) {
            docblockTypeStop = this.tabStops.constructorParameterType;
            dockblockImportStop = this.tabStops.constructorParameterStop;
            this.tabStops.constructorParameterStop++;
        }

        let propertyStatementText = '';
        if (this.config('phpAddProperty.property.docblock.add') === true) {
            let stopText = '';

            if (this.config('phpAddProperty.property.docblock.stopToImport') === true) {
                stopText += `$${dockblockImportStop}`;
            }
            
            stopText += `$${docblockTypeStop}`;

            if (this.config('phpAddProperty.property.docblock.withParameter') === false) {
                stopText += ' ';
            }

            propertyStatementText += `/** @var ${stopText}*/\n${this.indentText('')}`
        }

        const visibility = this.config('phpAddProperty.property.visibility.default');
        propertyStatementText += this.config('phpAddProperty.property.visibility.choose') === true
            ? `\${${this.tabStops.propertyVisibility}${this.getVisibilityChoice(visibility)}} `
            : `${visibility} `;
         
        if (this.config('phpAddProperty.property.types') === true) {
            propertyStatementText += `$${this.tabStops.constructorParameterType}`;
        } 
        propertyStatementText += `\\$${this.name};\n\n`;

        return propertyStatementText;
    }

    replaceWithSnippet(text, range) {
        const rangeLines = range.end.line - range.start.line;

        this.activeEditor().edit(
            editBuilder => {
                editBuilder.replace(range, "\n".repeat(rangeLines))
            },
            {
                undoStopBefore: false,
                undoStopAfter: false 
            }
        );

        this.activeEditor().insertSnippet(
            new vscode.SnippetString(text),
            range,
            {
                undoStopBefore: false,
                undoStopAfter: false 
            }
        );
    }

    calculateIndentationLevel(index) {
        return Math.floor(index / this.configUsingResource('editor.tabSize'));
    }

    escapeForSnippet(text) {
        return text.replace(/\$/g, '\\$');
    }

    activeEditor() {
        return vscode.window.activeTextEditor;
    }

    config(key) {
        return vscode.workspace.getConfiguration().get(key);
    }

    configUsingResource(key) {
        const parts = key.split(/\.(.+)/, 2);
        const configuration = vscode.workspace.getConfiguration(parts[0], this.activeEditor().document.uri);
            
        return parts[1] ? configuration.get(parts[1]) : configuration;
    }

    reset() {
        delete this.classLine;
        delete this.lastTraitLine;
        delete this.lastPropertyLine;
        delete this.constructorStartLine;
        delete this.constructorLastParameterLine;
        delete this.constructorParametersCloseLine;
        delete this.constructorEndLine;
        delete this.isMultiLineConstructor;
        delete this.name;

        this.tabStops = {
            propertyDocblockType: 1,
            propertyDocblockImport: 2,
            propertyVisibility: 3,
            constructorVisibility: 4,
            constructorParameterType: 5,
            constructorParameterStop: 6
        };
    }
}

module.exports = AddProperty;