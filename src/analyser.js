class Analyser {
    constructor(parseTree) {
        this.parseTree = parseTree;
        this.symbolTable = {};
        this.code = '';
        this.analyse(this.parseTree);
        // for (let sym in this.symbolTable) {
        //     this.symbolTable[sym].print();
        // }
        // parseTree.print()
        return [this.parseTree, this.symbolTable];
    }

    analyse(node) {
        if (node && node.type == "token") {
            return;
        }

        switch(node.type) {
            case 'declaration':
                this.declaration(node);
                break;
            case 'assignment':
                this.assignment(node);
                break;
            default:
                for (let child of node.children) {
                    this.analyse(child);
                }
                break;
        }

    }

    declaration(node) {
        const keywordToType = {
            int: 'integer',
            char: 'character',
            string: 'string',
            bool: 'boolean'
        }
        const identifier = node.children[1].lexeme;
        if (this.symbolTable[identifier]) {
            throw new Error("[position " + node.children[1].position + ": already declared variable with the same identifier before] " + identifier);
        }
        const type = keywordToType[node.children[0].lexeme];
        if (node.children[2].tokenType == 'opensqrb') {
            const length = this.expression(node.children[3]);
            this.symbolTable[identifier] = new Array(type, length);
        } else {
            this.symbolTable[identifier] = new Variable(type);
        }
    }

    assignment(node) {
        const identifier = node.children[0].lexeme,
            symbol = this.symbolTable[identifier];
        if (symbol) {
            const computed = this.expression(node.children[2], symbol.type, symbol.isArray());
            symbol.setValue(computed);
        } else {
            throw new Error("[position " + node.children[0].position + ": identifier not declared] " + identifier);
        }
        return;
    }

    expression(node, type, isArray) {
        // non-arithemetic expressions should look like this:
        //                expresssion
        //               /           \
        //             term     expression_tail
        //            /   \             |
        //       factor   term_tail    epsilon
        //        /           \
        //     un-paren      epsilon
        //    thesised ex
        //     pression
        const term = node.children[0],
            expressiontail = node.children[1],
            factor = term.children[0],
            termtail = term.children[1];
        if (expressiontail.children.length == 0 && termtail.children.length == 0) {
            const value = this.factor(factor, type, isArray);
            node.setValue(value);
        } else {
            const term = this.term(node.children[0], 'integer', false),
                value = this.expressionTail(node.children[1], term);
            node.setValue(value);
        }
        return node.value;
    }

    term(node) {
        const factor = this.factor(node.children[0], 'integer', false);
        return this.termTail(node.children[1], factor);
    }

    termTail(node, leftFactor) {
        if (node.children.length == 0) {
            return leftFactor;
        }
        const isMultiplication = node.children[0].lexeme === '*';
        const rightFactor = this.factor(node.children[1], 'integer', false);
        const factor =  isMultiplication ? leftFactor*rightFactor : Math.floor(leftFactor/rightFactor);
        return this.termTail(node.children[2], factor);
    }
    
    expressionTail(node, leftTerm) {
        if (node.children.length == 0) {
            return leftTerm;
        }
        const isAddition = node.children[0].lexeme === '+',
            rightTerm = this.term(node.children[1]),
            term = isAddition ? leftTerm + rightTerm : leftTerm - rightTerm;
        return this.expressionTail(node.children[2], term);
    }

    factor(node, type, isArray) {
        const first = node.children[0];
        if (first.type == 'token') {
            if (first.tokenType == 'openparen') {
                return this.expression(node.children[1], type, isArray);
            } else if (first.tokenType == 'opencurly') {
                if (!isArray) {
                    throw new Error("[position " + first.position + ": array type not expected] {");
                }
                return this.list(node.children[1], type);
            }
        } else {
            if (first.type == 'idaccess') {
                return this.idaccess(first, type, isArray);
            } else if (first.type == 'literal') {
                return this.literal(first, type);
            }
        }
    }

    idaccess(node, type, isArray) {
        const identifier = node.children[0].lexeme,
            symbol = this.symbolTable[identifier];
        if (!symbol.isValidType(type)) {
            throw new Error("[position " + node.children[0].position + ": incompatible type] " + identifier + " type " + symbol.type);
        }

        if (symbol) {
            if (symbol.isArray() && node.children.length == 2) {
                return this.subscript(node.children[1], identifier, isArray);
            } else {
                return symbol.isArray() ? symbol.getValue() : symbol.value;
            }
        } else {
            throw new Error("[position " + node.children[0].position + ": identifier not declared] " + identifier);
        }
    }

    subscript(node, identifier, isArray) {
        const rangeop = node.children.length == 5;
        if (rangeop^isArray) {
            throw new Error("[position " + node.children[0].position + ": incompatible subscript operation] " + identifier);
        }

        const symbol = this.symbolTable[identifier];
        if (!rangeop) {
            const index = this.expression(node.children[1], 'integer', false);
            return symbol.getValueAtIndex(index);
        } else {
            const initial = this.expression(node.children[1], 'integer', false),
                final = this.expression(node.children[3], 'integer', false);
            return symbol.getValueAtRange(initial, final);
        }
    }

    list(node, type) {
        const literal = this.literal(node.children[0], type);
        if (node.children.length == 1) {
            return [literal]
        }
        const list = this.list(node.children[2], type);
        return [literal, ...list];
    }

    literal(node, type) {
        const literal = node.children[0];
        let value;
        if (literal.tokenType == 'integer') {
            value = parseInt(literal.lexeme);
        } else if (literal.tokenType == 'character') {
            value = literal.lexeme;
        } else if (literal.tokenType == 'string') {
            value = literal.lexeme;
        } else {
            value = literal.lexeme == 'True';
        }

        if (type != null && type != literal.tokenType) {
            throw new Error("[position " + literal.position + ": invalid literal type] " + literal.lexeme);
        }

        return value;
    }

}
        

class Variable {
    constructor(type, value = null) {
        this.type = type;
        this.value = value;
    }

    setValue(value) {
        this.value = value;
    }

    isValidType(type) {
        return this.type == type;
    }

    isArray() {
        return false;
    }

    print() {
        console.log('{');
        console.log('\ttype:', this.type);
        console.log('\tvalue:', this.value);
        console.log('}');
    }
}

const LENGTH = 5;

class Array {
    constructor(type, length) {
        this.type = type;
        this.length = length;
        this.value = []
        this.rangeTable = [];
        this.indexTable = [];
        this.ids = [];
        this.index = -1;
    }

    setValue(value) {
        if (value.length != this.length) {
            throw new Error("array size don't match");
        }
        this.value.push(value);
        this.rangeTable.push({});
        this.indexTable.push({});
    }

    getValue() {
        return this.value[this.value.length -1];
    }

    isArray() {
        return true;
    }

    isValidType(type) {
        return type == this.type;
    }

    getValueAtIndex(index) {
        if (index >= this.length) {
            throw new Error("range error, index out of bounds");
        }
        const current = this.indexTable[this.indexTable.length -1];
        if (current[index]) {
            current[index].counter++;
            return current[index].value;
        } else {
            current[index] = {
                counter: 1,
                value: this.value[this.value.length -1][index],
                id: makeid(LENGTH)
            }
            return current[index].value;
        }
    }
    
    getValueAtRange(initial, final) {
        if (initial > final || final >= this.length) {
            throw new Error("range error, index out of bounds");
        }
        const range = initial + '..' + final;
        const current = this.rangeTable[this.rangeTable.length -1];
        if (current[range]) {
            current[range].counter++;
            return current[range].value;
        } else {
            current[range] = {
                counter: 1,
                value: this.value[this.value.length -1].slice(initial, final+1),
                id: makeid(LENGTH)
            }
            return current[range].value;
        }
    }

    currentIndex() {
        return this.index;
    }

    nextIndex() {
        return this.index++;
    }

    print() {
        console.log('{');
        console.log('\ttype:', this.type);
        console.log('\tvalue:', this.value);
        console.log('\trange:');
        // for (let val of this.value) {
        //     console.log('\t\tval:', val);
        // }
        for (let range in this.rangeTable) {
            console.log('\t\t', range + ':', '{');
            console.log('\t\t\t', this.rangeTable[range])
            console.log('\t\t}');
        }
        console.log('}');
    }
}

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

module.exports = { Analyser }
