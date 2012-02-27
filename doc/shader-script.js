(function(global) {
  var _require = {};
  var require = function(path) { return require[path] = require[path] || (_require[path] && _require[path]()); };
  
    _require["shader-script"] = function() {
      var exports = {};
      (function() {
  var Lexer, Program, Simulator, fs, lexer, parser;

  fs = require('fs');

  Lexer = require("shader-script/lexer").Lexer;

  Simulator = require("shader-script/simulator").Simulator;

  parser = require("shader-script/parser").parser;

  Program = require('shader-script/glsl/program').Program;

  lexer = new Lexer;

  parser.lexer = {
    lex: function() {
      var tag, _ref;
      _ref = this.tokens[this.pos++] || [''], tag = _ref[0], this.yytext = _ref[1], this.yylineno = _ref[2];
      return tag;
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };

  parser.yy = require('shader-script/nodes');

  exports.Simulator = Simulator;

  exports.parse = function(code) {
    return parser.parse(lexer.tokenize(code));
  };

  exports.compile_to_glsl = function(code) {
    var program;
    program = exports.compile(code);
    return {
      vertex: program.vertex.toSource(),
      fragment: program.fragment.toSource()
    };
  };

  exports.compile = function(code) {
    exports.builtins || (exports.builtins = require('shader-script/builtins').builtins);
    if (!(code instanceof Object && code.compile)) code = exports.parse(code);
    return code.compile();
  };

}).call(this);

      return exports;
    };
    _require["shader-script/builtins"] = function() {
      var exports = {};
      (function() {
  var Definition, Extension, Program, d, e,
    __slice = Array.prototype.slice;

  try {
    Program = require('shader-script/glsl/program').Program;
    Definition = require('shader-script/scope').Definition;
    d = function(type, default_val) {
      return new Definition({
        type: type,
        builtin: true,
        value: default_val
      });
    };
    Program.prototype.builtins = {
      _variables: {
        common: {
          gl_MaxVertexAttribs: d('int', 8),
          gl_MaxVertexUniformVectors: d('int', 128),
          gl_MaxVaryingVectors: d('int', 8),
          gl_MaxVertexTextureImageUnits: d('int', 0),
          gl_MaxCombinedTextureImageUnits: d('int', 8),
          gl_MaxTextureImageUnits: d('int', 8),
          gl_MaxFragmentUniformVectors: d('int', 16),
          gl_MaxDrawBuffers: d('int', 1)
        },
        vertex: {
          gl_Position: d('vec4'),
          gl_PointSize: d('float')
        },
        fragment: {
          gl_FragCoord: d('vec4'),
          gl_FrontFacing: d('bool'),
          gl_FragColor: d('vec4'),
          gl_PointCoord: d('vec2')
        }
      }
    };
    Extension = (function() {

      Extension.prototype.return_type = function() {
        return this.type;
      };

      function Extension(name, type, callback) {
        this.name = name;
        this.type = type;
        this.callback = callback;
        Program.prototype.builtins[this.name] = this;
      }

      Extension.prototype.invoke = function() {
        var param, params;
        params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        params = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = params.length; _i < _len; _i++) {
            param = params[_i];
            _results.push(param.execute());
          }
          return _results;
        })();
        return this.callback.apply(this, params);
      };

      Extension.invoke = function() {
        var args, name, _ref;
        name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (Program.prototype.builtins[name]) {
          return (_ref = Program.prototype.builtins[name]).callback.apply(_ref, args);
        } else {
          throw new Error("No built-in function named " + name);
        }
      };

      Extension.prototype.toSource = function() {
        return "" + (this.return_type()) + " " + this.name + "(/* variable args */) { /* native code */ }";
      };

      return Extension;

    })();
    e = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(Extension, args, function() {});
    };
    e('radians', 'float', function(d) {
      return d * Math.PI / 180;
    });
    e('degrees', 'float', function(r) {
      return r / Math.PI * 180;
    });
    e('sin', 'float', Math.sin);
    e('cos', 'float', Math.cos);
    e('tan', 'float', Math.tan);
    e('asin', 'float', Math.asin);
    e('acos', 'float', Math.acos);
    e('atan', 'float', function(y, x) {
      if (x === void 0) {
        return Math.atan(y);
      } else {
        return Math.atan2(y, x);
      }
    });
    e('pow', 'float', Math.pow);
    e('exp', 'float', Math.exp);
    e('log', 'float', Math.log);
    e('exp2', 'float', function(x) {
      return Math.pow(2, x);
    });
    e('log2', 'float', function(x) {
      return Math.log(x) / Math.log(2);
    });
    e('sqrt', 'float', Math.sqrt);
    e('inversesqrt', 'float', function(x) {
      return 1 / Math.sqrt(x);
    });
    e('abs', 'float', Math.abs);
    e('sign', 'float', function(x) {
      if (x > 0) {
        return 1;
      } else {
        if (x < 0) {
          return -1;
        } else {
          return 0;
        }
      }
    });
    e('floor', 'float', Math.floor);
    e('ceil', 'float', Math.ceil);
    e('fract', 'float', function(x) {
      return x - Math.floor(x);
    });
    e('mod', 'float', function(x, y) {
      return x - y * Math.floor(x / y);
    });
    e('min', 'float', Math.min);
    e('max', 'float', Math.max);
    e('clamp', 'float', function(x, min, max) {
      return Math.min(Math.max(x, min), max);
    });
    e('mix', 'float', function(min, max, a) {
      return min * (1 - a) + max * a;
    });
    e('step', 'float', function(edge, x) {
      if (x < edge) {
        return 0;
      } else {
        return 1;
      }
    });
    e('smoothstep', 'float', function(edge0, edge1, x) {
      var t;
      t = Extension.invoke('clamp', (x - edge0) / (edge1 - edge0), 0, 1);
      return t * t * (3 - 2 * t);
    });
    e('length', 'float', function(vec) {
      var l, x, _i, _len;
      l = 0;
      for (_i = 0, _len = vec.length; _i < _len; _i++) {
        x = vec[_i];
        l += Math.pow(x, 2);
      }
      return Math.sqrt(l);
    });
    e('distance', 'float', function(v1, v2) {
      var i, v3;
      v3 = (function() {
        var _results;
        _results = [];
        for (i in v1) {
          _results.push(v1[i] - v2[i]);
        }
        return _results;
      })();
      return Extension.invoke('length', v3);
    });
    e('dot', 'float', function(v1, v2) {
      var dot, i;
      dot = 0;
      for (i in v1) {
        dot += v1[i] * v2[i];
      }
      return dot;
    });
    e('cross', 'vec3', function(x, y) {
      if (x.length !== 3 || y.length !== 3) {
        throw new Error('Can only cross vec3 with vec3');
      }
      return [x[1] * y[2] - y[1] * x[2], x[2] * y[0] - y[2] * x[0], x[0] * y[1] - y[0] * x[1]];
    });
    e('normalize', null, function(vec) {
      var len, v, _i, _len, _results;
      len = Extension.invoke('length', vec);
      _results = [];
      for (_i = 0, _len = vec.length; _i < _len; _i++) {
        v = vec[_i];
        _results.push(v / len);
      }
      return _results;
    });
    e('faceforward', null, function(N, I, Nref) {
      if (Extension.invoke('dot', Nref, I) < 0) {
        return N;
      } else {
        return I;
      }
    });
    e('reflect', null, function(I, N) {
      var dot, i, _results;
      dot = Extension.invoke('dot', N, I);
      _results = [];
      for (i in I) {
        _results.push(I[i] - 2 * dot * N[i]);
      }
      return _results;
    });
    e('refract', null, function(I, N, eta) {
      var dotNI, i, k, x, _i, _len, _results, _results2;
      dotNI = Extension.invoke('dot', N, I);
      k = 1 - eta * eta * (1 - dotNI * dotNI);
      if (k < 0) {
        _results = [];
        for (_i = 0, _len = I.length; _i < _len; _i++) {
          x = I[_i];
          _results.push(0);
        }
        return _results;
      } else {
        _results2 = [];
        for (i in I) {
          _results2.push(eta * I[i] - (eta * dotNI + Math.sqrt(k)) * N[i]);
        }
        return _results2;
      }
    });
    e('matrixCompMult', null, function(x, y) {
      var i, _results;
      _results = [];
      for (i in x) {
        _results.push(x[i] * y[i]);
      }
      return _results;
    });
    e('texture2D', 'vec4', function() {
      return [1, 1, 1, 1];
    });
    e('texture2DLod', 'vec4', function() {
      return [1, 1, 1, 1];
    });
    e('texture2DProj', 'vec4', function() {
      return [1, 1, 1, 1];
    });
    e('texture2DProjLod', 'vec4', function() {
      return [1, 1, 1, 1];
    });
    e('textureCube', 'vec4', function() {
      return [1, 1, 1, 1];
    });
    e('textureCubeLod', 'vec4', function() {
      return [1, 1, 1, 1];
    });
  } catch (e) {
    console.log(e);
    console.log(e.stack);
    console.log("WARNING: continuing without builtins...");
  }

}).call(this);

      return exports;
    };
    _require["shader-script/definition"] = function() {
      var exports = {};
      (function() {
  var Definition;

  exports.Definition = Definition = (function() {

    function Definition(options) {
      if (options == null) options = {};
      this.dependents = [];
      this.assign(options);
    }

    Definition.prototype.type = function() {
      return this.explicit_type || this.inferred_type();
    };

    Definition.prototype.as_options = function() {
      return {
        type: this.type(),
        name: this.name,
        qualified_name: this.qualified_name,
        builtin: this.builtin,
        dependents: this.dependents,
        value: this.value
      };
    };

    Definition.prototype.inferred_type = function() {
      var dep, type, _i, _len, _ref;
      _ref = this.dependents;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dep = _ref[_i];
        type = dep.type();
        if (type) return type;
      }
      return;
    };

    Definition.prototype.set_type = function(type) {
      var current_type;
      if (type) {
        current_type = this.type();
        if (current_type && type !== current_type) {
          throw new Error("Variable '" + this.qualified_name + "' redefined with conflicting type: " + (this.type()) + " redefined as " + type);
        }
        if (type) return this.explicit_type = type;
      }
    };

    Definition.prototype.add_dependent = function(dep) {
      return this.dependents.push(dep);
    };

    Definition.prototype.assign = function(options) {
      var dependent, _i, _len, _ref;
      if (options.name) this.name = options.name;
      if (options.qualified_name) this.qualified_name = options.qualified_name;
      if (options.builtin) this.builtin = options.builtin;
      this.value = options.value;
      if (options.type) this.set_type(options.type);
      if (options.dependents) {
        _ref = options.dependents;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          dependent = _ref[_i];
          this.add_dependent(dependent);
        }
      }
      if (options.dependent) return this.add_dependent(options.dependent);
    };

    return Definition;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/glsl"] = function() {
      var exports = {};
      (function() {
  var Lexer, lexer, parse, parser;

  Lexer = require("shader-script/glsl/lexer").Lexer;

  if (typeof process !== 'undefined' && process.env['TEST']) {
    parser = require("shader-script/glsl/grammar").parser;
  } else {
    parser = require("shader-script/glsl/parser").parser;
  }

  lexer = new Lexer;

  parser.lexer = {
    lex: function() {
      var tag, _ref;
      _ref = this.tokens[this.pos++] || [''], tag = _ref[0], this.yytext = _ref[1], this.yylineno = _ref[2];
      return tag;
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };

  parser.yy = require('shader-script/glsl/nodes');

  exports.parse = parse = function(code) {
    return parser.parse(lexer.tokenize(code, {
      rewrite: false
    }));
  };

  exports.compile = function(code, program) {
    return parse(code).compile(program);
  };

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/grammar"] = function() {
      var exports = {};
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
    Return: [
      o('RETURN', function() {
        return new Return;
      }), o('RETURN Expression', function() {
        return new Return($2);
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

      return exports;
    };
    _require["shader-script/glsl/lexer"] = function() {
      var exports = {};
      (function() {
  var BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, STRICT_PROSCRIBED, TRAILING_SPACES, UNARY, WHITESPACE, compact, count, key, last, starts, _ref, _ref2,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('shader-script/rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

  _ref2 = require('shader-script/helpers'), count = _ref2.count, starts = _ref2.starts, compact = _ref2.compact, last = _ref2.last;

  exports.Lexer = Lexer = (function() {

    function Lexer() {}

    Lexer.prototype.tokenize = function(code, opts) {
      var i, tag;
      if (opts == null) opts = {};
      if (WHITESPACE.test(code)) code = "\n" + code;
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      this.code = code;
      this.line = opts.line || 0;
      this.indent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      i = 0;
      while (this.chunk = code.slice(i)) {
        i += this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.heredocToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
      }
      this.closeIndentation();
      if (tag = this.ends.pop()) this.error("missing " + tag);
      if (opts.rewrite === false) return this.tokens;
      return (new Rewriter).rewrite(this.tokens);
    };

    Lexer.prototype.identifierToken = function() {
      var colon, forcedIdentifier, id, input, match, prev, tag, _ref3, _ref4;
      if (!(match = IDENTIFIER.exec(this.chunk))) return 0;
      input = match[0], id = match[1], colon = match[2];
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref3 = prev[0]) === '.' || _ref3 === '?.' || _ref3 === '::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref4 = this.tag(), __indexOf.call(LINE_BREAK, _ref4) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("reserved word \"" + id + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) id = COFFEE_ALIAS_MAP[id];
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
            case 'null':
            case 'undefined':
              return 'BOOL';
            case 'break':
            case 'continue':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      this.token(tag, id);
      if (colon) this.token(':', ':');
      return input.length;
    };

    Lexer.prototype.numberToken = function() {
      var binaryLiteral, lexedLength, match, number, octalLiteral;
      if (!(match = NUMBER.exec(this.chunk))) return 0;
      number = match[0];
      if (/E/.test(number)) {
        this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
      } else if (/[BOX]/.test(number)) {
        this.error("radix prefixes must be lowercase '" + number + "'");
      } else if (/^0[89]/.test(number)) {
        this.error("decimal literals '" + number + "' must not be prefixed with '0'");
      } else if (/^0[0-7]/.test(number)) {
        this.error("octal literals '" + number + "' must be prefixed with '0o'");
      }
      lexedLength = number.length;
      if (octalLiteral = /0o([0-7]+)/.exec(number)) {
        number = (parseInt(octalLiteral[1], 8)).toString();
      }
      if (binaryLiteral = /0b([01]+)/.exec(number)) {
        number = (parseInt(binaryLiteral[1], 2)).toString();
      }
      this.token('NUMBER', number);
      return lexedLength;
    };

    Lexer.prototype.stringToken = function() {
      var match, octalEsc, string;
      switch (this.chunk.charAt(0)) {
        case "'":
          if (!(match = SIMPLESTR.exec(this.chunk))) return 0;
          this.token('STRING', (string = match[0]).replace(MULTILINER, '\\\n'));
          break;
        case '"':
          if (!(string = this.balancedString(this.chunk, '"'))) return 0;
          if (0 < string.indexOf('#{', 1)) {
            this.interpolateString(string.slice(1, -1));
          } else {
            this.token('STRING', this.escapeLines(string));
          }
          break;
        default:
          return 0;
      }
      if (octalEsc = /^(?:\\.|[^\\])*\\[0-7]/.test(string)) {
        this.error("octal escape sequences " + string + " are not allowed");
      }
      this.line += count(string, '\n');
      return string.length;
    };

    Lexer.prototype.heredocToken = function() {
      var doc, heredoc, match, quote;
      if (!(match = HEREDOC.exec(this.chunk))) return 0;
      heredoc = match[0];
      quote = heredoc.charAt(0);
      doc = this.sanitizeHeredoc(match[2], {
        quote: quote,
        indent: null
      });
      if (quote === '"' && 0 <= doc.indexOf('#{')) {
        this.interpolateString(doc, {
          heredoc: true
        });
      } else {
        this.token('STRING', this.makeString(doc, quote, true));
      }
      this.line += count(heredoc, '\n');
      return heredoc.length;
    };

    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) return 0;
      comment = match[0], here = match[1];
      if (here) {
        this.token('HERECOMMENT', this.sanitizeHeredoc(here, {
          herecomment: true,
          indent: Array(this.indent + 1).join(' ')
        }));
      }
      this.line += count(comment, '\n');
      return comment.length;
    };

    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1));
      return script.length;
    };

    Lexer.prototype.regexToken = function() {
      var flags, length, match, prev, regex, _ref3, _ref4;
      if (this.chunk.charAt(0) !== '/') return 0;
      if (match = HEREGEX.exec(this.chunk)) {
        length = this.heregexToken(match);
        this.line += count(match[0], '\n');
        return length;
      }
      prev = last(this.tokens);
      if (prev && (_ref3 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref3) >= 0)) {
        return 0;
      }
      if (!(match = REGEX.exec(this.chunk))) return 0;
      _ref4 = match, match = _ref4[0], regex = _ref4[1], flags = _ref4[2];
      if (regex.slice(0, 2) === '/*') {
        this.error('regular expressions cannot begin with `*`');
      }
      if (regex === '//') regex = '/(?:)/';
      this.token('REGEX', "" + regex + flags);
      return match.length;
    };

    Lexer.prototype.heregexToken = function(match) {
      var body, flags, heregex, re, tag, tokens, value, _i, _len, _ref3, _ref4, _ref5, _ref6;
      heregex = match[0], body = match[1], flags = match[2];
      if (0 > body.indexOf('#{')) {
        re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/');
        if (re.match(/^\*/)) {
          this.error('regular expressions cannot begin with `*`');
        }
        this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
        return heregex.length;
      }
      this.token('IDENTIFIER', 'RegExp');
      this.tokens.push(['CALL_START', '(']);
      tokens = [];
      _ref3 = this.interpolateString(body, {
        regex: true
      });
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], tag = _ref4[0], value = _ref4[1];
        if (tag === 'TOKENS') {
          tokens.push.apply(tokens, value);
        } else {
          if (!(value = value.replace(HEREGEX_OMIT, ''))) continue;
          value = value.replace(/\\/g, '\\\\');
          tokens.push(['STRING', this.makeString(value, '"', true)]);
        }
        tokens.push(['+', '+']);
      }
      tokens.pop();
      if (((_ref5 = tokens[0]) != null ? _ref5[0] : void 0) !== 'STRING') {
        this.tokens.push(['STRING', '""'], ['+', '+']);
      }
      (_ref6 = this.tokens).push.apply(_ref6, tokens);
      if (flags) this.tokens.push([',', ','], ['STRING', '"' + flags + '"']);
      this.token(')', ')');
      return heregex.length;
    };

    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, prev, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) return 0;
      indent = match[0];
      this.line += count(indent, ';');
      this.seenFor = false;
      prev = last(this.tokens, 1);
      size = indent.length - 1 - indent.lastIndexOf(';');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken();
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.outdebt = this.indebt = 0;
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines);
      }
      this.indent = size;
      return indent.length;
    };

    Lexer.prototype.outdentToken = function(moveOut, noNewlines) {
      var dent, len;
      while (moveOut > 0) {
        len = this.indents.length - 1;
        if (this.indents[len] === void 0) {
          moveOut = 0;
        } else if (this.indents[len] === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (this.indents[len] < this.outdebt) {
          this.outdebt -= this.indents[len];
          moveOut -= this.indents[len];
        } else {
          dent = this.indents.pop() - this.outdebt;
          moveOut -= dent;
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', dent);
        }
      }
      if (dent) this.outdebt -= moveOut;
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', ';');
      }
      return this;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === ';'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) prev[match ? 'spaced' : 'newLine'] = true;
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };

    Lexer.prototype.newlineToken = function() {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') this.token('TERMINATOR', ';');
      return this;
    };

    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') this.tokens.pop();
      return this;
    };

    Lexer.prototype.literalToken = function() {
      var match, prev, tag, value, _ref3, _ref4, _ref5, _ref6;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) this.tagParameters();
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref3 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref3) >= 0)) {
          this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref4 = prev[1]) === '||' || _ref4 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        this.seenFor = false;
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref5 = prev[0], __indexOf.call(CALLABLE, _ref5) >= 0)) {
          if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
          tag = 'CALL_START';
        } else if (value === '[' && (_ref6 = prev[0], __indexOf.call(INDEXABLE, _ref6) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push(INVERSES[value]);
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.token(tag, value);
      return value.length;
    };

    Lexer.prototype.sanitizeHeredoc = function(doc, options) {
      var attempt, herecomment, indent, match, _ref3;
      indent = options.indent, herecomment = options.herecomment;
      if (herecomment) {
        if (HEREDOC_ILLEGAL.test(doc)) {
          this.error("block comment cannot contain \"*/\", starting");
        }
        if (doc.indexOf('\n') <= 0) return doc;
      } else {
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref3 = attempt.length) && _ref3 < indent.length)) {
            indent = attempt;
          }
        }
      }
      if (indent) doc = doc.replace(RegExp("\\n" + indent, "g"), '\n');
      if (!herecomment) doc = doc.replace(/^\n/, '');
      return doc;
    };

    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') return this;
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };

    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };

    Lexer.prototype.balancedString = function(str, end) {
      var continueCount, i, letter, match, prev, stack, _ref3;
      continueCount = 0;
      stack = [end];
      for (i = 1, _ref3 = str.length; 1 <= _ref3 ? i < _ref3 : i > _ref3; 1 <= _ref3 ? i++ : i--) {
        if (continueCount) {
          --continueCount;
          continue;
        }
        switch (letter = str.charAt(i)) {
          case '\\':
            ++continueCount;
            continue;
          case end:
            stack.pop();
            if (!stack.length) return str.slice(0, i + 1 || 9e9);
            end = stack[stack.length - 1];
            continue;
        }
        if (end === '}' && (letter === '"' || letter === "'")) {
          stack.push(end = letter);
        } else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
          continueCount += match[0].length - 1;
        } else if (end === '}' && letter === '{') {
          stack.push(end = '}');
        } else if (end === '"' && prev === '#' && letter === '{') {
          stack.push(end = '}');
        }
        prev = letter;
      }
      return this.error("missing " + (stack.pop()) + ", starting");
    };

    Lexer.prototype.interpolateString = function(str, options) {
      var expr, heredoc, i, inner, interpolated, len, letter, nested, pi, regex, tag, tokens, value, _len, _ref3, _ref4, _ref5;
      if (options == null) options = {};
      heredoc = options.heredoc, regex = options.regex;
      tokens = [];
      pi = 0;
      i = -1;
      while (letter = str.charAt(i += 1)) {
        if (letter === '\\') {
          i += 1;
          continue;
        }
        if (!(letter === '#' && str.charAt(i + 1) === '{' && (expr = this.balancedString(str.slice(i + 1), '}')))) {
          continue;
        }
        if (pi < i) tokens.push(['NEOSTRING', str.slice(pi, i)]);
        inner = expr.slice(1, -1);
        if (inner.length) {
          nested = new Lexer().tokenize(inner, {
            line: this.line,
            rewrite: false
          });
          nested.pop();
          if (((_ref3 = nested[0]) != null ? _ref3[0] : void 0) === 'TERMINATOR') {
            nested.shift();
          }
          if (len = nested.length) {
            if (len > 1) {
              nested.unshift(['(', '(', this.line]);
              nested.push([')', ')', this.line]);
            }
            tokens.push(['TOKENS', nested]);
          }
        }
        i += expr.length;
        pi = i + 1;
      }
      if ((i > pi && pi < str.length)) tokens.push(['NEOSTRING', str.slice(pi)]);
      if (regex) return tokens;
      if (!tokens.length) return this.token('STRING', '""');
      if (tokens[0][0] !== 'NEOSTRING') tokens.unshift(['', '']);
      if (interpolated = tokens.length > 1) this.token('(', '(');
      for (i = 0, _len = tokens.length; i < _len; i++) {
        _ref4 = tokens[i], tag = _ref4[0], value = _ref4[1];
        if (i) this.token('+', '+');
        if (tag === 'TOKENS') {
          (_ref5 = this.tokens).push.apply(_ref5, value);
        } else {
          this.token('STRING', this.makeString(value, '"', heredoc));
        }
      }
      if (interpolated) this.token(')', ')');
      return tokens;
    };

    Lexer.prototype.pair = function(tag) {
      var size, wanted;
      if (tag !== (wanted = last(this.ends))) {
        if ('OUTDENT' !== wanted) this.error("unmatched " + tag);
        this.indent -= size = last(this.indents);
        this.outdentToken(size, true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };

    Lexer.prototype.token = function(tag, value) {
      return this.tokens.push([tag, value, this.line]);
    };

    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };

    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };

    Lexer.prototype.unfinished = function() {
      var _ref3;
      return LINE_CONTINUER.test(this.chunk) || ((_ref3 = this.tag()) === '\\' || _ref3 === '.' || _ref3 === '?.' || _ref3 === 'UNARY' || _ref3 === 'MATH' || _ref3 === '+' || _ref3 === '-' || _ref3 === 'SHIFT' || _ref3 === 'RELATION' || _ref3 === 'COMPARE' || _ref3 === 'LOGIC' || _ref3 === 'THROW' || _ref3 === 'EXTENDS');
    };

    Lexer.prototype.escapeLines = function(str, heredoc) {
      return str.replace(MULTILINER, heredoc ? '\\n' : '');
    };

    Lexer.prototype.makeString = function(body, quote, heredoc) {
      if (!body) return quote + quote;
      body = body.replace(/\\([\s\S])/g, function(match, contents) {
        if (contents === '\n' || contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      return quote + this.escapeLines(body, heredoc) + quote;
    };

    Lexer.prototype.error = function(message) {
      throw SyntaxError("" + message + " on line " + (this.line + 1));
    };

    return Lexer;

  })();

  JS_KEYWORDS = ['attribute', 'const', 'uniform', 'varying', 'centroid', 'break', 'continue', 'do', 'for', 'while', 'if', 'else', 'in', 'out', 'inout', 'float', 'int', 'void', 'bool', 'true', 'false', 'invariant', 'discard', 'return', 'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'bvec2', 'bvec3', 'bvec4', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow', 'sampler2DShadow', 'struct', 'asm', 'class', 'union', 'enum', 'typedef', 'template', 'this', 'packed', 'goto', 'switch', 'default', 'inline', 'noinline', 'volatile', 'public', 'static', 'extern', 'external', 'interface', 'long', 'short', 'double', 'half', 'fixed', 'unsigned', 'lowp', 'mediump', 'highp', 'precision', 'input', 'output', 'hvec2', 'hvec3', 'hvec4', 'dvec2', 'dvec3', 'dvec4', 'fvec2', 'fvec3', 'fvec4', 'sampler2DRect', 'sampler3DRect', 'sampler2DRectShadow', 'sizeof', 'cast', 'namespace', 'using'];

  COFFEE_KEYWORDS = [];

  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };

  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();

  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

  RESERVED = [];

  STRICT_PROSCRIBED = ['arguments', 'eval'];

  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);

  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;

  IDENTIFIER = /^([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([^\n\S]*:(?!:))?/;

  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

  HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;

  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3})/;

  WHITESPACE = /^[^\n\S]+/;

  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/;

  CODE = /^[-=]>/;

  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

  SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;

  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

  REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;

  HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;

  HEREGEX_OMIT = /\s+(?:#.*)?/g;

  MULTILINER = /\n/g;

  HEREDOC_INDENT = /\n+([^\n\S]*)/g;

  HEREDOC_ILLEGAL = /\*\//;

  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

  TRAILING_SPACES = /\s+$/;

  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='];

  UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE', 'DO'];

  LOGIC = ['&&', '||', '&', '|', '^'];

  SHIFT = ['<<', '>>', '>>>'];

  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

  MATH = ['*', '/', '%'];

  RELATION = ['IN', 'OF', 'INSTANCEOF'];

  BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'];

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL');

  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes"] = function() {
      var exports = {};
      (function() {
  var node_file, node_name, nodes;

  nodes = {
    Block: 'block',
    Literal: 'literal',
    Value: 'value',
    Identifier: 'identifier',
    Call: 'call',
    Variable: 'variable',
    Assign: 'assign',
    Function: 'function',
    Root: 'root',
    TypeConstructor: 'type_constructor',
    Return: 'return',
    Op: 'op'
  };

  for (node_name in nodes) {
    node_file = nodes[node_name];
    exports[node_name] = require("shader-script/glsl/nodes/" + node_file)[node_name];
  }

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/assign"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.name = "_assign";

    Assign.prototype.children = function() {
      return ['left', 'right'];
    };

    Assign.prototype.compile = function(program) {
      var left, right, variable;
      left = this.left.toVariableName();
      right = this.right.compile(program);
      variable = program.state.scope.lookup(left);
      return {
        execute: function() {
          return variable.value = right.execute();
        },
        toSource: function() {
          return "" + left + " = " + (right.toSource());
        }
      };
    };

    return Assign;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/block"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Block = (function(_super) {

    __extends(Block, _super);

    Block.prototype.name = function() {
      return 'block';
    };

    function Block(lines, options) {
      if (lines == null) lines = [];
      this.options = options != null ? options : {
        scope: true
      };
      Block.__super__.constructor.call(this, lines);
    }

    Block.prototype.compile = function(program) {
      var child, lines, _i, _len, _ref, _result,
        _this = this;
      if (this.children.length > 1) throw new Error("too many children");
      program.state.scope.push('block');
      lines = [];
      if (this.lines) {
        _ref = this.lines;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _result = child.compile(program);
          if (_result !== null) lines.push(_result);
        }
      }
      program.state.scope.pop();
      return {
        execute: function() {
          var line, _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
            line = lines[_j];
            _results.push(line.execute());
          }
          return _results;
        },
        toSource: function() {
          var indent, line, result;
          indent = _this.options && _this.options.scope ? "  " : "";
          result = ((function() {
            var _j, _len2, _results;
            _results = [];
            for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
              line = lines[_j];
              _results.push(line.toSource());
            }
            return _results;
          })()).join(";\n").trim();
          if (result[result.length - 1] !== ";") result += ";";
          return indent + result.split("\n").join("\n" + indent) + "\n";
        }
      };
    };

    Block.prototype.children = function() {
      return ['lines'];
    };

    Block.prototype.push = function(line) {
      this.lines.push(line);
      return this;
    };

    Block.wrap = function(lines, options) {
      if (lines.length === 1 && lines[0] instanceof Block) return lines[0];
      return new exports.Block(lines, options);
    };

    return Block;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/call"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Call = (function(_super) {

    __extends(Call, _super);

    function Call() {
      Call.__super__.constructor.apply(this, arguments);
    }

    Call.prototype.name = '_call';

    Call.prototype.children = function() {
      return ['name', 'params'];
    };

    Call.prototype.compile = function(program) {
      var compiled_params, name, param;
      name = this.name.toVariableName();
      compiled_params = (function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.compile(program));
        }
        return _results;
      }).call(this);
      return {
        execute: function() {
          var _ref, _ref2;
          if (program.functions[name]) {
            return (_ref = program.functions[name]).invoke.apply(_ref, compiled_params);
          } else if (program.builtins[name]) {
            return (_ref2 = program.builtins[name]).invoke.apply(_ref2, compiled_params);
          } else {
            throw new Error("function '" + name + "' is not defined");
          }
        },
        toSource: function() {
          var joined_params, param;
          joined_params = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_params.length; _i < _len; _i++) {
              param = compiled_params[_i];
              _results.push(param.toSource());
            }
            return _results;
          })()).join(', ');
          return "" + name + "(" + joined_params + ")";
        }
      };
    };

    return Call;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/function"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Function = (function(_super) {

    __extends(Function, _super);

    function Function() {
      Function.__super__.constructor.apply(this, arguments);
    }

    Function.prototype.name = '_function';

    Function.prototype.children = function() {
      return ['return_type', 'name', 'arguments', 'block'];
    };

    Function.prototype.type = function() {
      return this.return_type;
    };

    Function.prototype.compile = function(program) {
      var argument, compiled_arguments, compiled_block, compiled_name, originator,
        _this = this;
      compiled_name = this.name.toVariableName();
      program.state.scope.push(compiled_name);
      compiled_arguments = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          argument = _ref[_i];
          _results.push(argument.compile(program));
        }
        return _results;
      }).call(this);
      compiled_block = this.block.compile(program);
      originator = this;
      program.state.scope.pop();
      return {
        execute: function() {
          var arg, args, name,
            _this = this;
          name = compiled_name;
          args = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_arguments.length; _i < _len; _i++) {
              arg = compiled_arguments[_i];
              _results.push(arg.variable);
            }
            return _results;
          })();
          return program.functions[name] = {
            return_type: function() {
              return originator.type();
            },
            arguments: args,
            invoke: function() {
              var i, params, _ref;
              params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              try {
                if (args.length !== params.length) {
                  throw new Error("Incorrect argument count (" + params.length + " for " + args.length + ")");
                }
                for (i = 0, _ref = params.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
                  args[i].value = params[i].execute();
                }
                return compiled_block.execute();
              } catch (e) {
                if (e.is_return) {
                  return e.result;
                } else {
                  throw e;
                }
              }
            },
            toSource: function(overriding_fn_name) {
              return _this.toSource(overriding_fn_name);
            }
          };
        },
        toSource: function(fn_name) {
          var arg, arg_list;
          fn_name || (fn_name = compiled_name);
          arg_list = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_arguments.length; _i < _len; _i++) {
              arg = compiled_arguments[_i];
              _results.push(arg.toSource());
            }
            return _results;
          })()).join(', ');
          return ("" + (_this.type()) + " " + fn_name + "(" + arg_list + ") {\n") + compiled_block.toSource() + "}";
        }
      };
    };

    return Function;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/identifier"] = function() {
      var exports = {};
      (function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/scope').Definition;

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "_identifier";

    Identifier.prototype.toVariableName = function() {
      if (this.children[0] instanceof Definition) {
        return this.children[0].name;
      } else {
        return this.children[0];
      }
    };

    Identifier.prototype.compile = function(program) {
      var variable,
        _this = this;
      if (this.children[0] instanceof Definition) {
        variable = this.children[0];
      } else {
        variable = program.state.scope.lookup(this.toVariableName());
      }
      return {
        execute: function() {
          return variable.value;
        },
        toSource: function() {
          return variable.name;
        }
      };
    };

    return Identifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/literal"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal() {
      Literal.__super__.constructor.apply(this, arguments);
    }

    Literal.prototype.name = "_literal";

    Literal.prototype.type = function() {
      if (this.children[0].match(/^-?[0-9]+\.[0-9]+$/)) return 'float';
      if (this.children[0].match(/^-?[0-9]+$/)) return 'float';
      if (this.children[0].match(/^(true|false)$/)) return 'bool';
      throw new Error("Value type is not recognized: " + this.children[0]);
    };

    Literal.prototype.compile = function(program) {
      var value;
      value = this.children[0];
      if (this.type() === 'float' && value.indexOf('.') === -1) value += ".0";
      return {
        execute: function() {
          return eval(value);
        },
        toSource: function() {
          return value;
        }
      };
    };

    return Literal;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/op"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Op = (function(_super) {

    __extends(Op, _super);

    function Op() {
      Op.__super__.constructor.apply(this, arguments);
    }

    Op.prototype.name = "_op";

    Op.prototype.children = function() {
      return ['op', 'left', 'right'];
    };

    Op.prototype.compile = function(program) {
      var left, op, right;
      left = this.left.compile(program);
      op = this.op;
      right = this.right && this.right.compile(program);
      return {
        execute: function() {
          var le, re, _ref;
          _ref = [left.execute(), right && right.execute()], le = _ref[0], re = _ref[1];
          switch (op) {
            case '+':
              if (re) {
                return le + re;
              } else {
                return le;
              }
            case '-':
              if (re) {
                return le - re;
              } else {
                return -le;
              }
            case '*':
              return le * re;
            case '/':
              return le / re;
            default:
              throw new Error("Unsupported operation: " + op);
          }
        },
        toSource: function() {
          if (right) {
            return "" + (left.toSource()) + " " + op + " " + (right.toSource());
          } else {
            return "" + op + (left.toSource());
          }
        }
      };
    };

    return Op;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/return"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Return = (function(_super) {

    __extends(Return, _super);

    function Return() {
      Return.__super__.constructor.apply(this, arguments);
    }

    Return.prototype.name = '_return';

    Return.prototype.children = function() {
      return ['expression'];
    };

    Return.prototype.compile = function(program) {
      var compiled_expression;
      if (this.expression) {
        compiled_expression = this.expression.compile(program);
        return {
          execute: function() {
            throw {
              is_return: true,
              result: compiled_expression.execute()
            };
          },
          toSource: function() {
            return "return " + (compiled_expression.toSource());
          }
        };
      } else {
        return {
          execute: function() {
            throw {
              is_return: true,
              result: void 0
            };
          },
          toSource: function() {
            return "return";
          }
        };
      }
    };

    return Return;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/root"] = function() {
      var exports = {};
      (function() {
  var Program,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Program = require('shader-script/glsl/program').Program;

  exports.Root = (function(_super) {

    __extends(Root, _super);

    function Root() {
      Root.__super__.constructor.apply(this, arguments);
    }

    Root.prototype.name = "_root";

    Root.prototype.children = function() {
      return ['block'];
    };

    Root.prototype.compile = function(state) {
      var block_node, name, options, program, subscope, _ref, _ref2;
      if (state == null) state = {};
      if (state instanceof Program) {
        _ref = [state, state.state], program = _ref[0], state = _ref[1];
      } else {
        program = new Program(state);
      }
      block_node = this.block.compile(program);
      block_node.execute();
      if (subscope = state.scope.subscopes['block']) {
        _ref2 = subscope.definitions;
        for (name in _ref2) {
          options = _ref2[name];
          program.variables.push({
            name: name,
            type: options.type(),
            value: options.value
          });
        }
      }
      return program;
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/type_constructor"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.TypeConstructor = (function(_super) {

    __extends(TypeConstructor, _super);

    TypeConstructor.prototype.name = "_type_constructor";

    function TypeConstructor(type, _arguments) {
      this.type = type;
      this.arguments = _arguments;
      TypeConstructor.__super__.constructor.call(this);
    }

    TypeConstructor.prototype.compile = function(program) {
      var arg, compiled_args, type, validate_length,
        _this = this;
      compiled_args = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arg = _ref[_i];
          _results.push(arg.compile(program));
        }
        return _results;
      }).call(this);
      validate_length = function(len) {
        if (compiled_args.length !== len) {
          return new Error("Incorrect argument count for " + _this.type + " constructor");
        }
      };
      switch (type = this.type) {
        case 'void':
          throw new Error("Can't cast to void");
          break;
        case 'bool':
        case 'int':
        case 'float':
          validate_length(1);
          compiled_args = compiled_args[0];
          break;
        case 'vec2':
        case 'ivec2':
        case 'bvec2':
          validate_length(2);
          break;
        case 'vec3':
        case 'ivec3':
        case 'bvec3':
          validate_length(3);
          break;
        case 'vec4':
        case 'ivec4':
        case 'bvec4':
          validate_length(4);
          break;
        default:
          throw new Error("Unexpected type constructor: " + this.type);
      }
      return {
        execute: function(state) {
          var arg, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
            arg = compiled_args[_i];
            _results.push(arg.execute());
          }
          return _results;
        },
        toSource: function() {
          var arg;
          return "" + type + "(" + (((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
              arg = compiled_args[_i];
              _results.push(arg.toSource());
            }
            return _results;
          })()).join(', ')) + ")";
        }
      };
    };

    return TypeConstructor;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/value"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Value = (function(_super) {

    __extends(Value, _super);

    Value.prototype.name = "_value";

    function Value() {
      Value.__super__.constructor.apply(this, arguments);
      if (this.children[0].toVariableName) {
        this.toVariableName = function() {
          return this.children[0].toVariableName();
        };
      }
    }

    Value.prototype.type = function(program) {
      return this.children[0].type(program);
    };

    Value.prototype.compile = function(shader) {
      return this.children[0].compile(shader);
    };

    return Value;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/variable"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Variable = (function(_super) {

    __extends(Variable, _super);

    Variable.prototype.name = '_variable';

    function Variable(type, name, qualified_name) {
      this.qualified_name = qualified_name;
      if (this.qualified_name) {
        throw new Error("don't use qualified name, it's left over from an earlier build");
      }
      if (arguments.length === 1) {
        this.variable = arguments[0];
        Variable.__super__.constructor.call(this);
      } else {
        Variable.__super__.constructor.call(this, type, name);
      }
    }

    Variable.prototype.children = function() {
      return ['type', 'name'];
    };

    Variable.prototype.compile = function(program) {
      var name, qualifier, variable, _base,
        _this = this;
      (_base = program.state).variables || (_base.variables = {});
      name = this.variable ? this.variable.name : this.name.toVariableName();
      variable = program.state.scope.define(name, {
        type: this.variable ? this.variable.type() : this.type
      });
      if (this.variable) variable.add_dependent(this.variable);
      if (variable.value === void 0) variable.value = Number.NaN;
      qualifier = program.state.scope.qualifier();
      if (qualifier === 'root.block' || qualifier === 'root.block.main.block') {
        program.state.variables[name] = variable;
      }
      return {
        execute: function() {
          return variable.value;
        },
        toSource: function() {
          return "" + (variable.type()) + " " + variable.name;
        },
        variable: variable
      };
    };

    return Variable;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/parser"] = function() {
      var exports = {};
      /* Jison generated parser */

var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"{":10,"}":11,"Identifier":12,"Assign":13,"Call":14,"Literal":15,"TypeConstructor":16,"FunctionCall":17,"Operation":18,"Return":19,"Comment":20,"FunctionDefinition":21,"FunctionDeclaration":22,"VariableDeclaration":23,"STATEMENT":24,"Type":25,"CALL_START":26,"ArgumentDefs":27,")":28,",":29,"ArgumentList":30,"(":31,"Arguments":32,"=":33,"IDENTIFIER":34,"NUMBER":35,"RETURN":36,"VOID":37,"BOOL":38,"INT":39,"FLOAT":40,"VEC2":41,"VEC3":42,"VEC4":43,"BVEC2":44,"BVEC3":45,"BVEC4":46,"IVEC2":47,"IVEC3":48,"IVEC4":49,"MAT2":50,"MAT3":51,"MAT4":52,"MAT2X2":53,"MAT2X3":54,"MAT2X4":55,"MAT3X2":56,"MAT3X3":57,"MAT3X4":58,"MAT4X2":59,"MAT4X3":60,"MAT4X4":61,"SAMPLER1D":62,"SAMPLER2D":63,"SAMPLER3D":64,"SAMPLERCUBE":65,"SAMPLER1DSHADOW":66,"SAMPLER2DSHADOW":67,"UNARY":68,"-":69,"+":70,"--":71,"SimpleAssignable":72,"++":73,"?":74,"MATH":75,"SHIFT":76,"COMPARE":77,"LOGIC":78,"RELATION":79,"COMPOUND_ASSIGN":80,"INDENT":81,"OUTDENT":82,"EXTENDS":83,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",10:"{",11:"}",14:"Call",20:"Comment",22:"FunctionDeclaration",24:"STATEMENT",26:"CALL_START",28:")",29:",",31:"(",33:"=",34:"IDENTIFIER",35:"NUMBER",36:"RETURN",37:"VOID",38:"BOOL",39:"INT",40:"FLOAT",41:"VEC2",42:"VEC3",43:"VEC4",44:"BVEC2",45:"BVEC3",46:"BVEC4",47:"IVEC2",48:"IVEC3",49:"IVEC4",50:"MAT2",51:"MAT3",52:"MAT4",53:"MAT2X2",54:"MAT2X3",55:"MAT2X4",56:"MAT3X2",57:"MAT3X3",58:"MAT3X4",59:"MAT4X2",60:"MAT4X3",61:"MAT4X4",62:"SAMPLER1D",63:"SAMPLER2D",64:"SAMPLER3D",65:"SAMPLERCUBE",66:"SAMPLER1DSHADOW",67:"SAMPLER2DSHADOW",68:"UNARY",69:"-",70:"+",71:"--",72:"SimpleAssignable",73:"++",74:"?",75:"MATH",76:"SHIFT",77:"COMPARE",78:"LOGIC",79:"RELATION",80:"COMPOUND_ASSIGN",81:"INDENT",82:"OUTDENT",83:"EXTENDS"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,2],[7,2],[7,1],[5,2],[5,3],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[9,2],[9,2],[9,1],[9,2],[9,2],[9,2],[9,1],[23,2],[21,6],[21,5],[27,2],[27,4],[30,3],[30,3],[30,2],[30,2],[32,1],[32,3],[17,2],[13,3],[12,1],[15,1],[16,2],[19,1],[19,2],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[25,1],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,5],[18,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Root(new yy.Block([]));
break;
case 2:return this.$ = new yy.Root($$[$0]);
break;
case 3:return this.$ = new yy.Root($$[$0-1]);
break;
case 4:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:this.$ = (function () {
        $$[$0-1].push($$[$0]);
        return $$[$0-1];
      }());
break;
case 6:this.$ = $$[$0-1];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = new yy.Block;
break;
case 9:this.$ = $$[$0-1];
break;
case 10:this.$ = $$[$0];
break;
case 11:this.$ = $$[$0];
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0-1];
break;
case 18:this.$ = $$[$0-1];
break;
case 19:this.$ = $$[$0];
break;
case 20:this.$ = $$[$0-1];
break;
case 21:this.$ = $$[$0-1];
break;
case 22:this.$ = new yy.Literal($$[$0-1]);
break;
case 23:this.$ = {
          compile: function() {
            return null;
          }
        };
break;
case 24:this.$ = new yy.Variable($$[$0-1], $$[$0]);
break;
case 25:this.$ = new yy.Function($$[$0-5], $$[$0-4], $$[$0-2], $$[$0]);
break;
case 26:this.$ = new yy.Function($$[$0-4], $$[$0-3], [], $$[$0]);
break;
case 27:this.$ = [new yy.Variable($$[$0-1], $$[$0])];
break;
case 28:this.$ = $$[$0-3].concat([new yy.Variable($$[$0-1], $$[$0])]);
break;
case 29:this.$ = $$[$0-1];
break;
case 30:this.$ = $$[$0-1];
break;
case 31:this.$ = [];
break;
case 32:this.$ = [];
break;
case 33:this.$ = [$$[$0]];
break;
case 34:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 35:this.$ = new yy.Call($$[$0-1], $$[$0]);
break;
case 36:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 37:this.$ = new yy.Identifier($$[$0]);
break;
case 38:this.$ = new yy.Literal($$[$0]);
break;
case 39:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
case 40:this.$ = new yy.Return;
break;
case 41:this.$ = new yy.Return($$[$0]);
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = $$[$0];
break;
case 46:this.$ = $$[$0];
break;
case 47:this.$ = $$[$0];
break;
case 48:this.$ = $$[$0];
break;
case 49:this.$ = $$[$0];
break;
case 50:this.$ = $$[$0];
break;
case 51:this.$ = $$[$0];
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = $$[$0];
break;
case 54:this.$ = $$[$0];
break;
case 55:this.$ = $$[$0];
break;
case 56:this.$ = $$[$0];
break;
case 57:this.$ = $$[$0];
break;
case 58:this.$ = $$[$0];
break;
case 59:this.$ = $$[$0];
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = $$[$0];
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = $$[$0];
break;
case 67:this.$ = $$[$0];
break;
case 68:this.$ = $$[$0];
break;
case 69:this.$ = $$[$0];
break;
case 70:this.$ = $$[$0];
break;
case 71:this.$ = $$[$0];
break;
case 72:this.$ = $$[$0];
break;
case 73:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 74:this.$ = new yy.Op('-', $$[$0]);
break;
case 75:this.$ = new yy.Op('+', $$[$0]);
break;
case 76:this.$ = new yy.Op('--', $$[$0]);
break;
case 77:this.$ = new yy.Op('++', $$[$0]);
break;
case 78:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 79:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 80:this.$ = new yy.Existence($$[$0-1]);
break;
case 81:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 82:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 83:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 84:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 85:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 86:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 87:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 88:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 89:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 90:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,6:[1,21],7:4,8:6,9:7,10:[1,5],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:[1,16],21:17,22:[1,18],23:19,24:[1,20],25:24,34:[1,22],35:[1,23],36:[1,31],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{1:[3]},{1:[2,2],6:[1,21],7:63,8:6,9:7,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:[1,16],21:17,22:[1,18],23:19,24:[1,20],25:24,34:[1,22],35:[1,23],36:[1,31],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{6:[1,64]},{1:[2,4],6:[2,4],11:[2,4],14:[2,4],20:[2,4],22:[2,4],24:[2,4],34:[2,4],35:[2,4],36:[2,4],37:[2,4],38:[2,4],39:[2,4],40:[2,4],41:[2,4],42:[2,4],43:[2,4],44:[2,4],45:[2,4],46:[2,4],47:[2,4],48:[2,4],49:[2,4],50:[2,4],51:[2,4],52:[2,4],53:[2,4],54:[2,4],55:[2,4],56:[2,4],57:[2,4],58:[2,4],59:[2,4],60:[2,4],61:[2,4],62:[2,4],63:[2,4],64:[2,4],65:[2,4],66:[2,4],67:[2,4],68:[2,4],69:[2,4],70:[2,4],71:[2,4],72:[2,4],73:[2,4]},{4:66,6:[1,21],7:4,8:6,9:7,11:[1,65],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:[1,16],21:17,22:[1,18],23:19,24:[1,20],25:24,34:[1,22],35:[1,23],36:[1,31],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{6:[1,67],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75]},{1:[2,7],6:[2,7],11:[2,7],14:[2,7],20:[2,7],22:[2,7],24:[2,7],34:[2,7],35:[2,7],36:[2,7],37:[2,7],38:[2,7],39:[2,7],40:[2,7],41:[2,7],42:[2,7],43:[2,7],44:[2,7],45:[2,7],46:[2,7],47:[2,7],48:[2,7],49:[2,7],50:[2,7],51:[2,7],52:[2,7],53:[2,7],54:[2,7],55:[2,7],56:[2,7],57:[2,7],58:[2,7],59:[2,7],60:[2,7],61:[2,7],62:[2,7],63:[2,7],64:[2,7],65:[2,7],66:[2,7],67:[2,7],68:[2,7],69:[2,7],70:[2,7],71:[2,7],72:[2,7],73:[2,7]},{6:[2,10],26:[1,79],28:[2,10],29:[2,10],30:77,31:[1,78],33:[1,76],69:[2,10],70:[2,10],74:[2,10],75:[2,10],76:[2,10],77:[2,10],78:[2,10],79:[2,10],82:[2,10]},{6:[2,11],28:[2,11],29:[2,11],69:[2,11],70:[2,11],74:[2,11],75:[2,11],76:[2,11],77:[2,11],78:[2,11],79:[2,11],82:[2,11]},{6:[2,12],28:[2,12],29:[2,12],69:[2,12],70:[2,12],74:[2,12],75:[2,12],76:[2,12],77:[2,12],78:[2,12],79:[2,12],82:[2,12]},{6:[2,13],28:[2,13],29:[2,13],69:[2,13],70:[2,13],74:[2,13],75:[2,13],76:[2,13],77:[2,13],78:[2,13],79:[2,13],82:[2,13]},{6:[2,14],28:[2,14],29:[2,14],69:[2,14],70:[2,14],74:[2,14],75:[2,14],76:[2,14],77:[2,14],78:[2,14],79:[2,14],82:[2,14]},{6:[2,15],28:[2,15],29:[2,15],69:[2,15],70:[2,15],74:[2,15],75:[2,15],76:[2,15],77:[2,15],78:[2,15],79:[2,15],82:[2,15]},{6:[2,16],28:[2,16],29:[2,16],69:[2,16],70:[2,16],74:[2,16],75:[2,16],76:[2,16],77:[2,16],78:[2,16],79:[2,16],82:[2,16]},{6:[1,80]},{6:[1,81]},{1:[2,19],6:[2,19],11:[2,19],14:[2,19],20:[2,19],22:[2,19],24:[2,19],34:[2,19],35:[2,19],36:[2,19],37:[2,19],38:[2,19],39:[2,19],40:[2,19],41:[2,19],42:[2,19],43:[2,19],44:[2,19],45:[2,19],46:[2,19],47:[2,19],48:[2,19],49:[2,19],50:[2,19],51:[2,19],52:[2,19],53:[2,19],54:[2,19],55:[2,19],56:[2,19],57:[2,19],58:[2,19],59:[2,19],60:[2,19],61:[2,19],62:[2,19],63:[2,19],64:[2,19],65:[2,19],66:[2,19],67:[2,19],68:[2,19],69:[2,19],70:[2,19],71:[2,19],72:[2,19],73:[2,19]},{6:[1,82]},{6:[1,83]},{6:[1,84]},{1:[2,23],6:[2,23],11:[2,23],14:[2,23],20:[2,23],22:[2,23],24:[2,23],34:[2,23],35:[2,23],36:[2,23],37:[2,23],38:[2,23],39:[2,23],40:[2,23],41:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23],47:[2,23],48:[2,23],49:[2,23],50:[2,23],51:[2,23],52:[2,23],53:[2,23],54:[2,23],55:[2,23],56:[2,23],57:[2,23],58:[2,23],59:[2,23],60:[2,23],61:[2,23],62:[2,23],63:[2,23],64:[2,23],65:[2,23],66:[2,23],67:[2,23],68:[2,23],69:[2,23],70:[2,23],71:[2,23],72:[2,23],73:[2,23]},{6:[2,37],26:[2,37],28:[2,37],29:[2,37],31:[2,37],33:[2,37],69:[2,37],70:[2,37],74:[2,37],75:[2,37],76:[2,37],77:[2,37],78:[2,37],79:[2,37],82:[2,37]},{6:[2,38],28:[2,38],29:[2,38],69:[2,38],70:[2,38],74:[2,38],75:[2,38],76:[2,38],77:[2,38],78:[2,38],79:[2,38],82:[2,38]},{12:86,26:[1,79],30:85,31:[1,78],34:[1,22]},{8:87,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:89,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:90,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{72:[1,91]},{72:[1,92]},{71:[1,93],73:[1,94],80:[1,95],83:[1,96]},{6:[2,40],8:97,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{26:[2,42],31:[2,42],34:[2,42]},{26:[2,43],31:[2,43],34:[2,43]},{26:[2,44],31:[2,44],34:[2,44]},{26:[2,45],31:[2,45],34:[2,45]},{26:[2,46],31:[2,46],34:[2,46]},{26:[2,47],31:[2,47],34:[2,47]},{26:[2,48],31:[2,48],34:[2,48]},{26:[2,49],31:[2,49],34:[2,49]},{26:[2,50],31:[2,50],34:[2,50]},{26:[2,51],31:[2,51],34:[2,51]},{26:[2,52],31:[2,52],34:[2,52]},{26:[2,53],31:[2,53],34:[2,53]},{26:[2,54],31:[2,54],34:[2,54]},{26:[2,55],31:[2,55],34:[2,55]},{26:[2,56],31:[2,56],34:[2,56]},{26:[2,57],31:[2,57],34:[2,57]},{26:[2,58],31:[2,58],34:[2,58]},{26:[2,59],31:[2,59],34:[2,59]},{26:[2,60],31:[2,60],34:[2,60]},{26:[2,61],31:[2,61],34:[2,61]},{26:[2,62],31:[2,62],34:[2,62]},{26:[2,63],31:[2,63],34:[2,63]},{26:[2,64],31:[2,64],34:[2,64]},{26:[2,65],31:[2,65],34:[2,65]},{26:[2,66],31:[2,66],34:[2,66]},{26:[2,67],31:[2,67],34:[2,67]},{26:[2,68],31:[2,68],34:[2,68]},{26:[2,69],31:[2,69],34:[2,69]},{26:[2,70],31:[2,70],34:[2,70]},{26:[2,71],31:[2,71],34:[2,71]},{26:[2,72],31:[2,72],34:[2,72]},{1:[2,5],6:[2,5],11:[2,5],14:[2,5],20:[2,5],22:[2,5],24:[2,5],34:[2,5],35:[2,5],36:[2,5],37:[2,5],38:[2,5],39:[2,5],40:[2,5],41:[2,5],42:[2,5],43:[2,5],44:[2,5],45:[2,5],46:[2,5],47:[2,5],48:[2,5],49:[2,5],50:[2,5],51:[2,5],52:[2,5],53:[2,5],54:[2,5],55:[2,5],56:[2,5],57:[2,5],58:[2,5],59:[2,5],60:[2,5],61:[2,5],62:[2,5],63:[2,5],64:[2,5],65:[2,5],66:[2,5],67:[2,5],68:[2,5],69:[2,5],70:[2,5],71:[2,5],72:[2,5],73:[2,5]},{1:[2,3]},{1:[2,8],6:[2,8],11:[2,8],14:[2,8],20:[2,8],22:[2,8],24:[2,8],34:[2,8],35:[2,8],36:[2,8],37:[2,8],38:[2,8],39:[2,8],40:[2,8],41:[2,8],42:[2,8],43:[2,8],44:[2,8],45:[2,8],46:[2,8],47:[2,8],48:[2,8],49:[2,8],50:[2,8],51:[2,8],52:[2,8],53:[2,8],54:[2,8],55:[2,8],56:[2,8],57:[2,8],58:[2,8],59:[2,8],60:[2,8],61:[2,8],62:[2,8],63:[2,8],64:[2,8],65:[2,8],66:[2,8],67:[2,8],68:[2,8],69:[2,8],70:[2,8],71:[2,8],72:[2,8],73:[2,8]},{6:[1,21],7:63,8:6,9:7,11:[1,98],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:[1,16],21:17,22:[1,18],23:19,24:[1,20],25:24,34:[1,22],35:[1,23],36:[1,31],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{1:[2,6],6:[2,6],11:[2,6],14:[2,6],20:[2,6],22:[2,6],24:[2,6],34:[2,6],35:[2,6],36:[2,6],37:[2,6],38:[2,6],39:[2,6],40:[2,6],41:[2,6],42:[2,6],43:[2,6],44:[2,6],45:[2,6],46:[2,6],47:[2,6],48:[2,6],49:[2,6],50:[2,6],51:[2,6],52:[2,6],53:[2,6],54:[2,6],55:[2,6],56:[2,6],57:[2,6],58:[2,6],59:[2,6],60:[2,6],61:[2,6],62:[2,6],63:[2,6],64:[2,6],65:[2,6],66:[2,6],67:[2,6],68:[2,6],69:[2,6],70:[2,6],71:[2,6],72:[2,6],73:[2,6]},{6:[2,80],28:[2,80],29:[2,80],69:[2,80],70:[2,80],74:[2,80],75:[2,80],76:[2,80],77:[2,80],78:[2,80],79:[2,80],82:[2,80]},{8:99,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:100,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:101,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:102,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:103,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:104,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:105,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:106,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{6:[2,35],28:[2,35],29:[2,35],69:[2,35],70:[2,35],74:[2,35],75:[2,35],76:[2,35],77:[2,35],78:[2,35],79:[2,35],82:[2,35]},{8:109,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,28:[1,108],32:107,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{8:109,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,28:[1,111],32:110,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{1:[2,17],6:[2,17],11:[2,17],14:[2,17],20:[2,17],22:[2,17],24:[2,17],34:[2,17],35:[2,17],36:[2,17],37:[2,17],38:[2,17],39:[2,17],40:[2,17],41:[2,17],42:[2,17],43:[2,17],44:[2,17],45:[2,17],46:[2,17],47:[2,17],48:[2,17],49:[2,17],50:[2,17],51:[2,17],52:[2,17],53:[2,17],54:[2,17],55:[2,17],56:[2,17],57:[2,17],58:[2,17],59:[2,17],60:[2,17],61:[2,17],62:[2,17],63:[2,17],64:[2,17],65:[2,17],66:[2,17],67:[2,17],68:[2,17],69:[2,17],70:[2,17],71:[2,17],72:[2,17],73:[2,17]},{1:[2,18],6:[2,18],11:[2,18],14:[2,18],20:[2,18],22:[2,18],24:[2,18],34:[2,18],35:[2,18],36:[2,18],37:[2,18],38:[2,18],39:[2,18],40:[2,18],41:[2,18],42:[2,18],43:[2,18],44:[2,18],45:[2,18],46:[2,18],47:[2,18],48:[2,18],49:[2,18],50:[2,18],51:[2,18],52:[2,18],53:[2,18],54:[2,18],55:[2,18],56:[2,18],57:[2,18],58:[2,18],59:[2,18],60:[2,18],61:[2,18],62:[2,18],63:[2,18],64:[2,18],65:[2,18],66:[2,18],67:[2,18],68:[2,18],69:[2,18],70:[2,18],71:[2,18],72:[2,18],73:[2,18]},{1:[2,20],6:[2,20],11:[2,20],14:[2,20],20:[2,20],22:[2,20],24:[2,20],34:[2,20],35:[2,20],36:[2,20],37:[2,20],38:[2,20],39:[2,20],40:[2,20],41:[2,20],42:[2,20],43:[2,20],44:[2,20],45:[2,20],46:[2,20],47:[2,20],48:[2,20],49:[2,20],50:[2,20],51:[2,20],52:[2,20],53:[2,20],54:[2,20],55:[2,20],56:[2,20],57:[2,20],58:[2,20],59:[2,20],60:[2,20],61:[2,20],62:[2,20],63:[2,20],64:[2,20],65:[2,20],66:[2,20],67:[2,20],68:[2,20],69:[2,20],70:[2,20],71:[2,20],72:[2,20],73:[2,20]},{1:[2,21],6:[2,21],11:[2,21],14:[2,21],20:[2,21],22:[2,21],24:[2,21],34:[2,21],35:[2,21],36:[2,21],37:[2,21],38:[2,21],39:[2,21],40:[2,21],41:[2,21],42:[2,21],43:[2,21],44:[2,21],45:[2,21],46:[2,21],47:[2,21],48:[2,21],49:[2,21],50:[2,21],51:[2,21],52:[2,21],53:[2,21],54:[2,21],55:[2,21],56:[2,21],57:[2,21],58:[2,21],59:[2,21],60:[2,21],61:[2,21],62:[2,21],63:[2,21],64:[2,21],65:[2,21],66:[2,21],67:[2,21],68:[2,21],69:[2,21],70:[2,21],71:[2,21],72:[2,21],73:[2,21]},{1:[2,22],6:[2,22],11:[2,22],14:[2,22],20:[2,22],22:[2,22],24:[2,22],34:[2,22],35:[2,22],36:[2,22],37:[2,22],38:[2,22],39:[2,22],40:[2,22],41:[2,22],42:[2,22],43:[2,22],44:[2,22],45:[2,22],46:[2,22],47:[2,22],48:[2,22],49:[2,22],50:[2,22],51:[2,22],52:[2,22],53:[2,22],54:[2,22],55:[2,22],56:[2,22],57:[2,22],58:[2,22],59:[2,22],60:[2,22],61:[2,22],62:[2,22],63:[2,22],64:[2,22],65:[2,22],66:[2,22],67:[2,22],68:[2,22],69:[2,22],70:[2,22],71:[2,22],72:[2,22],73:[2,22]},{6:[2,39],28:[2,39],29:[2,39],69:[2,39],70:[2,39],74:[2,39],75:[2,39],76:[2,39],77:[2,39],78:[2,39],79:[2,39],82:[2,39]},{6:[2,24],26:[1,112]},{6:[2,73],28:[2,73],29:[2,73],69:[2,73],70:[2,73],74:[1,68],75:[2,73],76:[2,73],77:[2,73],78:[2,73],79:[2,73],82:[2,73]},{26:[1,79],30:85,31:[1,78]},{6:[2,74],28:[2,74],29:[2,74],69:[2,74],70:[2,74],74:[1,68],75:[2,74],76:[2,74],77:[2,74],78:[2,74],79:[2,74],82:[2,74]},{6:[2,75],28:[2,75],29:[2,75],69:[2,75],70:[2,75],74:[1,68],75:[2,75],76:[2,75],77:[2,75],78:[2,75],79:[2,75],82:[2,75]},{6:[2,76],28:[2,76],29:[2,76],69:[2,76],70:[2,76],74:[2,76],75:[2,76],76:[2,76],77:[2,76],78:[2,76],79:[2,76],82:[2,76]},{6:[2,77],28:[2,77],29:[2,77],69:[2,77],70:[2,77],74:[2,77],75:[2,77],76:[2,77],77:[2,77],78:[2,77],79:[2,77],82:[2,77]},{6:[2,78],28:[2,78],29:[2,78],69:[2,78],70:[2,78],74:[2,78],75:[2,78],76:[2,78],77:[2,78],78:[2,78],79:[2,78],82:[2,78]},{6:[2,79],28:[2,79],29:[2,79],69:[2,79],70:[2,79],74:[2,79],75:[2,79],76:[2,79],77:[2,79],78:[2,79],79:[2,79],82:[2,79]},{8:113,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29],81:[1,114]},{8:115,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{6:[2,41],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75]},{1:[2,9],6:[2,9],11:[2,9],14:[2,9],20:[2,9],22:[2,9],24:[2,9],34:[2,9],35:[2,9],36:[2,9],37:[2,9],38:[2,9],39:[2,9],40:[2,9],41:[2,9],42:[2,9],43:[2,9],44:[2,9],45:[2,9],46:[2,9],47:[2,9],48:[2,9],49:[2,9],50:[2,9],51:[2,9],52:[2,9],53:[2,9],54:[2,9],55:[2,9],56:[2,9],57:[2,9],58:[2,9],59:[2,9],60:[2,9],61:[2,9],62:[2,9],63:[2,9],64:[2,9],65:[2,9],66:[2,9],67:[2,9],68:[2,9],69:[2,9],70:[2,9],71:[2,9],72:[2,9],73:[2,9]},{6:[2,81],28:[2,81],29:[2,81],69:[2,81],70:[2,81],74:[1,68],75:[1,71],76:[2,81],77:[2,81],78:[2,81],79:[2,81],82:[2,81]},{6:[2,82],28:[2,82],29:[2,82],69:[2,82],70:[2,82],74:[1,68],75:[1,71],76:[2,82],77:[2,82],78:[2,82],79:[2,82],82:[2,82]},{6:[2,83],28:[2,83],29:[2,83],69:[2,83],70:[2,83],74:[1,68],75:[2,83],76:[2,83],77:[2,83],78:[2,83],79:[2,83],82:[2,83]},{6:[2,84],28:[2,84],29:[2,84],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[2,84],77:[2,84],78:[2,84],79:[2,84],82:[2,84]},{6:[2,85],28:[2,85],29:[2,85],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[2,85],78:[2,85],79:[1,75],82:[2,85]},{6:[2,86],28:[2,86],29:[2,86],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[2,86],79:[1,75],82:[2,86]},{6:[2,87],28:[2,87],29:[2,87],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[2,87],78:[2,87],79:[2,87],82:[2,87]},{6:[2,36],28:[2,36],29:[2,36],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75],82:[2,36]},{28:[1,116],29:[1,117]},{6:[2,31],28:[2,31],29:[2,31],69:[2,31],70:[2,31],74:[2,31],75:[2,31],76:[2,31],77:[2,31],78:[2,31],79:[2,31],82:[2,31]},{28:[2,33],29:[2,33],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75]},{28:[1,118],29:[1,117]},{6:[2,32],28:[2,32],29:[2,32],69:[2,32],70:[2,32],74:[2,32],75:[2,32],76:[2,32],77:[2,32],78:[2,32],79:[2,32],82:[2,32]},{25:121,27:119,28:[1,120],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62]},{6:[2,88],28:[2,88],29:[2,88],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75],82:[2,88]},{8:122,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{6:[2,90],28:[2,90],29:[2,90],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75],82:[2,90]},{6:[2,29],28:[2,29],29:[2,29],69:[2,29],70:[2,29],74:[2,29],75:[2,29],76:[2,29],77:[2,29],78:[2,29],79:[2,29],82:[2,29]},{8:123,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,25:88,34:[1,22],35:[1,23],37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,25],69:[1,26],70:[1,27],71:[1,28],72:[1,30],73:[1,29]},{6:[2,30],28:[2,30],29:[2,30],69:[2,30],70:[2,30],74:[2,30],75:[2,30],76:[2,30],77:[2,30],78:[2,30],79:[2,30],82:[2,30]},{28:[1,124],29:[1,125]},{5:126,10:[1,5]},{12:127,34:[1,22]},{69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75],82:[1,128]},{28:[2,34],29:[2,34],69:[1,70],70:[1,69],74:[1,68],75:[1,71],76:[1,72],77:[1,73],78:[1,74],79:[1,75]},{5:129,10:[1,5]},{25:130,37:[1,32],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62]},{1:[2,26],6:[2,26],11:[2,26],14:[2,26],20:[2,26],22:[2,26],24:[2,26],34:[2,26],35:[2,26],36:[2,26],37:[2,26],38:[2,26],39:[2,26],40:[2,26],41:[2,26],42:[2,26],43:[2,26],44:[2,26],45:[2,26],46:[2,26],47:[2,26],48:[2,26],49:[2,26],50:[2,26],51:[2,26],52:[2,26],53:[2,26],54:[2,26],55:[2,26],56:[2,26],57:[2,26],58:[2,26],59:[2,26],60:[2,26],61:[2,26],62:[2,26],63:[2,26],64:[2,26],65:[2,26],66:[2,26],67:[2,26],68:[2,26],69:[2,26],70:[2,26],71:[2,26],72:[2,26],73:[2,26]},{28:[2,27],29:[2,27]},{6:[2,89],28:[2,89],29:[2,89],69:[2,89],70:[2,89],74:[2,89],75:[2,89],76:[2,89],77:[2,89],78:[2,89],79:[2,89],82:[2,89]},{1:[2,25],6:[2,25],11:[2,25],14:[2,25],20:[2,25],22:[2,25],24:[2,25],34:[2,25],35:[2,25],36:[2,25],37:[2,25],38:[2,25],39:[2,25],40:[2,25],41:[2,25],42:[2,25],43:[2,25],44:[2,25],45:[2,25],46:[2,25],47:[2,25],48:[2,25],49:[2,25],50:[2,25],51:[2,25],52:[2,25],53:[2,25],54:[2,25],55:[2,25],56:[2,25],57:[2,25],58:[2,25],59:[2,25],60:[2,25],61:[2,25],62:[2,25],63:[2,25],64:[2,25],65:[2,25],66:[2,25],67:[2,25],68:[2,25],69:[2,25],70:[2,25],71:[2,25],72:[2,25],73:[2,25]},{12:131,34:[1,22]},{28:[2,28],29:[2,28]}],
defaultActions: {64:[2,3]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
undefined
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
;

      return exports;
    };
    _require["shader-script/glsl/program"] = function() {
      var exports = {};
      (function() {
  var Scope,
    __slice = Array.prototype.slice;

  Scope = require('shader-script/scope').Scope;

  exports.Program = (function() {
    var createClone;

    createClone = function(program, entry_point, omit) {
      var attribute, clone, func, name, uniform, variable, varying, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5;
      clone = new exports.Program(program.state);
      _ref = program.uniforms;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        uniform = _ref[_i];
        clone.uniforms.push(uniform);
      }
      _ref2 = program.attributes;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        attribute = _ref2[_j];
        clone.attributes.push(attribute);
      }
      _ref3 = program.varyings;
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        varying = _ref3[_k];
        clone.varyings.push(varying);
      }
      _ref4 = program.variables;
      for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
        variable = _ref4[_l];
        clone.variables.push(variable);
      }
      _ref5 = program.functions;
      for (name in _ref5) {
        func = _ref5[name];
        if (name === omit) {
          continue;
        } else if (name === entry_point) {
          name = 'main';
        }
        clone.functions[name] = func;
      }
      return clone;
    };

    function Program(state) {
      var _base, _base2;
      this.state = state != null ? state : {};
      this.uniforms = [];
      this.attributes = [];
      this.varyings = [];
      this.variables = [];
      this.functions = {};
      (_base = this.state).variables || (_base.variables = {});
      (_base2 = this.state).scope || (_base2.scope = new Scope());
    }

    Program.prototype.toSource = function() {
      var attr, attributes, fn, functions, name, unif, uniforms, vari, variables, vary, varyings, _ref;
      uniforms = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.uniforms;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          unif = _ref[_i];
          _results.push("uniform   " + unif.type + " " + unif.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      attributes = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.attributes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attr = _ref[_i];
          _results.push("attribute " + attr.type + " " + attr.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      varyings = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.varyings;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          vary = _ref[_i];
          _results.push("varying   " + vary.type + " " + vary.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      variables = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.variables;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          vari = _ref[_i];
          _results.push("" + vari.type + " " + vari.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      functions = [];
      _ref = this.functions;
      for (name in _ref) {
        fn = _ref[name];
        functions.push(fn.toSource(name));
      }
      return [uniforms, attributes, varyings, variables, functions.join("\n\n")].join("\n\n").trim();
    };

    Program.prototype.toVertexProgram = function() {
      return createClone(this, 'vertex', 'fragment');
    };

    Program.prototype.toFragmentProgram = function() {
      return createClone(this, 'fragment', 'vertex');
    };

    Program.prototype.invoke = function() {
      var function_name, params, _ref;
      function_name = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this.functions[function_name]) {
        return (_ref = this.functions[function_name]).invoke.apply(_ref, params);
      } else {
        throw new Error("no " + function_name + " function found!");
      }
    };

    return Program;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/grammar"] = function() {
      var exports = {};
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
        return new Root(new Block);
      }), o('Body', function() {
        return new Root($1);
      }), o('Block TERMINATOR', function() {
        return new Root($1);
      })
    ],
    Body: [
      o('Line', function() {
        return Block.wrap([$1]);
      }), o('Body TERMINATOR Line', function() {
        return $1.push($3);
      }), o('Body TERMINATOR')
    ],
    Line: [o('Expression'), o('Statement')],
    Statement: [
      o('Return'), o('Comment'), o('STATEMENT', function() {
        return new Literal($1);
      })
    ],
    Expression: [o('Value'), o('Invocation'), o('Code'), o('Operation'), o('Assign'), o('If'), o('Try'), o('While'), o('For'), o('Switch'), o('Class'), o('Throw')],
    Block: [
      o('INDENT OUTDENT', function() {
        return new Block;
      }), o('INDENT Body OUTDENT', function() {
        return $2;
      })
    ],
    Identifier: [
      o('IDENTIFIER', function() {
        return new Identifier($1);
      })
    ],
    AlphaNumeric: [
      o('NUMBER', function() {
        return new Literal($1);
      }), o('STRING', function() {
        return new Literal($1);
      })
    ],
    Literal: [
      o('AlphaNumeric'), o('JS', function() {
        return new Literal($1);
      }), o('REGEX', function() {
        return new Literal($1);
      }), o('DEBUGGER', function() {
        return new Literal($1);
      }), o('BOOL', function() {
        var val;
        val = new Literal($1);
        if ($1 === 'undefined') val.isUndefined = true;
        return val;
      })
    ],
    Assign: [
      o('Assignable = Expression', function() {
        return new Assign($1, $3);
      }), o('Assignable = TERMINATOR Expression', function() {
        return new Assign($1, $4);
      }), o('Assignable = INDENT Expression OUTDENT', function() {
        return new Assign($1, $4);
      })
    ],
    AssignObj: [
      o('ObjAssignable', function() {
        return new Value($1);
      }), o('ObjAssignable : Expression', function() {
        return new Assign(new Value($1), $3, 'object');
      }), o('ObjAssignable :\
       INDENT Expression OUTDENT', function() {
        return new Assign(new Value($1), $4, 'object');
      }), o('Comment')
    ],
    ObjAssignable: [o('Identifier'), o('AlphaNumeric'), o('ThisProperty')],
    Return: [
      o('RETURN Expression', function() {
        return new Return($2);
      }), o('RETURN', function() {
        return new Return;
      })
    ],
    Comment: [
      o('HERECOMMENT', function() {
        return new Comment($1);
      })
    ],
    Code: [
      o('PARAM_START ParamList PARAM_END FuncGlyph Block', function() {
        return new Code($2, $5, $4);
      }), o('FuncGlyph Block', function() {
        return new Code([], $2, $1);
      })
    ],
    FuncGlyph: [
      o('->', function() {
        return 'func';
      }), o('=>', function() {
        return 'boundfunc';
      })
    ],
    OptComma: [o(''), o(',')],
    ParamList: [
      o('', function() {
        return [];
      }), o('Param', function() {
        return [$1];
      }), o('ParamList , Param', function() {
        return $1.concat($3);
      })
    ],
    Param: [
      o('ParamVar', function() {
        return new Param($1);
      }), o('ParamVar ...', function() {
        return new Param($1, null, true);
      }), o('ParamVar = Expression', function() {
        return new Param($1, $3);
      }), o('GlslType Param', function() {
        $2.set_type($1);
        return $2;
      })
    ],
    ParamVar: [o('Identifier'), o('ThisProperty'), o('Array'), o('Object')],
    Splat: [
      o('Expression ...', function() {
        return new Splat($1);
      })
    ],
    SimpleAssignable: [
      o('Identifier', function() {
        return new Value($1);
      }), o('Value Accessor', function() {
        return $1.add($2);
      }), o('Invocation Accessor', function() {
        return new Value($1, [].concat($2));
      }), o('ThisProperty')
    ],
    Assignable: [
      o('SimpleAssignable'), o('Array', function() {
        return new Value($1);
      }), o('Object', function() {
        return new Value($1);
      })
    ],
    Value: [
      o('Assignable'), o('Literal', function() {
        return new Value($1);
      }), o('Parenthetical', function() {
        return new Value($1);
      }), o('Range', function() {
        return new Value($1);
      }), o('This')
    ],
    Accessor: [
      o('.  Identifier', function() {
        return new Access($2);
      }), o('?. Identifier', function() {
        return new Access($2, 'soak');
      }), o(':: Identifier', function() {
        return [new Access(new Literal('prototype')), new Access($2)];
      }), o('::', function() {
        return new Access(new Literal('prototype'));
      }), o('Index')
    ],
    Index: [
      o('INDEX_START IndexValue INDEX_END', function() {
        return $2;
      }), o('INDEX_SOAK  Index', function() {
        return extend($2, {
          soak: true
        });
      })
    ],
    IndexValue: [
      o('Expression', function() {
        return new Index($1);
      }), o('Slice', function() {
        return new Slice($1);
      })
    ],
    Object: [
      o('{ AssignList OptComma }', function() {
        return new Obj($2, $1.generated);
      })
    ],
    AssignList: [
      o('', function() {
        return [];
      }), o('AssignObj', function() {
        return [$1];
      }), o('AssignList , AssignObj', function() {
        return $1.concat($3);
      }), o('AssignList OptComma TERMINATOR AssignObj', function() {
        return $1.concat($4);
      }), o('AssignList OptComma INDENT AssignList OptComma OUTDENT', function() {
        return $1.concat($4);
      })
    ],
    Class: [
      o('CLASS', function() {
        return new Class;
      }), o('CLASS Block', function() {
        return new Class(null, null, $2);
      }), o('CLASS EXTENDS Expression', function() {
        return new Class(null, $3);
      }), o('CLASS EXTENDS Expression Block', function() {
        return new Class(null, $3, $4);
      }), o('CLASS SimpleAssignable', function() {
        return new Class($2);
      }), o('CLASS SimpleAssignable Block', function() {
        return new Class($2, null, $3);
      }), o('CLASS SimpleAssignable EXTENDS Expression', function() {
        return new Class($2, $4);
      }), o('CLASS SimpleAssignable EXTENDS Expression Block', function() {
        return new Class($2, $4, $5);
      })
    ],
    Invocation: [
      o('Value OptFuncExist Arguments', function() {
        return new Call($1, $3, $2);
      }), o('Invocation OptFuncExist Arguments', function() {
        return new Call($1, $3, $2);
      }), o('SUPER', function() {
        return new Call('super', [new Splat(new Literal('arguments'))]);
      }), o('SUPER Arguments', function() {
        return new Call('super', $2);
      })
    ],
    OptFuncExist: [
      o('', function() {
        return false;
      }), o('FUNC_EXIST', function() {
        return true;
      })
    ],
    Arguments: [
      o('CALL_START CALL_END', function() {
        return [];
      }), o('CALL_START ArgList OptComma CALL_END', function() {
        return $2;
      })
    ],
    This: [
      o('THIS', function() {
        return new Value(new Literal('this'));
      }), o('@', function() {
        return new Value(new Literal('this'));
      })
    ],
    ThisProperty: [
      o('@ Identifier', function() {
        return new Value(new Literal('this'), [new Access($2)], 'this');
      })
    ],
    Array: [
      o('[ ]', function() {
        return new Arr([]);
      }), o('[ ArgList OptComma ]', function() {
        return new Arr($2);
      })
    ],
    RangeDots: [
      o('..', function() {
        return 'inclusive';
      }), o('...', function() {
        return 'exclusive';
      })
    ],
    Range: [
      o('[ Expression RangeDots Expression ]', function() {
        return new Range($2, $4, $3);
      })
    ],
    Slice: [
      o('Expression RangeDots Expression', function() {
        return new Range($1, $3, $2);
      }), o('Expression RangeDots', function() {
        return new Range($1, null, $2);
      }), o('RangeDots Expression', function() {
        return new Range(null, $2, $1);
      }), o('RangeDots', function() {
        return new Range(null, null, $1);
      })
    ],
    ArgList: [
      o('Arg', function() {
        return [$1];
      }), o('ArgList , Arg', function() {
        return $1.concat($3);
      }), o('ArgList OptComma TERMINATOR Arg', function() {
        return $1.concat($4);
      }), o('INDENT ArgList OptComma OUTDENT', function() {
        return $2;
      }), o('ArgList OptComma INDENT ArgList OptComma OUTDENT', function() {
        return $1.concat($4);
      })
    ],
    Arg: [o('Expression'), o('Splat')],
    SimpleArgs: [
      o('Expression'), o('SimpleArgs , Expression', function() {
        return [].concat($1, $3);
      })
    ],
    Try: [
      o('TRY Block', function() {
        return new Try($2);
      }), o('TRY Block Catch', function() {
        return new Try($2, $3[0], $3[1]);
      }), o('TRY Block FINALLY Block', function() {
        return new Try($2, null, null, $4);
      }), o('TRY Block Catch FINALLY Block', function() {
        return new Try($2, $3[0], $3[1], $5);
      })
    ],
    Catch: [
      o('CATCH Identifier Block', function() {
        return [$2, $3];
      })
    ],
    Throw: [
      o('THROW Expression', function() {
        return new Throw($2);
      })
    ],
    Parenthetical: [
      o('( Body )', function() {
        return new Parens($2);
      }), o('( INDENT Body OUTDENT )', function() {
        return new Parens($3);
      })
    ],
    WhileSource: [
      o('WHILE Expression', function() {
        return new While($2);
      }), o('WHILE Expression WHEN Expression', function() {
        return new While($2, {
          guard: $4
        });
      }), o('UNTIL Expression', function() {
        return new While($2, {
          invert: true
        });
      }), o('UNTIL Expression WHEN Expression', function() {
        return new While($2, {
          invert: true,
          guard: $4
        });
      })
    ],
    While: [
      o('WhileSource Block', function() {
        return $1.addBody($2);
      }), o('Statement  WhileSource', function() {
        return $2.addBody(Block.wrap([$1]));
      }), o('Expression WhileSource', function() {
        return $2.addBody(Block.wrap([$1]));
      }), o('Loop', function() {
        return $1;
      })
    ],
    Loop: [
      o('LOOP Block', function() {
        return new While(new Literal('true')).addBody($2);
      }), o('LOOP Expression', function() {
        return new While(new Literal('true')).addBody(Block.wrap([$2]));
      })
    ],
    For: [
      o('Statement  ForBody', function() {
        return new For($1, $2);
      }), o('Expression ForBody', function() {
        return new For($1, $2);
      }), o('ForBody    Block', function() {
        return new For($2, $1);
      })
    ],
    ForBody: [
      o('FOR Range', function() {
        return {
          source: new Value($2)
        };
      }), o('ForStart ForSource', function() {
        $2.own = $1.own;
        $2.name = $1[0];
        $2.index = $1[1];
        return $2;
      })
    ],
    ForStart: [
      o('FOR ForVariables', function() {
        return $2;
      }), o('FOR OWN ForVariables', function() {
        $3.own = true;
        return $3;
      })
    ],
    ForValue: [
      o('Identifier'), o('Array', function() {
        return new Value($1);
      }), o('Object', function() {
        return new Value($1);
      })
    ],
    ForVariables: [
      o('ForValue', function() {
        return [$1];
      }), o('ForValue , ForValue', function() {
        return [$1, $3];
      })
    ],
    ForSource: [
      o('FORIN Expression', function() {
        return {
          source: $2
        };
      }), o('FOROF Expression', function() {
        return {
          source: $2,
          object: true
        };
      }), o('FORIN Expression WHEN Expression', function() {
        return {
          source: $2,
          guard: $4
        };
      }), o('FOROF Expression WHEN Expression', function() {
        return {
          source: $2,
          guard: $4,
          object: true
        };
      }), o('FORIN Expression BY Expression', function() {
        return {
          source: $2,
          step: $4
        };
      }), o('FORIN Expression WHEN Expression BY Expression', function() {
        return {
          source: $2,
          guard: $4,
          step: $6
        };
      }), o('FORIN Expression BY Expression WHEN Expression', function() {
        return {
          source: $2,
          step: $4,
          guard: $6
        };
      })
    ],
    Switch: [
      o('SWITCH Expression INDENT Whens OUTDENT', function() {
        return new Switch($2, $4);
      }), o('SWITCH Expression INDENT Whens ELSE Block OUTDENT', function() {
        return new Switch($2, $4, $6);
      }), o('SWITCH INDENT Whens OUTDENT', function() {
        return new Switch(null, $3);
      }), o('SWITCH INDENT Whens ELSE Block OUTDENT', function() {
        return new Switch(null, $3, $5);
      })
    ],
    Whens: [
      o('When'), o('Whens When', function() {
        return $1.concat($2);
      })
    ],
    When: [
      o('LEADING_WHEN SimpleArgs Block', function() {
        return [[$2, $3]];
      }), o('LEADING_WHEN SimpleArgs Block TERMINATOR', function() {
        return [[$2, $3]];
      })
    ],
    IfBlock: [
      o('IF Expression Block', function() {
        return new If($2, $3, {
          type: $1
        });
      }), o('IfBlock ELSE IF Expression Block', function() {
        return $1.addElse(new If($4, $5, {
          type: $3
        }));
      })
    ],
    If: [
      o('IfBlock'), o('IfBlock ELSE Block', function() {
        return $1.addElse($3);
      }), o('Statement  POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), {
          type: $2,
          statement: true
        });
      }), o('Expression POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), {
          type: $2,
          statement: true
        });
      })
    ],
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
    ],
    GlslType: [o('VOID'), o('BOOL'), o('INT'), o('FLOAT'), o('VEC2'), o('VEC3'), o("VEC4"), o("BVEC2"), o("BVEC3"), o("BVEC4"), o('IVEC2'), o('IVEC3'), o('IVEC4'), o('MAT2'), o("MAT3"), o("MAT4"), o('MAT2X2'), o('MAT2X3'), o('MAT2X4'), o("MAT3X2"), o("MAT3X3"), o("MAT3X4"), o("MAT4X2"), o("MAT4X3"), o("MAT4X4"), o('SAMPLER1D'), o('SAMPLER2D'), o('SAMPLER3D'), o('SAMPLERCUBE'), o('SAMPLER1DSHADOW'), o('SAMPLER2DSHADOW')]
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

      return exports;
    };
    _require["shader-script/helpers"] = function() {
      var exports = {};
      (function() {
  var extend, flatten;

  exports.starts = function(string, literal, start) {
    return literal === string.substr(start, literal.length);
  };

  exports.ends = function(string, literal, back) {
    var len;
    len = literal.length;
    return literal === string.substr(string.length - len - (back || 0), len);
  };

  exports.compact = function(array) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (item) _results.push(item);
    }
    return _results;
  };

  exports.count = function(string, substr) {
    var num, pos;
    num = pos = 0;
    if (!substr.length) return 1 / 0;
    while (pos = 1 + string.indexOf(substr, pos)) {
      num++;
    }
    return num;
  };

  exports.merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };

  extend = exports.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  exports.flatten = flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(flatten(element));
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };

  exports.del = function(obj, key) {
    var val;
    val = obj[key];
    delete obj[key];
    return val;
  };

  exports.last = function(array, back) {
    return array[array.length - (back || 0) - 1];
  };

}).call(this);

      return exports;
    };
    _require["shader-script/lexer"] = function() {
      var exports = {};
      (function() {
  var BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, STRICT_PROSCRIBED, TRAILING_SPACES, UNARY, WHITESPACE, compact, count, key, last, starts, _ref, _ref2,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('shader-script/rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

  _ref2 = require('shader-script/helpers'), count = _ref2.count, starts = _ref2.starts, compact = _ref2.compact, last = _ref2.last;

  exports.Lexer = Lexer = (function() {

    function Lexer() {}

    Lexer.prototype.tokenize = function(code, opts) {
      var i, tag;
      if (opts == null) opts = {};
      if (WHITESPACE.test(code)) code = "\n" + code;
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      this.code = code;
      this.line = opts.line || 0;
      this.indent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      i = 0;
      while (this.chunk = code.slice(i)) {
        i += this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.heredocToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
      }
      this.closeIndentation();
      if (tag = this.ends.pop()) this.error("missing " + tag);
      if (opts.rewrite === false) return this.tokens;
      return (new Rewriter).rewrite(this.tokens);
    };

    Lexer.prototype.identifierToken = function() {
      var colon, forcedIdentifier, id, input, match, prev, tag, _ref3, _ref4;
      if (!(match = IDENTIFIER.exec(this.chunk))) return 0;
      input = match[0], id = match[1], colon = match[2];
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref3 = prev[0]) === '.' || _ref3 === '?.' || _ref3 === '::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref4 = this.tag(), __indexOf.call(LINE_BREAK, _ref4) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("reserved word \"" + id + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) id = COFFEE_ALIAS_MAP[id];
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
            case 'null':
            case 'undefined':
              return 'BOOL';
            case 'break':
            case 'continue':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      this.token(tag, id);
      if (colon) this.token(':', ':');
      return input.length;
    };

    Lexer.prototype.numberToken = function() {
      var binaryLiteral, lexedLength, match, number, octalLiteral;
      if (!(match = NUMBER.exec(this.chunk))) return 0;
      number = match[0];
      if (/E/.test(number)) {
        this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
      } else if (/[BOX]/.test(number)) {
        this.error("radix prefixes must be lowercase '" + number + "'");
      } else if (/^0[89]/.test(number)) {
        this.error("decimal literals '" + number + "' must not be prefixed with '0'");
      } else if (/^0[0-7]/.test(number)) {
        this.error("octal literals '" + number + "' must be prefixed with '0o'");
      }
      lexedLength = number.length;
      if (octalLiteral = /0o([0-7]+)/.exec(number)) {
        number = (parseInt(octalLiteral[1], 8)).toString();
      }
      if (binaryLiteral = /0b([01]+)/.exec(number)) {
        number = (parseInt(binaryLiteral[1], 2)).toString();
      }
      this.token('NUMBER', number);
      return lexedLength;
    };

    Lexer.prototype.stringToken = function() {
      var match, octalEsc, string;
      switch (this.chunk.charAt(0)) {
        case "'":
          if (!(match = SIMPLESTR.exec(this.chunk))) return 0;
          this.token('STRING', (string = match[0]).replace(MULTILINER, '\\\n'));
          break;
        case '"':
          if (!(string = this.balancedString(this.chunk, '"'))) return 0;
          if (0 < string.indexOf('#{', 1)) {
            this.interpolateString(string.slice(1, -1));
          } else {
            this.token('STRING', this.escapeLines(string));
          }
          break;
        default:
          return 0;
      }
      if (octalEsc = /^(?:\\.|[^\\])*\\[0-7]/.test(string)) {
        this.error("octal escape sequences " + string + " are not allowed");
      }
      this.line += count(string, '\n');
      return string.length;
    };

    Lexer.prototype.heredocToken = function() {
      var doc, heredoc, match, quote;
      if (!(match = HEREDOC.exec(this.chunk))) return 0;
      heredoc = match[0];
      quote = heredoc.charAt(0);
      doc = this.sanitizeHeredoc(match[2], {
        quote: quote,
        indent: null
      });
      if (quote === '"' && 0 <= doc.indexOf('#{')) {
        this.interpolateString(doc, {
          heredoc: true
        });
      } else {
        this.token('STRING', this.makeString(doc, quote, true));
      }
      this.line += count(heredoc, '\n');
      return heredoc.length;
    };

    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) return 0;
      comment = match[0], here = match[1];
      if (here) {
        this.token('HERECOMMENT', this.sanitizeHeredoc(here, {
          herecomment: true,
          indent: Array(this.indent + 1).join(' ')
        }));
      }
      this.line += count(comment, '\n');
      return comment.length;
    };

    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1));
      return script.length;
    };

    Lexer.prototype.regexToken = function() {
      var flags, length, match, prev, regex, _ref3, _ref4;
      if (this.chunk.charAt(0) !== '/') return 0;
      if (match = HEREGEX.exec(this.chunk)) {
        length = this.heregexToken(match);
        this.line += count(match[0], '\n');
        return length;
      }
      prev = last(this.tokens);
      if (prev && (_ref3 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref3) >= 0)) {
        return 0;
      }
      if (!(match = REGEX.exec(this.chunk))) return 0;
      _ref4 = match, match = _ref4[0], regex = _ref4[1], flags = _ref4[2];
      if (regex.slice(0, 2) === '/*') {
        this.error('regular expressions cannot begin with `*`');
      }
      if (regex === '//') regex = '/(?:)/';
      this.token('REGEX', "" + regex + flags);
      return match.length;
    };

    Lexer.prototype.heregexToken = function(match) {
      var body, flags, heregex, re, tag, tokens, value, _i, _len, _ref3, _ref4, _ref5, _ref6;
      heregex = match[0], body = match[1], flags = match[2];
      if (0 > body.indexOf('#{')) {
        re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/');
        if (re.match(/^\*/)) {
          this.error('regular expressions cannot begin with `*`');
        }
        this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
        return heregex.length;
      }
      this.token('IDENTIFIER', 'RegExp');
      this.tokens.push(['CALL_START', '(']);
      tokens = [];
      _ref3 = this.interpolateString(body, {
        regex: true
      });
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], tag = _ref4[0], value = _ref4[1];
        if (tag === 'TOKENS') {
          tokens.push.apply(tokens, value);
        } else {
          if (!(value = value.replace(HEREGEX_OMIT, ''))) continue;
          value = value.replace(/\\/g, '\\\\');
          tokens.push(['STRING', this.makeString(value, '"', true)]);
        }
        tokens.push(['+', '+']);
      }
      tokens.pop();
      if (((_ref5 = tokens[0]) != null ? _ref5[0] : void 0) !== 'STRING') {
        this.tokens.push(['STRING', '""'], ['+', '+']);
      }
      (_ref6 = this.tokens).push.apply(_ref6, tokens);
      if (flags) this.tokens.push([',', ','], ['STRING', '"' + flags + '"']);
      this.token(')', ')');
      return heregex.length;
    };

    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, prev, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) return 0;
      indent = match[0];
      this.line += count(indent, '\n');
      this.seenFor = false;
      prev = last(this.tokens, 1);
      size = indent.length - 1 - indent.lastIndexOf('\n');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken();
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.token('INDENT', diff);
        this.indents.push(diff);
        this.ends.push('OUTDENT');
        this.outdebt = this.indebt = 0;
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines);
      }
      this.indent = size;
      return indent.length;
    };

    Lexer.prototype.outdentToken = function(moveOut, noNewlines) {
      var dent, len;
      while (moveOut > 0) {
        len = this.indents.length - 1;
        if (this.indents[len] === void 0) {
          moveOut = 0;
        } else if (this.indents[len] === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (this.indents[len] < this.outdebt) {
          this.outdebt -= this.indents[len];
          moveOut -= this.indents[len];
        } else {
          dent = this.indents.pop() - this.outdebt;
          moveOut -= dent;
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', dent);
        }
      }
      if (dent) this.outdebt -= moveOut;
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', '\n');
      }
      return this;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) prev[match ? 'spaced' : 'newLine'] = true;
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };

    Lexer.prototype.newlineToken = function() {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') this.token('TERMINATOR', '\n');
      return this;
    };

    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') this.tokens.pop();
      return this;
    };

    Lexer.prototype.literalToken = function() {
      var match, prev, tag, value, _ref3, _ref4, _ref5, _ref6;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) this.tagParameters();
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref3 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref3) >= 0)) {
          this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref4 = prev[1]) === '||' || _ref4 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        this.seenFor = false;
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref5 = prev[0], __indexOf.call(CALLABLE, _ref5) >= 0)) {
          if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
          tag = 'CALL_START';
        } else if (value === '[' && (_ref6 = prev[0], __indexOf.call(INDEXABLE, _ref6) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push(INVERSES[value]);
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.token(tag, value);
      return value.length;
    };

    Lexer.prototype.sanitizeHeredoc = function(doc, options) {
      var attempt, herecomment, indent, match, _ref3;
      indent = options.indent, herecomment = options.herecomment;
      if (herecomment) {
        if (HEREDOC_ILLEGAL.test(doc)) {
          this.error("block comment cannot contain \"*/\", starting");
        }
        if (doc.indexOf('\n') <= 0) return doc;
      } else {
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref3 = attempt.length) && _ref3 < indent.length)) {
            indent = attempt;
          }
        }
      }
      if (indent) doc = doc.replace(RegExp("\\n" + indent, "g"), '\n');
      if (!herecomment) doc = doc.replace(/^\n/, '');
      return doc;
    };

    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') return this;
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };

    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };

    Lexer.prototype.balancedString = function(str, end) {
      var continueCount, i, letter, match, prev, stack, _ref3;
      continueCount = 0;
      stack = [end];
      for (i = 1, _ref3 = str.length; 1 <= _ref3 ? i < _ref3 : i > _ref3; 1 <= _ref3 ? i++ : i--) {
        if (continueCount) {
          --continueCount;
          continue;
        }
        switch (letter = str.charAt(i)) {
          case '\\':
            ++continueCount;
            continue;
          case end:
            stack.pop();
            if (!stack.length) return str.slice(0, i + 1 || 9e9);
            end = stack[stack.length - 1];
            continue;
        }
        if (end === '}' && (letter === '"' || letter === "'")) {
          stack.push(end = letter);
        } else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
          continueCount += match[0].length - 1;
        } else if (end === '}' && letter === '{') {
          stack.push(end = '}');
        } else if (end === '"' && prev === '#' && letter === '{') {
          stack.push(end = '}');
        }
        prev = letter;
      }
      return this.error("missing " + (stack.pop()) + ", starting");
    };

    Lexer.prototype.interpolateString = function(str, options) {
      var expr, heredoc, i, inner, interpolated, len, letter, nested, pi, regex, tag, tokens, value, _len, _ref3, _ref4, _ref5;
      if (options == null) options = {};
      heredoc = options.heredoc, regex = options.regex;
      tokens = [];
      pi = 0;
      i = -1;
      while (letter = str.charAt(i += 1)) {
        if (letter === '\\') {
          i += 1;
          continue;
        }
        if (!(letter === '#' && str.charAt(i + 1) === '{' && (expr = this.balancedString(str.slice(i + 1), '}')))) {
          continue;
        }
        if (pi < i) tokens.push(['NEOSTRING', str.slice(pi, i)]);
        inner = expr.slice(1, -1);
        if (inner.length) {
          nested = new Lexer().tokenize(inner, {
            line: this.line,
            rewrite: false
          });
          nested.pop();
          if (((_ref3 = nested[0]) != null ? _ref3[0] : void 0) === 'TERMINATOR') {
            nested.shift();
          }
          if (len = nested.length) {
            if (len > 1) {
              nested.unshift(['(', '(', this.line]);
              nested.push([')', ')', this.line]);
            }
            tokens.push(['TOKENS', nested]);
          }
        }
        i += expr.length;
        pi = i + 1;
      }
      if ((i > pi && pi < str.length)) tokens.push(['NEOSTRING', str.slice(pi)]);
      if (regex) return tokens;
      if (!tokens.length) return this.token('STRING', '""');
      if (tokens[0][0] !== 'NEOSTRING') tokens.unshift(['', '']);
      if (interpolated = tokens.length > 1) this.token('(', '(');
      for (i = 0, _len = tokens.length; i < _len; i++) {
        _ref4 = tokens[i], tag = _ref4[0], value = _ref4[1];
        if (i) this.token('+', '+');
        if (tag === 'TOKENS') {
          (_ref5 = this.tokens).push.apply(_ref5, value);
        } else {
          this.token('STRING', this.makeString(value, '"', heredoc));
        }
      }
      if (interpolated) this.token(')', ')');
      return tokens;
    };

    Lexer.prototype.pair = function(tag) {
      var size, wanted;
      if (tag !== (wanted = last(this.ends))) {
        if ('OUTDENT' !== wanted) this.error("unmatched " + tag);
        this.indent -= size = last(this.indents);
        this.outdentToken(size, true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };

    Lexer.prototype.token = function(tag, value) {
      return this.tokens.push([tag, value, this.line]);
    };

    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };

    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };

    Lexer.prototype.unfinished = function() {
      var _ref3;
      return LINE_CONTINUER.test(this.chunk) || ((_ref3 = this.tag()) === '\\' || _ref3 === '.' || _ref3 === '?.' || _ref3 === 'UNARY' || _ref3 === 'MATH' || _ref3 === '+' || _ref3 === '-' || _ref3 === 'SHIFT' || _ref3 === 'RELATION' || _ref3 === 'COMPARE' || _ref3 === 'LOGIC' || _ref3 === 'THROW' || _ref3 === 'EXTENDS');
    };

    Lexer.prototype.escapeLines = function(str, heredoc) {
      return str.replace(MULTILINER, heredoc ? '\\n' : '');
    };

    Lexer.prototype.makeString = function(body, quote, heredoc) {
      if (!body) return quote + quote;
      body = body.replace(/\\([\s\S])/g, function(match, contents) {
        if (contents === '\n' || contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      return quote + this.escapeLines(body, heredoc) + quote;
    };

    Lexer.prototype.error = function(message) {
      throw SyntaxError("" + message + " on line " + (this.line + 1));
    };

    return Lexer;

  })();

  JS_KEYWORDS = ['attribute', 'const', 'uniform', 'varying', 'centroid', 'break', 'continue', 'do', 'for', 'while', 'if', 'else', 'in', 'out', 'inout', 'float', 'int', 'void', 'bool', 'true', 'false', 'invariant', 'discard', 'return', 'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'bvec2', 'bvec3', 'bvec4', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow', 'sampler2DShadow', 'struct', 'asm', 'class', 'union', 'enum', 'typedef', 'template', 'this', 'packed', 'goto', 'switch', 'default', 'inline', 'noinline', 'volatile', 'public', 'static', 'extern', 'external', 'interface', 'long', 'short', 'double', 'half', 'fixed', 'unsigned', 'lowp', 'mediump', 'highp', 'precision', 'input', 'output', 'hvec2', 'hvec3', 'hvec4', 'dvec2', 'dvec3', 'dvec4', 'fvec2', 'fvec3', 'fvec4', 'sampler2DRect', 'sampler3DRect', 'sampler2DRectShadow', 'sizeof', 'cast', 'namespace', 'using', 'true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];

  COFFEE_KEYWORDS = ['undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };

  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();

  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

  RESERVED = ['case', 'default', 'function', 'var', 'with', 'const', 'let', 'enum', 'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind', '__indexOf', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield'];

  STRICT_PROSCRIBED = ['arguments', 'eval'];

  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);

  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;

  IDENTIFIER = /^([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([^\n\S]*:(?!:))?/;

  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

  HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;

  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3})/;

  WHITESPACE = /^[^\n\S]+/;

  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/;

  CODE = /^[-=]>/;

  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

  SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;

  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

  REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;

  HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;

  HEREGEX_OMIT = /\s+(?:#.*)?/g;

  MULTILINER = /\n/g;

  HEREDOC_INDENT = /\n+([^\n\S]*)/g;

  HEREDOC_ILLEGAL = /\*\//;

  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

  TRAILING_SPACES = /\s+$/;

  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='];

  UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE', 'DO'];

  LOGIC = ['&&', '||', '&', '|', '^'];

  SHIFT = ['<<', '>>', '>>>'];

  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

  MATH = ['*', '/', '%'];

  RELATION = ['IN', 'OF', 'INSTANCEOF'];

  BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'];

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL');

  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

}).call(this);

      return exports;
    };
    _require["shader-script/name_registry"] = function() {
      var exports = {};
      (function() {
  var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  exports.NameRegistry = (function() {
    var mangle;

    mangle = function(name, entries) {
      var counter, mangled_name;
      counter = 0;
      mangled_name = name;
      while (__indexOf.call(entries, mangled_name) >= 0) {
        mangled_name = name + counter++;
      }
      return mangled_name;
    };

    function NameRegistry() {
      this.entries = {};
    }

    NameRegistry.prototype.entries_for = function(name) {
      var _base;
      return (_base = this.entries)[name] || (_base[name] = []);
    };

    NameRegistry.prototype.define = function(name) {
      var entries;
      entries = this.entries_for(name);
      entries.push(mangle(name, entries));
      return entries[entries.length - 1];
    };

    return NameRegistry;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/nodes"] = function() {
      var exports = {};
      (function() {
  var node_file, node_name, nodes;

  nodes = {
    Root: 'root',
    Block: 'block',
    Literal: 'literal',
    Value: 'value',
    Call: 'call',
    Identifier: 'identifier',
    Assign: 'assign',
    Function: 'function',
    Code: 'function',
    Arr: 'arr',
    Param: 'param',
    Return: 'return',
    Op: 'op'
  };

  for (node_name in nodes) {
    node_file = nodes[node_name];
    exports[node_name] = require("shader-script/nodes/" + node_file)[node_name];
  }

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/arr"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Arr = (function(_super) {

    __extends(Arr, _super);

    function Arr() {
      Arr.__super__.constructor.apply(this, arguments);
    }

    Arr.prototype.name = "arr";

    Arr.prototype.children = function() {
      return ['elements'];
    };

    Arr.prototype.type = function() {
      return 'vec' + this.elements.length.toString();
    };

    Arr.prototype.compile = function(shader) {
      var child;
      return this.glsl('TypeConstructor', this.type(), (function() {
        var _i, _len, _ref, _results;
        _ref = this.elements;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.compile(shader));
        }
        return _results;
      }).call(this));
    };

    return Arr;

  })(require("shader-script/nodes/base").Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/assign"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.name = "assign";

    Assign.prototype.type = function(shader) {
      return this.right.type(shader);
    };

    Assign.prototype.compile = function(shader) {
      var Function, dependent, left, right;
      Function = require('shader-script/nodes').Function;
      if (this.right instanceof Function) {
        this.right.func_name = this.left;
        return this.right.compile(shader);
      } else {
        left = this.left.compile(shader);
        right = this.right.compile(shader);
        if (!left.toVariableName) {
          throw new Error("Can't use " + (JSON.stringify(left)) + " as lvalue");
        }
        if (this.right.variable) dependent = this.right.variable(shader);
        shader.scope.define(left.toVariableName(), {
          type: this.right.type(shader),
          dependent: dependent
        });
        return this.glsl('Assign', left, right);
      }
    };

    return Assign;

  })(require("shader-script/glsl/nodes/assign").Assign);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/base"] = function() {
      var exports = {};
      (function() {
  var Base,
    __slice = Array.prototype.slice;

  exports.Base = Base = (function() {
    var glsl_nodes, required_methods;

    glsl_nodes = null;

    required_methods = ['name', 'compile'];

    Base.prototype.glsl = function() {
      var args, node_name;
      node_name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      glsl_nodes || (glsl_nodes = require('shader-script/glsl/nodes'));
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(glsl_nodes[node_name], args, function() {});
    };

    function Base() {
      var child, child_names, children, method_name, name, _i, _j, _len, _len2;
      children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = required_methods.length; _i < _len; _i++) {
        method_name = required_methods[_i];
        if (!this[method_name]) {
          throw new Error("Method '" + method_name + "' is not defined in " + this);
        }
      }
      this.name = this.name;
      if (this.children) child_names = this.children();
      for (_j = 0, _len2 = children.length; _j < _len2; _j++) {
        child = children[_j];
        if (!child_names || child_names.length === 0) break;
        name = child_names.shift();
        this[name] = child;
      }
      this.children = children;
    }

    return Base;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/block"] = function() {
      var exports = {};
      (function() {
  var Block,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Block = Block = (function(_super) {

    __extends(Block, _super);

    Block.prototype.name = "block";

    function Block(lines) {
      if (lines == null) lines = [];
      Block.__super__.constructor.call(this, lines);
    }

    Block.prototype.compile = function(shader) {
      var compiled_lines, definition, line, name, _ref;
      shader.scope.push(this.name);
      compiled_lines = (function() {
        var _i, _len, _ref, _results;
        _ref = this.lines;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          line = _ref[_i];
          _results.push(line.compile(shader));
        }
        return _results;
      }).call(this);
      _ref = shader.scope.delegate(function() {
        return this.definitions;
      });
      for (name in _ref) {
        definition = _ref[name];
        if (definition.builtin) continue;
        compiled_lines.unshift(this.glsl('Variable', definition));
      }
      shader.scope.pop();
      return this.glsl('Block', compiled_lines);
    };

    Block.wrap = function(lines) {
      if (lines.length === 1 && lines[0] instanceof Block) return lines[0];
      return new exports.Block(lines);
    };

    return Block;

  })(require('shader-script/glsl/nodes/block').Block);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/call"] = function() {
      var exports = {};
      (function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/scope').Definition;

  exports.Call = (function(_super) {

    __extends(Call, _super);

    function Call() {
      Call.__super__.constructor.apply(this, arguments);
    }

    Call.prototype.name = "call";

    Call.prototype.children = function() {
      return ['method_name', 'params'];
    };

    Call.prototype.variable = function(shader) {
      return this._variable || (this._variable = new Definition);
    };

    Call.prototype.type = function(shader) {
      return this.variable(shader).type();
    };

    Call.prototype.compile = function(shader) {
      var arg, args, compiled_params, method_name, param, variable, _i, _len, _ref;
      method_name = this.method_name.compile(shader);
      compiled_params = [];
      args = [];
      _ref = this.params;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        arg = param.compile(shader);
        compiled_params.push(arg);
        variable = param.variable(shader);
        if (variable) {
          args.push(variable);
        } else {
          args.push(param.type());
        }
      }
      shader.mark_function(this.method_name.toVariableName(), args, this.variable(shader));
      return this.glsl('Call', method_name, compiled_params);
    };

    return Call;

  })(require("shader-script/nodes/base").Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/function"] = function() {
      var exports = {};
      (function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/scope').Definition;

  exports.Code = exports.Function = (function(_super) {

    __extends(Function, _super);

    function Function() {
      Function.__super__.constructor.apply(this, arguments);
    }

    Function.prototype.name = 'function';

    Function.prototype.children = function() {
      return ['params', 'body'];
    };

    Function.prototype.variable = function(shader) {
      return this._variable || (this._variable = new Definition);
    };

    Function.prototype.type = function(shader) {
      return this.variable(shader).type() || 'void';
    };

    Function.prototype.compile = function(shader) {
      var compiled_body, compiled_func_name, compiled_params, function_scope, glsl, param, return_variable, str_func_name,
        _this = this;
      if (!this.func_name) {
        throw new Error("GLSL doesn't support anonymous functions");
      }
      return_variable = this.variable(shader);
      compiled_func_name = this.func_name.compile(shader);
      str_func_name = this.func_name.toVariableName();
      shader.current_function = {
        name: str_func_name,
        return_variable: return_variable
      };
      function_scope = shader.scope.push(str_func_name);
      compiled_params = (function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.compile(shader));
        }
        return _results;
      }).call(this);
      compiled_body = this.body.compile(shader);
      return_variable = this.variable(shader);
      shader.define_function(str_func_name, return_variable, function(args) {
        var arg, i, variable, _ref, _results;
        if (args.length !== compiled_params.length) {
          throw new Error("Function " + str_func_name + " called with incorrect argument count (" + args.length + " for " + compiled_params.length + ")");
        }
        _results = [];
        for (i = 0, _ref = args.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          arg = args[i];
          variable = compiled_params[i].variable;
          if (arg.type) {
            _results.push(variable.dependents.push(arg));
          } else {
            _results.push(variable.set_type(arg));
          }
        }
        return _results;
      });
      shader.scope.pop();
      delete shader.current_function;
      glsl = this.glsl('Function', 'void', compiled_func_name, compiled_params, compiled_body);
      glsl.type = function() {
        return _this.type(shader);
      };
      return glsl;
    };

    return Function;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/identifier"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "identifier";

    Identifier.prototype.variable = function(shader) {
      return shader.scope.lookup(this.toVariableName());
    };

    Identifier.prototype.type = function(shader) {
      return this.variable(shader).type();
    };

    Identifier.prototype.compile = function(shader) {
      return this.glsl.apply(this, ['Identifier'].concat(__slice.call(this.children)));
    };

    return Identifier;

  })(require("shader-script/glsl/nodes/identifier").Identifier);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/literal"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal() {
      Literal.__super__.constructor.apply(this, arguments);
    }

    Literal.prototype.name = "literal";

    Literal.prototype.compile = function() {
      return this.glsl.apply(this, ['Literal'].concat(__slice.call(this.children)));
    };

    return Literal;

  })(require("shader-script/glsl/nodes/literal").Literal);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/op"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Op = (function(_super) {

    __extends(Op, _super);

    function Op() {
      Op.__super__.constructor.apply(this, arguments);
    }

    Op.prototype.name = "op";

    Op.prototype.children = function() {
      return ['op', 'left', 'right'];
    };

    Op.prototype.type = function(shader) {
      return this.left.type(shader) || this.right && this.right.type(shader);
    };

    Op.prototype.variable = function(shader) {
      return this.left.variable(shader) || this.right && this.right.variable(shader);
    };

    Op.prototype.compile = function(shader) {
      var left, op, right;
      left = this.left.compile(shader);
      op = this.op;
      right = this.right && this.right.compile(shader);
      return this.glsl('Op', op, left, right);
    };

    return Op;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/param"] = function() {
      var exports = {};
      (function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/scope').Definition;

  exports.Param = (function(_super) {

    __extends(Param, _super);

    function Param() {
      Param.__super__.constructor.apply(this, arguments);
    }

    Param.prototype.name = 'param';

    Param.prototype.children = function() {
      return ['name', 'default_value'];
    };

    Param.prototype.toVariableName = function() {
      return this.name.toVariableName();
    };

    Param.prototype.variable = function() {
      return this._variable || (this._variable = new Definition);
    };

    Param.prototype.set_type = function(type) {
      return this.variable().set_type(type);
    };

    Param.prototype.type = function() {
      return this.variable().type();
    };

    Param.prototype.compile = function(shader) {
      var result, variable, varn;
      varn = this.toVariableName();
      variable = shader.scope.define(varn, {
        dependent: this.variable()
      });
      result = this.glsl('Variable', variable);
      result.variable = variable;
      return result;
    };

    return Param;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/return"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Return = (function(_super) {

    __extends(Return, _super);

    function Return() {
      Return.__super__.constructor.apply(this, arguments);
    }

    Return.prototype.name = 'return';

    Return.prototype.children = function() {
      return ['expression'];
    };

    Return.prototype.type = function(shader) {
      if (this.expression) {
        return this.expression.type(shader);
      } else {
        return "void";
      }
    };

    Return.prototype.compile = function(shader) {
      if (!shader.current_function) throw "Can't return outside of any function";
      shader.current_function.return_variable.set_type(this.type(shader));
      return this.glsl('Return', this.expression.compile(shader));
    };

    return Return;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/root"] = function() {
      var exports = {};
      (function() {
  var Shader,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Shader = require('shader-script/shader').Shader;

  exports.Root = (function(_super) {

    __extends(Root, _super);

    Root.prototype.name = "root";

    function Root(block) {
      this.block = block;
      Root.__super__.constructor.call(this, this.block);
    }

    Root.prototype.compile = function(state) {
      var program, root_node, shader;
      if (state == null) state = {};
      shader = new Shader(state);
      root_node = this.glsl('Root', this.block.compile(shader));
      program = root_node.compile(state);
      return {
        vertex: program.toVertexProgram(),
        fragment: program.toFragmentProgram()
      };
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/value"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Value = (function(_super) {

    __extends(Value, _super);

    function Value() {
      Value.__super__.constructor.apply(this, arguments);
    }

    Value.prototype.name = "value";

    Value.prototype.compile = function(shader) {
      return this.glsl('Value', this.children[0].compile(shader));
    };

    Value.prototype.toVariableName = function() {
      return this.children[0].toVariableName();
    };

    Value.prototype.variable = function(shader) {
      return this.children[0].variable && this.children[0].variable(shader);
    };

    return Value;

  })(require("shader-script/glsl/nodes/value").Value);

}).call(this);

      return exports;
    };
    _require["shader-script/parser"] = function() {
      var exports = {};
      /* Jison generated parser */

var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"Return":10,"Comment":11,"STATEMENT":12,"Value":13,"Invocation":14,"Code":15,"Operation":16,"Assign":17,"If":18,"Try":19,"While":20,"For":21,"Switch":22,"Class":23,"Throw":24,"INDENT":25,"OUTDENT":26,"Identifier":27,"IDENTIFIER":28,"AlphaNumeric":29,"NUMBER":30,"STRING":31,"Literal":32,"JS":33,"REGEX":34,"DEBUGGER":35,"BOOL":36,"Assignable":37,"=":38,"AssignObj":39,"ObjAssignable":40,":":41,"ThisProperty":42,"RETURN":43,"HERECOMMENT":44,"PARAM_START":45,"ParamList":46,"PARAM_END":47,"FuncGlyph":48,"->":49,"=>":50,"OptComma":51,",":52,"Param":53,"ParamVar":54,"...":55,"GlslType":56,"Array":57,"Object":58,"Splat":59,"SimpleAssignable":60,"Accessor":61,"Parenthetical":62,"Range":63,"This":64,".":65,"?.":66,"::":67,"Index":68,"INDEX_START":69,"IndexValue":70,"INDEX_END":71,"INDEX_SOAK":72,"Slice":73,"{":74,"AssignList":75,"}":76,"CLASS":77,"EXTENDS":78,"OptFuncExist":79,"Arguments":80,"SUPER":81,"FUNC_EXIST":82,"CALL_START":83,"CALL_END":84,"ArgList":85,"THIS":86,"@":87,"[":88,"]":89,"RangeDots":90,"..":91,"Arg":92,"SimpleArgs":93,"TRY":94,"Catch":95,"FINALLY":96,"CATCH":97,"THROW":98,"(":99,")":100,"WhileSource":101,"WHILE":102,"WHEN":103,"UNTIL":104,"Loop":105,"LOOP":106,"ForBody":107,"FOR":108,"ForStart":109,"ForSource":110,"ForVariables":111,"OWN":112,"ForValue":113,"FORIN":114,"FOROF":115,"BY":116,"SWITCH":117,"Whens":118,"ELSE":119,"When":120,"LEADING_WHEN":121,"IfBlock":122,"IF":123,"POST_IF":124,"UNARY":125,"-":126,"+":127,"--":128,"++":129,"?":130,"MATH":131,"SHIFT":132,"COMPARE":133,"LOGIC":134,"RELATION":135,"COMPOUND_ASSIGN":136,"VOID":137,"INT":138,"FLOAT":139,"VEC2":140,"VEC3":141,"VEC4":142,"BVEC2":143,"BVEC3":144,"BVEC4":145,"IVEC2":146,"IVEC3":147,"IVEC4":148,"MAT2":149,"MAT3":150,"MAT4":151,"MAT2X2":152,"MAT2X3":153,"MAT2X4":154,"MAT3X2":155,"MAT3X3":156,"MAT3X4":157,"MAT4X2":158,"MAT4X3":159,"MAT4X4":160,"SAMPLER1D":161,"SAMPLER2D":162,"SAMPLER3D":163,"SAMPLERCUBE":164,"SAMPLER1DSHADOW":165,"SAMPLER2DSHADOW":166,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",12:"STATEMENT",25:"INDENT",26:"OUTDENT",28:"IDENTIFIER",30:"NUMBER",31:"STRING",33:"JS",34:"REGEX",35:"DEBUGGER",36:"BOOL",38:"=",41:":",43:"RETURN",44:"HERECOMMENT",45:"PARAM_START",47:"PARAM_END",49:"->",50:"=>",52:",",55:"...",65:".",66:"?.",67:"::",69:"INDEX_START",71:"INDEX_END",72:"INDEX_SOAK",74:"{",76:"}",77:"CLASS",78:"EXTENDS",81:"SUPER",82:"FUNC_EXIST",83:"CALL_START",84:"CALL_END",86:"THIS",87:"@",88:"[",89:"]",91:"..",94:"TRY",96:"FINALLY",97:"CATCH",98:"THROW",99:"(",100:")",102:"WHILE",103:"WHEN",104:"UNTIL",106:"LOOP",108:"FOR",112:"OWN",114:"FORIN",115:"FOROF",116:"BY",117:"SWITCH",119:"ELSE",121:"LEADING_WHEN",123:"IF",124:"POST_IF",125:"UNARY",126:"-",127:"+",128:"--",129:"++",130:"?",131:"MATH",132:"SHIFT",133:"COMPARE",134:"LOGIC",135:"RELATION",136:"COMPOUND_ASSIGN",137:"VOID",138:"INT",139:"FLOAT",140:"VEC2",141:"VEC3",142:"VEC4",143:"BVEC2",144:"BVEC3",145:"BVEC4",146:"IVEC2",147:"IVEC3",148:"IVEC4",149:"MAT2",150:"MAT3",151:"MAT4",152:"MAT2X2",153:"MAT2X3",154:"MAT2X4",155:"MAT3X2",156:"MAT3X3",157:"MAT3X4",158:"MAT4X2",159:"MAT4X3",160:"MAT4X4",161:"SAMPLER1D",162:"SAMPLER2D",163:"SAMPLER3D",164:"SAMPLERCUBE",165:"SAMPLER1DSHADOW",166:"SAMPLER2DSHADOW"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[9,1],[9,1],[9,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[5,2],[5,3],[27,1],[29,1],[29,1],[32,1],[32,1],[32,1],[32,1],[32,1],[17,3],[17,4],[17,5],[39,1],[39,3],[39,5],[39,1],[40,1],[40,1],[40,1],[10,2],[10,1],[11,1],[15,5],[15,2],[48,1],[48,1],[51,0],[51,1],[46,0],[46,1],[46,3],[53,1],[53,2],[53,3],[53,2],[54,1],[54,1],[54,1],[54,1],[59,2],[60,1],[60,2],[60,2],[60,1],[37,1],[37,1],[37,1],[13,1],[13,1],[13,1],[13,1],[13,1],[61,2],[61,2],[61,2],[61,1],[61,1],[68,3],[68,2],[70,1],[70,1],[58,4],[75,0],[75,1],[75,3],[75,4],[75,6],[23,1],[23,2],[23,3],[23,4],[23,2],[23,3],[23,4],[23,5],[14,3],[14,3],[14,1],[14,2],[79,0],[79,1],[80,2],[80,4],[64,1],[64,1],[42,2],[57,2],[57,4],[90,1],[90,1],[63,5],[73,3],[73,2],[73,2],[73,1],[85,1],[85,3],[85,4],[85,4],[85,6],[92,1],[92,1],[93,1],[93,3],[19,2],[19,3],[19,4],[19,5],[95,3],[24,2],[62,3],[62,5],[101,2],[101,4],[101,2],[101,4],[20,2],[20,2],[20,2],[20,1],[105,2],[105,2],[21,2],[21,2],[21,2],[107,2],[107,2],[109,2],[109,3],[113,1],[113,1],[113,1],[111,1],[111,3],[110,2],[110,2],[110,4],[110,4],[110,4],[110,6],[110,6],[22,5],[22,7],[22,4],[22,6],[118,1],[118,2],[120,3],[120,4],[122,3],[122,5],[18,1],[18,3],[18,3],[18,3],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,5],[16,3],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1],[56,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Root(new yy.Block);
break;
case 2:return this.$ = new yy.Root($$[$0]);
break;
case 3:return this.$ = new yy.Root($$[$0-1]);
break;
case 4:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:this.$ = $$[$0-2].push($$[$0]);
break;
case 6:this.$ = $$[$0-1];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = $$[$0];
break;
case 9:this.$ = $$[$0];
break;
case 10:this.$ = $$[$0];
break;
case 11:this.$ = new yy.Literal($$[$0]);
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = $$[$0];
break;
case 20:this.$ = $$[$0];
break;
case 21:this.$ = $$[$0];
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = $$[$0];
break;
case 24:this.$ = new yy.Block;
break;
case 25:this.$ = $$[$0-1];
break;
case 26:this.$ = new yy.Identifier($$[$0]);
break;
case 27:this.$ = new yy.Literal($$[$0]);
break;
case 28:this.$ = new yy.Literal($$[$0]);
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = new yy.Literal($$[$0]);
break;
case 31:this.$ = new yy.Literal($$[$0]);
break;
case 32:this.$ = new yy.Literal($$[$0]);
break;
case 33:this.$ = (function () {
        var val;
        val = new yy.Literal($$[$0]);
        if ($$[$0] === 'undefined') val.isUndefined = true;
        return val;
      }());
break;
case 34:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 35:this.$ = new yy.Assign($$[$0-3], $$[$0]);
break;
case 36:this.$ = new yy.Assign($$[$0-4], $$[$0-1]);
break;
case 37:this.$ = new yy.Value($$[$0]);
break;
case 38:this.$ = new yy.Assign(new yy.Value($$[$0-2]), $$[$0], 'object');
break;
case 39:this.$ = new yy.Assign(new yy.Value($$[$0-4]), $$[$0-1], 'object');
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = new yy.Return($$[$0]);
break;
case 45:this.$ = new yy.Return;
break;
case 46:this.$ = new yy.Comment($$[$0]);
break;
case 47:this.$ = new yy.Code($$[$0-3], $$[$0], $$[$0-1]);
break;
case 48:this.$ = new yy.Code([], $$[$0], $$[$0-1]);
break;
case 49:this.$ = 'func';
break;
case 50:this.$ = 'boundfunc';
break;
case 51:this.$ = $$[$0];
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = [];
break;
case 54:this.$ = [$$[$0]];
break;
case 55:this.$ = $$[$0-2].concat($$[$0]);
break;
case 56:this.$ = new yy.Param($$[$0]);
break;
case 57:this.$ = new yy.Param($$[$0-1], null, true);
break;
case 58:this.$ = new yy.Param($$[$0-2], $$[$0]);
break;
case 59:this.$ = (function () {
        $$[$0].set_type($$[$0-1]);
        return $$[$0];
      }());
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = new yy.Splat($$[$0-1]);
break;
case 65:this.$ = new yy.Value($$[$0]);
break;
case 66:this.$ = $$[$0-1].add($$[$0]);
break;
case 67:this.$ = new yy.Value($$[$0-1], [].concat($$[$0]));
break;
case 68:this.$ = $$[$0];
break;
case 69:this.$ = $$[$0];
break;
case 70:this.$ = new yy.Value($$[$0]);
break;
case 71:this.$ = new yy.Value($$[$0]);
break;
case 72:this.$ = $$[$0];
break;
case 73:this.$ = new yy.Value($$[$0]);
break;
case 74:this.$ = new yy.Value($$[$0]);
break;
case 75:this.$ = new yy.Value($$[$0]);
break;
case 76:this.$ = $$[$0];
break;
case 77:this.$ = new yy.Access($$[$0]);
break;
case 78:this.$ = new yy.Access($$[$0], 'soak');
break;
case 79:this.$ = [new yy.Access(new yy.Literal('prototype')), new yy.Access($$[$0])];
break;
case 80:this.$ = new yy.Access(new yy.Literal('prototype'));
break;
case 81:this.$ = $$[$0];
break;
case 82:this.$ = $$[$0-1];
break;
case 83:this.$ = yy.extend($$[$0], {
          soak: true
        });
break;
case 84:this.$ = new yy.Index($$[$0]);
break;
case 85:this.$ = new yy.Slice($$[$0]);
break;
case 86:this.$ = new yy.Obj($$[$0-2], $$[$0-3].generated);
break;
case 87:this.$ = [];
break;
case 88:this.$ = [$$[$0]];
break;
case 89:this.$ = $$[$0-2].concat($$[$0]);
break;
case 90:this.$ = $$[$0-3].concat($$[$0]);
break;
case 91:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 92:this.$ = new yy.Class;
break;
case 93:this.$ = new yy.Class(null, null, $$[$0]);
break;
case 94:this.$ = new yy.Class(null, $$[$0]);
break;
case 95:this.$ = new yy.Class(null, $$[$0-1], $$[$0]);
break;
case 96:this.$ = new yy.Class($$[$0]);
break;
case 97:this.$ = new yy.Class($$[$0-1], null, $$[$0]);
break;
case 98:this.$ = new yy.Class($$[$0-2], $$[$0]);
break;
case 99:this.$ = new yy.Class($$[$0-3], $$[$0-1], $$[$0]);
break;
case 100:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 101:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 102:this.$ = new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]);
break;
case 103:this.$ = new yy.Call('super', $$[$0]);
break;
case 104:this.$ = false;
break;
case 105:this.$ = true;
break;
case 106:this.$ = [];
break;
case 107:this.$ = $$[$0-2];
break;
case 108:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 109:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 110:this.$ = new yy.Value(new yy.Literal('this'), [new yy.Access($$[$0])], 'this');
break;
case 111:this.$ = new yy.Arr([]);
break;
case 112:this.$ = new yy.Arr($$[$0-2]);
break;
case 113:this.$ = 'inclusive';
break;
case 114:this.$ = 'exclusive';
break;
case 115:this.$ = new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]);
break;
case 116:this.$ = new yy.Range($$[$0-2], $$[$0], $$[$0-1]);
break;
case 117:this.$ = new yy.Range($$[$0-1], null, $$[$0]);
break;
case 118:this.$ = new yy.Range(null, $$[$0], $$[$0-1]);
break;
case 119:this.$ = new yy.Range(null, null, $$[$0]);
break;
case 120:this.$ = [$$[$0]];
break;
case 121:this.$ = $$[$0-2].concat($$[$0]);
break;
case 122:this.$ = $$[$0-3].concat($$[$0]);
break;
case 123:this.$ = $$[$0-2];
break;
case 124:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 125:this.$ = $$[$0];
break;
case 126:this.$ = $$[$0];
break;
case 127:this.$ = $$[$0];
break;
case 128:this.$ = [].concat($$[$0-2], $$[$0]);
break;
case 129:this.$ = new yy.Try($$[$0]);
break;
case 130:this.$ = new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]);
break;
case 131:this.$ = new yy.Try($$[$0-2], null, null, $$[$0]);
break;
case 132:this.$ = new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]);
break;
case 133:this.$ = [$$[$0-1], $$[$0]];
break;
case 134:this.$ = new yy.Throw($$[$0]);
break;
case 135:this.$ = new yy.Parens($$[$0-1]);
break;
case 136:this.$ = new yy.Parens($$[$0-2]);
break;
case 137:this.$ = new yy.While($$[$0]);
break;
case 138:this.$ = new yy.While($$[$0-2], {
          guard: $$[$0]
        });
break;
case 139:this.$ = new yy.While($$[$0], {
          invert: true
        });
break;
case 140:this.$ = new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        });
break;
case 141:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 142:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 143:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 144:this.$ = $$[$0];
break;
case 145:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 146:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 147:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 148:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 149:this.$ = new yy.For($$[$0], $$[$0-1]);
break;
case 150:this.$ = {
          source: new yy.Value($$[$0])
        };
break;
case 151:this.$ = (function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }());
break;
case 152:this.$ = $$[$0];
break;
case 153:this.$ = (function () {
        $$[$0].own = true;
        return $$[$0];
      }());
break;
case 154:this.$ = $$[$0];
break;
case 155:this.$ = new yy.Value($$[$0]);
break;
case 156:this.$ = new yy.Value($$[$0]);
break;
case 157:this.$ = [$$[$0]];
break;
case 158:this.$ = [$$[$0-2], $$[$0]];
break;
case 159:this.$ = {
          source: $$[$0]
        };
break;
case 160:this.$ = {
          source: $$[$0],
          object: true
        };
break;
case 161:this.$ = {
          source: $$[$0-2],
          guard: $$[$0]
        };
break;
case 162:this.$ = {
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        };
break;
case 163:this.$ = {
          source: $$[$0-2],
          step: $$[$0]
        };
break;
case 164:this.$ = {
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        };
break;
case 165:this.$ = {
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        };
break;
case 166:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 167:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 168:this.$ = new yy.Switch(null, $$[$0-1]);
break;
case 169:this.$ = new yy.Switch(null, $$[$0-3], $$[$0-1]);
break;
case 170:this.$ = $$[$0];
break;
case 171:this.$ = $$[$0-1].concat($$[$0]);
break;
case 172:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 173:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 174:this.$ = new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        });
break;
case 175:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 176:this.$ = $$[$0];
break;
case 177:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 178:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 179:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 180:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 181:this.$ = new yy.Op('-', $$[$0]);
break;
case 182:this.$ = new yy.Op('+', $$[$0]);
break;
case 183:this.$ = new yy.Op('--', $$[$0]);
break;
case 184:this.$ = new yy.Op('++', $$[$0]);
break;
case 185:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 186:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 187:this.$ = new yy.Existence($$[$0-1]);
break;
case 188:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 189:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 190:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 191:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 192:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 193:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 194:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 195:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 196:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 197:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
case 198:this.$ = $$[$0];
break;
case 199:this.$ = $$[$0];
break;
case 200:this.$ = $$[$0];
break;
case 201:this.$ = $$[$0];
break;
case 202:this.$ = $$[$0];
break;
case 203:this.$ = $$[$0];
break;
case 204:this.$ = $$[$0];
break;
case 205:this.$ = $$[$0];
break;
case 206:this.$ = $$[$0];
break;
case 207:this.$ = $$[$0];
break;
case 208:this.$ = $$[$0];
break;
case 209:this.$ = $$[$0];
break;
case 210:this.$ = $$[$0];
break;
case 211:this.$ = $$[$0];
break;
case 212:this.$ = $$[$0];
break;
case 213:this.$ = $$[$0];
break;
case 214:this.$ = $$[$0];
break;
case 215:this.$ = $$[$0];
break;
case 216:this.$ = $$[$0];
break;
case 217:this.$ = $$[$0];
break;
case 218:this.$ = $$[$0];
break;
case 219:this.$ = $$[$0];
break;
case 220:this.$ = $$[$0];
break;
case 221:this.$ = $$[$0];
break;
case 222:this.$ = $$[$0];
break;
case 223:this.$ = $$[$0];
break;
case 224:this.$ = $$[$0];
break;
case 225:this.$ = $$[$0];
break;
case 226:this.$ = $$[$0];
break;
case 227:this.$ = $$[$0];
break;
case 228:this.$ = $$[$0];
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,5],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[3]},{1:[2,2],6:[1,72]},{6:[1,73]},{1:[2,4],6:[2,4],26:[2,4],100:[2,4]},{4:75,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[1,74],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,7],6:[2,7],26:[2,7],100:[2,7],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,8],6:[2,8],26:[2,8],100:[2,8],101:88,102:[1,63],104:[1,64],107:89,108:[1,66],109:67,124:[1,87]},{1:[2,12],6:[2,12],25:[2,12],26:[2,12],47:[2,12],52:[2,12],55:[2,12],61:91,65:[1,93],66:[1,94],67:[1,95],68:96,69:[1,97],71:[2,12],72:[1,98],76:[2,12],79:90,82:[1,92],83:[2,104],84:[2,12],89:[2,12],91:[2,12],100:[2,12],102:[2,12],103:[2,12],104:[2,12],108:[2,12],116:[2,12],124:[2,12],126:[2,12],127:[2,12],130:[2,12],131:[2,12],132:[2,12],133:[2,12],134:[2,12],135:[2,12]},{1:[2,13],6:[2,13],25:[2,13],26:[2,13],47:[2,13],52:[2,13],55:[2,13],61:100,65:[1,93],66:[1,94],67:[1,95],68:96,69:[1,97],71:[2,13],72:[1,98],76:[2,13],79:99,82:[1,92],83:[2,104],84:[2,13],89:[2,13],91:[2,13],100:[2,13],102:[2,13],103:[2,13],104:[2,13],108:[2,13],116:[2,13],124:[2,13],126:[2,13],127:[2,13],130:[2,13],131:[2,13],132:[2,13],133:[2,13],134:[2,13],135:[2,13]},{1:[2,14],6:[2,14],25:[2,14],26:[2,14],47:[2,14],52:[2,14],55:[2,14],71:[2,14],76:[2,14],84:[2,14],89:[2,14],91:[2,14],100:[2,14],102:[2,14],103:[2,14],104:[2,14],108:[2,14],116:[2,14],124:[2,14],126:[2,14],127:[2,14],130:[2,14],131:[2,14],132:[2,14],133:[2,14],134:[2,14],135:[2,14]},{1:[2,15],6:[2,15],25:[2,15],26:[2,15],47:[2,15],52:[2,15],55:[2,15],71:[2,15],76:[2,15],84:[2,15],89:[2,15],91:[2,15],100:[2,15],102:[2,15],103:[2,15],104:[2,15],108:[2,15],116:[2,15],124:[2,15],126:[2,15],127:[2,15],130:[2,15],131:[2,15],132:[2,15],133:[2,15],134:[2,15],135:[2,15]},{1:[2,16],6:[2,16],25:[2,16],26:[2,16],47:[2,16],52:[2,16],55:[2,16],71:[2,16],76:[2,16],84:[2,16],89:[2,16],91:[2,16],100:[2,16],102:[2,16],103:[2,16],104:[2,16],108:[2,16],116:[2,16],124:[2,16],126:[2,16],127:[2,16],130:[2,16],131:[2,16],132:[2,16],133:[2,16],134:[2,16],135:[2,16]},{1:[2,17],6:[2,17],25:[2,17],26:[2,17],47:[2,17],52:[2,17],55:[2,17],71:[2,17],76:[2,17],84:[2,17],89:[2,17],91:[2,17],100:[2,17],102:[2,17],103:[2,17],104:[2,17],108:[2,17],116:[2,17],124:[2,17],126:[2,17],127:[2,17],130:[2,17],131:[2,17],132:[2,17],133:[2,17],134:[2,17],135:[2,17]},{1:[2,18],6:[2,18],25:[2,18],26:[2,18],47:[2,18],52:[2,18],55:[2,18],71:[2,18],76:[2,18],84:[2,18],89:[2,18],91:[2,18],100:[2,18],102:[2,18],103:[2,18],104:[2,18],108:[2,18],116:[2,18],124:[2,18],126:[2,18],127:[2,18],130:[2,18],131:[2,18],132:[2,18],133:[2,18],134:[2,18],135:[2,18]},{1:[2,19],6:[2,19],25:[2,19],26:[2,19],47:[2,19],52:[2,19],55:[2,19],71:[2,19],76:[2,19],84:[2,19],89:[2,19],91:[2,19],100:[2,19],102:[2,19],103:[2,19],104:[2,19],108:[2,19],116:[2,19],124:[2,19],126:[2,19],127:[2,19],130:[2,19],131:[2,19],132:[2,19],133:[2,19],134:[2,19],135:[2,19]},{1:[2,20],6:[2,20],25:[2,20],26:[2,20],47:[2,20],52:[2,20],55:[2,20],71:[2,20],76:[2,20],84:[2,20],89:[2,20],91:[2,20],100:[2,20],102:[2,20],103:[2,20],104:[2,20],108:[2,20],116:[2,20],124:[2,20],126:[2,20],127:[2,20],130:[2,20],131:[2,20],132:[2,20],133:[2,20],134:[2,20],135:[2,20]},{1:[2,21],6:[2,21],25:[2,21],26:[2,21],47:[2,21],52:[2,21],55:[2,21],71:[2,21],76:[2,21],84:[2,21],89:[2,21],91:[2,21],100:[2,21],102:[2,21],103:[2,21],104:[2,21],108:[2,21],116:[2,21],124:[2,21],126:[2,21],127:[2,21],130:[2,21],131:[2,21],132:[2,21],133:[2,21],134:[2,21],135:[2,21]},{1:[2,22],6:[2,22],25:[2,22],26:[2,22],47:[2,22],52:[2,22],55:[2,22],71:[2,22],76:[2,22],84:[2,22],89:[2,22],91:[2,22],100:[2,22],102:[2,22],103:[2,22],104:[2,22],108:[2,22],116:[2,22],124:[2,22],126:[2,22],127:[2,22],130:[2,22],131:[2,22],132:[2,22],133:[2,22],134:[2,22],135:[2,22]},{1:[2,23],6:[2,23],25:[2,23],26:[2,23],47:[2,23],52:[2,23],55:[2,23],71:[2,23],76:[2,23],84:[2,23],89:[2,23],91:[2,23],100:[2,23],102:[2,23],103:[2,23],104:[2,23],108:[2,23],116:[2,23],124:[2,23],126:[2,23],127:[2,23],130:[2,23],131:[2,23],132:[2,23],133:[2,23],134:[2,23],135:[2,23]},{1:[2,9],6:[2,9],26:[2,9],100:[2,9],102:[2,9],104:[2,9],108:[2,9],124:[2,9]},{1:[2,10],6:[2,10],26:[2,10],100:[2,10],102:[2,10],104:[2,10],108:[2,10],124:[2,10]},{1:[2,11],6:[2,11],26:[2,11],100:[2,11],102:[2,11],104:[2,11],108:[2,11],124:[2,11]},{1:[2,72],6:[2,72],25:[2,72],26:[2,72],38:[1,101],47:[2,72],52:[2,72],55:[2,72],65:[2,72],66:[2,72],67:[2,72],69:[2,72],71:[2,72],72:[2,72],76:[2,72],82:[2,72],83:[2,72],84:[2,72],89:[2,72],91:[2,72],100:[2,72],102:[2,72],103:[2,72],104:[2,72],108:[2,72],116:[2,72],124:[2,72],126:[2,72],127:[2,72],130:[2,72],131:[2,72],132:[2,72],133:[2,72],134:[2,72],135:[2,72]},{1:[2,73],6:[2,73],25:[2,73],26:[2,73],47:[2,73],52:[2,73],55:[2,73],65:[2,73],66:[2,73],67:[2,73],69:[2,73],71:[2,73],72:[2,73],76:[2,73],82:[2,73],83:[2,73],84:[2,73],89:[2,73],91:[2,73],100:[2,73],102:[2,73],103:[2,73],104:[2,73],108:[2,73],116:[2,73],124:[2,73],126:[2,73],127:[2,73],130:[2,73],131:[2,73],132:[2,73],133:[2,73],134:[2,73],135:[2,73]},{1:[2,74],6:[2,74],25:[2,74],26:[2,74],47:[2,74],52:[2,74],55:[2,74],65:[2,74],66:[2,74],67:[2,74],69:[2,74],71:[2,74],72:[2,74],76:[2,74],82:[2,74],83:[2,74],84:[2,74],89:[2,74],91:[2,74],100:[2,74],102:[2,74],103:[2,74],104:[2,74],108:[2,74],116:[2,74],124:[2,74],126:[2,74],127:[2,74],130:[2,74],131:[2,74],132:[2,74],133:[2,74],134:[2,74],135:[2,74]},{1:[2,75],6:[2,75],25:[2,75],26:[2,75],47:[2,75],52:[2,75],55:[2,75],65:[2,75],66:[2,75],67:[2,75],69:[2,75],71:[2,75],72:[2,75],76:[2,75],82:[2,75],83:[2,75],84:[2,75],89:[2,75],91:[2,75],100:[2,75],102:[2,75],103:[2,75],104:[2,75],108:[2,75],116:[2,75],124:[2,75],126:[2,75],127:[2,75],130:[2,75],131:[2,75],132:[2,75],133:[2,75],134:[2,75],135:[2,75]},{1:[2,76],6:[2,76],25:[2,76],26:[2,76],47:[2,76],52:[2,76],55:[2,76],65:[2,76],66:[2,76],67:[2,76],69:[2,76],71:[2,76],72:[2,76],76:[2,76],82:[2,76],83:[2,76],84:[2,76],89:[2,76],91:[2,76],100:[2,76],102:[2,76],103:[2,76],104:[2,76],108:[2,76],116:[2,76],124:[2,76],126:[2,76],127:[2,76],130:[2,76],131:[2,76],132:[2,76],133:[2,76],134:[2,76],135:[2,76]},{1:[2,102],6:[2,102],25:[2,102],26:[2,102],47:[2,102],52:[2,102],55:[2,102],65:[2,102],66:[2,102],67:[2,102],69:[2,102],71:[2,102],72:[2,102],76:[2,102],80:102,82:[2,102],83:[1,103],84:[2,102],89:[2,102],91:[2,102],100:[2,102],102:[2,102],103:[2,102],104:[2,102],108:[2,102],116:[2,102],124:[2,102],126:[2,102],127:[2,102],130:[2,102],131:[2,102],132:[2,102],133:[2,102],134:[2,102],135:[2,102]},{27:108,28:[1,71],36:[1,113],42:109,46:104,47:[2,53],52:[2,53],53:105,54:106,56:107,57:110,58:111,74:[1,68],87:[1,143],88:[1,144],137:[1,112],138:[1,114],139:[1,115],140:[1,116],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121],146:[1,122],147:[1,123],148:[1,124],149:[1,125],150:[1,126],151:[1,127],152:[1,128],153:[1,129],154:[1,130],155:[1,131],156:[1,132],157:[1,133],158:[1,134],159:[1,135],160:[1,136],161:[1,137],162:[1,138],163:[1,139],164:[1,140],165:[1,141],166:[1,142]},{5:145,25:[1,5]},{8:146,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:148,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:149,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{13:151,14:152,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:153,42:61,57:47,58:48,60:150,62:25,63:26,64:27,74:[1,68],81:[1,28],86:[1,56],87:[1,57],88:[1,55],99:[1,54]},{13:151,14:152,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:153,42:61,57:47,58:48,60:154,62:25,63:26,64:27,74:[1,68],81:[1,28],86:[1,56],87:[1,57],88:[1,55],99:[1,54]},{1:[2,69],6:[2,69],25:[2,69],26:[2,69],38:[2,69],47:[2,69],52:[2,69],55:[2,69],65:[2,69],66:[2,69],67:[2,69],69:[2,69],71:[2,69],72:[2,69],76:[2,69],78:[1,158],82:[2,69],83:[2,69],84:[2,69],89:[2,69],91:[2,69],100:[2,69],102:[2,69],103:[2,69],104:[2,69],108:[2,69],116:[2,69],124:[2,69],126:[2,69],127:[2,69],128:[1,155],129:[1,156],130:[2,69],131:[2,69],132:[2,69],133:[2,69],134:[2,69],135:[2,69],136:[1,157]},{1:[2,176],6:[2,176],25:[2,176],26:[2,176],47:[2,176],52:[2,176],55:[2,176],71:[2,176],76:[2,176],84:[2,176],89:[2,176],91:[2,176],100:[2,176],102:[2,176],103:[2,176],104:[2,176],108:[2,176],116:[2,176],119:[1,159],124:[2,176],126:[2,176],127:[2,176],130:[2,176],131:[2,176],132:[2,176],133:[2,176],134:[2,176],135:[2,176]},{5:160,25:[1,5]},{5:161,25:[1,5]},{1:[2,144],6:[2,144],25:[2,144],26:[2,144],47:[2,144],52:[2,144],55:[2,144],71:[2,144],76:[2,144],84:[2,144],89:[2,144],91:[2,144],100:[2,144],102:[2,144],103:[2,144],104:[2,144],108:[2,144],116:[2,144],124:[2,144],126:[2,144],127:[2,144],130:[2,144],131:[2,144],132:[2,144],133:[2,144],134:[2,144],135:[2,144]},{5:162,25:[1,5]},{8:163,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,164],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,92],5:165,6:[2,92],13:151,14:152,25:[1,5],26:[2,92],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:153,42:61,47:[2,92],52:[2,92],55:[2,92],57:47,58:48,60:167,62:25,63:26,64:27,71:[2,92],74:[1,68],76:[2,92],78:[1,166],81:[1,28],84:[2,92],86:[1,56],87:[1,57],88:[1,55],89:[2,92],91:[2,92],99:[1,54],100:[2,92],102:[2,92],103:[2,92],104:[2,92],108:[2,92],116:[2,92],124:[2,92],126:[2,92],127:[2,92],130:[2,92],131:[2,92],132:[2,92],133:[2,92],134:[2,92],135:[2,92]},{8:168,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,45],6:[2,45],8:169,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[2,45],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],100:[2,45],101:39,102:[2,45],104:[2,45],105:40,106:[1,65],107:41,108:[2,45],109:67,117:[1,42],122:37,123:[1,62],124:[2,45],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,46],6:[2,46],25:[2,46],26:[2,46],52:[2,46],76:[2,46],100:[2,46],102:[2,46],104:[2,46],108:[2,46],124:[2,46]},{1:[2,70],6:[2,70],25:[2,70],26:[2,70],38:[2,70],47:[2,70],52:[2,70],55:[2,70],65:[2,70],66:[2,70],67:[2,70],69:[2,70],71:[2,70],72:[2,70],76:[2,70],82:[2,70],83:[2,70],84:[2,70],89:[2,70],91:[2,70],100:[2,70],102:[2,70],103:[2,70],104:[2,70],108:[2,70],116:[2,70],124:[2,70],126:[2,70],127:[2,70],130:[2,70],131:[2,70],132:[2,70],133:[2,70],134:[2,70],135:[2,70]},{1:[2,71],6:[2,71],25:[2,71],26:[2,71],38:[2,71],47:[2,71],52:[2,71],55:[2,71],65:[2,71],66:[2,71],67:[2,71],69:[2,71],71:[2,71],72:[2,71],76:[2,71],82:[2,71],83:[2,71],84:[2,71],89:[2,71],91:[2,71],100:[2,71],102:[2,71],103:[2,71],104:[2,71],108:[2,71],116:[2,71],124:[2,71],126:[2,71],127:[2,71],130:[2,71],131:[2,71],132:[2,71],133:[2,71],134:[2,71],135:[2,71]},{1:[2,29],6:[2,29],25:[2,29],26:[2,29],47:[2,29],52:[2,29],55:[2,29],65:[2,29],66:[2,29],67:[2,29],69:[2,29],71:[2,29],72:[2,29],76:[2,29],82:[2,29],83:[2,29],84:[2,29],89:[2,29],91:[2,29],100:[2,29],102:[2,29],103:[2,29],104:[2,29],108:[2,29],116:[2,29],124:[2,29],126:[2,29],127:[2,29],130:[2,29],131:[2,29],132:[2,29],133:[2,29],134:[2,29],135:[2,29]},{1:[2,30],6:[2,30],25:[2,30],26:[2,30],47:[2,30],52:[2,30],55:[2,30],65:[2,30],66:[2,30],67:[2,30],69:[2,30],71:[2,30],72:[2,30],76:[2,30],82:[2,30],83:[2,30],84:[2,30],89:[2,30],91:[2,30],100:[2,30],102:[2,30],103:[2,30],104:[2,30],108:[2,30],116:[2,30],124:[2,30],126:[2,30],127:[2,30],130:[2,30],131:[2,30],132:[2,30],133:[2,30],134:[2,30],135:[2,30]},{1:[2,31],6:[2,31],25:[2,31],26:[2,31],47:[2,31],52:[2,31],55:[2,31],65:[2,31],66:[2,31],67:[2,31],69:[2,31],71:[2,31],72:[2,31],76:[2,31],82:[2,31],83:[2,31],84:[2,31],89:[2,31],91:[2,31],100:[2,31],102:[2,31],103:[2,31],104:[2,31],108:[2,31],116:[2,31],124:[2,31],126:[2,31],127:[2,31],130:[2,31],131:[2,31],132:[2,31],133:[2,31],134:[2,31],135:[2,31]},{1:[2,32],6:[2,32],25:[2,32],26:[2,32],47:[2,32],52:[2,32],55:[2,32],65:[2,32],66:[2,32],67:[2,32],69:[2,32],71:[2,32],72:[2,32],76:[2,32],82:[2,32],83:[2,32],84:[2,32],89:[2,32],91:[2,32],100:[2,32],102:[2,32],103:[2,32],104:[2,32],108:[2,32],116:[2,32],124:[2,32],126:[2,32],127:[2,32],130:[2,32],131:[2,32],132:[2,32],133:[2,32],134:[2,32],135:[2,32]},{1:[2,33],6:[2,33],25:[2,33],26:[2,33],47:[2,33],52:[2,33],55:[2,33],65:[2,33],66:[2,33],67:[2,33],69:[2,33],71:[2,33],72:[2,33],76:[2,33],82:[2,33],83:[2,33],84:[2,33],89:[2,33],91:[2,33],100:[2,33],102:[2,33],103:[2,33],104:[2,33],108:[2,33],116:[2,33],124:[2,33],126:[2,33],127:[2,33],130:[2,33],131:[2,33],132:[2,33],133:[2,33],134:[2,33],135:[2,33]},{4:170,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,171],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:172,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,176],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,59:177,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],85:174,86:[1,56],87:[1,57],88:[1,55],89:[1,173],92:175,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,108],6:[2,108],25:[2,108],26:[2,108],47:[2,108],52:[2,108],55:[2,108],65:[2,108],66:[2,108],67:[2,108],69:[2,108],71:[2,108],72:[2,108],76:[2,108],82:[2,108],83:[2,108],84:[2,108],89:[2,108],91:[2,108],100:[2,108],102:[2,108],103:[2,108],104:[2,108],108:[2,108],116:[2,108],124:[2,108],126:[2,108],127:[2,108],130:[2,108],131:[2,108],132:[2,108],133:[2,108],134:[2,108],135:[2,108]},{1:[2,109],6:[2,109],25:[2,109],26:[2,109],27:178,28:[1,71],47:[2,109],52:[2,109],55:[2,109],65:[2,109],66:[2,109],67:[2,109],69:[2,109],71:[2,109],72:[2,109],76:[2,109],82:[2,109],83:[2,109],84:[2,109],89:[2,109],91:[2,109],100:[2,109],102:[2,109],103:[2,109],104:[2,109],108:[2,109],116:[2,109],124:[2,109],126:[2,109],127:[2,109],130:[2,109],131:[2,109],132:[2,109],133:[2,109],134:[2,109],135:[2,109]},{25:[2,49]},{25:[2,50]},{1:[2,65],6:[2,65],25:[2,65],26:[2,65],38:[2,65],47:[2,65],52:[2,65],55:[2,65],65:[2,65],66:[2,65],67:[2,65],69:[2,65],71:[2,65],72:[2,65],76:[2,65],78:[2,65],82:[2,65],83:[2,65],84:[2,65],89:[2,65],91:[2,65],100:[2,65],102:[2,65],103:[2,65],104:[2,65],108:[2,65],116:[2,65],124:[2,65],126:[2,65],127:[2,65],128:[2,65],129:[2,65],130:[2,65],131:[2,65],132:[2,65],133:[2,65],134:[2,65],135:[2,65],136:[2,65]},{1:[2,68],6:[2,68],25:[2,68],26:[2,68],38:[2,68],47:[2,68],52:[2,68],55:[2,68],65:[2,68],66:[2,68],67:[2,68],69:[2,68],71:[2,68],72:[2,68],76:[2,68],78:[2,68],82:[2,68],83:[2,68],84:[2,68],89:[2,68],91:[2,68],100:[2,68],102:[2,68],103:[2,68],104:[2,68],108:[2,68],116:[2,68],124:[2,68],126:[2,68],127:[2,68],128:[2,68],129:[2,68],130:[2,68],131:[2,68],132:[2,68],133:[2,68],134:[2,68],135:[2,68],136:[2,68]},{8:179,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:180,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:181,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{5:182,8:183,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,5],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{27:188,28:[1,71],57:189,58:190,63:184,74:[1,68],88:[1,55],111:185,112:[1,186],113:187},{110:191,114:[1,192],115:[1,193]},{6:[2,87],11:197,25:[2,87],27:198,28:[1,71],29:199,30:[1,69],31:[1,70],39:195,40:196,42:200,44:[1,46],52:[2,87],75:194,76:[2,87],87:[1,143]},{1:[2,27],6:[2,27],25:[2,27],26:[2,27],41:[2,27],47:[2,27],52:[2,27],55:[2,27],65:[2,27],66:[2,27],67:[2,27],69:[2,27],71:[2,27],72:[2,27],76:[2,27],82:[2,27],83:[2,27],84:[2,27],89:[2,27],91:[2,27],100:[2,27],102:[2,27],103:[2,27],104:[2,27],108:[2,27],116:[2,27],124:[2,27],126:[2,27],127:[2,27],130:[2,27],131:[2,27],132:[2,27],133:[2,27],134:[2,27],135:[2,27]},{1:[2,28],6:[2,28],25:[2,28],26:[2,28],41:[2,28],47:[2,28],52:[2,28],55:[2,28],65:[2,28],66:[2,28],67:[2,28],69:[2,28],71:[2,28],72:[2,28],76:[2,28],82:[2,28],83:[2,28],84:[2,28],89:[2,28],91:[2,28],100:[2,28],102:[2,28],103:[2,28],104:[2,28],108:[2,28],116:[2,28],124:[2,28],126:[2,28],127:[2,28],130:[2,28],131:[2,28],132:[2,28],133:[2,28],134:[2,28],135:[2,28]},{1:[2,26],6:[2,26],25:[2,26],26:[2,26],38:[2,26],41:[2,26],47:[2,26],52:[2,26],55:[2,26],65:[2,26],66:[2,26],67:[2,26],69:[2,26],71:[2,26],72:[2,26],76:[2,26],78:[2,26],82:[2,26],83:[2,26],84:[2,26],89:[2,26],91:[2,26],100:[2,26],102:[2,26],103:[2,26],104:[2,26],108:[2,26],114:[2,26],115:[2,26],116:[2,26],124:[2,26],126:[2,26],127:[2,26],128:[2,26],129:[2,26],130:[2,26],131:[2,26],132:[2,26],133:[2,26],134:[2,26],135:[2,26],136:[2,26]},{1:[2,6],6:[2,6],7:201,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[2,6],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],100:[2,6],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,3]},{1:[2,24],6:[2,24],25:[2,24],26:[2,24],47:[2,24],52:[2,24],55:[2,24],71:[2,24],76:[2,24],84:[2,24],89:[2,24],91:[2,24],96:[2,24],97:[2,24],100:[2,24],102:[2,24],103:[2,24],104:[2,24],108:[2,24],116:[2,24],119:[2,24],121:[2,24],124:[2,24],126:[2,24],127:[2,24],130:[2,24],131:[2,24],132:[2,24],133:[2,24],134:[2,24],135:[2,24]},{6:[1,72],26:[1,202]},{1:[2,187],6:[2,187],25:[2,187],26:[2,187],47:[2,187],52:[2,187],55:[2,187],71:[2,187],76:[2,187],84:[2,187],89:[2,187],91:[2,187],100:[2,187],102:[2,187],103:[2,187],104:[2,187],108:[2,187],116:[2,187],124:[2,187],126:[2,187],127:[2,187],130:[2,187],131:[2,187],132:[2,187],133:[2,187],134:[2,187],135:[2,187]},{8:203,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:204,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:205,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:206,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:207,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:208,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:209,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:210,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,143],6:[2,143],25:[2,143],26:[2,143],47:[2,143],52:[2,143],55:[2,143],71:[2,143],76:[2,143],84:[2,143],89:[2,143],91:[2,143],100:[2,143],102:[2,143],103:[2,143],104:[2,143],108:[2,143],116:[2,143],124:[2,143],126:[2,143],127:[2,143],130:[2,143],131:[2,143],132:[2,143],133:[2,143],134:[2,143],135:[2,143]},{1:[2,148],6:[2,148],25:[2,148],26:[2,148],47:[2,148],52:[2,148],55:[2,148],71:[2,148],76:[2,148],84:[2,148],89:[2,148],91:[2,148],100:[2,148],102:[2,148],103:[2,148],104:[2,148],108:[2,148],116:[2,148],124:[2,148],126:[2,148],127:[2,148],130:[2,148],131:[2,148],132:[2,148],133:[2,148],134:[2,148],135:[2,148]},{8:211,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,142],6:[2,142],25:[2,142],26:[2,142],47:[2,142],52:[2,142],55:[2,142],71:[2,142],76:[2,142],84:[2,142],89:[2,142],91:[2,142],100:[2,142],102:[2,142],103:[2,142],104:[2,142],108:[2,142],116:[2,142],124:[2,142],126:[2,142],127:[2,142],130:[2,142],131:[2,142],132:[2,142],133:[2,142],134:[2,142],135:[2,142]},{1:[2,147],6:[2,147],25:[2,147],26:[2,147],47:[2,147],52:[2,147],55:[2,147],71:[2,147],76:[2,147],84:[2,147],89:[2,147],91:[2,147],100:[2,147],102:[2,147],103:[2,147],104:[2,147],108:[2,147],116:[2,147],124:[2,147],126:[2,147],127:[2,147],130:[2,147],131:[2,147],132:[2,147],133:[2,147],134:[2,147],135:[2,147]},{80:212,83:[1,103]},{1:[2,66],6:[2,66],25:[2,66],26:[2,66],38:[2,66],47:[2,66],52:[2,66],55:[2,66],65:[2,66],66:[2,66],67:[2,66],69:[2,66],71:[2,66],72:[2,66],76:[2,66],78:[2,66],82:[2,66],83:[2,66],84:[2,66],89:[2,66],91:[2,66],100:[2,66],102:[2,66],103:[2,66],104:[2,66],108:[2,66],116:[2,66],124:[2,66],126:[2,66],127:[2,66],128:[2,66],129:[2,66],130:[2,66],131:[2,66],132:[2,66],133:[2,66],134:[2,66],135:[2,66],136:[2,66]},{83:[2,105]},{27:213,28:[1,71]},{27:214,28:[1,71]},{1:[2,80],6:[2,80],25:[2,80],26:[2,80],27:215,28:[1,71],38:[2,80],47:[2,80],52:[2,80],55:[2,80],65:[2,80],66:[2,80],67:[2,80],69:[2,80],71:[2,80],72:[2,80],76:[2,80],78:[2,80],82:[2,80],83:[2,80],84:[2,80],89:[2,80],91:[2,80],100:[2,80],102:[2,80],103:[2,80],104:[2,80],108:[2,80],116:[2,80],124:[2,80],126:[2,80],127:[2,80],128:[2,80],129:[2,80],130:[2,80],131:[2,80],132:[2,80],133:[2,80],134:[2,80],135:[2,80],136:[2,80]},{1:[2,81],6:[2,81],25:[2,81],26:[2,81],38:[2,81],47:[2,81],52:[2,81],55:[2,81],65:[2,81],66:[2,81],67:[2,81],69:[2,81],71:[2,81],72:[2,81],76:[2,81],78:[2,81],82:[2,81],83:[2,81],84:[2,81],89:[2,81],91:[2,81],100:[2,81],102:[2,81],103:[2,81],104:[2,81],108:[2,81],116:[2,81],124:[2,81],126:[2,81],127:[2,81],128:[2,81],129:[2,81],130:[2,81],131:[2,81],132:[2,81],133:[2,81],134:[2,81],135:[2,81],136:[2,81]},{8:217,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],55:[1,221],57:47,58:48,60:36,62:25,63:26,64:27,70:216,73:218,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],90:219,91:[1,220],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{68:222,69:[1,97],72:[1,98]},{80:223,83:[1,103]},{1:[2,67],6:[2,67],25:[2,67],26:[2,67],38:[2,67],47:[2,67],52:[2,67],55:[2,67],65:[2,67],66:[2,67],67:[2,67],69:[2,67],71:[2,67],72:[2,67],76:[2,67],78:[2,67],82:[2,67],83:[2,67],84:[2,67],89:[2,67],91:[2,67],100:[2,67],102:[2,67],103:[2,67],104:[2,67],108:[2,67],116:[2,67],124:[2,67],126:[2,67],127:[2,67],128:[2,67],129:[2,67],130:[2,67],131:[2,67],132:[2,67],133:[2,67],134:[2,67],135:[2,67],136:[2,67]},{6:[1,225],8:224,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,226],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,103],6:[2,103],25:[2,103],26:[2,103],47:[2,103],52:[2,103],55:[2,103],65:[2,103],66:[2,103],67:[2,103],69:[2,103],71:[2,103],72:[2,103],76:[2,103],82:[2,103],83:[2,103],84:[2,103],89:[2,103],91:[2,103],100:[2,103],102:[2,103],103:[2,103],104:[2,103],108:[2,103],116:[2,103],124:[2,103],126:[2,103],127:[2,103],130:[2,103],131:[2,103],132:[2,103],133:[2,103],134:[2,103],135:[2,103]},{8:229,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,176],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,59:177,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],84:[1,227],85:228,86:[1,56],87:[1,57],88:[1,55],92:175,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{47:[1,230],52:[1,231]},{47:[2,54],52:[2,54]},{38:[1,233],47:[2,56],52:[2,56],55:[1,232]},{27:108,28:[1,71],36:[1,113],42:109,53:234,54:106,56:107,57:110,58:111,74:[1,68],87:[1,143],88:[1,144],137:[1,112],138:[1,114],139:[1,115],140:[1,116],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121],146:[1,122],147:[1,123],148:[1,124],149:[1,125],150:[1,126],151:[1,127],152:[1,128],153:[1,129],154:[1,130],155:[1,131],156:[1,132],157:[1,133],158:[1,134],159:[1,135],160:[1,136],161:[1,137],162:[1,138],163:[1,139],164:[1,140],165:[1,141],166:[1,142]},{38:[2,60],47:[2,60],52:[2,60],55:[2,60]},{38:[2,61],47:[2,61],52:[2,61],55:[2,61]},{38:[2,62],47:[2,62],52:[2,62],55:[2,62]},{38:[2,63],47:[2,63],52:[2,63],55:[2,63]},{28:[2,198],36:[2,198],74:[2,198],87:[2,198],88:[2,198],137:[2,198],138:[2,198],139:[2,198],140:[2,198],141:[2,198],142:[2,198],143:[2,198],144:[2,198],145:[2,198],146:[2,198],147:[2,198],148:[2,198],149:[2,198],150:[2,198],151:[2,198],152:[2,198],153:[2,198],154:[2,198],155:[2,198],156:[2,198],157:[2,198],158:[2,198],159:[2,198],160:[2,198],161:[2,198],162:[2,198],163:[2,198],164:[2,198],165:[2,198],166:[2,198]},{28:[2,199],36:[2,199],74:[2,199],87:[2,199],88:[2,199],137:[2,199],138:[2,199],139:[2,199],140:[2,199],141:[2,199],142:[2,199],143:[2,199],144:[2,199],145:[2,199],146:[2,199],147:[2,199],148:[2,199],149:[2,199],150:[2,199],151:[2,199],152:[2,199],153:[2,199],154:[2,199],155:[2,199],156:[2,199],157:[2,199],158:[2,199],159:[2,199],160:[2,199],161:[2,199],162:[2,199],163:[2,199],164:[2,199],165:[2,199],166:[2,199]},{28:[2,200],36:[2,200],74:[2,200],87:[2,200],88:[2,200],137:[2,200],138:[2,200],139:[2,200],140:[2,200],141:[2,200],142:[2,200],143:[2,200],144:[2,200],145:[2,200],146:[2,200],147:[2,200],148:[2,200],149:[2,200],150:[2,200],151:[2,200],152:[2,200],153:[2,200],154:[2,200],155:[2,200],156:[2,200],157:[2,200],158:[2,200],159:[2,200],160:[2,200],161:[2,200],162:[2,200],163:[2,200],164:[2,200],165:[2,200],166:[2,200]},{28:[2,201],36:[2,201],74:[2,201],87:[2,201],88:[2,201],137:[2,201],138:[2,201],139:[2,201],140:[2,201],141:[2,201],142:[2,201],143:[2,201],144:[2,201],145:[2,201],146:[2,201],147:[2,201],148:[2,201],149:[2,201],150:[2,201],151:[2,201],152:[2,201],153:[2,201],154:[2,201],155:[2,201],156:[2,201],157:[2,201],158:[2,201],159:[2,201],160:[2,201],161:[2,201],162:[2,201],163:[2,201],164:[2,201],165:[2,201],166:[2,201]},{28:[2,202],36:[2,202],74:[2,202],87:[2,202],88:[2,202],137:[2,202],138:[2,202],139:[2,202],140:[2,202],141:[2,202],142:[2,202],143:[2,202],144:[2,202],145:[2,202],146:[2,202],147:[2,202],148:[2,202],149:[2,202],150:[2,202],151:[2,202],152:[2,202],153:[2,202],154:[2,202],155:[2,202],156:[2,202],157:[2,202],158:[2,202],159:[2,202],160:[2,202],161:[2,202],162:[2,202],163:[2,202],164:[2,202],165:[2,202],166:[2,202]},{28:[2,203],36:[2,203],74:[2,203],87:[2,203],88:[2,203],137:[2,203],138:[2,203],139:[2,203],140:[2,203],141:[2,203],142:[2,203],143:[2,203],144:[2,203],145:[2,203],146:[2,203],147:[2,203],148:[2,203],149:[2,203],150:[2,203],151:[2,203],152:[2,203],153:[2,203],154:[2,203],155:[2,203],156:[2,203],157:[2,203],158:[2,203],159:[2,203],160:[2,203],161:[2,203],162:[2,203],163:[2,203],164:[2,203],165:[2,203],166:[2,203]},{28:[2,204],36:[2,204],74:[2,204],87:[2,204],88:[2,204],137:[2,204],138:[2,204],139:[2,204],140:[2,204],141:[2,204],142:[2,204],143:[2,204],144:[2,204],145:[2,204],146:[2,204],147:[2,204],148:[2,204],149:[2,204],150:[2,204],151:[2,204],152:[2,204],153:[2,204],154:[2,204],155:[2,204],156:[2,204],157:[2,204],158:[2,204],159:[2,204],160:[2,204],161:[2,204],162:[2,204],163:[2,204],164:[2,204],165:[2,204],166:[2,204]},{28:[2,205],36:[2,205],74:[2,205],87:[2,205],88:[2,205],137:[2,205],138:[2,205],139:[2,205],140:[2,205],141:[2,205],142:[2,205],143:[2,205],144:[2,205],145:[2,205],146:[2,205],147:[2,205],148:[2,205],149:[2,205],150:[2,205],151:[2,205],152:[2,205],153:[2,205],154:[2,205],155:[2,205],156:[2,205],157:[2,205],158:[2,205],159:[2,205],160:[2,205],161:[2,205],162:[2,205],163:[2,205],164:[2,205],165:[2,205],166:[2,205]},{28:[2,206],36:[2,206],74:[2,206],87:[2,206],88:[2,206],137:[2,206],138:[2,206],139:[2,206],140:[2,206],141:[2,206],142:[2,206],143:[2,206],144:[2,206],145:[2,206],146:[2,206],147:[2,206],148:[2,206],149:[2,206],150:[2,206],151:[2,206],152:[2,206],153:[2,206],154:[2,206],155:[2,206],156:[2,206],157:[2,206],158:[2,206],159:[2,206],160:[2,206],161:[2,206],162:[2,206],163:[2,206],164:[2,206],165:[2,206],166:[2,206]},{28:[2,207],36:[2,207],74:[2,207],87:[2,207],88:[2,207],137:[2,207],138:[2,207],139:[2,207],140:[2,207],141:[2,207],142:[2,207],143:[2,207],144:[2,207],145:[2,207],146:[2,207],147:[2,207],148:[2,207],149:[2,207],150:[2,207],151:[2,207],152:[2,207],153:[2,207],154:[2,207],155:[2,207],156:[2,207],157:[2,207],158:[2,207],159:[2,207],160:[2,207],161:[2,207],162:[2,207],163:[2,207],164:[2,207],165:[2,207],166:[2,207]},{28:[2,208],36:[2,208],74:[2,208],87:[2,208],88:[2,208],137:[2,208],138:[2,208],139:[2,208],140:[2,208],141:[2,208],142:[2,208],143:[2,208],144:[2,208],145:[2,208],146:[2,208],147:[2,208],148:[2,208],149:[2,208],150:[2,208],151:[2,208],152:[2,208],153:[2,208],154:[2,208],155:[2,208],156:[2,208],157:[2,208],158:[2,208],159:[2,208],160:[2,208],161:[2,208],162:[2,208],163:[2,208],164:[2,208],165:[2,208],166:[2,208]},{28:[2,209],36:[2,209],74:[2,209],87:[2,209],88:[2,209],137:[2,209],138:[2,209],139:[2,209],140:[2,209],141:[2,209],142:[2,209],143:[2,209],144:[2,209],145:[2,209],146:[2,209],147:[2,209],148:[2,209],149:[2,209],150:[2,209],151:[2,209],152:[2,209],153:[2,209],154:[2,209],155:[2,209],156:[2,209],157:[2,209],158:[2,209],159:[2,209],160:[2,209],161:[2,209],162:[2,209],163:[2,209],164:[2,209],165:[2,209],166:[2,209]},{28:[2,210],36:[2,210],74:[2,210],87:[2,210],88:[2,210],137:[2,210],138:[2,210],139:[2,210],140:[2,210],141:[2,210],142:[2,210],143:[2,210],144:[2,210],145:[2,210],146:[2,210],147:[2,210],148:[2,210],149:[2,210],150:[2,210],151:[2,210],152:[2,210],153:[2,210],154:[2,210],155:[2,210],156:[2,210],157:[2,210],158:[2,210],159:[2,210],160:[2,210],161:[2,210],162:[2,210],163:[2,210],164:[2,210],165:[2,210],166:[2,210]},{28:[2,211],36:[2,211],74:[2,211],87:[2,211],88:[2,211],137:[2,211],138:[2,211],139:[2,211],140:[2,211],141:[2,211],142:[2,211],143:[2,211],144:[2,211],145:[2,211],146:[2,211],147:[2,211],148:[2,211],149:[2,211],150:[2,211],151:[2,211],152:[2,211],153:[2,211],154:[2,211],155:[2,211],156:[2,211],157:[2,211],158:[2,211],159:[2,211],160:[2,211],161:[2,211],162:[2,211],163:[2,211],164:[2,211],165:[2,211],166:[2,211]},{28:[2,212],36:[2,212],74:[2,212],87:[2,212],88:[2,212],137:[2,212],138:[2,212],139:[2,212],140:[2,212],141:[2,212],142:[2,212],143:[2,212],144:[2,212],145:[2,212],146:[2,212],147:[2,212],148:[2,212],149:[2,212],150:[2,212],151:[2,212],152:[2,212],153:[2,212],154:[2,212],155:[2,212],156:[2,212],157:[2,212],158:[2,212],159:[2,212],160:[2,212],161:[2,212],162:[2,212],163:[2,212],164:[2,212],165:[2,212],166:[2,212]},{28:[2,213],36:[2,213],74:[2,213],87:[2,213],88:[2,213],137:[2,213],138:[2,213],139:[2,213],140:[2,213],141:[2,213],142:[2,213],143:[2,213],144:[2,213],145:[2,213],146:[2,213],147:[2,213],148:[2,213],149:[2,213],150:[2,213],151:[2,213],152:[2,213],153:[2,213],154:[2,213],155:[2,213],156:[2,213],157:[2,213],158:[2,213],159:[2,213],160:[2,213],161:[2,213],162:[2,213],163:[2,213],164:[2,213],165:[2,213],166:[2,213]},{28:[2,214],36:[2,214],74:[2,214],87:[2,214],88:[2,214],137:[2,214],138:[2,214],139:[2,214],140:[2,214],141:[2,214],142:[2,214],143:[2,214],144:[2,214],145:[2,214],146:[2,214],147:[2,214],148:[2,214],149:[2,214],150:[2,214],151:[2,214],152:[2,214],153:[2,214],154:[2,214],155:[2,214],156:[2,214],157:[2,214],158:[2,214],159:[2,214],160:[2,214],161:[2,214],162:[2,214],163:[2,214],164:[2,214],165:[2,214],166:[2,214]},{28:[2,215],36:[2,215],74:[2,215],87:[2,215],88:[2,215],137:[2,215],138:[2,215],139:[2,215],140:[2,215],141:[2,215],142:[2,215],143:[2,215],144:[2,215],145:[2,215],146:[2,215],147:[2,215],148:[2,215],149:[2,215],150:[2,215],151:[2,215],152:[2,215],153:[2,215],154:[2,215],155:[2,215],156:[2,215],157:[2,215],158:[2,215],159:[2,215],160:[2,215],161:[2,215],162:[2,215],163:[2,215],164:[2,215],165:[2,215],166:[2,215]},{28:[2,216],36:[2,216],74:[2,216],87:[2,216],88:[2,216],137:[2,216],138:[2,216],139:[2,216],140:[2,216],141:[2,216],142:[2,216],143:[2,216],144:[2,216],145:[2,216],146:[2,216],147:[2,216],148:[2,216],149:[2,216],150:[2,216],151:[2,216],152:[2,216],153:[2,216],154:[2,216],155:[2,216],156:[2,216],157:[2,216],158:[2,216],159:[2,216],160:[2,216],161:[2,216],162:[2,216],163:[2,216],164:[2,216],165:[2,216],166:[2,216]},{28:[2,217],36:[2,217],74:[2,217],87:[2,217],88:[2,217],137:[2,217],138:[2,217],139:[2,217],140:[2,217],141:[2,217],142:[2,217],143:[2,217],144:[2,217],145:[2,217],146:[2,217],147:[2,217],148:[2,217],149:[2,217],150:[2,217],151:[2,217],152:[2,217],153:[2,217],154:[2,217],155:[2,217],156:[2,217],157:[2,217],158:[2,217],159:[2,217],160:[2,217],161:[2,217],162:[2,217],163:[2,217],164:[2,217],165:[2,217],166:[2,217]},{28:[2,218],36:[2,218],74:[2,218],87:[2,218],88:[2,218],137:[2,218],138:[2,218],139:[2,218],140:[2,218],141:[2,218],142:[2,218],143:[2,218],144:[2,218],145:[2,218],146:[2,218],147:[2,218],148:[2,218],149:[2,218],150:[2,218],151:[2,218],152:[2,218],153:[2,218],154:[2,218],155:[2,218],156:[2,218],157:[2,218],158:[2,218],159:[2,218],160:[2,218],161:[2,218],162:[2,218],163:[2,218],164:[2,218],165:[2,218],166:[2,218]},{28:[2,219],36:[2,219],74:[2,219],87:[2,219],88:[2,219],137:[2,219],138:[2,219],139:[2,219],140:[2,219],141:[2,219],142:[2,219],143:[2,219],144:[2,219],145:[2,219],146:[2,219],147:[2,219],148:[2,219],149:[2,219],150:[2,219],151:[2,219],152:[2,219],153:[2,219],154:[2,219],155:[2,219],156:[2,219],157:[2,219],158:[2,219],159:[2,219],160:[2,219],161:[2,219],162:[2,219],163:[2,219],164:[2,219],165:[2,219],166:[2,219]},{28:[2,220],36:[2,220],74:[2,220],87:[2,220],88:[2,220],137:[2,220],138:[2,220],139:[2,220],140:[2,220],141:[2,220],142:[2,220],143:[2,220],144:[2,220],145:[2,220],146:[2,220],147:[2,220],148:[2,220],149:[2,220],150:[2,220],151:[2,220],152:[2,220],153:[2,220],154:[2,220],155:[2,220],156:[2,220],157:[2,220],158:[2,220],159:[2,220],160:[2,220],161:[2,220],162:[2,220],163:[2,220],164:[2,220],165:[2,220],166:[2,220]},{28:[2,221],36:[2,221],74:[2,221],87:[2,221],88:[2,221],137:[2,221],138:[2,221],139:[2,221],140:[2,221],141:[2,221],142:[2,221],143:[2,221],144:[2,221],145:[2,221],146:[2,221],147:[2,221],148:[2,221],149:[2,221],150:[2,221],151:[2,221],152:[2,221],153:[2,221],154:[2,221],155:[2,221],156:[2,221],157:[2,221],158:[2,221],159:[2,221],160:[2,221],161:[2,221],162:[2,221],163:[2,221],164:[2,221],165:[2,221],166:[2,221]},{28:[2,222],36:[2,222],74:[2,222],87:[2,222],88:[2,222],137:[2,222],138:[2,222],139:[2,222],140:[2,222],141:[2,222],142:[2,222],143:[2,222],144:[2,222],145:[2,222],146:[2,222],147:[2,222],148:[2,222],149:[2,222],150:[2,222],151:[2,222],152:[2,222],153:[2,222],154:[2,222],155:[2,222],156:[2,222],157:[2,222],158:[2,222],159:[2,222],160:[2,222],161:[2,222],162:[2,222],163:[2,222],164:[2,222],165:[2,222],166:[2,222]},{28:[2,223],36:[2,223],74:[2,223],87:[2,223],88:[2,223],137:[2,223],138:[2,223],139:[2,223],140:[2,223],141:[2,223],142:[2,223],143:[2,223],144:[2,223],145:[2,223],146:[2,223],147:[2,223],148:[2,223],149:[2,223],150:[2,223],151:[2,223],152:[2,223],153:[2,223],154:[2,223],155:[2,223],156:[2,223],157:[2,223],158:[2,223],159:[2,223],160:[2,223],161:[2,223],162:[2,223],163:[2,223],164:[2,223],165:[2,223],166:[2,223]},{28:[2,224],36:[2,224],74:[2,224],87:[2,224],88:[2,224],137:[2,224],138:[2,224],139:[2,224],140:[2,224],141:[2,224],142:[2,224],143:[2,224],144:[2,224],145:[2,224],146:[2,224],147:[2,224],148:[2,224],149:[2,224],150:[2,224],151:[2,224],152:[2,224],153:[2,224],154:[2,224],155:[2,224],156:[2,224],157:[2,224],158:[2,224],159:[2,224],160:[2,224],161:[2,224],162:[2,224],163:[2,224],164:[2,224],165:[2,224],166:[2,224]},{28:[2,225],36:[2,225],74:[2,225],87:[2,225],88:[2,225],137:[2,225],138:[2,225],139:[2,225],140:[2,225],141:[2,225],142:[2,225],143:[2,225],144:[2,225],145:[2,225],146:[2,225],147:[2,225],148:[2,225],149:[2,225],150:[2,225],151:[2,225],152:[2,225],153:[2,225],154:[2,225],155:[2,225],156:[2,225],157:[2,225],158:[2,225],159:[2,225],160:[2,225],161:[2,225],162:[2,225],163:[2,225],164:[2,225],165:[2,225],166:[2,225]},{28:[2,226],36:[2,226],74:[2,226],87:[2,226],88:[2,226],137:[2,226],138:[2,226],139:[2,226],140:[2,226],141:[2,226],142:[2,226],143:[2,226],144:[2,226],145:[2,226],146:[2,226],147:[2,226],148:[2,226],149:[2,226],150:[2,226],151:[2,226],152:[2,226],153:[2,226],154:[2,226],155:[2,226],156:[2,226],157:[2,226],158:[2,226],159:[2,226],160:[2,226],161:[2,226],162:[2,226],163:[2,226],164:[2,226],165:[2,226],166:[2,226]},{28:[2,227],36:[2,227],74:[2,227],87:[2,227],88:[2,227],137:[2,227],138:[2,227],139:[2,227],140:[2,227],141:[2,227],142:[2,227],143:[2,227],144:[2,227],145:[2,227],146:[2,227],147:[2,227],148:[2,227],149:[2,227],150:[2,227],151:[2,227],152:[2,227],153:[2,227],154:[2,227],155:[2,227],156:[2,227],157:[2,227],158:[2,227],159:[2,227],160:[2,227],161:[2,227],162:[2,227],163:[2,227],164:[2,227],165:[2,227],166:[2,227]},{28:[2,228],36:[2,228],74:[2,228],87:[2,228],88:[2,228],137:[2,228],138:[2,228],139:[2,228],140:[2,228],141:[2,228],142:[2,228],143:[2,228],144:[2,228],145:[2,228],146:[2,228],147:[2,228],148:[2,228],149:[2,228],150:[2,228],151:[2,228],152:[2,228],153:[2,228],154:[2,228],155:[2,228],156:[2,228],157:[2,228],158:[2,228],159:[2,228],160:[2,228],161:[2,228],162:[2,228],163:[2,228],164:[2,228],165:[2,228],166:[2,228]},{27:178,28:[1,71]},{8:229,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,176],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,59:177,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],85:174,86:[1,56],87:[1,57],88:[1,55],89:[1,173],92:175,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,48],6:[2,48],25:[2,48],26:[2,48],47:[2,48],52:[2,48],55:[2,48],71:[2,48],76:[2,48],84:[2,48],89:[2,48],91:[2,48],100:[2,48],102:[2,48],103:[2,48],104:[2,48],108:[2,48],116:[2,48],124:[2,48],126:[2,48],127:[2,48],130:[2,48],131:[2,48],132:[2,48],133:[2,48],134:[2,48],135:[2,48]},{1:[2,180],6:[2,180],25:[2,180],26:[2,180],47:[2,180],52:[2,180],55:[2,180],71:[2,180],76:[2,180],84:[2,180],89:[2,180],91:[2,180],100:[2,180],101:85,102:[2,180],103:[2,180],104:[2,180],107:86,108:[2,180],109:67,116:[2,180],124:[2,180],126:[2,180],127:[2,180],130:[1,76],131:[2,180],132:[2,180],133:[2,180],134:[2,180],135:[2,180]},{101:88,102:[1,63],104:[1,64],107:89,108:[1,66],109:67,124:[1,87]},{1:[2,181],6:[2,181],25:[2,181],26:[2,181],47:[2,181],52:[2,181],55:[2,181],71:[2,181],76:[2,181],84:[2,181],89:[2,181],91:[2,181],100:[2,181],101:85,102:[2,181],103:[2,181],104:[2,181],107:86,108:[2,181],109:67,116:[2,181],124:[2,181],126:[2,181],127:[2,181],130:[1,76],131:[2,181],132:[2,181],133:[2,181],134:[2,181],135:[2,181]},{1:[2,182],6:[2,182],25:[2,182],26:[2,182],47:[2,182],52:[2,182],55:[2,182],71:[2,182],76:[2,182],84:[2,182],89:[2,182],91:[2,182],100:[2,182],101:85,102:[2,182],103:[2,182],104:[2,182],107:86,108:[2,182],109:67,116:[2,182],124:[2,182],126:[2,182],127:[2,182],130:[1,76],131:[2,182],132:[2,182],133:[2,182],134:[2,182],135:[2,182]},{1:[2,183],6:[2,183],25:[2,183],26:[2,183],47:[2,183],52:[2,183],55:[2,183],65:[2,69],66:[2,69],67:[2,69],69:[2,69],71:[2,183],72:[2,69],76:[2,183],82:[2,69],83:[2,69],84:[2,183],89:[2,183],91:[2,183],100:[2,183],102:[2,183],103:[2,183],104:[2,183],108:[2,183],116:[2,183],124:[2,183],126:[2,183],127:[2,183],130:[2,183],131:[2,183],132:[2,183],133:[2,183],134:[2,183],135:[2,183]},{61:91,65:[1,93],66:[1,94],67:[1,95],68:96,69:[1,97],72:[1,98],79:90,82:[1,92],83:[2,104]},{61:100,65:[1,93],66:[1,94],67:[1,95],68:96,69:[1,97],72:[1,98],79:99,82:[1,92],83:[2,104]},{65:[2,72],66:[2,72],67:[2,72],69:[2,72],72:[2,72],82:[2,72],83:[2,72]},{1:[2,184],6:[2,184],25:[2,184],26:[2,184],47:[2,184],52:[2,184],55:[2,184],65:[2,69],66:[2,69],67:[2,69],69:[2,69],71:[2,184],72:[2,69],76:[2,184],82:[2,69],83:[2,69],84:[2,184],89:[2,184],91:[2,184],100:[2,184],102:[2,184],103:[2,184],104:[2,184],108:[2,184],116:[2,184],124:[2,184],126:[2,184],127:[2,184],130:[2,184],131:[2,184],132:[2,184],133:[2,184],134:[2,184],135:[2,184]},{1:[2,185],6:[2,185],25:[2,185],26:[2,185],47:[2,185],52:[2,185],55:[2,185],71:[2,185],76:[2,185],84:[2,185],89:[2,185],91:[2,185],100:[2,185],102:[2,185],103:[2,185],104:[2,185],108:[2,185],116:[2,185],124:[2,185],126:[2,185],127:[2,185],130:[2,185],131:[2,185],132:[2,185],133:[2,185],134:[2,185],135:[2,185]},{1:[2,186],6:[2,186],25:[2,186],26:[2,186],47:[2,186],52:[2,186],55:[2,186],71:[2,186],76:[2,186],84:[2,186],89:[2,186],91:[2,186],100:[2,186],102:[2,186],103:[2,186],104:[2,186],108:[2,186],116:[2,186],124:[2,186],126:[2,186],127:[2,186],130:[2,186],131:[2,186],132:[2,186],133:[2,186],134:[2,186],135:[2,186]},{8:235,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,236],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:237,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{5:238,25:[1,5],123:[1,239]},{1:[2,129],6:[2,129],25:[2,129],26:[2,129],47:[2,129],52:[2,129],55:[2,129],71:[2,129],76:[2,129],84:[2,129],89:[2,129],91:[2,129],95:240,96:[1,241],97:[1,242],100:[2,129],102:[2,129],103:[2,129],104:[2,129],108:[2,129],116:[2,129],124:[2,129],126:[2,129],127:[2,129],130:[2,129],131:[2,129],132:[2,129],133:[2,129],134:[2,129],135:[2,129]},{1:[2,141],6:[2,141],25:[2,141],26:[2,141],47:[2,141],52:[2,141],55:[2,141],71:[2,141],76:[2,141],84:[2,141],89:[2,141],91:[2,141],100:[2,141],102:[2,141],103:[2,141],104:[2,141],108:[2,141],116:[2,141],124:[2,141],126:[2,141],127:[2,141],130:[2,141],131:[2,141],132:[2,141],133:[2,141],134:[2,141],135:[2,141]},{1:[2,149],6:[2,149],25:[2,149],26:[2,149],47:[2,149],52:[2,149],55:[2,149],71:[2,149],76:[2,149],84:[2,149],89:[2,149],91:[2,149],100:[2,149],102:[2,149],103:[2,149],104:[2,149],108:[2,149],116:[2,149],124:[2,149],126:[2,149],127:[2,149],130:[2,149],131:[2,149],132:[2,149],133:[2,149],134:[2,149],135:[2,149]},{25:[1,243],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{118:244,120:245,121:[1,246]},{1:[2,93],6:[2,93],25:[2,93],26:[2,93],47:[2,93],52:[2,93],55:[2,93],71:[2,93],76:[2,93],84:[2,93],89:[2,93],91:[2,93],100:[2,93],102:[2,93],103:[2,93],104:[2,93],108:[2,93],116:[2,93],124:[2,93],126:[2,93],127:[2,93],130:[2,93],131:[2,93],132:[2,93],133:[2,93],134:[2,93],135:[2,93]},{8:247,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,96],5:248,6:[2,96],25:[1,5],26:[2,96],47:[2,96],52:[2,96],55:[2,96],65:[2,69],66:[2,69],67:[2,69],69:[2,69],71:[2,96],72:[2,69],76:[2,96],78:[1,249],82:[2,69],83:[2,69],84:[2,96],89:[2,96],91:[2,96],100:[2,96],102:[2,96],103:[2,96],104:[2,96],108:[2,96],116:[2,96],124:[2,96],126:[2,96],127:[2,96],130:[2,96],131:[2,96],132:[2,96],133:[2,96],134:[2,96],135:[2,96]},{1:[2,134],6:[2,134],25:[2,134],26:[2,134],47:[2,134],52:[2,134],55:[2,134],71:[2,134],76:[2,134],84:[2,134],89:[2,134],91:[2,134],100:[2,134],101:85,102:[2,134],103:[2,134],104:[2,134],107:86,108:[2,134],109:67,116:[2,134],124:[2,134],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,44],6:[2,44],26:[2,44],100:[2,44],101:85,102:[2,44],104:[2,44],107:86,108:[2,44],109:67,124:[2,44],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{6:[1,72],100:[1,250]},{4:251,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{6:[2,125],25:[2,125],52:[2,125],55:[1,253],89:[2,125],90:252,91:[1,220],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,111],6:[2,111],25:[2,111],26:[2,111],38:[2,111],47:[2,111],52:[2,111],55:[2,111],65:[2,111],66:[2,111],67:[2,111],69:[2,111],71:[2,111],72:[2,111],76:[2,111],82:[2,111],83:[2,111],84:[2,111],89:[2,111],91:[2,111],100:[2,111],102:[2,111],103:[2,111],104:[2,111],108:[2,111],114:[2,111],115:[2,111],116:[2,111],124:[2,111],126:[2,111],127:[2,111],130:[2,111],131:[2,111],132:[2,111],133:[2,111],134:[2,111],135:[2,111]},{6:[2,51],25:[2,51],51:254,52:[1,255],89:[2,51]},{6:[2,120],25:[2,120],26:[2,120],52:[2,120],84:[2,120],89:[2,120]},{8:229,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,176],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,59:177,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],85:256,86:[1,56],87:[1,57],88:[1,55],92:175,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{6:[2,126],25:[2,126],26:[2,126],52:[2,126],84:[2,126],89:[2,126]},{1:[2,110],6:[2,110],25:[2,110],26:[2,110],38:[2,110],41:[2,110],47:[2,110],52:[2,110],55:[2,110],65:[2,110],66:[2,110],67:[2,110],69:[2,110],71:[2,110],72:[2,110],76:[2,110],78:[2,110],82:[2,110],83:[2,110],84:[2,110],89:[2,110],91:[2,110],100:[2,110],102:[2,110],103:[2,110],104:[2,110],108:[2,110],116:[2,110],124:[2,110],126:[2,110],127:[2,110],128:[2,110],129:[2,110],130:[2,110],131:[2,110],132:[2,110],133:[2,110],134:[2,110],135:[2,110],136:[2,110]},{5:257,25:[1,5],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,137],6:[2,137],25:[2,137],26:[2,137],47:[2,137],52:[2,137],55:[2,137],71:[2,137],76:[2,137],84:[2,137],89:[2,137],91:[2,137],100:[2,137],101:85,102:[1,63],103:[1,258],104:[1,64],107:86,108:[1,66],109:67,116:[2,137],124:[2,137],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,139],6:[2,139],25:[2,139],26:[2,139],47:[2,139],52:[2,139],55:[2,139],71:[2,139],76:[2,139],84:[2,139],89:[2,139],91:[2,139],100:[2,139],101:85,102:[1,63],103:[1,259],104:[1,64],107:86,108:[1,66],109:67,116:[2,139],124:[2,139],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,145],6:[2,145],25:[2,145],26:[2,145],47:[2,145],52:[2,145],55:[2,145],71:[2,145],76:[2,145],84:[2,145],89:[2,145],91:[2,145],100:[2,145],102:[2,145],103:[2,145],104:[2,145],108:[2,145],116:[2,145],124:[2,145],126:[2,145],127:[2,145],130:[2,145],131:[2,145],132:[2,145],133:[2,145],134:[2,145],135:[2,145]},{1:[2,146],6:[2,146],25:[2,146],26:[2,146],47:[2,146],52:[2,146],55:[2,146],71:[2,146],76:[2,146],84:[2,146],89:[2,146],91:[2,146],100:[2,146],101:85,102:[1,63],103:[2,146],104:[1,64],107:86,108:[1,66],109:67,116:[2,146],124:[2,146],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,150],6:[2,150],25:[2,150],26:[2,150],47:[2,150],52:[2,150],55:[2,150],71:[2,150],76:[2,150],84:[2,150],89:[2,150],91:[2,150],100:[2,150],102:[2,150],103:[2,150],104:[2,150],108:[2,150],116:[2,150],124:[2,150],126:[2,150],127:[2,150],130:[2,150],131:[2,150],132:[2,150],133:[2,150],134:[2,150],135:[2,150]},{114:[2,152],115:[2,152]},{27:188,28:[1,71],57:189,58:190,74:[1,68],88:[1,144],111:260,113:187},{52:[1,261],114:[2,157],115:[2,157]},{52:[2,154],114:[2,154],115:[2,154]},{52:[2,155],114:[2,155],115:[2,155]},{52:[2,156],114:[2,156],115:[2,156]},{1:[2,151],6:[2,151],25:[2,151],26:[2,151],47:[2,151],52:[2,151],55:[2,151],71:[2,151],76:[2,151],84:[2,151],89:[2,151],91:[2,151],100:[2,151],102:[2,151],103:[2,151],104:[2,151],108:[2,151],116:[2,151],124:[2,151],126:[2,151],127:[2,151],130:[2,151],131:[2,151],132:[2,151],133:[2,151],134:[2,151],135:[2,151]},{8:262,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:263,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{6:[2,51],25:[2,51],51:264,52:[1,265],76:[2,51]},{6:[2,88],25:[2,88],26:[2,88],52:[2,88],76:[2,88]},{6:[2,37],25:[2,37],26:[2,37],41:[1,266],52:[2,37],76:[2,37]},{6:[2,40],25:[2,40],26:[2,40],52:[2,40],76:[2,40]},{6:[2,41],25:[2,41],26:[2,41],41:[2,41],52:[2,41],76:[2,41]},{6:[2,42],25:[2,42],26:[2,42],41:[2,42],52:[2,42],76:[2,42]},{6:[2,43],25:[2,43],26:[2,43],41:[2,43],52:[2,43],76:[2,43]},{1:[2,5],6:[2,5],26:[2,5],100:[2,5]},{1:[2,25],6:[2,25],25:[2,25],26:[2,25],47:[2,25],52:[2,25],55:[2,25],71:[2,25],76:[2,25],84:[2,25],89:[2,25],91:[2,25],96:[2,25],97:[2,25],100:[2,25],102:[2,25],103:[2,25],104:[2,25],108:[2,25],116:[2,25],119:[2,25],121:[2,25],124:[2,25],126:[2,25],127:[2,25],130:[2,25],131:[2,25],132:[2,25],133:[2,25],134:[2,25],135:[2,25]},{1:[2,188],6:[2,188],25:[2,188],26:[2,188],47:[2,188],52:[2,188],55:[2,188],71:[2,188],76:[2,188],84:[2,188],89:[2,188],91:[2,188],100:[2,188],101:85,102:[2,188],103:[2,188],104:[2,188],107:86,108:[2,188],109:67,116:[2,188],124:[2,188],126:[2,188],127:[2,188],130:[1,76],131:[1,79],132:[2,188],133:[2,188],134:[2,188],135:[2,188]},{1:[2,189],6:[2,189],25:[2,189],26:[2,189],47:[2,189],52:[2,189],55:[2,189],71:[2,189],76:[2,189],84:[2,189],89:[2,189],91:[2,189],100:[2,189],101:85,102:[2,189],103:[2,189],104:[2,189],107:86,108:[2,189],109:67,116:[2,189],124:[2,189],126:[2,189],127:[2,189],130:[1,76],131:[1,79],132:[2,189],133:[2,189],134:[2,189],135:[2,189]},{1:[2,190],6:[2,190],25:[2,190],26:[2,190],47:[2,190],52:[2,190],55:[2,190],71:[2,190],76:[2,190],84:[2,190],89:[2,190],91:[2,190],100:[2,190],101:85,102:[2,190],103:[2,190],104:[2,190],107:86,108:[2,190],109:67,116:[2,190],124:[2,190],126:[2,190],127:[2,190],130:[1,76],131:[2,190],132:[2,190],133:[2,190],134:[2,190],135:[2,190]},{1:[2,191],6:[2,191],25:[2,191],26:[2,191],47:[2,191],52:[2,191],55:[2,191],71:[2,191],76:[2,191],84:[2,191],89:[2,191],91:[2,191],100:[2,191],101:85,102:[2,191],103:[2,191],104:[2,191],107:86,108:[2,191],109:67,116:[2,191],124:[2,191],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[2,191],133:[2,191],134:[2,191],135:[2,191]},{1:[2,192],6:[2,192],25:[2,192],26:[2,192],47:[2,192],52:[2,192],55:[2,192],71:[2,192],76:[2,192],84:[2,192],89:[2,192],91:[2,192],100:[2,192],101:85,102:[2,192],103:[2,192],104:[2,192],107:86,108:[2,192],109:67,116:[2,192],124:[2,192],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[2,192],134:[2,192],135:[1,83]},{1:[2,193],6:[2,193],25:[2,193],26:[2,193],47:[2,193],52:[2,193],55:[2,193],71:[2,193],76:[2,193],84:[2,193],89:[2,193],91:[2,193],100:[2,193],101:85,102:[2,193],103:[2,193],104:[2,193],107:86,108:[2,193],109:67,116:[2,193],124:[2,193],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[2,193],135:[1,83]},{1:[2,194],6:[2,194],25:[2,194],26:[2,194],47:[2,194],52:[2,194],55:[2,194],71:[2,194],76:[2,194],84:[2,194],89:[2,194],91:[2,194],100:[2,194],101:85,102:[2,194],103:[2,194],104:[2,194],107:86,108:[2,194],109:67,116:[2,194],124:[2,194],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[2,194],134:[2,194],135:[2,194]},{1:[2,179],6:[2,179],25:[2,179],26:[2,179],47:[2,179],52:[2,179],55:[2,179],71:[2,179],76:[2,179],84:[2,179],89:[2,179],91:[2,179],100:[2,179],101:85,102:[1,63],103:[2,179],104:[1,64],107:86,108:[1,66],109:67,116:[2,179],124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,178],6:[2,178],25:[2,178],26:[2,178],47:[2,178],52:[2,178],55:[2,178],71:[2,178],76:[2,178],84:[2,178],89:[2,178],91:[2,178],100:[2,178],101:85,102:[1,63],103:[2,178],104:[1,64],107:86,108:[1,66],109:67,116:[2,178],124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,100],6:[2,100],25:[2,100],26:[2,100],47:[2,100],52:[2,100],55:[2,100],65:[2,100],66:[2,100],67:[2,100],69:[2,100],71:[2,100],72:[2,100],76:[2,100],82:[2,100],83:[2,100],84:[2,100],89:[2,100],91:[2,100],100:[2,100],102:[2,100],103:[2,100],104:[2,100],108:[2,100],116:[2,100],124:[2,100],126:[2,100],127:[2,100],130:[2,100],131:[2,100],132:[2,100],133:[2,100],134:[2,100],135:[2,100]},{1:[2,77],6:[2,77],25:[2,77],26:[2,77],38:[2,77],47:[2,77],52:[2,77],55:[2,77],65:[2,77],66:[2,77],67:[2,77],69:[2,77],71:[2,77],72:[2,77],76:[2,77],78:[2,77],82:[2,77],83:[2,77],84:[2,77],89:[2,77],91:[2,77],100:[2,77],102:[2,77],103:[2,77],104:[2,77],108:[2,77],116:[2,77],124:[2,77],126:[2,77],127:[2,77],128:[2,77],129:[2,77],130:[2,77],131:[2,77],132:[2,77],133:[2,77],134:[2,77],135:[2,77],136:[2,77]},{1:[2,78],6:[2,78],25:[2,78],26:[2,78],38:[2,78],47:[2,78],52:[2,78],55:[2,78],65:[2,78],66:[2,78],67:[2,78],69:[2,78],71:[2,78],72:[2,78],76:[2,78],78:[2,78],82:[2,78],83:[2,78],84:[2,78],89:[2,78],91:[2,78],100:[2,78],102:[2,78],103:[2,78],104:[2,78],108:[2,78],116:[2,78],124:[2,78],126:[2,78],127:[2,78],128:[2,78],129:[2,78],130:[2,78],131:[2,78],132:[2,78],133:[2,78],134:[2,78],135:[2,78],136:[2,78]},{1:[2,79],6:[2,79],25:[2,79],26:[2,79],38:[2,79],47:[2,79],52:[2,79],55:[2,79],65:[2,79],66:[2,79],67:[2,79],69:[2,79],71:[2,79],72:[2,79],76:[2,79],78:[2,79],82:[2,79],83:[2,79],84:[2,79],89:[2,79],91:[2,79],100:[2,79],102:[2,79],103:[2,79],104:[2,79],108:[2,79],116:[2,79],124:[2,79],126:[2,79],127:[2,79],128:[2,79],129:[2,79],130:[2,79],131:[2,79],132:[2,79],133:[2,79],134:[2,79],135:[2,79],136:[2,79]},{71:[1,267]},{55:[1,221],71:[2,84],90:268,91:[1,220],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{71:[2,85]},{8:269,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,71:[2,119],74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{12:[2,113],28:[2,113],30:[2,113],31:[2,113],33:[2,113],34:[2,113],35:[2,113],36:[2,113],43:[2,113],44:[2,113],45:[2,113],49:[2,113],50:[2,113],71:[2,113],74:[2,113],77:[2,113],81:[2,113],86:[2,113],87:[2,113],88:[2,113],94:[2,113],98:[2,113],99:[2,113],102:[2,113],104:[2,113],106:[2,113],108:[2,113],117:[2,113],123:[2,113],125:[2,113],126:[2,113],127:[2,113],128:[2,113],129:[2,113]},{12:[2,114],28:[2,114],30:[2,114],31:[2,114],33:[2,114],34:[2,114],35:[2,114],36:[2,114],43:[2,114],44:[2,114],45:[2,114],49:[2,114],50:[2,114],71:[2,114],74:[2,114],77:[2,114],81:[2,114],86:[2,114],87:[2,114],88:[2,114],94:[2,114],98:[2,114],99:[2,114],102:[2,114],104:[2,114],106:[2,114],108:[2,114],117:[2,114],123:[2,114],125:[2,114],126:[2,114],127:[2,114],128:[2,114],129:[2,114]},{1:[2,83],6:[2,83],25:[2,83],26:[2,83],38:[2,83],47:[2,83],52:[2,83],55:[2,83],65:[2,83],66:[2,83],67:[2,83],69:[2,83],71:[2,83],72:[2,83],76:[2,83],78:[2,83],82:[2,83],83:[2,83],84:[2,83],89:[2,83],91:[2,83],100:[2,83],102:[2,83],103:[2,83],104:[2,83],108:[2,83],116:[2,83],124:[2,83],126:[2,83],127:[2,83],128:[2,83],129:[2,83],130:[2,83],131:[2,83],132:[2,83],133:[2,83],134:[2,83],135:[2,83],136:[2,83]},{1:[2,101],6:[2,101],25:[2,101],26:[2,101],47:[2,101],52:[2,101],55:[2,101],65:[2,101],66:[2,101],67:[2,101],69:[2,101],71:[2,101],72:[2,101],76:[2,101],82:[2,101],83:[2,101],84:[2,101],89:[2,101],91:[2,101],100:[2,101],102:[2,101],103:[2,101],104:[2,101],108:[2,101],116:[2,101],124:[2,101],126:[2,101],127:[2,101],130:[2,101],131:[2,101],132:[2,101],133:[2,101],134:[2,101],135:[2,101]},{1:[2,34],6:[2,34],25:[2,34],26:[2,34],47:[2,34],52:[2,34],55:[2,34],71:[2,34],76:[2,34],84:[2,34],89:[2,34],91:[2,34],100:[2,34],101:85,102:[2,34],103:[2,34],104:[2,34],107:86,108:[2,34],109:67,116:[2,34],124:[2,34],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{8:270,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:271,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,106],6:[2,106],25:[2,106],26:[2,106],47:[2,106],52:[2,106],55:[2,106],65:[2,106],66:[2,106],67:[2,106],69:[2,106],71:[2,106],72:[2,106],76:[2,106],82:[2,106],83:[2,106],84:[2,106],89:[2,106],91:[2,106],100:[2,106],102:[2,106],103:[2,106],104:[2,106],108:[2,106],116:[2,106],124:[2,106],126:[2,106],127:[2,106],130:[2,106],131:[2,106],132:[2,106],133:[2,106],134:[2,106],135:[2,106]},{6:[2,51],25:[2,51],51:272,52:[1,255],84:[2,51]},{6:[2,125],25:[2,125],26:[2,125],52:[2,125],55:[1,273],84:[2,125],89:[2,125],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{48:274,49:[1,58],50:[1,59]},{27:108,28:[1,71],36:[1,113],42:109,53:275,54:106,56:107,57:110,58:111,74:[1,68],87:[1,143],88:[1,144],137:[1,112],138:[1,114],139:[1,115],140:[1,116],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121],146:[1,122],147:[1,123],148:[1,124],149:[1,125],150:[1,126],151:[1,127],152:[1,128],153:[1,129],154:[1,130],155:[1,131],156:[1,132],157:[1,133],158:[1,134],159:[1,135],160:[1,136],161:[1,137],162:[1,138],163:[1,139],164:[1,140],165:[1,141],166:[1,142]},{47:[2,57],52:[2,57]},{8:276,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{47:[2,59],52:[2,59]},{1:[2,195],6:[2,195],25:[2,195],26:[2,195],47:[2,195],52:[2,195],55:[2,195],71:[2,195],76:[2,195],84:[2,195],89:[2,195],91:[2,195],100:[2,195],101:85,102:[2,195],103:[2,195],104:[2,195],107:86,108:[2,195],109:67,116:[2,195],124:[2,195],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{8:277,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,197],6:[2,197],25:[2,197],26:[2,197],47:[2,197],52:[2,197],55:[2,197],71:[2,197],76:[2,197],84:[2,197],89:[2,197],91:[2,197],100:[2,197],101:85,102:[2,197],103:[2,197],104:[2,197],107:86,108:[2,197],109:67,116:[2,197],124:[2,197],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,177],6:[2,177],25:[2,177],26:[2,177],47:[2,177],52:[2,177],55:[2,177],71:[2,177],76:[2,177],84:[2,177],89:[2,177],91:[2,177],100:[2,177],102:[2,177],103:[2,177],104:[2,177],108:[2,177],116:[2,177],124:[2,177],126:[2,177],127:[2,177],130:[2,177],131:[2,177],132:[2,177],133:[2,177],134:[2,177],135:[2,177]},{8:278,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,130],6:[2,130],25:[2,130],26:[2,130],47:[2,130],52:[2,130],55:[2,130],71:[2,130],76:[2,130],84:[2,130],89:[2,130],91:[2,130],96:[1,279],100:[2,130],102:[2,130],103:[2,130],104:[2,130],108:[2,130],116:[2,130],124:[2,130],126:[2,130],127:[2,130],130:[2,130],131:[2,130],132:[2,130],133:[2,130],134:[2,130],135:[2,130]},{5:280,25:[1,5]},{27:281,28:[1,71]},{118:282,120:245,121:[1,246]},{26:[1,283],119:[1,284],120:285,121:[1,246]},{26:[2,170],119:[2,170],121:[2,170]},{8:287,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],93:286,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,94],5:288,6:[2,94],25:[1,5],26:[2,94],47:[2,94],52:[2,94],55:[2,94],71:[2,94],76:[2,94],84:[2,94],89:[2,94],91:[2,94],100:[2,94],101:85,102:[1,63],103:[2,94],104:[1,64],107:86,108:[1,66],109:67,116:[2,94],124:[2,94],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,97],6:[2,97],25:[2,97],26:[2,97],47:[2,97],52:[2,97],55:[2,97],71:[2,97],76:[2,97],84:[2,97],89:[2,97],91:[2,97],100:[2,97],102:[2,97],103:[2,97],104:[2,97],108:[2,97],116:[2,97],124:[2,97],126:[2,97],127:[2,97],130:[2,97],131:[2,97],132:[2,97],133:[2,97],134:[2,97],135:[2,97]},{8:289,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,135],6:[2,135],25:[2,135],26:[2,135],47:[2,135],52:[2,135],55:[2,135],65:[2,135],66:[2,135],67:[2,135],69:[2,135],71:[2,135],72:[2,135],76:[2,135],82:[2,135],83:[2,135],84:[2,135],89:[2,135],91:[2,135],100:[2,135],102:[2,135],103:[2,135],104:[2,135],108:[2,135],116:[2,135],124:[2,135],126:[2,135],127:[2,135],130:[2,135],131:[2,135],132:[2,135],133:[2,135],134:[2,135],135:[2,135]},{6:[1,72],26:[1,290]},{8:291,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{6:[2,64],12:[2,114],25:[2,64],28:[2,114],30:[2,114],31:[2,114],33:[2,114],34:[2,114],35:[2,114],36:[2,114],43:[2,114],44:[2,114],45:[2,114],49:[2,114],50:[2,114],52:[2,64],74:[2,114],77:[2,114],81:[2,114],86:[2,114],87:[2,114],88:[2,114],89:[2,64],94:[2,114],98:[2,114],99:[2,114],102:[2,114],104:[2,114],106:[2,114],108:[2,114],117:[2,114],123:[2,114],125:[2,114],126:[2,114],127:[2,114],128:[2,114],129:[2,114]},{6:[1,293],25:[1,294],89:[1,292]},{6:[2,52],8:229,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[2,52],26:[2,52],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,59:177,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],84:[2,52],86:[1,56],87:[1,57],88:[1,55],89:[2,52],92:295,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{6:[2,51],25:[2,51],26:[2,51],51:296,52:[1,255]},{1:[2,174],6:[2,174],25:[2,174],26:[2,174],47:[2,174],52:[2,174],55:[2,174],71:[2,174],76:[2,174],84:[2,174],89:[2,174],91:[2,174],100:[2,174],102:[2,174],103:[2,174],104:[2,174],108:[2,174],116:[2,174],119:[2,174],124:[2,174],126:[2,174],127:[2,174],130:[2,174],131:[2,174],132:[2,174],133:[2,174],134:[2,174],135:[2,174]},{8:297,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:298,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{114:[2,153],115:[2,153]},{27:188,28:[1,71],57:189,58:190,74:[1,68],88:[1,144],113:299},{1:[2,159],6:[2,159],25:[2,159],26:[2,159],47:[2,159],52:[2,159],55:[2,159],71:[2,159],76:[2,159],84:[2,159],89:[2,159],91:[2,159],100:[2,159],101:85,102:[2,159],103:[1,300],104:[2,159],107:86,108:[2,159],109:67,116:[1,301],124:[2,159],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,160],6:[2,160],25:[2,160],26:[2,160],47:[2,160],52:[2,160],55:[2,160],71:[2,160],76:[2,160],84:[2,160],89:[2,160],91:[2,160],100:[2,160],101:85,102:[2,160],103:[1,302],104:[2,160],107:86,108:[2,160],109:67,116:[2,160],124:[2,160],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{6:[1,304],25:[1,305],76:[1,303]},{6:[2,52],11:197,25:[2,52],26:[2,52],27:198,28:[1,71],29:199,30:[1,69],31:[1,70],39:306,40:196,42:200,44:[1,46],76:[2,52],87:[1,143]},{8:307,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,308],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,82],6:[2,82],25:[2,82],26:[2,82],38:[2,82],47:[2,82],52:[2,82],55:[2,82],65:[2,82],66:[2,82],67:[2,82],69:[2,82],71:[2,82],72:[2,82],76:[2,82],78:[2,82],82:[2,82],83:[2,82],84:[2,82],89:[2,82],91:[2,82],100:[2,82],102:[2,82],103:[2,82],104:[2,82],108:[2,82],116:[2,82],124:[2,82],126:[2,82],127:[2,82],128:[2,82],129:[2,82],130:[2,82],131:[2,82],132:[2,82],133:[2,82],134:[2,82],135:[2,82],136:[2,82]},{8:309,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,71:[2,117],74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{71:[2,118],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,35],6:[2,35],25:[2,35],26:[2,35],47:[2,35],52:[2,35],55:[2,35],71:[2,35],76:[2,35],84:[2,35],89:[2,35],91:[2,35],100:[2,35],101:85,102:[2,35],103:[2,35],104:[2,35],107:86,108:[2,35],109:67,116:[2,35],124:[2,35],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{26:[1,310],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{6:[1,293],25:[1,294],84:[1,311]},{6:[2,64],25:[2,64],26:[2,64],52:[2,64],84:[2,64],89:[2,64]},{5:312,25:[1,5]},{47:[2,55],52:[2,55]},{47:[2,58],52:[2,58],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{26:[1,313],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{5:314,25:[1,5],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{5:315,25:[1,5]},{1:[2,131],6:[2,131],25:[2,131],26:[2,131],47:[2,131],52:[2,131],55:[2,131],71:[2,131],76:[2,131],84:[2,131],89:[2,131],91:[2,131],100:[2,131],102:[2,131],103:[2,131],104:[2,131],108:[2,131],116:[2,131],124:[2,131],126:[2,131],127:[2,131],130:[2,131],131:[2,131],132:[2,131],133:[2,131],134:[2,131],135:[2,131]},{5:316,25:[1,5]},{26:[1,317],119:[1,318],120:285,121:[1,246]},{1:[2,168],6:[2,168],25:[2,168],26:[2,168],47:[2,168],52:[2,168],55:[2,168],71:[2,168],76:[2,168],84:[2,168],89:[2,168],91:[2,168],100:[2,168],102:[2,168],103:[2,168],104:[2,168],108:[2,168],116:[2,168],124:[2,168],126:[2,168],127:[2,168],130:[2,168],131:[2,168],132:[2,168],133:[2,168],134:[2,168],135:[2,168]},{5:319,25:[1,5]},{26:[2,171],119:[2,171],121:[2,171]},{5:320,25:[1,5],52:[1,321]},{25:[2,127],52:[2,127],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,95],6:[2,95],25:[2,95],26:[2,95],47:[2,95],52:[2,95],55:[2,95],71:[2,95],76:[2,95],84:[2,95],89:[2,95],91:[2,95],100:[2,95],102:[2,95],103:[2,95],104:[2,95],108:[2,95],116:[2,95],124:[2,95],126:[2,95],127:[2,95],130:[2,95],131:[2,95],132:[2,95],133:[2,95],134:[2,95],135:[2,95]},{1:[2,98],5:322,6:[2,98],25:[1,5],26:[2,98],47:[2,98],52:[2,98],55:[2,98],71:[2,98],76:[2,98],84:[2,98],89:[2,98],91:[2,98],100:[2,98],101:85,102:[1,63],103:[2,98],104:[1,64],107:86,108:[1,66],109:67,116:[2,98],124:[2,98],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{100:[1,323]},{89:[1,324],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,112],6:[2,112],25:[2,112],26:[2,112],38:[2,112],47:[2,112],52:[2,112],55:[2,112],65:[2,112],66:[2,112],67:[2,112],69:[2,112],71:[2,112],72:[2,112],76:[2,112],82:[2,112],83:[2,112],84:[2,112],89:[2,112],91:[2,112],100:[2,112],102:[2,112],103:[2,112],104:[2,112],108:[2,112],114:[2,112],115:[2,112],116:[2,112],124:[2,112],126:[2,112],127:[2,112],130:[2,112],131:[2,112],132:[2,112],133:[2,112],134:[2,112],135:[2,112]},{8:229,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,59:177,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],92:325,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:229,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,176],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,59:177,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],85:326,86:[1,56],87:[1,57],88:[1,55],92:175,94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{6:[2,121],25:[2,121],26:[2,121],52:[2,121],84:[2,121],89:[2,121]},{6:[1,293],25:[1,294],26:[1,327]},{1:[2,138],6:[2,138],25:[2,138],26:[2,138],47:[2,138],52:[2,138],55:[2,138],71:[2,138],76:[2,138],84:[2,138],89:[2,138],91:[2,138],100:[2,138],101:85,102:[1,63],103:[2,138],104:[1,64],107:86,108:[1,66],109:67,116:[2,138],124:[2,138],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,140],6:[2,140],25:[2,140],26:[2,140],47:[2,140],52:[2,140],55:[2,140],71:[2,140],76:[2,140],84:[2,140],89:[2,140],91:[2,140],100:[2,140],101:85,102:[1,63],103:[2,140],104:[1,64],107:86,108:[1,66],109:67,116:[2,140],124:[2,140],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{114:[2,158],115:[2,158]},{8:328,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:329,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:330,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,86],6:[2,86],25:[2,86],26:[2,86],38:[2,86],47:[2,86],52:[2,86],55:[2,86],65:[2,86],66:[2,86],67:[2,86],69:[2,86],71:[2,86],72:[2,86],76:[2,86],82:[2,86],83:[2,86],84:[2,86],89:[2,86],91:[2,86],100:[2,86],102:[2,86],103:[2,86],104:[2,86],108:[2,86],114:[2,86],115:[2,86],116:[2,86],124:[2,86],126:[2,86],127:[2,86],130:[2,86],131:[2,86],132:[2,86],133:[2,86],134:[2,86],135:[2,86]},{11:197,27:198,28:[1,71],29:199,30:[1,69],31:[1,70],39:331,40:196,42:200,44:[1,46],87:[1,143]},{6:[2,87],11:197,25:[2,87],26:[2,87],27:198,28:[1,71],29:199,30:[1,69],31:[1,70],39:195,40:196,42:200,44:[1,46],52:[2,87],75:332,87:[1,143]},{6:[2,89],25:[2,89],26:[2,89],52:[2,89],76:[2,89]},{6:[2,38],25:[2,38],26:[2,38],52:[2,38],76:[2,38],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{8:333,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{71:[2,116],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,36],6:[2,36],25:[2,36],26:[2,36],47:[2,36],52:[2,36],55:[2,36],71:[2,36],76:[2,36],84:[2,36],89:[2,36],91:[2,36],100:[2,36],102:[2,36],103:[2,36],104:[2,36],108:[2,36],116:[2,36],124:[2,36],126:[2,36],127:[2,36],130:[2,36],131:[2,36],132:[2,36],133:[2,36],134:[2,36],135:[2,36]},{1:[2,107],6:[2,107],25:[2,107],26:[2,107],47:[2,107],52:[2,107],55:[2,107],65:[2,107],66:[2,107],67:[2,107],69:[2,107],71:[2,107],72:[2,107],76:[2,107],82:[2,107],83:[2,107],84:[2,107],89:[2,107],91:[2,107],100:[2,107],102:[2,107],103:[2,107],104:[2,107],108:[2,107],116:[2,107],124:[2,107],126:[2,107],127:[2,107],130:[2,107],131:[2,107],132:[2,107],133:[2,107],134:[2,107],135:[2,107]},{1:[2,47],6:[2,47],25:[2,47],26:[2,47],47:[2,47],52:[2,47],55:[2,47],71:[2,47],76:[2,47],84:[2,47],89:[2,47],91:[2,47],100:[2,47],102:[2,47],103:[2,47],104:[2,47],108:[2,47],116:[2,47],124:[2,47],126:[2,47],127:[2,47],130:[2,47],131:[2,47],132:[2,47],133:[2,47],134:[2,47],135:[2,47]},{1:[2,196],6:[2,196],25:[2,196],26:[2,196],47:[2,196],52:[2,196],55:[2,196],71:[2,196],76:[2,196],84:[2,196],89:[2,196],91:[2,196],100:[2,196],102:[2,196],103:[2,196],104:[2,196],108:[2,196],116:[2,196],124:[2,196],126:[2,196],127:[2,196],130:[2,196],131:[2,196],132:[2,196],133:[2,196],134:[2,196],135:[2,196]},{1:[2,175],6:[2,175],25:[2,175],26:[2,175],47:[2,175],52:[2,175],55:[2,175],71:[2,175],76:[2,175],84:[2,175],89:[2,175],91:[2,175],100:[2,175],102:[2,175],103:[2,175],104:[2,175],108:[2,175],116:[2,175],119:[2,175],124:[2,175],126:[2,175],127:[2,175],130:[2,175],131:[2,175],132:[2,175],133:[2,175],134:[2,175],135:[2,175]},{1:[2,132],6:[2,132],25:[2,132],26:[2,132],47:[2,132],52:[2,132],55:[2,132],71:[2,132],76:[2,132],84:[2,132],89:[2,132],91:[2,132],100:[2,132],102:[2,132],103:[2,132],104:[2,132],108:[2,132],116:[2,132],124:[2,132],126:[2,132],127:[2,132],130:[2,132],131:[2,132],132:[2,132],133:[2,132],134:[2,132],135:[2,132]},{1:[2,133],6:[2,133],25:[2,133],26:[2,133],47:[2,133],52:[2,133],55:[2,133],71:[2,133],76:[2,133],84:[2,133],89:[2,133],91:[2,133],96:[2,133],100:[2,133],102:[2,133],103:[2,133],104:[2,133],108:[2,133],116:[2,133],124:[2,133],126:[2,133],127:[2,133],130:[2,133],131:[2,133],132:[2,133],133:[2,133],134:[2,133],135:[2,133]},{1:[2,166],6:[2,166],25:[2,166],26:[2,166],47:[2,166],52:[2,166],55:[2,166],71:[2,166],76:[2,166],84:[2,166],89:[2,166],91:[2,166],100:[2,166],102:[2,166],103:[2,166],104:[2,166],108:[2,166],116:[2,166],124:[2,166],126:[2,166],127:[2,166],130:[2,166],131:[2,166],132:[2,166],133:[2,166],134:[2,166],135:[2,166]},{5:334,25:[1,5]},{26:[1,335]},{6:[1,336],26:[2,172],119:[2,172],121:[2,172]},{8:337,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{1:[2,99],6:[2,99],25:[2,99],26:[2,99],47:[2,99],52:[2,99],55:[2,99],71:[2,99],76:[2,99],84:[2,99],89:[2,99],91:[2,99],100:[2,99],102:[2,99],103:[2,99],104:[2,99],108:[2,99],116:[2,99],124:[2,99],126:[2,99],127:[2,99],130:[2,99],131:[2,99],132:[2,99],133:[2,99],134:[2,99],135:[2,99]},{1:[2,136],6:[2,136],25:[2,136],26:[2,136],47:[2,136],52:[2,136],55:[2,136],65:[2,136],66:[2,136],67:[2,136],69:[2,136],71:[2,136],72:[2,136],76:[2,136],82:[2,136],83:[2,136],84:[2,136],89:[2,136],91:[2,136],100:[2,136],102:[2,136],103:[2,136],104:[2,136],108:[2,136],116:[2,136],124:[2,136],126:[2,136],127:[2,136],130:[2,136],131:[2,136],132:[2,136],133:[2,136],134:[2,136],135:[2,136]},{1:[2,115],6:[2,115],25:[2,115],26:[2,115],47:[2,115],52:[2,115],55:[2,115],65:[2,115],66:[2,115],67:[2,115],69:[2,115],71:[2,115],72:[2,115],76:[2,115],82:[2,115],83:[2,115],84:[2,115],89:[2,115],91:[2,115],100:[2,115],102:[2,115],103:[2,115],104:[2,115],108:[2,115],116:[2,115],124:[2,115],126:[2,115],127:[2,115],130:[2,115],131:[2,115],132:[2,115],133:[2,115],134:[2,115],135:[2,115]},{6:[2,122],25:[2,122],26:[2,122],52:[2,122],84:[2,122],89:[2,122]},{6:[2,51],25:[2,51],26:[2,51],51:338,52:[1,255]},{6:[2,123],25:[2,123],26:[2,123],52:[2,123],84:[2,123],89:[2,123]},{1:[2,161],6:[2,161],25:[2,161],26:[2,161],47:[2,161],52:[2,161],55:[2,161],71:[2,161],76:[2,161],84:[2,161],89:[2,161],91:[2,161],100:[2,161],101:85,102:[2,161],103:[2,161],104:[2,161],107:86,108:[2,161],109:67,116:[1,339],124:[2,161],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,163],6:[2,163],25:[2,163],26:[2,163],47:[2,163],52:[2,163],55:[2,163],71:[2,163],76:[2,163],84:[2,163],89:[2,163],91:[2,163],100:[2,163],101:85,102:[2,163],103:[1,340],104:[2,163],107:86,108:[2,163],109:67,116:[2,163],124:[2,163],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,162],6:[2,162],25:[2,162],26:[2,162],47:[2,162],52:[2,162],55:[2,162],71:[2,162],76:[2,162],84:[2,162],89:[2,162],91:[2,162],100:[2,162],101:85,102:[2,162],103:[2,162],104:[2,162],107:86,108:[2,162],109:67,116:[2,162],124:[2,162],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{6:[2,90],25:[2,90],26:[2,90],52:[2,90],76:[2,90]},{6:[2,51],25:[2,51],26:[2,51],51:341,52:[1,265]},{26:[1,342],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{26:[1,343]},{1:[2,169],6:[2,169],25:[2,169],26:[2,169],47:[2,169],52:[2,169],55:[2,169],71:[2,169],76:[2,169],84:[2,169],89:[2,169],91:[2,169],100:[2,169],102:[2,169],103:[2,169],104:[2,169],108:[2,169],116:[2,169],124:[2,169],126:[2,169],127:[2,169],130:[2,169],131:[2,169],132:[2,169],133:[2,169],134:[2,169],135:[2,169]},{26:[2,173],119:[2,173],121:[2,173]},{25:[2,128],52:[2,128],101:85,102:[1,63],104:[1,64],107:86,108:[1,66],109:67,124:[1,84],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{6:[1,293],25:[1,294],26:[1,344]},{8:345,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{8:346,9:147,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],57:47,58:48,60:36,62:25,63:26,64:27,74:[1,68],77:[1,43],81:[1,28],86:[1,56],87:[1,57],88:[1,55],94:[1,38],98:[1,44],99:[1,54],101:39,102:[1,63],104:[1,64],105:40,106:[1,65],107:41,108:[1,66],109:67,117:[1,42],122:37,123:[1,62],125:[1,31],126:[1,32],127:[1,33],128:[1,34],129:[1,35]},{6:[1,304],25:[1,305],26:[1,347]},{6:[2,39],25:[2,39],26:[2,39],52:[2,39],76:[2,39]},{1:[2,167],6:[2,167],25:[2,167],26:[2,167],47:[2,167],52:[2,167],55:[2,167],71:[2,167],76:[2,167],84:[2,167],89:[2,167],91:[2,167],100:[2,167],102:[2,167],103:[2,167],104:[2,167],108:[2,167],116:[2,167],124:[2,167],126:[2,167],127:[2,167],130:[2,167],131:[2,167],132:[2,167],133:[2,167],134:[2,167],135:[2,167]},{6:[2,124],25:[2,124],26:[2,124],52:[2,124],84:[2,124],89:[2,124]},{1:[2,164],6:[2,164],25:[2,164],26:[2,164],47:[2,164],52:[2,164],55:[2,164],71:[2,164],76:[2,164],84:[2,164],89:[2,164],91:[2,164],100:[2,164],101:85,102:[2,164],103:[2,164],104:[2,164],107:86,108:[2,164],109:67,116:[2,164],124:[2,164],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{1:[2,165],6:[2,165],25:[2,165],26:[2,165],47:[2,165],52:[2,165],55:[2,165],71:[2,165],76:[2,165],84:[2,165],89:[2,165],91:[2,165],100:[2,165],101:85,102:[2,165],103:[2,165],104:[2,165],107:86,108:[2,165],109:67,116:[2,165],124:[2,165],126:[1,78],127:[1,77],130:[1,76],131:[1,79],132:[1,80],133:[1,81],134:[1,82],135:[1,83]},{6:[2,91],25:[2,91],26:[2,91],52:[2,91],76:[2,91]}],
defaultActions: {58:[2,49],59:[2,50],73:[2,3],92:[2,105],218:[2,85]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
undefined
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
;

      return exports;
    };
    _require["shader-script/rewriter"] = function() {
      var exports = {};
      (function() {
  var BALANCED_PAIRS, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_BLOCK, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, SINGLE_CLOSERS, SINGLE_LINERS, left, rite, _i, _len, _ref,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

  exports.Rewriter = (function() {

    function Rewriter() {}

    Rewriter.prototype.rewrite = function(tokens) {
      this.tokens = tokens;
      this.removeLeadingNewlines();
      this.removeMidExpressionNewlines();
      this.closeOpenCalls();
      this.closeOpenIndexes();
      this.addImplicitIndentation();
      this.tagPostfixConditionals();
      this.addImplicitBraces();
      this.addImplicitParentheses();
      return this.tokens;
    };

    Rewriter.prototype.scanTokens = function(block) {
      var i, token, tokens;
      tokens = this.tokens;
      i = 0;
      while (token = tokens[i]) {
        i += block.call(this, token, i, tokens);
      }
      return true;
    };

    Rewriter.prototype.detectEnd = function(i, condition, action) {
      var levels, token, tokens, _ref, _ref2;
      tokens = this.tokens;
      levels = 0;
      while (token = tokens[i]) {
        if (levels === 0 && condition.call(this, token, i)) {
          return action.call(this, token, i);
        }
        if (!token || levels < 0) return action.call(this, token, i - 1);
        if (_ref = token[0], __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          levels += 1;
        } else if (_ref2 = token[0], __indexOf.call(EXPRESSION_END, _ref2) >= 0) {
          levels -= 1;
        }
        i += 1;
      }
      return i - 1;
    };

    Rewriter.prototype.removeLeadingNewlines = function() {
      var i, tag, _len, _ref;
      _ref = this.tokens;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        tag = _ref[i][0];
        if (tag !== 'TERMINATOR') break;
      }
      if (i) return this.tokens.splice(0, i);
    };

    Rewriter.prototype.removeMidExpressionNewlines = function() {
      return this.scanTokens(function(token, i, tokens) {
        var _ref;
        if (!(token[0] === 'TERMINATOR' && (_ref = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref) >= 0))) {
          return 1;
        }
        tokens.splice(i, 1);
        return 0;
      });
    };

    Rewriter.prototype.closeOpenCalls = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return ((_ref = token[0]) === ')' || _ref === 'CALL_END') || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
      };
      action = function(token, i) {
        return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'CALL_START') this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.closeOpenIndexes = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === ']' || _ref === 'INDEX_END';
      };
      action = function(token, i) {
        return token[0] = 'INDEX_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'INDEX_START') this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.addImplicitBraces = function() {
      var action, condition, sameLine, stack, start, startIndent, startsLine;
      stack = [];
      start = null;
      startsLine = null;
      sameLine = true;
      startIndent = 0;
      condition = function(token, i) {
        var one, tag, three, two, _ref, _ref2;
        _ref = this.tokens.slice(i + 1, (i + 3) + 1 || 9e9), one = _ref[0], two = _ref[1], three = _ref[2];
        if ('HERECOMMENT' === (one != null ? one[0] : void 0)) return false;
        tag = token[0];
        if (__indexOf.call(LINEBREAKS, tag) >= 0) sameLine = false;
        return (((tag === 'TERMINATOR' || tag === 'OUTDENT') || (__indexOf.call(IMPLICIT_END, tag) >= 0 && sameLine)) && ((!startsLine && this.tag(i - 1) !== ',') || !((two != null ? two[0] : void 0) === ':' || (one != null ? one[0] : void 0) === '@' && (three != null ? three[0] : void 0) === ':'))) || (tag === ',' && one && ((_ref2 = one[0]) !== 'IDENTIFIER' && _ref2 !== 'NUMBER' && _ref2 !== 'STRING' && _ref2 !== '@' && _ref2 !== 'TERMINATOR' && _ref2 !== 'OUTDENT'));
      };
      action = function(token, i) {
        var tok;
        tok = this.generate('}', '}', token[2]);
        return this.tokens.splice(i, 0, tok);
      };
      return this.scanTokens(function(token, i, tokens) {
        var ago, idx, prevTag, tag, tok, value, _ref, _ref2;
        if (_ref = (tag = token[0]), __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          stack.push([(tag === 'INDENT' && this.tag(i - 1) === '{' ? '{' : tag), i]);
          return 1;
        }
        if (__indexOf.call(EXPRESSION_END, tag) >= 0) {
          start = stack.pop();
          return 1;
        }
        if (!(tag === ':' && ((ago = this.tag(i - 2)) === ':' || ((_ref2 = stack[stack.length - 1]) != null ? _ref2[0] : void 0) !== '{'))) {
          return 1;
        }
        sameLine = true;
        stack.push(['{']);
        idx = ago === '@' ? i - 2 : i - 1;
        while (this.tag(idx - 2) === 'HERECOMMENT') {
          idx -= 2;
        }
        prevTag = this.tag(idx - 1);
        startsLine = !prevTag || (__indexOf.call(LINEBREAKS, prevTag) >= 0);
        value = new String('{');
        value.generated = true;
        tok = this.generate('{', value, token[2]);
        tokens.splice(idx, 0, tok);
        this.detectEnd(i + 2, condition, action);
        return 2;
      });
    };

    Rewriter.prototype.addImplicitParentheses = function() {
      var action, condition, noCall, seenControl, seenSingle;
      noCall = seenSingle = seenControl = false;
      condition = function(token, i) {
        var post, tag, _ref, _ref2;
        tag = token[0];
        if (!seenSingle && token.fromThen) return true;
        if (tag === 'IF' || tag === 'ELSE' || tag === 'CATCH' || tag === '->' || tag === '=>' || tag === 'CLASS') {
          seenSingle = true;
        }
        if (tag === 'IF' || tag === 'ELSE' || tag === 'SWITCH' || tag === 'TRY' || tag === '=') {
          seenControl = true;
        }
        if ((tag === '.' || tag === '?.' || tag === '::') && this.tag(i - 1) === 'OUTDENT') {
          return true;
        }
        return !token.generated && this.tag(i - 1) !== ',' && (__indexOf.call(IMPLICIT_END, tag) >= 0 || (tag === 'INDENT' && !seenControl)) && (tag !== 'INDENT' || (((_ref = this.tag(i - 2)) !== 'CLASS' && _ref !== 'EXTENDS') && (_ref2 = this.tag(i - 1), __indexOf.call(IMPLICIT_BLOCK, _ref2) < 0) && !((post = this.tokens[i + 1]) && post.generated && post[0] === '{')));
      };
      action = function(token, i) {
        return this.tokens.splice(i, 0, this.generate('CALL_END', ')', token[2]));
      };
      return this.scanTokens(function(token, i, tokens) {
        var callObject, current, next, prev, tag, _ref, _ref2, _ref3;
        tag = token[0];
        if (tag === 'CLASS' || tag === 'IF' || tag === 'FOR' || tag === 'WHILE') {
          noCall = true;
        }
        _ref = tokens.slice(i - 1, (i + 1) + 1 || 9e9), prev = _ref[0], current = _ref[1], next = _ref[2];
        callObject = !noCall && tag === 'INDENT' && next && next.generated && next[0] === '{' && prev && (_ref2 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref2) >= 0);
        seenSingle = false;
        seenControl = false;
        if (__indexOf.call(LINEBREAKS, tag) >= 0) noCall = false;
        if (prev && !prev.spaced && tag === '?') token.call = true;
        if (token.fromThen) return 1;
        if (!(callObject || (prev != null ? prev.spaced : void 0) && (prev.call || (_ref3 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref3) >= 0)) && (__indexOf.call(IMPLICIT_CALL, tag) >= 0 || !(token.spaced || token.newLine) && __indexOf.call(IMPLICIT_UNSPACED_CALL, tag) >= 0))) {
          return 1;
        }
        tokens.splice(i, 0, this.generate('CALL_START', '(', token[2]));
        this.detectEnd(i + 1, condition, action);
        if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
        return 2;
      });
    };

    Rewriter.prototype.addImplicitIndentation = function() {
      var action, condition, indent, outdent, starter;
      starter = indent = outdent = null;
      condition = function(token, i) {
        var _ref;
        return token[1] !== ';' && (_ref = token[0], __indexOf.call(SINGLE_CLOSERS, _ref) >= 0) && !(token[0] === 'ELSE' && (starter !== 'IF' && starter !== 'THEN'));
      };
      action = function(token, i) {
        return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
      };
      return this.scanTokens(function(token, i, tokens) {
        var tag, _ref, _ref2;
        tag = token[0];
        if (tag === 'TERMINATOR' && this.tag(i + 1) === 'THEN') {
          tokens.splice(i, 1);
          return 0;
        }
        if (tag === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
          tokens.splice.apply(tokens, [i, 0].concat(__slice.call(this.indentation(token))));
          return 2;
        }
        if (tag === 'CATCH' && ((_ref = this.tag(i + 2)) === 'OUTDENT' || _ref === 'TERMINATOR' || _ref === 'FINALLY')) {
          tokens.splice.apply(tokens, [i + 2, 0].concat(__slice.call(this.indentation(token))));
          return 4;
        }
        if (__indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
          starter = tag;
          _ref2 = this.indentation(token, true), indent = _ref2[0], outdent = _ref2[1];
          if (starter === 'THEN') indent.fromThen = true;
          tokens.splice(i + 1, 0, indent);
          this.detectEnd(i + 2, condition, action);
          if (tag === 'THEN') tokens.splice(i, 1);
          return 1;
        }
        return 1;
      });
    };

    Rewriter.prototype.tagPostfixConditionals = function() {
      var action, condition, original;
      original = null;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === 'TERMINATOR' || _ref === 'INDENT';
      };
      action = function(token, i) {
        if (token[0] !== 'INDENT' || (token.generated && !token.fromThen)) {
          return original[0] = 'POST_' + original[0];
        }
      };
      return this.scanTokens(function(token, i) {
        if (token[0] !== 'IF') return 1;
        original = token;
        this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.indentation = function(token, implicit) {
      var indent, outdent;
      if (implicit == null) implicit = false;
      indent = ['INDENT', 2, token[2]];
      outdent = ['OUTDENT', 2, token[2]];
      if (implicit) indent.generated = outdent.generated = true;
      return [indent, outdent];
    };

    Rewriter.prototype.generate = function(tag, value, line) {
      var tok;
      tok = [tag, value, line];
      tok.generated = true;
      return tok;
    };

    Rewriter.prototype.tag = function(i) {
      var _ref;
      return (_ref = this.tokens[i]) != null ? _ref[0] : void 0;
    };

    return Rewriter;

  })();

  BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END']];

  exports.INVERSES = INVERSES = {};

  EXPRESSION_START = [];

  EXPRESSION_END = [];

  for (_i = 0, _len = BALANCED_PAIRS.length; _i < _len; _i++) {
    _ref = BALANCED_PAIRS[_i], left = _ref[0], rite = _ref[1];
    EXPRESSION_START.push(INVERSES[rite] = left);
    EXPRESSION_END.push(INVERSES[left] = rite);
  }

  EXPRESSION_CLOSE = ['CATCH', 'WHEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'UNARY', 'SUPER', '@', '->', '=>', '[', '(', '{', '--', '++'];

  IMPLICIT_UNSPACED_CALL = ['+', '-'];

  IMPLICIT_BLOCK = ['->', '=>', '{', '[', ','];

  IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

  SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];

  SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

  LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

}).call(this);

      return exports;
    };
    _require["shader-script/scope"] = function() {
      var exports = {};
      (function() {
  var Definition, NameRegistry, Scope;

  NameRegistry = require('shader-script/name_registry').NameRegistry;

  exports.Definition = Definition = require('shader-script/definition').Definition;

  exports.Scope = Scope = (function() {

    function Scope(name, parent) {
      this.name = name != null ? name : "root";
      this.parent = parent != null ? parent : null;
      this.subscopes = {};
      this.definitions = {};
      this.registry = new NameRegistry();
    }

    Scope.prototype.all_qualifiers = function() {
      var id, result, subscope, _ref;
      result = [this.qualifier(false)];
      _ref = this.subscopes;
      for (id in _ref) {
        subscope = _ref[id];
        result = result.concat(subscope.all_qualifiers());
      }
      return result;
    };

    Scope.prototype.all_definitions = function() {
      var arr, array, def, id, name, qualifier, result, sub, subscope, _ref, _ref2;
      result = {};
      arr = result[this.qualifier(false)] = [];
      _ref = this.definitions;
      for (name in _ref) {
        def = _ref[name];
        arr.push(def.qualified_name);
      }
      _ref2 = this.subscopes;
      for (id in _ref2) {
        subscope = _ref2[id];
        sub = subscope.all_definitions();
        for (qualifier in sub) {
          array = sub[qualifier];
          result[qualifier] = array;
        }
      }
      return result;
    };

    Scope.prototype.qualifier = function(delegate_to_subscope) {
      var prefix;
      if (delegate_to_subscope == null) delegate_to_subscope = true;
      if (this.current_subscope && delegate_to_subscope) {
        return this.current_subscope.qualifier();
      } else {
        prefix = this.parent ? this.parent.qualifier(false) + "." : "";
        return prefix + this.name;
      }
    };

    Scope.prototype.push = function(name) {
      if (this.current_subscope) {
        return this.assume(this.current_subscope.push(name));
      } else {
        return this.assume(this.subscopes[this.registry.define(name)] = new Scope(name, this));
      }
    };

    Scope.prototype.pop = function() {
      if (this.current_subscope) {
        return this.current_subscope.pop();
      } else if (this.parent) {
        return this.parent.assume(this.parent);
      } else {
        return this;
      }
    };

    Scope.prototype.assume = function(subscope) {
      if (subscope === this) {
        this.current_subscope = null;
      } else {
        this.current_subscope = subscope;
      }
      if (this.parent) this.parent.assume(subscope);
      return this.current_subscope || this;
    };

    Scope.prototype.define = function(name, options) {
      if (options == null) options = {};
      return this.delegate(function() {
        return this.define_within(name, options);
      });
    };

    Scope.prototype.define_within = function(name, options) {
      var def;
      if (options == null) options = {};
      options.name || (options.name = name);
      def = this.lookup(name, true);
      if (def) {
        def.assign(options);
      } else {
        options.qualified_name = this.qualifier() + "." + name;
        def = new Definition(options);
      }
      return this.definitions[name] = def;
    };

    Scope.prototype.current = function() {
      return this.delegate(function() {
        return this;
      });
    };

    Scope.prototype.find = function(name) {
      var qualifiers, scope_name, subscope;
      if (name instanceof Array) {
        qualifiers = name;
      } else {
        qualifiers = name.split(/\./);
      }
      if (qualifiers.length === 1) {
        return this.definitions[qualifiers[0]] || this.find_subscope(qualifiers[0]);
      } else {
        scope_name = qualifiers.shift();
        if (subscope = this.find_subscope(scope_name)) {
          return subscope.find(qualifiers);
        } else {
          if (scope_name === ("" + this.name)) return this.find(qualifiers);
        }
      }
      return null;
    };

    Scope.prototype.find_subscope = function(scope_name) {
      var id, subscope, _ref;
      _ref = this.subscopes;
      for (id in _ref) {
        subscope = _ref[id];
        if (subscope.name === scope_name) return subscope;
      }
    };

    Scope.prototype.lookup = function(name, silent) {
      if (silent == null) silent = false;
      return this.delegate(function() {
        var result, target;
        target = this;
        while (target) {
          if (result = target.find(name)) return result;
          target = target.parent;
        }
        if (silent) {
          return null;
        } else {
          throw new Error("Variable '" + name + "' is not defined in this scope");
        }
      });
    };

    Scope.prototype.delegate = function(callback) {
      return callback.call(this.current_subscope || this);
    };

    return Scope;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/shader"] = function() {
      var exports = {};
      (function() {
  var Program, Scope;

  Scope = require('shader-script/scope').Scope;

  Program = require('shader-script/glsl/program').Program;

  exports.Shader = (function() {

    function Shader(state) {
      var builtins, definition, name, varname, _ref;
      this.scope = state.scope || (state.scope = new Scope());
      this.functions = {};
      this.fn_args = {};
      _ref = Program.prototype.builtins._variables;
      for (name in _ref) {
        builtins = _ref[name];
        for (varname in builtins) {
          definition = builtins[varname];
          this.scope.define_within(varname, definition.as_options());
        }
      }
    }

    Shader.prototype.define_function = function(name, return_variable, callback) {
      var args, _i, _len, _ref, _results;
      this.functions[name] = {
        return_variable: return_variable,
        callback: callback
      };
      if (this.fn_args[name]) {
        _ref = this.fn_args[name];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          args = _ref[_i];
          _results.push(callback(args));
        }
        return _results;
      }
    };

    Shader.prototype.mark_function = function(name, args, dependent_variable) {
      var builtin, _base;
      if (dependent_variable == null) dependent_variable = null;
      if (this.functions[name]) {
        this.functions[name].callback(args);
        if (dependent_variable) {
          return dependent_variable.add_dependent(this.functions[name].return_variable);
        }
      } else if (builtin = Program.prototype.builtins[name]) {
        if (dependent_variable) {
          if (builtin.return_type()) {
            return dependent_variable.set_type(builtin.return_type());
          } else {
            if (args.length) {
              if (typeof args[0] === 'string') {
                return dependent_variable.set_type(args[0]);
              } else {
                return dependent_variable.add_dependent(args[0]);
              }
            }
          }
        }
      } else {
        (_base = this.fn_args)[name] || (_base[name] = []);
        return this.fn_args[name].push(args);
      }
    };

    return Shader;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/simulator"] = function() {
      var exports = {};
      (function() {
  var Glsl, Program, Simulator;

  Glsl = require('shader-script/glsl');

  Program = require('shader-script/glsl/program').Program;

  exports.Simulator = Simulator = (function() {
    var assign_builtin_variables, compile_program;

    assign_builtin_variables = function(name, program) {
      var builtins, definition, _results;
      builtins = program.builtins._variables[name];
      _results = [];
      for (name in builtins) {
        definition = builtins[name];
        _results.push(program.state.scope.define(name, definition.as_options()));
      }
      return _results;
    };

    compile_program = function(type, state, source_code) {
      var program;
      program = new Program(state);
      assign_builtin_variables('common', program);
      assign_builtin_variables(type, program);
      program = Glsl.compile(source_code, program);
      return program;
    };

    function Simulator(glsl) {
      this.state = {};
      if (glsl.vertex) {
        this.vertex = compile_program('vertex', this.state, glsl.vertex);
      }
      if (glsl.fragment) {
        this.fragment = compile_program('fragment', this.state, glsl.fragment);
      }
      if (!(this.vertex || this.fragment)) throw new Error("No programs found!");
    }

    Simulator.prototype.start = function(which) {
      var program;
      if (which == null) which = 'both';
      switch (which) {
        case 'both':
          if (this.vertex) this.start('vertex');
          if (this.fragment) this.start('fragment');
          break;
        default:
          program = this[which];
          if (!program) throw new Error("No " + which + " program found!");
          this.run_program(which, program);
      }
      return this;
    };

    Simulator.prototype.run_program = function(name, program) {
      try {
        return program.invoke('main');
      } catch (err) {
        err.message = "" + name + ": " + err.message;
        throw err;
      }
    };

    return Simulator;

  })();

}).call(this);

      return exports;
    };
  
  global.ShaderScript = require("shader-script");
})(this);
