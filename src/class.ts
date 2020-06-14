import Constructor from './constructor';

export default class Class {
    public ast: any;

    private construct?: Constructor;

    constructor(ast: any) {
        this.ast = ast;

        this.findConstructor();
    }

    public getConstructor() {
        return this.construct;
    }

    private findConstructor() {
        for (let i = 0; i < this.ast.body.length; i++) {
            const node = this.ast.body[i];

            if (node.kind === 'method' && node.name?.name === '__construct') {
                this.construct = new Constructor(node);
            }
        }
    }
}
