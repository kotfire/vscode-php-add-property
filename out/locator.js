"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_1 = require("./class");
const constructor_1 = require("./constructor");
class Locator {
    constructor(ast) {
        this.ast = ast;
    }
    findClass(cursorAtLine) {
        let firstClass;
        const cursorClass = filter(this.ast, 'class', function (node) {
            if (!firstClass) {
                firstClass = new class_1.default(node);
            }
            if (!cursorAtLine || (cursorAtLine >= node.loc.start.line && cursorAtLine <= node.loc.end.line)) {
                return new class_1.default(node);
            }
        });
        return cursorClass || firstClass;
    }
    findConstructor() {
        return filter(this.ast, 'method', function (node) {
            var _a;
            if (((_a = node.name) === null || _a === void 0 ? void 0 : _a.name) === '__construct') {
                return new constructor_1.default(node);
            }
        });
    }
}
exports.default = Locator;
function filter(ast, kind, matcher) {
    let result;
    if (Array.isArray(ast)) {
        for (var i = 0; i < ast.length; i++) {
            result = filter(ast[i], kind, matcher);
            if (result) {
                return result;
            }
        }
    }
    else {
        if ((ast === null || ast === void 0 ? void 0 : ast.kind) === kind) {
            result = matcher(ast);
            if (result) {
                return result;
            }
        }
        for (const node in ast) {
            if (ast.hasOwnProperty(node) && ast[node] !== ast) {
                result = filter(ast[node], kind, matcher);
                if (result) {
                    return result;
                }
            }
        }
    }
}
//# sourceMappingURL=locator.js.map