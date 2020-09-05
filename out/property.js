"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class Property {
    constructor(name, type) {
        this.name = name;
        this.type = type;
    }
    getName() {
        return this.name;
    }
    getType() {
        return this.type;
    }
    getStatementText(tabStops) {
        let docblockTypeStop = tabStops.propertyDocblockType;
        let dockblockImportStop = tabStops.propertyDocblockImport;
        if (utils_1.config('phpAddProperty.property.docblock.withParameter') === true) {
            docblockTypeStop = tabStops.constructorParameterType;
            dockblockImportStop = tabStops.constructorParameterStop;
            tabStops.constructorParameterStop++;
        }
        let propertyStatementText = '';
        if (utils_1.config('phpAddProperty.property.docblock.add') === true) {
            let stopText = '';
            if (utils_1.config('phpAddProperty.property.docblock.stopToImport') === true) {
                stopText += `$${dockblockImportStop}`;
            }
            stopText += `$${docblockTypeStop}`;
            if (utils_1.config('phpAddProperty.property.docblock.multiline') === true) {
                propertyStatementText += `/**\n${utils_1.indentText(' * @var ')}${stopText}\n${utils_1.indentText(' */')}\n${utils_1.indentText('')}`;
            }
            else {
                if (utils_1.config('phpAddProperty.property.docblock.withParameter') === false) {
                    stopText += ' ';
                }
                propertyStatementText += `/** @var ${stopText}*/\n${utils_1.indentText('')}`;
            }
        }
        const visibility = utils_1.config('phpAddProperty.property.visibility.default');
        propertyStatementText += utils_1.config('phpAddProperty.property.visibility.choose') === true
            ? `\${${tabStops.propertyVisibility}${utils_1.getVisibilityChoice(visibility)}} `
            : `${visibility} `;
        if (utils_1.config('phpAddProperty.property.types') === true) {
            propertyStatementText += `$${tabStops.constructorParameterType}`;
        }
        propertyStatementText += `\\$${this.getName()};`;
        return propertyStatementText;
    }
    getParameterText(tabStops) {
        let tabStopsText = `$${tabStops.constructorParameterType}`;
        if (this.getType()) {
            tabStopsText = `\${${tabStops.constructorParameterType}:${this.getType()}}`;
        }
        if (utils_1.config('phpAddProperty.property.stopToImport') === true) {
            tabStopsText += `$${tabStops.constructorParameterStop}`;
        }
        let parameterText = `${tabStopsText}`;
        if (this.getType()) {
            parameterText += ' ';
        }
        parameterText += `\\$${this.getName()}`;
        return parameterText;
    }
    getConstructorParamDocblockText(tabStops) {
        let docblockTypeStop = tabStops.constructorDocblockType;
        let dockblockImportStop = tabStops.constructorDocblockImport;
        if (utils_1.config('phpAddProperty.constructor.docblock.withParameter') === true) {
            docblockTypeStop = tabStops.constructorParameterType;
            dockblockImportStop = tabStops.constructorParameterStop;
            tabStops.constructorParameterStop++;
        }
        let constructorParamDocblockText = `\${${docblockTypeStop}}`;
        if (this.getType()) {
            constructorParamDocblockText = `\${${docblockTypeStop}:${this.getType()}} `;
        }
        if (utils_1.config('phpAddProperty.constructor.docblock.stopToImport') === true) {
            constructorParamDocblockText += `\$${dockblockImportStop}`;
        }
        constructorParamDocblockText += `\\$${this.getName()}`;
        if (utils_1.config('phpAddProperty.constructor.docblock.stopForDescription') === true) {
            constructorParamDocblockText += `\$${tabStops.constructorDocblockDescription}`;
        }
        return ` * @param ${constructorParamDocblockText}`;
    }
}
exports.default = Property;
//# sourceMappingURL=property.js.map