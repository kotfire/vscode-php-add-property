"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constructor_1 = require("./constructor");
class Class {
    constructor(ast) {
        this.ast = ast;
        this.findConstructor();
    }
    getConstructor() {
        return this.construct;
    }
    findConstructor() {
        var _a;
        for (let i = 0; i < this.ast.body.length; i++) {
            const node = this.ast.body[i];
            if (node.kind === 'method' && ((_a = node.name) === null || _a === void 0 ? void 0 : _a.name) === '__construct') {
                this.construct = new constructor_1.default(node);
            }
        }
    }
}
exports.default = Class;
//# sourceMappingURL=class.js.map