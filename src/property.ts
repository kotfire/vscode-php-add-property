export default class Property {
    private name: string;
    private type?: string;

    constructor(name: string, type?: string) {
        this.name = name;
        this.type = type;
    }

    public getName() {
        return this.name;
    }

    public getType() {
        return this.type;
    }
}
