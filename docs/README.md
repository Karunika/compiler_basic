# CFG Grammar

This grammar describes a simple programming language that allows for the declaration and assignment of variables, as well as the use of expressions involving arithmetic operations.

```bash
<program> := <statement> <program> | ε
<statment> := <declaration> | <assignment>

<declaration> := keyword identifier ;
<declaration> := keyword identifier [ <expression> ] ;

<assignment> := identifier = <expression> ;

<expression> := <term> <expressionTail>
<expressionTail> := addop <term> <expressionTail> | ε

<term> := <factor> <termTail>
<termTail> := mulop <factor> <termTail> | ε

<factor> := ( <expression> ) | <idaccess> | { <list> } | <literal>

<idaccess> := <identifier> | <identifier> <subscript>
<subscript> := [ <expression> ] | [ <expression> rangeop <expression> ]

<list> := <literal>, <list> | <literal>

<literal> := integer | string | char | boolean
```

* `<program>`: Represents a program and consists of a `<statement>` followed by another `<program>`, or it can be empty (represented by ε) indicating the end of the program.

* `<statement>`: Represents either a `<declaration>` or an `<assignment>`
* `<declaration>`: Declares a variable using the keyword followed by an identifier. It can be followed by an optional expression within square brackets, indicating an array declaration.
* `<assignment>`: Assigns a value to a previously declared variable. It consists of an identifier followed by the assignment operator (=) and an `<expression>`.
* `<expression>`: Represents an arithmetic expression involving terms and expression tails. It starts with a `<term>` and can be followed by an optional `<expressionTail>`.
* `<expressionTail>`: Represents the tail part of an expression, which includes an operator (addop) followed by a `<term>` and another `<expressionTail>`. It can also be empty (ε), indicating the end of the expression.
* `<term>`: Represents a term in an arithmetic expression, consisting of a `<factor>` followed by an optional `<termTail>`.
* `<termTail>`: Represents the tail part of a term, which includes an operator (mulop) followed by a `<factor>` and another `<termTail>`. It can also be empty (ε), indicating the end of the term.
* `<factor>`: Represents a factor in an arithmetic expression, which can be enclosed in parentheses, an `<idaccess>`, a list of literals within curly braces, or a `<literal>`.
* `<idaccess>`: Represents accessing an identifier, either as a standalone identifier or followed by a `<subscript>`. It allows for array indexing.
* `<subscript>`: Represents the indexing of an array, enclosed in square brackets. It can either include a single expression or a range expression (with a range operator).
* `<list>`: Represents a list of literals, separated by commas and enclosed in curly braces.
* `<literal>`: Represents a literal value, such as an integer, string, character, or boolean.

Overall, this grammar allows for the representation of basic variable declaration, assignment, arithmetic expressions, array indexing, and the use of literals.

## Symbol Table

In the context of the provided grammar, the symbol table is a data structure used by a compiler or interpreter to keep track of information about variables and their usages within a program. It maintains important details such as variable names, data types, and scope information.

```
int arr[5];
arr = {1,2,3,4,5};

// assignment scope 1

arr = {5,4,3,2,1};

// assignment scope 2

// end of file
```

For each assignment scope for an array type variable, a range table is maintained that keeps trach of the number of similar range accesses in that scope.

for instance, symbol Table Entry for "arr" might look something like the following:

* Name: "arr"
* Data Type: "int[]"
    * Scope 1 Range Table:
        * Range: [2, 4]
            * Access Count: 1
        * Range: [3, 5]
            * Access Count: 0 (no range access in this scope)
    * Scope 2 Range Table:
        * Range: [2, 4]
            * Access Count: 0 (no range access in this scope)
        * Range: [3, 5]
            * Access Count: 1


## Generator

Generator declare and initialize a new variable for every range that has been accessed more than twice within each assignment scope.

By performing these optimizations, the code can avoid redundant range access operations. Instead of repeatedly accessing the same range within a loop or block, the optimized code stores the range values in separate variables, eliminating the need for multiple range accesses. This can improve performance by reducing computation time and potentially optimize memory usage.

It's important to note that this optimization technique assumes that accessing a range multiple times within a scope is more expensive than storing the range values in a separate variable. The decision to apply this optimization should be based on the specific characteristics of the programming language, the runtime environment, and the expected usage patterns of the code. Additionally, appropriate scoping rules should be considered to ensure correct variable visibility and lifetime within the program.
