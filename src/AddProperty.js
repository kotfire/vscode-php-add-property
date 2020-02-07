const vscode = require('vscode');

class AddProperty {
    async add() {
        this.reset();
        const document = this.activeEditor().document;

        if (document.uri === undefined) {
            return;
        }

        this.parseDocument(document);

        if (!this.classLine) {
            return;
        }

        this.name = await vscode.window.showInputBox({
            placeHolder: 'Enter the property name'
        });

        if (this.name === undefined || this.name.trim() === "") {
            return;
        }

        if (!this.constructorStartLine) {
            this.insertConstructor();
        } else {
            this.insertProperty();
        }
    }

    async append() {
        this.reset();
        const document = this.activeEditor().document;

        if (document.uri === undefined) {
            return;
        }

        this.parseDocument(document);

        if (!this.classLine) {
            return;
        }

        const editor = this.activeEditor();
        const selectionLineNumber = editor.selection.active.line;
        const line = document.lineAt(selectionLineNumber);
            
        if (!this.isPropertyLine(line.text)) {
            return;
        }

        const match = /\$([^\s;]*)/.exec(line.text);

        if (!match[1]) {
            return;
        }

        this.name = match[1];

        if (this.name === undefined || this.name.trim() === "") {
            return;
        }

        let previousLineNumber = selectionLineNumber - 1;

        if (previousLineNumber > 0) {
            let previousLine = editor.document.lineAt(previousLineNumber);

            if (/\*\//.test(previousLine.text)) {
                for (previousLineNumber; previousLineNumber > 0; previousLineNumber--) {
                    previousLine = document.lineAt(previousLineNumber);
                    const typeMatch = /@var\s(\S*)/.exec(previousLine.text);

                    if (typeMatch) {
                        this.type = typeMatch[1];
                    }

                    if (/\/\*\*/.test(previousLine.text)) {
                        break;
                    }
                }
            }
        }

        if (! /function __construct/gm.test(this.activeEditor().document.getText())) {
            this.insertConstructor(false);
        } else {
            this.insertProperty(false);
        }
    }

    insertConstructor(shouldInsertPropertyStatement = true) {
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

        if (shouldInsertPropertyStatement === true && !this.classProperties.includes(this.name)) {
            snippet += this.indentText(this.getPropertyStatementText());
        }

        if (this.config('phpAddProperty.constructor.docblock.enable') === true) {
            snippet += this.indentText("/**\n")
                + this.indentText(" * Constructor.\n")
                + this.indentText(`${this.getConstructorParamDocblockText()}\n`)
                + this.indentText(" */\n")
        }

        const visibility = this.config('phpAddProperty.constructor.visibility.default');
        let constructorText = this.indentText(
            this.config('phpAddProperty.constructor.visibility.choose') === true
                ? `\${${this.tabStops.constructorVisibility}${this.getVisibilityChoice(visibility)}} `
                : `${visibility} `
            );

        const parameterText = this.getParameterText();

        constructorText += `function __construct(${parameterText})\n`
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

    insertProperty(shouldInsertPropertyStatement = true) {
        let text = shouldInsertPropertyStatement === true && !this.classProperties.includes(this.name)
            ? this.indentText(this.getPropertyStatementText())
            : '';

        let constructorText = this.escapeForSnippet(
            this.activeEditor().document.getText(
                new vscode.Range(
                    this.constructorStartLine.range.start,
                    this.constructorEndLine.rangeIncludingLineBreak.start
                )
            )
        );

        // Update docblock parameters
        const shouldUpdateDocblockParameters = this.config('phpAddProperty.constructor.docblock.enable') === true
            && this.constructorDocblockStartLine
            && !this.docblockParams.includes(this.name);

        if (shouldUpdateDocblockParameters) {
            let docblockText = this.escapeForSnippet(
                this.activeEditor().document.getText(
                    new vscode.Range(
                        this.constructorDocblockStartLine.range.start,
                        this.constructorDocblockEndLine.rangeIncludingLineBreak.start
                    )
                )
            );

            const newDocblockText = docblockText
                + this.indentText(
                    this.getConstructorParamDocblockText(),
                    this.calculateIndentationLevel(
                        this.getLineFirstNonIndentationCharacterIndex(this.constructorDocblockStartLine)
                    )
                )
                + "\n";

            constructorText = constructorText.replace(docblockText, newDocblockText);
        }        

        // Check if property already exists as argument
        const constructorMatch = /function\s+__construct\s*\(((?:\s|\S)*)(?=\))\s*\)/.exec(constructorText);
        if (constructorMatch) {
            const parametersText = constructorMatch[1];
            const parameters = parametersText.split(',').flatMap(parameter => {
                const match = parameter.trim().match(/\$(\S+)/);
                return match ? [match[1]] : [];
            });
            
            if (parameters.includes(this.name)) {
                this.showErrorMessage('Property already exists as constructor argument');

                return;
            }
        }

        // Check if property has been already assignated
        let propertyAssignationExists = false;
        const assignationRegex = /\$this->(\S+)\s*=[^;]*;/g;
        let assignationMatch;
        while (assignationMatch = assignationRegex.exec(constructorText)) {
            if (assignationMatch[1] === this.name) {
                propertyAssignationExists = true;
                break;
            }
        }

        // Add property to constructor parameters
        const constructorParameterLastLine = this.constructorLastParameterLine || this.constructorParametersCloseLine;
        const constructorLastParameterText = this.escapeForSnippet(
            this.activeEditor().document.getText(constructorParameterLastLine.range)
        );

        let position = constructorParameterLastLine.range.end.character;
        if (constructorParameterLastLine.lineNumber === this.constructorParametersCloseLine.lineNumber) {
            const match = /\)(?!\))/.exec(constructorLastParameterText);
            if (match) {
                position = match.index - 1;
            }
        }

        // Zero-based to one-based
        position++;

        const newParameterText = this.getParameterText();
        let newParameterWrapper = this.constructorLastParameterLine ? ',' : '';
        if (this.isMultiLineConstructor) {
            newParameterWrapper += "\n" + this.indentText(
                newParameterText,
                this.calculateIndentationLevel(
                    this.getLineFirstNonIndentationCharacterIndex(constructorParameterLastLine)
                )
            );
        } else {
            newParameterWrapper += (this.constructorLastParameterLine ? ' ' : '') + newParameterText;
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
        
        if (!propertyAssignationExists) {
            // Initialize property to parameter
            text += this.indentText(`\\$this->${this.name} = \\$${this.name};\$0\n`, 2);
        }

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

            if (this.config('phpAddProperty.property.docblock.multiline') === true) {
                propertyStatementText += `/**\n${this.indentText(' * @var ')}${stopText}\n${this.indentText(' */')}\n${this.indentText('')}`;
            } else {
                if (this.config('phpAddProperty.property.docblock.withParameter') === false) {
                    stopText += ' ';
                }

                propertyStatementText += `/** @var ${stopText}*/\n${this.indentText('')}`;
            }
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

    getConstructorParamDocblockText() {
        let docblockTypeStop = this.tabStops.constructorDocblockType;
        let dockblockImportStop = this.tabStops.constructorDocblockImport;

        if (this.config('phpAddProperty.constructor.docblock.withParameter') === true) {
            docblockTypeStop = this.tabStops.constructorParameterType;
            dockblockImportStop = this.tabStops.constructorParameterStop;
            this.tabStops.constructorParameterStop++;
        }

        let constructorParamDocblockText = `\${${docblockTypeStop}}`;

        if (this.type) {
            constructorParamDocblockText = `\${${docblockTypeStop}:${this.type} }`;
        }

        if (this.config('phpAddProperty.constructor.docblock.stopToImport') === true) {
            constructorParamDocblockText += `\$${dockblockImportStop}`;
        }
            
        constructorParamDocblockText += `\\$${this.name}`;

        if (this.config('phpAddProperty.constructor.docblock.stopForDescription') === true) {
            constructorParamDocblockText += `\$${this.tabStops.constructorDocblockDescription}`;
        }

        return ` * @param ${constructorParamDocblockText}`;
    }

    getParameterText() {
        let tabStopsText = `$${this.tabStops.constructorParameterType}`;

        if (this.type) {
            tabStopsText = `\${${this.tabStops.constructorParameterType}:${this.type}}`;
        }

        if (this.config('phpAddProperty.property.stopToImport') === true) {
            tabStopsText += `$${this.tabStops.constructorParameterStop}`;
        }

        let parameterText = `${tabStopsText}`;

        if (this.type) {
            parameterText += ' ';
        }

        parameterText += `\\$${this.name}`;

        return parameterText;
    }

    isPropertyLine(textLine) {
        return /(public|protected|private|static)\s+\$\w+.*;/.test(textLine);
    }

    isClassLine(textLine) {
        return /^(?:(?:final|abstract)\s+)?class\s+\w+/.test(textLine);
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

    getLineFirstNonIndentationCharacterIndex(line) {
        const tabSize = this.configUsingResource('editor.tabSize');

        let index = 0;
        for (let i = 0; i < line.text.length; i++) {
            const char = line.text[i];

            if (/[^\s\t]/.test(char)) {
                index++;
                break;
            }

            index += char === "\t" ? tabSize : 1;
        }

        return index;
    }

    getLineTextFromFirstNonIndentationCharacter(line) {
        let i = 0;

        for (i; i < line.text.length; i++) {
            if (/[^\s\t]/.test(line.text[i])) {
                break;
            }
        }

        return line.text.substr(i);
    }

    calculateIndentationLevel(index) {
        return Math.floor(index / this.configUsingResource('editor.tabSize'));
    }

    escapeForSnippet(text) {
        return text.replace(/(?<!\\)\$/g, '\\$');
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

    showMessage(message, isError = false) {
        if (this.config('phpAddProperty.showMessagesOnStatusBar')) {
            return vscode.window.setStatusBarMessage(message, 3000);
        }

        message = message.replace(/\$\(.+?\)\s\s/, '');

        if (isError) {
            vscode.window.showErrorMessage(message);
        } else {
            vscode.window.showInformationMessage(message);
        }
    }

    showErrorMessage(message) {
        this.showMessage(message, true);
    }

    reset() {
        delete this.classLine;
        delete this.lastTraitLine;
        delete this.lastPropertyLine;
        delete this.constructorStartLine;
        delete this.constructorLastParameterLine;
        delete this.constructorParametersCloseLine;
        delete this.constructorEndLine;
        delete this.constructorDocblockStartLine;
        delete this.constructorDocblockEndLine;
        delete this.lastDocBlockParamLine;
        delete this.isMultiLineConstructor;
        delete this.name;
        delete this.type;

        this.classProperties = [];
        this.docblockParams = [];

        this.tabStops = {
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
    }

    parseDocument(document) {
        let startingLine = 0;

        const selection = this.activeEditor().selection.active;
        
        if (selection) {
            startingLine = this.getClassLineNumberFromCursorLineNumber(document, selection.line); 
        }

        for (let lineNumber = startingLine; lineNumber < document.lineCount; lineNumber++) {
            const line = document.lineAt(lineNumber);
            const textLine = line.text;
            
            if (this.isClassLine(this.getLineTextFromFirstNonIndentationCharacter(line))) {
                this.classLine = line;
                if (! /^{/.test(this.getLineTextFromFirstNonIndentationCharacter(line))) {
                    for (let nextLineNumber = lineNumber + 1; nextLineNumber < document.lineCount; nextLineNumber++) {
                        const nextLine = document.lineAt(nextLineNumber);
                        if (/^{/.test(this.getLineTextFromFirstNonIndentationCharacter(nextLine))) {
                            this.classLine = nextLine;
                            break;
                        }
                    }
                }
            }

            if (this.classLine && /^use\s+\w+/.test(this.getLineTextFromFirstNonIndentationCharacter(line))) {
                this.lastTraitLine = line;
            }

            const isPropertyOrConstantLine = this.isPropertyLine(this.getLineTextFromFirstNonIndentationCharacter(line))
                || /^const\s+\w+.*;/.test(this.getLineTextFromFirstNonIndentationCharacter(line));

            if (isPropertyOrConstantLine) {
                const match = /\$([^\s;]*)/.exec(line.text);

                if (match) {
                    this.classProperties.push(match[1]);
                }

                this.lastPropertyLine = line;
            }

            const lineIsBracketAfterClass = this.classLine
                && this.classLine.lineNumber != line.lineNumber
                && /^{|}/.test(this.getLineTextFromFirstNonIndentationCharacter(line));

            if (lineIsBracketAfterClass) {
                break;
            }

            if (/function __construct/.test(textLine)) {
                this.constructorStartLine = line;
                let previousLineNumber = lineNumber - 1;
                if (previousLineNumber > 0) {
                    let previousLine = document.lineAt(previousLineNumber);
                    
                    if (/^\*\//.test(this.getLineTextFromFirstNonIndentationCharacter(previousLine))) {
                        this.constructorDocblockEndLine = previousLine;
                        let paramLine;

                        for (previousLineNumber--; previousLineNumber > 0; previousLineNumber--) {
                            previousLine = document.lineAt(previousLineNumber);
                            paramLine = /@param(?:\s+\S+)\s+\$(\S+)/.exec(previousLine.text);

                            if (paramLine) {
                                this.docblockParams.push(paramLine[1]);
                                this.lastDocBlockParamLine = previousLine;
                            }

                            if (/^\/\*\*/.test(this.getLineTextFromFirstNonIndentationCharacter(previousLine))) {
                                this.constructorDocblockStartLine = previousLine;
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
                    if (/^}/.test(this.getLineTextFromFirstNonIndentationCharacter(nextLine))) {
                        this.constructorEndLine = nextLine;
                        break;
                    }
                }
            } 
        }
    }

    getClassLineNumberFromCursorLineNumber(document, cursorLineNumber) {
        for (let lineNumber = cursorLineNumber; lineNumber >= 0; lineNumber--) {
            const line = document.lineAt(lineNumber);
            
            if (this.isClassLine(this.getLineTextFromFirstNonIndentationCharacter(line))) {
                return lineNumber;
            }
        }

        return 0;
    }
}

module.exports = AddProperty;