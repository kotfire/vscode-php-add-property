import Class from "./class";
import Constructor from "./constructor";

export default class Locator {
    private ast: any;

    constructor(ast: any) {
        this.ast = ast;
    }

    findClass(cursorAtLine?: number): Class | undefined {
        let firstClass: Class | undefined;
        const cursorClass = filter(this.ast, 'class', function (node: any) {
            if (!firstClass) {
                firstClass = new Class(node);
            }
            if (!cursorAtLine || (cursorAtLine >= node.loc.start.line && cursorAtLine <= node.loc.end.line)) {
                return new Class(node);
            }
        });

        return cursorClass || firstClass;
    }

    findConstructor(): Constructor | undefined {
        return filter(this.ast, 'method', function (node: any) {
            if (node.name?.name === '__construct') {
                return new Constructor(node);
            }
        });
    }
}

function filter(ast: any, kind: string, matcher: Function): any {
    let result;

    if (Array.isArray(ast)) {
        for (var i = 0; i < ast.length; i++) {
            result = filter(ast[i], kind, matcher);
            if (result) {
                return result;
            }
        }
    } else {
        if (ast?.kind === kind) {
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
