class Generator {
    constructor(parseTree, symbolTable) {
        this.parseTree = parseTree;
        this.symbolTable = symbolTable;
        this.code = '';
        this.generate();
        console.log(this.code);
        return this.code;
    }

    generate() {
        this.code = '';
        this.program(this.parseTree.children[0]);
    }

    program(node) {
        this.statement(node.children[0]);
        if (node.children.length > 1) {
            this.program(node.children[1]);
        }
    }

    statement(node) {
        const statement = node.children[0];
        if (statement.type == 'declaration') {
            this.declaration(node.children[0]);
        } else if (statement.type == 'assignment') {
            this.assignment(node.children[0]);
        }
    }

    declaration(node) {
        const type = node.children[0],
            identifier = node.children[1].lexeme,
            symbol = this.symbolTable[identifier];
        this.code += type.lexeme + ' ' + identifier;
        if (symbol.isArray()) {
            this.code += '[' + symbol.length+ ']';
        }
        this.code += ';\n';
    }

    assignment(node) {
        const typeToKeyword = {
            integer: 'int',
            character: 'char',
            string: 'string',
            boolean: 'bool'
        }
        const identifier = node.children[0].lexeme,
            expression = node.children[2],
            symbol = this.symbolTable[identifier];
        this.code += identifier + ' = ' + this.expression(expression) + ';\n';
        if (symbol.isArray()) {
            symbol.nextIndex();
            const assignScopeIndex = symbol.currentIndex(),
                rangeTable = symbol.rangeTable[assignScopeIndex];
            for (let range in rangeTable) {
                const { id, counter } = rangeTable[range];
                if (counter > 1) {
                    this.code += typeToKeyword[symbol.type] + ' ' + identifier + '[' + symbol.length + '];\n';
                    this.code += id + ' = ' + identifier + '[' + range + '];\n';
                }
            }
        }
    }

    expression(node) {
        const term = node.children[0],
            expressiontail = node.children[1],
            factor = term.children[0],
            termtail = term.children[1];
        if (expressiontail.children.length == 0 && termtail.children.length == 0) {
            const idaccess = factor.children[0];
            if (idaccess.type == 'idaccess' && idaccess.children.length > 1) {
                const identifier = idaccess.children[0].lexeme,
                    subscript = idaccess.children[1];
                if (subscript.children.length == 5) {
                    const symbol = this.symbolTable[identifier],
                        initial = subscript.children[1].value,
                        final = subscript.children[3].value;
                        return symbol.rangeTable[symbol.currentIndex()][initial + '..' + final].id;
                } else {
                    return node.value;
                }
            } else {
                return node.value;
            }
        } else {
            return node.value;
        }
    }
}

module.exports = { Generator };
