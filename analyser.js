class Analyser {
    constructor(parseTree) {
        this.parseTree = parseTree;
        this.symbolTable = { };
        this.expressionTable = { };
        this.code = ''
        this.generate();
        return this.code;
    }

    generate() {
        this.code = '';
        this.generator(this.parseTree);

    }

    generator(node) {
        if (node == null) {
            return;
        }
        if (node.type == "token") {
            this.code += node.lexeme;
            return;
        }
        for (let child of node.children) {
            this.generator(child);
        }
    }

    traverseTopDown() {
        
    }

}

module.exports = { Analyser }