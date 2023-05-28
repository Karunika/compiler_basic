const {
    INTEGER,
    CHARACTER,
    STRING,
    BOOLEAN,
    KEYWORD,
    IDENTIFIER,
    MULOP,
    ADDOP,
    RANGEOP,
    OPENSQRB,
    CLOSESQRB,
    OPENPAREN,
    CLOSEPAREN,
    OPENCURLY,
    CLOSECURLY,
    ASSIGN,
    SEMICOLON,
    COMMA,
    WHITESPACE
} = require('./constants');

const scan = input => {
    const tokenStream = [];

    for (let lexemeBegin = 0; lexemeBegin < input.length;) {
        let lexeme, lexemeQuestion = '', found = false;

        for (let forward = lexemeBegin; ; forward++) {
            lexemeQuestion += input[forward];
            const token = analyse(lexemeQuestion);

            if (token != null) {
                lexeme = lexemeQuestion;
                found = true;
            }

            if (found && token == null) {
                tokenStream.push(analyse(lexeme))
                lexemeBegin = forward;
                break;
            }

            if (forward > input.length) {
                found = false;
                break;
            }

        }

        if (!found) {
            console.log(lexemeQuestion.match(/^.*\n/g)[0])
            console.log("unidentified token");
            return null;
        }

    }

    return new TokenStreamController(tokenStream)

}

class TokenStreamController {
    constructor(tokenStream) {
        this.tokenStream = tokenStream;
        this.index = 0;
    }

    current() {
        if (this.index >= this.tokenStream.length) {
            return null;
        }
        return this.tokenStream[this.index];
    }

    peek() {
        if (this.index >= this.tokenStream.length) {
            return null;
        } 
        return this.tokenStream[this.index++]
    }

    next() {
        if (this.index >= this.tokenStream.length) {
            return null;
        } 
        return this.tokenStream[this.index+1]
    }

    isExceeded() {
        return this.index >= this.tokenStream.length;
    }
}

const tokenRegEx = {
    [INTEGER]: /^[0-9]+$/,
    [CHARACTER]: /^\'.\'$/,
    [STRING]: /^\".*\"$/,
    [BOOLEAN]: /^(True|False)$/,
    [KEYWORD]: /^(int|char|string|boolean)$/,
    [IDENTIFIER]: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    [MULOP]: /^[\*\/]$/,
    [ADDOP]: /^[\+\-]$/,
    [RANGEOP]: /^\.\.$/,
    [OPENSQRB]: /^\[$/,
    [CLOSESQRB]: /^\]$/,
    [OPENPAREN]: /^\($/,
    [CLOSEPAREN]: /^\)$/,
    [OPENCURLY]: /^\{$/,
    [CLOSECURLY]: /^\}$/,
    [ASSIGN]: /^=$/,
    [SEMICOLON]: /^;$/,
    [COMMA]: /^,$/,
    [WHITESPACE]: /^[\n\s\t]*$/
};

const analyse = lexeme => {
    for (let tokenType in tokenRegEx) {
        if (tokenRegEx[tokenType].test(lexeme)) {
            return {
                type: "token",
                tokenType,
                lexeme
            }
        }
    }
    return null;
}

module.exports = { scan };
