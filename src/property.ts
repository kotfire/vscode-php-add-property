import { config, indentText, getVisibilityChoice } from "./utils";

export default class Property {
    private name: string;
    private nullable: Boolean;
    private type?: string;

    constructor(name: string, nullable: Boolean = false, type?: string) {
        this.name = name;
        this.nullable = nullable;
        this.type = type;
    }

    public getName() {
        return this.name;
    }

    public isNullable() {
        return this.nullable === true;
    }

    public getType() {
        return this.type;
    }

    public getStatementText(tabStops: any): string {
        let docblockTypeStop = tabStops.propertyDocblockType;
        let dockblockImportStop = tabStops.propertyDocblockImport;

        if (config('phpAddProperty.property.docblock.withParameter') === true) {
            docblockTypeStop = tabStops.constructorParameterType;
            dockblockImportStop = tabStops.constructorParameterStop;
            tabStops.constructorParameterStop++;
        }

        let propertyStatementText = '';
        if (config('phpAddProperty.property.docblock.add') === true) {
            let stopText = '';

            if (config('phpAddProperty.property.docblock.stopToImport') === true) {
                stopText += `$${dockblockImportStop}`;
            }

            stopText += `$${docblockTypeStop}`;

            if (config('phpAddProperty.property.docblock.multiline') === true) {
                propertyStatementText += `/**\n${indentText(' * @var ')}${stopText}\n${indentText(' */')}\n${indentText('')}`;
            } else {
                if (config('phpAddProperty.property.docblock.withParameter') === false) {
                    stopText += ' ';
                }

                propertyStatementText += `/** @var ${stopText}*/\n${indentText('')}`;
            }
        }

        const visibility = (config('phpAddProperty.property.visibility.default') as string);
        propertyStatementText += config('phpAddProperty.property.visibility.choose') === true
            ? `\${${tabStops.propertyVisibility}${getVisibilityChoice(visibility)}} `
            : `${visibility} `;

        if (config('phpAddProperty.property.types') === true) {
            propertyStatementText += `$${tabStops.constructorParameterType}`;
        }
        propertyStatementText += `\\$${this.getName()};`;

        return propertyStatementText;
    }

    public getParameterText(tabStops: any): string {
        let tabStopsText = `$${tabStops.constructorParameterType}`;

        if (this.getType()) {
            let typeText = this.getType();

            if (this.isNullable()) {
                typeText = `?${typeText}`;
            }

            tabStopsText = `\${${tabStops.constructorParameterType}:${typeText}}`;
        }

        if (config('phpAddProperty.property.stopToImport') === true) {
            tabStopsText += `$${tabStops.constructorParameterStop}`;
        }

        let parameterText = `${tabStopsText}`;

        if (this.getType()) {
            parameterText += ' ';
        }

        parameterText += `\\$${this.getName()}`;

        return parameterText;
    }

    public getConstructorParamDocblockText(tabStops: any): string {
        let docblockTypeStop = tabStops.constructorDocblockType;
        let dockblockImportStop = tabStops.constructorDocblockImport;

        if (config('phpAddProperty.constructor.docblock.withParameter') === true) {
            docblockTypeStop = tabStops.constructorParameterType;
            dockblockImportStop = tabStops.constructorParameterStop;
            tabStops.constructorParameterStop++;
        }

        let constructorParamDocblockText = `\${${docblockTypeStop}}`;

        if (this.getType()) {
            let typeText = this.getType();

            if (this.isNullable()) {
                typeText = `${typeText}|null`;
            }

            constructorParamDocblockText = `\${${docblockTypeStop}:${typeText}} `;
        }

        if (config('phpAddProperty.constructor.docblock.stopToImport') === true) {
            constructorParamDocblockText += `\$${dockblockImportStop}`;
        }

        constructorParamDocblockText += `\\$${this.getName()}`;

        if (config('phpAddProperty.constructor.docblock.stopForDescription') === true) {
            constructorParamDocblockText += `\$${tabStops.constructorDocblockDescription}`;
        }

        return ` * @param ${constructorParamDocblockText}`;
    }
}
