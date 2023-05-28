const { ASTNode } = require('./ast_node');

class Parser {
    constructor(tokenStreamController) {
        this.tokenStream = tokenStreamController;
        this.rootNode = new ASTNode("root");
        this.program();
        return this.rootNode;
    }

    print(node = this.rootNode, indent = 0) {
        if (node.type == "token") {
            console.log("   ".repeat(indent), node)
            return;
        }
        console.log("   ".repeat(indent), node.type, ':');
        if (node.children.length == 0) {
            console.log("   ".repeat(indent+1), "epsilon"); 
        }
        for (let child of node.children) {
            this.print(child, indent+1);
        }
    }

    program(parentNode = this.rootNode) {
        const currentNode = new ASTNode("program");
        this.statement(currentNode);
        this.optionalWhitespace(currentNode);
        if (!this.tokenStream.isExceeded()) {
            this.program(currentNode);
        }
        parentNode.push(currentNode);
    }

    statement(parentNode) {
        const currentNode = new ASTNode("statement");
        const currentToken = this.tokenStream.current().tokenType;
    
        if(currentToken == 'keyword') {
            this.declaration(currentNode);
        } else if (currentToken== 'identifier') {
            this.assignment(currentNode);
        }
    
        parentNode.push(currentNode);
    }

    declaration(parentNode) {
        const currentNode = new ASTNode("declaration")
        this.keyword(currentNode);
        this.whitespace(currentNode);
        this.identifier(currentNode);

        const currentToken = this.tokenStream.current().tokenType;
        if (currentToken == 'opensqrb') {
            this.opensqrb(currentNode);
            this.expression(currentNode);
            this.closesqrb(currentNode);
        }
        this.optionalWhitespace(currentNode);
        this.semicolon(currentNode);
        parentNode.push(currentNode);
    }

    assignment(parentNode) {
        const currentNode = new ASTNode("assignment");
        this.identifier(currentNode);
        this.optionalWhitespace(currentNode);
        this.assign(currentNode);
        this.optionalWhitespace(currentNode);
        this.expression(currentNode);
        this.optionalWhitespace(currentNode);
        this.semicolon(currentNode);
        parentNode.push(currentNode);
    }

    expression(parentNode) {
        const currentNode = new ASTNode("expression");
        this.term(currentNode);
        this.expressionTail(currentNode);
        parentNode.push(currentNode);
    }

    expressionTail(parentNode) {
        const currentNode = new ASTNode("expression-tail");
        const currentToken = this.tokenStream.current().tokenType;
    
        if(currentToken == 'addop') {
            this.addop(currentNode);
            this.term(currentNode);
            this.expressionTail(currentNode);
        }

        parentNode.push(currentNode);
    }

    term(parentNode) {
        const currentNode = new ASTNode("term");
        this.factor(currentNode);
        this.termTail(currentNode);
        parentNode.push(currentNode);
    }

    termTail(parentNode) {
        const currentNode = new ASTNode("term-tail");
        const currentToken = this.tokenStream.current().tokenType;

        if(currentToken == 'mulop') {
            this.mulop(currentNode);
            this.factor(currentNode);
            this.termTail(currentNode);
        }

        parentNode.push(currentNode);
    }

    factor(parentNode) {
        const currentNode = new ASTNode("factor");
        const currentToken = this.tokenStream.current().tokenType;

        if (currentToken == 'openparen') {
            this.openparen(currentNode);
            this.expression(currentNode);
            this.closeparen(currentNode);
        } else if (currentToken == 'identifier') {
            this.idaccess(currentNode);
        } else if (currentToken == 'opencurly') {
            this.opencurly(currentNode);
            this.list(currentNode);
            this.closecurly(currentNode);
        } else {
            this.literal(currentNode);
        }

        parentNode.push(currentNode);
    }

    literal(parentNode) {
        const currentNode = new ASTNode('literal');
        const currentToken = this.tokenStream.current().tokenType;

        if (currentToken == 'integer') {
            this.integer(currentNode);
        } else if (currentToken == 'string') {
            this.string(currentNode);
        } else if (currentToken == 'char') {
            this.char(currentNode);
        } else if (currentToken == 'boolean') {
            this.boolean(currentNode);
        } else {
            throw new Error("error");
        }

        parentNode.push(currentNode);
    }

    idaccess(parentNode) {
        const currentNode = new ASTNode("idaccess");

        this.identifier(currentNode);

        const currentToken = this.tokenStream.current().tokenType;
        if (currentToken == 'opensqrb') {
            this.subscript(currentNode);
        }

        parentNode.push(currentNode);
    }

    subscript(parentNode) {
        const currentNode = new ASTNode("subscript");

        this.opensqrb(currentNode);
        this.expression(currentNode);

        const currentToken = this.tokenStream.current().tokenType;
        if (currentToken == 'rangeop') {
            this.rangeop(currentNode);
            this.expression(currentNode);
        }

        this.closesqrb(currentNode);

        parentNode.push(currentNode);
    }

    list(parentNode) {
        const currentNode = new ASTNode("list");

        this.optionalWhitespace(currentNode);
        this.literal(currentNode);
        this.optionalWhitespace(currentNode);

        const currentToken = this.tokenStream.current().tokenType;
        if (currentToken == 'comma') {
            this.comma(currentNode);
            this.optionalWhitespace(currentNode);
            this.list(currentNode);
        }

        parentNode.push(currentNode);
    }

    addop(node) {
        return this.checkTerminal(node, 'addop');
    }

    mulop(node) {
        return this.checkTerminal(node, 'mulop');
    }

    rangeop(node) {
        return this.checkTerminal(node, 'rangeop');
    }

    openparen(node) {
        return this.checkTerminal(node, 'openparen');
    }

    closeparen(node) {
        return this.checkTerminal(node, 'closeparen');
    }

    opensqrb(node) {
        return this.checkTerminal(node, 'opensqrb');
    }

    closesqrb(node) {
        return this.checkTerminal(node, 'closesqrb');
    }

    opencurly(node) {
        return this.checkTerminal(node, 'opencurly');
    }

    closecurly(node) {
        return this.checkTerminal(node, 'closecurly');
    }

    keyword(node) {
        return this.checkTerminal(node, "keyword");
    }

    whitespace(node) {
        return this.checkTerminal(node, "whitespace");
    }

    optionalWhitespace(node) {
        if (this.tokenStream.current() == null || this.tokenStream.current().tokenType != "whitespace")
            return;
        return this.checkTerminal(node, "whitespace");
    }

    identifier(node) {
        return this.checkTerminal(node, "identifier");
    }

    integer(node) {
        return this.checkTerminal(node, "integer");
    }

    string(node) {
        return this.checkTerminal(node, "string");
    }

    char(node) {
        return this.checkTerminal(node, "char");
    }

    boolean(node) {
        return this.checkTerminal(node, "boolean");
    }

    assign(node) {
        return this.checkTerminal(node, "assign");
    }

    semicolon(node) {
        return this.checkTerminal(node, "semicolon");
    }

    comma(node) {
        return this.checkTerminal(node, "comma");
    }

    checkTerminal(node, tokenType) {
        const valid = this.tokenStream.current().tokenType == tokenType;
        if (valid) {
            if (tokenType == 'whitespace') {
                this.tokenStream.peek();
            } else {
                node.push(this.tokenStream.peek())
            }
        }
        else throw Error("error")
        return valid;
    }
}

module.exports = { Parser };
