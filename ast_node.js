class ASTNode {
    constructor(type) {
        this.type = type;
        this.children = [];
    }

    push(childNode) {
        this.children.push(childNode);
    }
}

module.exports = { ASTNode };
