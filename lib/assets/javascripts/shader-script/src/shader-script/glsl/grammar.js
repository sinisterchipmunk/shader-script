(function() {
  var Parser, alt, alternatives, grammar, name, o, operators, token, tokens, unwrap;

  Parser = require('jison').Parser;

  unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

  o = function(patternString, action, options) {
    var match;
    patternString = patternString.replace(/\s{2,}/g, ' ');
    if (!action) return [patternString, '$$ = $1;', options];
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    action = action.replace(/\bnew /g, '$&yy.');
    action = action.replace(/\b(?:Block\.wrap|extend)\b/g, 'yy.$&');
    return [patternString, "$$ = " + action + ";", options];
  };

  grammar = {
    Root: [
      o('', function() {
        return new Root(new Block([]));
      }), o('Body', function() {
        return new Root($1);
      }), o('Block TERMINATOR', function() {
        return new Root($1);
      })
    ],
    Body: [
      o('Line', function() {
        return Block.wrap([$1]);
      }), o('Body Line', function() {
        $1.push($2);
        return $1;
      })
    ],
    Line: [o('Expression TERMINATOR'), o('Statement')],
    Block: [
      o('{ }', function() {
        return new Block;
      }), o('{ Body }', function() {
        return $2;
      })
    ],
    Expression: [o('Identifier'), o('Assign'), o('Call'), o('Literal'), o('TypeConstructor'), o('FunctionCall'), o('Operation')],
    Statement: [
      o('Return TERMINATOR'), o('Comment TERMINATOR'), o('FunctionDefinition'), o('FunctionDeclaration TERMINATOR'), o('VariableDeclaration TERMINATOR'), o('STATEMENT TERMINATOR', function() {
        return new Literal($1);
      }), o('TERMINATOR', function() {
        return {
          compile: function() {
            return null;
          }
        };
      })
    ],
    VariableDeclaration: [
      o('Type Identifier', function() {
        return new Variable($1, $2);
      })
    ],
    FunctionDefinition: [
      o('Type Identifier CALL_START ArgumentDefs ) Block', function() {
        return new Function($1, $2, $4, $6);
      }), o('Type Identifier CALL_START ) Block', function() {
        return new Function($1, $2, [], $5);
      })
    ],
    ArgumentDefs: [
      o('Type Identifier', function() {
        return [new Variable($1, $2)];
      }), o('ArgumentDefs , Type Identifier', function() {
        return $1.concat([new Variable($3, $4)]);
      })
    ],
    ArgumentList: [
      o('( Arguments )', function() {
        return $2;
      }), o('CALL_START Arguments )', function() {
        return $2;
      }), o('( )', function() {
        return [];
      }), o('CALL_START )', function() {
        return [];
      })
    ],
    Arguments: [
      o('Expression', function() {
        return [$1];
      }), o('Arguments , Expression', function() {
        return $1.concat([$3]);
      })
    ],
    FunctionCall: [
      o('Identifier ArgumentList', function() {
        return new Call($1, $2);
      })
    ],
    Assign: [
      o('Identifier = Expression', function() {
        return new Assign($1, $3);
      })
    ],
    Identifier: [
      o('IDENTIFIER', function() {
        return new Identifier($1);
      })
    ],
    Literal: [
      o('NUMBER', function() {
        return new Literal($1);
      })
    ],
    TypeConstructor: [
      o('Type ArgumentList', function() {
        return new TypeConstructor($1, $2);
      })
    ],
    Type: [o('VOID'), o('BOOL'), o('INT'), o('FLOAT'), o('VEC2'), o('VEC3'), o("VEC4"), o("BVEC2"), o("BVEC3"), o("BVEC4"), o('IVEC2'), o('IVEC3'), o('IVEC4'), o('MAT2'), o("MAT3"), o("MAT4"), o('MAT2X2'), o('MAT2X3'), o('MAT2X4'), o("MAT3X2"), o("MAT3X3"), o("MAT3X4"), o("MAT4X2"), o("MAT4X3"), o("MAT4X4"), o('SAMPLER1D'), o('SAMPLER2D'), o('SAMPLER3D'), o('SAMPLERCUBE'), o('SAMPLER1DSHADOW'), o('SAMPLER2DSHADOW')],
    Operation: [
      o('UNARY Expression', function() {
        return new Op($1, $2);
      }), o('-     Expression', (function() {
        return new Op('-', $2);
      }), {
        prec: 'UNARY'
      }), o('+     Expression', (function() {
        return new Op('+', $2);
      }), {
        prec: 'UNARY'
      }), o('-- SimpleAssignable', function() {
        return new Op('--', $2);
      }), o('++ SimpleAssignable', function() {
        return new Op('++', $2);
      }), o('SimpleAssignable --', function() {
        return new Op('--', $1, null, true);
      }), o('SimpleAssignable ++', function() {
        return new Op('++', $1, null, true);
      }), o('Expression ?', function() {
        return new Existence($1);
      }), o('Expression +  Expression', function() {
        return new Op('+', $1, $3);
      }), o('Expression -  Expression', function() {
        return new Op('-', $1, $3);
      }), o('Expression MATH     Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression SHIFT    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression COMPARE  Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression LOGIC    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression RELATION Expression', function() {
        if ($2.charAt(0) === '!') {
          return new Op($2.slice(1), $1, $3).invert();
        } else {
          return new Op($2, $1, $3);
        }
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       Expression', function() {
        return new Assign($1, $3, $2);
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       INDENT Expression OUTDENT', function() {
        return new Assign($1, $4, $2);
      }), o('SimpleAssignable EXTENDS Expression', function() {
        return new Extends($1, $3);
      })
    ]
  };

  operators = [['left', '.', '?.', '::'], ['left', 'CALL_START', 'CALL_END'], ['nonassoc', '++', '--'], ['left', '?'], ['right', 'UNARY'], ['left', 'MATH'], ['left', '+', '-'], ['left', 'SHIFT'], ['left', 'RELATION'], ['left', 'COMPARE'], ['left', 'LOGIC'], ['nonassoc', 'INDENT', 'OUTDENT'], ['right', '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS'], ['right', 'FORIN', 'FOROF', 'BY', 'WHEN'], ['right', 'IF', 'ELSE', 'FOR', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS'], ['right', 'POST_IF']];

  tokens = [];

  for (name in grammar) {
    alternatives = grammar[name];
    grammar[name] = (function() {
      var _i, _j, _len, _len2, _ref, _results;
      _results = [];
      for (_i = 0, _len = alternatives.length; _i < _len; _i++) {
        alt = alternatives[_i];
        _ref = alt[0].split(' ');
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          token = _ref[_j];
          if (!grammar[token]) tokens.push(token);
        }
        if (name === 'Root') alt[1] = "return " + alt[1];
        _results.push(alt);
      }
      return _results;
    })();
  }

  exports.parser = new Parser({
    tokens: tokens.join(' '),
    bnf: grammar,
    operators: operators.reverse(),
    startSymbol: 'Root'
  });

}).call(this);
