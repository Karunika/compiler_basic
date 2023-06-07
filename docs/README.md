:# LL(1) Parser

This grammar describes a simple programming language that allows for the declaration and assignment of variables, as well as the use of expressions involving arithmetic operations.

```
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
