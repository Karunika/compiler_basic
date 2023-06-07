const fs = require('fs');
const path = require('path');
const lexer = require('./src/lexer');
const { Parser } = require('./src/parser');
const { Analyser } = require('./src/analyser');
const { Generator } = require('./src/generator');


const generateCode = (data) => {
    try {
        const tokenStreamController = lexer.scan(data);
        const parseTree = new Parser(tokenStreamController);
        const [newParseTree, symbolTable] = new Analyser(parseTree);
        const generatedCode = new Generator(newParseTree, symbolTable);
        return generatedCode.code;
    } catch (err) {
        return err;
    }
}

const getFileContent = (file) => {
    return fs.readFileSync(path.join(__dirname, file), 'utf8');
}

module.exports = {
    getFileContent,
    generateCode
}
