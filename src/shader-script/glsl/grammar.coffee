# The CoffeeScript parser is generated by [Jison](http://github.com/zaach/jison)
# from this grammar file. Jison is a bottom-up parser generator, similar in
# style to [Bison](http://www.gnu.org/software/bison), implemented in JavaScript.
# It can recognize [LALR(1), LR(0), SLR(1), and LR(1)](http://en.wikipedia.org/wiki/LR_grammar)
# type grammars. To create the Jison parser, we list the pattern to match
# on the left-hand side, and the action to take (usually the creation of syntax
# tree nodes) on the right. As the parser runs, it
# shifts tokens from our token stream, from left to right, and
# [attempts to match](http://en.wikipedia.org/wiki/Bottom-up_parsing)
# the token sequence against the rules below. When a match can be made, it
# reduces into the [nonterminal](http://en.wikipedia.org/wiki/Terminal_and_nonterminal_symbols)
# (the enclosing name at the top), and we proceed from there.
#
# If you run the `cake build:parser` command, Jison constructs a parse table
# from our rules and saves it into `lib/parser.js`.

# The only dependency is on the **Jison.Parser**.
{Parser} = require 'jison'

# Jison DSL
# ---------

# Since we're going to be wrapped in a function by Jison in any case, if our
# action immediately returns a value, we can optimize by removing the function
# wrapper and just returning the value directly.
unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/

# Our handy DSL for Jison grammar generation, thanks to
# [Tim Caswell](http://github.com/creationix). For every rule in the grammar,
# we pass the pattern-defining string, the action to run, and extra options,
# optionally. If no action is specified, we simply pass the value of the
# previous nonterminal.
o = (patternString, action, options) ->
  patternString = patternString.replace /\s{2,}/g, ' '
  return [patternString, '$$ = $1;', options] unless action
  action = if match = unwrap.exec action then match[1] else "(#{action}())"
  action = action.replace /\bnew /g, '$&yy.'
  action = action.replace /\b(?:Block\.wrap|extend)\b/g, 'yy.$&'
  [patternString, "$$ = #{action};", options]

# Grammatical Rules
# -----------------

# In all of the rules that follow, you'll see the name of the nonterminal as
# the key to a list of alternative matches. With each match's action, the
# dollar-sign variables are provided by Jison as references to the value of
# their numeric position, so in this rule:
#
#     "Expression UNLESS Expression"
#
# `$1` would be the value of the first `Expression`, `$2` would be the token
# for the `UNLESS` terminal, and `$3` would be the value of the second
# `Expression`.
grammar =

  # The **Root** is the top-level node in the syntax tree. Since we parse bottom-up,
  # all parsing must end here.
  Root: [
    o '',                                       -> new Root new Block []
    o 'Body',                                   -> new Root $1
    o 'Block TERMINATOR',                       -> new Root $1
  ]

  # Any list of statements and expressions, separated by line breaks or semicolons.
  Body: [
    o 'Line',                                   -> Block.wrap [$1]
    o 'Body TERMINATOR Line',                   -> $1.push $3; $1
    o 'Body TERMINATOR'
  ]

  # Block and statements, which make up a line in a body.
  Line: [
    o 'Expression'
    o 'Statement'
  ]

  Block: [
    o '{ }',                         -> new Block
    o '{ Body }',                    -> $2
  ]

  Expression: [
    o 'Identifier'
    o 'Assign'
    o 'Call'
    o 'Literal'
    o 'TypeConstructor'
  ]
  
  # Pure statements which cannot be expressions.
  Statement: [
    o 'Return'
    o 'Comment'
    o 'FunctionDefinition'
    o 'FunctionDeclaration'
    o 'VariableDeclaration'
    o 'STATEMENT',                              -> new Literal $1
  ]
  
  VariableDeclaration: [
    o 'Type Identifier', -> new Variable $1, $2
  ]
  
  FunctionDefinition: [
    o 'Type Identifier CALL_START ArgumentDefs ) Block', -> new Function $1, $2, $4, $6
    o 'Type Identifier CALL_START ) Block', -> new Function $1, $2, [], $5
  ]
  
  ArgumentDefs: [
    o 'Type Identifier', -> [new Variable $1, $2]
    o 'ArgumentDefs , Type Identifier', -> $1.concat [new Variable $3, $4]
  ]
  
  ArgumentList: [
    o '( Arguments )', -> $2
    o '( )', -> []
  ]
  
  Arguments: [
    o 'Expression', -> [$1]
    o 'Arguments , Expression', -> $1.concat [$3]
  ]
  
  Assign: [
    o 'Identifier = Expression', -> new Assign $1, $3
  ]
  
  Identifier: [
    o 'IDENTIFIER', -> new Identifier $1
  ]
  
  Literal: [
    o 'NUMBER', -> new Literal $1
  ]
  
  TypeConstructor: [
    o 'Type ArgumentList', -> new TypeConstructor $1, $2
  ]
  
  Type: [
    o 'VOID'
    o 'BOOL'
    o 'INT'
    o 'FLOAT'
    o 'VEC2'
    o 'VEC3'
    o "VEC4"
    o "BVEC2"
    o "BVEC3"
    o "BVEC4"
    o 'IVEC2'
    o 'IVEC3'
    o 'IVEC4'
    o 'MAT2'
    o "MAT3"
    o "MAT4"
    o 'MAT2X2'
    o 'MAT2X3'
    o 'MAT2X4'
    o "MAT3X2"
    o "MAT3X3"
    o "MAT3X4"
    o "MAT4X2"
    o "MAT4X3"
    o "MAT4X4"
    o 'SAMPLER1D'
    o 'SAMPLER2D'
    o 'SAMPLER3D'
    o 'SAMPLERCUBE'
    o 'SAMPLER1DSHADOW'
    o 'SAMPLER2DSHADOW'
  ]
  
  # Arithmetic and logical operators, working on one or more operands.
  # Here they are grouped by order of precedence. The actual precedence rules
  # are defined at the bottom of the page. It would be shorter if we could
  # combine most of these rules into a single generic *Operand OpSymbol Operand*
  # -type rule, but in order to make the precedence binding possible, separate
  # rules are necessary.
  Operation: [
    o 'UNARY Expression',                       -> new Op $1 , $2
    o '-     Expression',                      (-> new Op '-', $2), prec: 'UNARY'
    o '+     Expression',                      (-> new Op '+', $2), prec: 'UNARY'

    o '-- SimpleAssignable',                    -> new Op '--', $2
    o '++ SimpleAssignable',                    -> new Op '++', $2
    o 'SimpleAssignable --',                    -> new Op '--', $1, null, true
    o 'SimpleAssignable ++',                    -> new Op '++', $1, null, true

    # [The existential operator](http://jashkenas.github.com/coffee-script/#existence).
    o 'Expression ?',                           -> new Existence $1

    o 'Expression +  Expression',               -> new Op '+' , $1, $3
    o 'Expression -  Expression',               -> new Op '-' , $1, $3

    o 'Expression MATH     Expression',         -> new Op $2, $1, $3
    o 'Expression SHIFT    Expression',         -> new Op $2, $1, $3
    o 'Expression COMPARE  Expression',         -> new Op $2, $1, $3
    o 'Expression LOGIC    Expression',         -> new Op $2, $1, $3
    o 'Expression RELATION Expression',         ->
      if $2.charAt(0) is '!'
        new Op($2[1..], $1, $3).invert()
      else
        new Op $2, $1, $3

    o 'SimpleAssignable COMPOUND_ASSIGN
       Expression',                             -> new Assign $1, $3, $2
    o 'SimpleAssignable COMPOUND_ASSIGN
       INDENT Expression OUTDENT',              -> new Assign $1, $4, $2
    o 'SimpleAssignable EXTENDS Expression',    -> new Extends $1, $3
  ]


# Precedence
# ----------

# Operators at the top of this list have higher precedence than the ones lower
# down. Following these rules is what makes `2 + 3 * 4` parse as:
#
#     2 + (3 * 4)
#
# And not:
#
#     (2 + 3) * 4
operators = [
  ['left',      '.', '?.', '::']
  ['left',      'CALL_START', 'CALL_END']
  ['nonassoc',  '++', '--']
  ['left',      '?']
  ['right',     'UNARY']
  ['left',      'MATH']
  ['left',      '+', '-']
  ['left',      'SHIFT']
  ['left',      'RELATION']
  ['left',      'COMPARE']
  ['left',      'LOGIC']
  ['nonassoc',  'INDENT', 'OUTDENT']
  ['right',     '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS']
  ['right',     'FORIN', 'FOROF', 'BY', 'WHEN']
  ['right',     'IF', 'ELSE', 'FOR', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS']
  ['right',     'POST_IF']
]

# Wrapping Up
# -----------

# Finally, now that we have our **grammar** and our **operators**, we can create
# our **Jison.Parser**. We do this by processing all of our rules, recording all
# terminals (every symbol which does not appear as the name of a rule above)
# as "tokens".
tokens = []
for name, alternatives of grammar
  grammar[name] = for alt in alternatives
    for token in alt[0].split ' '
      tokens.push token unless grammar[token]
    alt[1] = "return #{alt[1]}" if name is 'Root'
    alt

# Initialize the **Parser** with our list of terminal **tokens**, our **grammar**
# rules, and the name of the root. Reverse the operators because Jison orders
# precedence from low to high, and we have it high to low
# (as in [Yacc](http://dinosaur.compilertools.net/yacc/index.html)).
exports.parser = new Parser
  tokens      : tokens.join ' '
  bnf         : grammar
  operators   : operators.reverse()
  startSymbol : 'Root'