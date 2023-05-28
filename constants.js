module.exports = {
    // terminals
    INTEGER: 'integer',
    CHARACTER: 'character',
    STRING: 'string',
    BOOLEAN: 'boolean',
    KEYWORD: 'keyword',
    IDENTIFIER: 'identifier',
    MULOP: 'mulop',
    ADDOP: 'addop',
    RANGEOP: 'rangeop',
    OPENSQRB: 'opensqrb',
    CLOSESQRB: 'closesqrb',
    OPENPAREN: 'openparen',
    CLOSEPAREN: 'closeparen',
    OPENCURLY: 'opencurly',
    CLOSECURLY: 'closecurly',
    ASSIGN: 'assign',
    SEMICOLON: 'semicolon',
    COMMA: 'comma',
    WHITESPACE: 'whitespace',

    // non-terminals
    PROGRAM: 'program',
    STATEMENT: 'statement',
    DECLARATION: 'declaration',
    ASSIGNMENT: 'assignment',
    EXPRESSION: 'expression',
    EXPRESSIONTAIL: 'expressiontail',
    TERM: 'term',
    TERMTAIL: 'termtail',
    FACTOR: 'factor',
    LITERAL: 'literal',
    IDACCESS: 'idaccess',
    SUBSCRIPT: 'subscript',
    LIST: 'list',

    // misc
    EPSILON: 'epsilon'

    // error codes
}


