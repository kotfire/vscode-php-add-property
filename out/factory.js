"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const php_parser_1 = require("php-parser");
function createProperty(name, value) {
    let statement = `\$${name}`;
    if (value) {
        statement += ` = ${value}`;
    }
    const ast = php_parser_1.default.parseEval(`
        class a {
            ${statement};
        }
    `);
    return ast.children[0].body[0];
}
exports.createProperty = createProperty;
//# sourceMappingURL=factory.js.map