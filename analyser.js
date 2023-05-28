class Analyser {
    constructor(parseTree) {
        this.parseTree = parseTree;
        this.symbolTable = {};
        this.code = '';
        // this.generate();
        this.analyse(this.parseTree);
        // this.parseTree.print();
        return this.parseTree;
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
            console.log('symbol', identifier);
            throw new Error("already declared variable with same identifier before");
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
            throw new Error("identifier not declared");
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
            const value = this.factor(factor, type, isArray).value;
            node.setValue(value);
        } else {
            const termResult = this.term(node.children[0], 'integer', false).value;
            const value = this.expressionTail(node.children[1], termResult);
            node.setValue(value);
        }
        return node.value;
    }

    term(node) {
        const factorResult = this.factor(node.children[0], 'integer', false).value;
        return this.termTail(node.children[1], factorResult);
    }

    termTail(node, leftFactor) {
        if (node.children.length == 0) {
            return 1;
        }
        const isMultiplication = node.children[0].lexeme === '*';
        const factor = this.factor(node.children[1], 'integer', false);
        const rightFactor = this.termTail(node.children[2], factor);
        // console.log("term-tail", leftFactor, rightFactor)
        return isMultiplication ? leftFactor*rightFactor : Math.floor(leftFactor/rightFactor);
    }
    
    expressionTail(node, leftTerm) {
        if (node.children.length == 0) {
            return 1;
        }
        const isAddition = node.children[0].lexeme === '+';
        const term = this.factor(node.children[1], 'integer', false);
        const rightTerm = this.termTail(node.children[2], term);
        return isAddition ? leftTerm + rightTerm : leftTerm - rightTerm;
    }

    factor(node, type, isArray) {
        const first = node.children[0];
        if (first.type == 'token') {
            if (first.tokenType == 'openparen') {
                this.expression(node.children[1], type, isArray);
            } else if (first.tokenType == 'opencurly') {
                if (!isArray) {
                    throw new Error("array wrong type");
                }
                const list = this.list(node.children[1]);
                if (type == list.type) {
                    return list;
                } else {
                    throw new Error("array wrong type")
                }
            }
        } else {
            if (first.type == 'idaccess') {
                const value = this.idaccess(first, type, isArray);
                return value;
            } else if (first.type == 'literal') {
                return this.literal(first);
            }
        }
    }

    idaccess(node, type, isArray) {
        const identifier = node.children[0].lexeme,
            symbol = this.symbolTable[identifier];
        if (symbol.type != type) {
            throw new Error("incompatible type");
        }

        if (symbol) {
            if (symbol.isArray() && node.children.length == 2) {
                return this.subscript(node.children[1], identifier, isArray);
            } else {
                return symbol.value;
            }
        } else {
            throw new Error("identifier not declared");
        }
    }

    subscript(node, identifier, isArray) {
        const rangeop = node.children.length == 5;
        if (rangeop^isArray) {
            throw new Error("subscript type 160");
        }

        const symbol = this.symbolTable[identifier];
        if (!rangeop) {
            const index = this.expression(node.children[1], 'integer', false);
            symbol.addIndex(index);
            return { value: symbol.value[index] };
        } else {
            const initial = this.expression(node.children[1], 'integer', false),
                final = this.expression(node.children[3], 'integer', false);
            symbol.addRange(initial, final);
            return { value: symbol.value.slice(initial, final+1) };
        }
    }

    list(node, type = null) {
        const literal = this.literal(node.children[0]);
        if (type != null && type != literal.type) {
            throw new Error("types of the elements of the list is inconsistent");
        }
        if (node.children.length == 1) {
            return {
                value: [literal.value],
                type
            }
        }
        const list = this.list(node.children[2], literal.type);
        return {
            value: [literal.value, ...list.value],
            type: literal.type
        };
    }

    literal(node, type = null) {
        const literal = node.children[0];
        let value;
        if (literal.tokenType == 'integer') {
            value = parseInt(literal.lexeme);
        } else if (literal.tokenType == 'character') {
            value = literal.lexeme.replace(/'/g, '');
        } else if (literal.tokenType == 'string') {
            value = literal.lexeme.replace(/"/g, '');
        } else {
            value = literal.lexeme == 'True';
        }

        if (type != null && type != literal.tokenType) {
            throw new Errow("wrong type");
        }

        return {
            type: literal.tokenType,
            value
        }
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

    checkType(type) {
        return this.type == type;
    }

    isArray() {
        return false;
    }
}

class Array {
    constructor(type, length, value = null) {
        this.type = type;
        this.length = length;
        this.value = value;
        this.rangeTable = {};
        this.indexTable = {};
    }

    setValue(value) {
        this.value = value;
    }

    isArray() {
        return true;
    }

    addIndex(index) {
        this.indexTable[index] = -~this.indexTable[index]
    }

    addRange(initial, final) {
        const range = initial + ',' + final;
        this.rangeTable[range] = -~this.rangeTable[range]
    }
}

module.exports = { Analyser }
