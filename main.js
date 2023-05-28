const fs = require('fs');
const path = require('path');
const lexer = require('./lexer');
const { Parser } = require('./parser');
const { Analyser } = require('./analyser');

const handleFile = (err, data) => {
    if (err) throw err
    const tokenStreamController = lexer.scan(data)
    if (!tokenStreamController) return;
    const parseTree = new Parser(tokenStreamController);
    const newParseTree = new Analyser(parseTree);
}

fs.readFile(path.join(__dirname, 'test1.kt'), 'utf8', handleFile)
