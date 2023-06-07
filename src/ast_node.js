class ASTNode {
    constructor(type) {
        this.type = type;
        this.children = [];
        this.value = null;
    }

    push(childNode) {
        this.children.push(childNode);
    }

    setValue(value) {
        this.value = value;
    }

    print(node = this, indent = 0) {
        if (node.type == "token") {
            console.log("   ".repeat(indent), node)
            return;
        }
        console.log("   ".repeat(indent), node.type, ':', node.value);
        if (node.children.length == 0) {
            console.log("   ".repeat(indent+1), "epsilon"); 
        }
        for (let child of node.children) {
            this.print(child, indent+1);
        }
    }
}

module.exports = { ASTNode };
