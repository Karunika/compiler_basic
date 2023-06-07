const assert = require('assert');
const { generateCode, getFileContent } = require('./../util.js');

generateCode('')

describe('type checking: declaration and assignment', () => {
    describe('primitive types', () => {
        it('integer type', () => {
            assert.equal(generateCode('int i;\ni = 8;'), 'int i;\ni = 8;\n');
        });

        it('string type', () => {
            const code = 'string s;\ns = "this is string";',
                result = 'string s;\ns = "this is string";\n';
            assert.equal(generateCode(code), result);
        });

        it('boolean type', () => {
            const code = 'bool b;\nb = False;',
                result = 'bool b;\nb = false;\n';
            assert.equal(generateCode(code), result);
        });

        it('character type', () => {
            const code = 'char c;\nc = \'a\';',
                result = 'char c;\nc = \'a\';\n';
            assert.equal(generateCode(code), result);
        });
    });

    describe('array types', () => {
        it('integer type', () => {
            const code = 'int i[4];\ni = {1, 2, 3, 4};',
                result = 'int i[4];\ni = {1,2,3,4};\n';
            assert.equal(generateCode(code), result);
        });

        it('string type', () => {
            const code = 'string s[4];\ns = {"str1", "str2", "str3", "str4"};',
                result = 'string s[4];\ns = {"str1","str2","str3","str4"};\n';
            assert.equal(generateCode(code), result);
        });

        it('boolean type', () => {
            const code = 'bool b[4];\nb = {False, True, False, True};',
                result = 'bool b[4];\nb = {false,true,false,true};\n';
            assert.equal(generateCode(code), result);
        });

        it('character type', () => {
            const code = 'char c[4];\nc = {\'a\', \'b\', \'c\', \'d\'};',
                result = 'char c[4];\nc = {\'a\',\'b\',\'c\',\'d\'};\n';
            assert.equal(generateCode(code), result);
        });
    });
});


describe('arithmetic on integers', () => {
    it('addition', () => {
        const code = 'int i;\ni = 8+4;',
            result = 'int i;\ni = 12;\n';
        assert.equal(generateCode(code), result);
    });

    it('subtraction', () => {
        const code = 'int i;\ni = 8-12;',
            result = 'int i;\ni = -4;\n';
        assert.equal(generateCode(code), result);
    });

    it('both', () => {
        const code = 'int i;\ni = 12+4-6;',
            result = 'int i;\ni = 10;\n';
        assert.equal(generateCode(code), result);
    });

    it('multiplication', () => {
        const code = 'int i;\ni = 8*4;',
            result = 'int i;\ni = 32;\n';
        assert.equal(generateCode(code), result);
    });

    it('division', () => {
        const code = 'int i;\ni = 13/3;',
            result = 'int i;\ni = 4;\n';
        assert.equal(generateCode(code), result);
    });

    it('parenthesis', () => {
        const code = 'int i;\ni = (12-9);',
            result = 'int i;\ni = 3;\n';
        assert.equal(generateCode(code), result);
    });

    it('everything', () => {
        const code = 'int i;\ni = ((12-9)*2)/3+4;',
            result = 'int i;\ni = 6;\n';
        assert.equal(generateCode(code), result);
    });
});

describe('identifier subscript access', () => {
    describe('subscript indexing', () => {
        it('basic indexing', () => {
            const code = `
                    int i[6];
                    i = {3, 4, 5, 6, 2, 7};
                    int i2;
                    i2 = i[0];
                `,
                result = `int i[6];
i = {3,4,5,6,2,7};
int i2;
i2 = 3;
`;
            assert.equal(generateCode(code), result);
        });
    
        it('arithmetic indexing', () => {
            const code = `
                    int i[6];
                    i = {3, 4, 5, 6, 2, 7};
                    int i2;
                    i2 = i[4-2];
                `,
                result = `int i[6];
i = {3,4,5,6,2,7};
int i2;
i2 = 5;
`;
            assert.equal(generateCode(code), result);
        });
    })

    describe('range indexing', () => {
        it('basic indexing', () => {
            const code = `
                    int i[6];
                    i = {3, 4, 5, 6, 2, 7};
                    int i2[2];
                    i2 = i[2..3];
                `,
                result = `int i[6];
i = {3,4,5,6,2,7};
int i2[2];
i2 = i[2..3];
`;
            assert.equal(generateCode(code), result);
        });
    
        it('arithmetic indexing', () => {
            const code = `
                    int i[6];
                    i = {3, 4, 5, 6, 2, 7};
                    int i2[2];
                    i2 = i[4-2..7/2];
                `,
                result = `int i[6];
i = {3,4,5,6,2,7};
int i2[2];
i2 = i[2..3];
`;
            assert.equal(generateCode(code), result);
        });
    })
});

describe('using id access in arithmetic', () => {
    it('addition', () => {
        const code = `
            int arr[3];
            arr = {4, 5, 6};

            int i;
            i = arr[0]+4;
        `,
        result = `int arr[3];
arr = {4,5,6};
int i;
i = 8;
`;
    assert.equal(generateCode(code), result);
    })

    it('subtraction', () => {
        const code = `
            int arr[3];
            arr = {4, 5, 6};

            int i;
            i = arr[1]-4;
        `,
        result = `int arr[3];
arr = {4,5,6};
int i;
i = 1;
`;
    assert.equal(generateCode(code), result);
    })

    it('parenthesis', () => {
        const code = `
            int arr[3];
            arr = {4, 5, 6};

            int i;
            i = (5*arr[1])-4;
        `,
        result = `int arr[3];
arr = {4,5,6};
int i;
i = 21;
`;
    assert.equal(generateCode(code), result);
    })
})

describe('code optimization', () => {
    it('computed range index', () => {
        const code = `
            int arr[9];
            arr = {4, 5, 6, 7, 0, 1, 3, 9, 3};
            
            int x[arr[0]+1];
            x = arr[1..5];
            
            int y[5];
            y = arr[arr[2]-5..arr[2]-1];
        `,
        resultPattern = new RegExp(`int arr\\[9\\];
arr = \\{4,5,6,7,0,1,3,9,3\\};
int ([a-zA-Z]{5})\\[9\\];
\\1 = arr\\[1\\.\\.5\\];
int x\\[5\\];
x = \\1;
int y\\[5\\];
y = \\1;
`);

        assert.match(generateCode(code), resultPattern)

    })

    it('multiple range operation', () => {
        const code = `
            int arr[4];
            arr = {1, 2, 3, 4};

            int newArr[2];
            newArr = arr[2..3];

            int anotherArray[2];
            anotherArray = arr[2..3];
        `,
        resultPattern = new RegExp(`int arr\\[4\\];
arr = \\{1,2,3,4\\};
int ([a-zA-Z]{5})\\[4\\];
\\1 = arr\\[2\\.\\.3\\];
int newArr\\[2\\];
newArr = \\1;
int anotherArray\\[2\\];
anotherArray = \\1;
`);

        assert.match(generateCode(code), resultPattern)

    })

    it('assignment scopes', () => {
        const code = `
            int arr[4];
            arr = {1, 2, 3, 4};

            int newArr[2];
            newArr = arr[2..3];

            int anotherArray[2];
            anotherArray = arr[2..3];

            arr = {9, 8, 7, 6};

            newArr = arr[2..3];

            anotherArray = arr[2..3];
        `,
        resultPattern = new RegExp(`int arr\\[4\\];
arr = \\{1,2,3,4\\};
int ([a-zA-Z]{5})\\[4\\];
\\1 = arr\\[2\\.\\.3\\];
int newArr\\[2\\];
newArr = \\1;
int anotherArray\\[2\\];
anotherArray = \\1;
arr = \\{9,8,7,6\\};
int ([a-zA-Z]{5})\\[4\\];
\\2 = arr\\[2\\.\\.3\\];
newArr = \\2;
anotherArray = \\2;
`);
        assert.match(generateCode(code), resultPattern);
    })

    it('more than one repeated range accesses', () => {
        const code = `
            int arr[4];
            arr = {1, 2, 3, 4};
            
            int newArr[2];
            newArr = arr[2..3];
            newArr = arr[1..2];
            
            int anotherArray[2];
            anotherArray = arr[2..3];
            anotherArray = arr[1..2];
            
            arr = {9, 8, 7, 6};
            
            newArr = arr[2..3];
            
            anotherArray = arr[2..3];    
        `,
        resultPattern = new RegExp(`int arr\\[4\\];
arr = \\{1,2,3,4\\};
int ([a-zA-Z]{5})\\[4\\];
\\1 = arr\\[2\\.\\.3\\];
int ([a-zA-Z]{5})\\[4\\];
\\2 = arr\\[1\\.\\.2\\];
int newArr\\[2\\];
newArr = \\1;
newArr = \\2;
int anotherArray\\[2\\];
anotherArray = \\1;
anotherArray = \\2;
arr = \\{9,8,7,6\\};
int ([a-zA-Z]{5})\\[4\\];
\\3 = arr\\[2\\.\\.3\\];
newArr = \\3;
anotherArray = \\3;
`);
        assert.match(generateCode(code), resultPattern);
    })
})

describe('error log for exceptions', () => {
    describe('undefined token', () => {
        it('basic case', () => {
            const code = `.`,
                result = `Error: [position 0: undefined token] .`
            assert.equal(generateCode(code), result);
        });
    
        it('gibberish', () => {
            const code = `_39jd`,
                result = `Error: [position 0: undefined token] _39jd`
            assert.equal(generateCode(code), result);
        });
    
        it('using wrong assignment', () => {
            const code = `int i; i := 4;`,
                result = `Error: [position 9: undefined token] := 4;`
            assert.equal(generateCode(code), result);
        });
    })

    describe('syntactic error', () => {
        it('missing semicolon', () => {
            const code = `int gh; gh = 6`,
                result = `[syntax error] found nothing\nexpected semicolon`
            assert.equal(generateCode(code), result);
        });

        it('missing assignment', () => {
            const code = `int gh;gh 6;`,
                result = `Error: [position 10: syntax error] found 6\nexpected assign`
            assert.equal(generateCode(code), result);
        });
    })

    describe('semantic error', () => {
        it('identifier not declared', () => {
            const code = `
                    int iHaveBeenDeclared;
                    iHaveBeenDeclared = 8;
                    iHaveNotBeenDeclared = 9;
                `,
                result = `Error: [position 107: identifier not declared] iHaveNotBeenDeclared`
            assert.equal(generateCode(code), result);
        });

        it('identifier already declared', () => {
            const code = `
                int iHaveAlreadyBeenDeclared;
                iHaveAlreadyBeenDeclared = 8;
                int iHaveAlreadyBeenDeclared;
            `,
            result = `Error: [position 113: already declared variable with the same identifier before] iHaveAlreadyBeenDeclared`
            assert.equal(generateCode(code), result);
        });

        it('assigning array to non-array type', () => {
            const code = `
                int iAmNotArray;
                iAmNotArray = {6,7};
            `,
            result = `Error: [position 64: array type not expected] {`
            assert.equal(generateCode(code), result);
        });

        it('assigning primitive to array', () => {
            const code = `
                int arr[2];
                arr = {6,7};

                int newArr[2];
                newArr = arr[0];
            `,
            result = `Error: [position 118: incompatible subscript operation] arr`
            assert.equal(generateCode(code), result);
        });

        describe('assigning wrong types', () => {
            it('string to int', () => {
                const code = `
                    string s;
                    s = "this is a string";
    
                    int i;
                    i = s;
                `,
                result = `Error: [position 131: incompatible type] s type string`
                assert.equal(generateCode(code), result);
            });

            it('bool to int', () => {
                const code = `
                    bool b;
                    b = False;
    
                    int i;
                    i = b;
                `,
                result = `Error: [position 116: incompatible type] b type boolean`
                assert.equal(generateCode(code), result);
            });
        })
    })
});

