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
      o('Return TERMINATOR'), o('FunctionDefinition'), o('Comment'), o('FunctionDeclaration TERMINATOR'), o('VariableDeclaration TERMINATOR'), o('STATEMENT TERMINATOR', function() {
        return new Literal($1);
      }), o('TERMINATOR', function() {
        return {
          compile: function() {
            return null;
          }
        };
      })
    ],
    Comment: [
      o('HERECOMMENT', function() {
        return new Comment($1);
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

  COMMENT = /\/\*(.|[\r\n])*?\*\/|(\/\/[^\r\n]*)/;

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
    Op: 'op',
    Comment: 'comment'
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
      var child, lines, qual, _i, _len, _ref, _result,
        _this = this;
      if (this.children.length > 1) throw new Error("too many children");
      program.state.scope.push('block');
      lines = [];
      qual = program.state.scope.qualifier();
      if (this.lines) {
        _ref = this.lines;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _result = child.compile(program);
          if (_result !== null) {
            lines.push(_result);
            if (qual === 'root.block') program.nodes.push(_result);
          }
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
    _require["shader-script/glsl/nodes/comment"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Comment = (function(_super) {

    __extends(Comment, _super);

    function Comment() {
      Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.prototype.name = '_comment';

    Comment.prototype.children = function() {
      return ['comment'];
    };

    Comment.prototype.compile = function(program) {
      var _this = this;
      return {
        execute: function() {},
        is_comment: true,
        toSource: function() {
          if (_this.comment.indexOf("\n") !== -1) {
            return "/*\n  " + (_this.comment.trim().replace(/\n/g, '\n  ')) + "\n*/";
          } else {
            return "// " + _this.comment;
          }
        }
      };
    };

    return Comment;

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
            is_function: true,
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
        is_function: true,
        name: compiled_name,
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

    Identifier.prototype.cast = function(type, program) {
      var current_type;
      current_type = this.type(program);
      if (type === null || type === void 0) return;
      if (type === current_type) return;
      if (current_type) {
        throw new Error("Cannot implicitly cast " + current_type + " to " + type);
      }
      return this.variable(program).set_type(type);
    };

    Identifier.prototype.variable = function(program) {
      if (this.children[0] instanceof Definition) {
        return this.children[0];
      } else {
        return program.state.scope.lookup(this.toVariableName());
      }
    };

    Identifier.prototype.type = function(program) {
      return this.variable(program).type();
    };

    Identifier.prototype.compile = function(program) {
      var variable,
        _this = this;
      variable = this.variable(program);
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

    Literal.prototype.cast = function(type) {
      var current_type;
      if (type === null || type === void 0) return this.explicit_type = type;
      current_type = this.type();
      if (current_type === type) return;
      if (current_type === 'float') {
        if (type === 'int') {
          if (/\.[^0]+$/.test(this.children[0])) {
            throw new Error("Cannot cast non-integer float to integer type");
          }
        } else if (current_type !== type) {
          throw new Error("Cannot cast " + current_type + " to " + type);
        }
      } else if (current_type !== type) {
        throw new Error("Cannot cast " + current_type + " to " + type);
      }
      return this.explicit_type = type;
    };

    Literal.prototype.type = function() {
      if (this.explicit_type) return this.explicit_type;
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

    function TypeConstructor() {
      TypeConstructor.__super__.constructor.apply(this, arguments);
    }

    TypeConstructor.prototype.name = "_type_constructor";

    TypeConstructor.prototype.children = function() {
      return ['cast_type', 'arguments'];
    };

    TypeConstructor.prototype.cast = function(type, shader) {
      if (!type) {}
    };

    TypeConstructor.prototype.type = function(shader) {
      if (typeof this.cast_type === 'string') {
        return this.cast_type;
      } else {
        return this.cast_type.type(shader);
      }
    };

    TypeConstructor.prototype.compile = function(program) {
      var arg, compiled_args,
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
          return "" + (_this.type()) + "(" + (((function() {
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

    Value.prototype.cast = function(type, program) {
      return this.children[0].cast(type, program);
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
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"{":10,"}":11,"Identifier":12,"Assign":13,"Call":14,"Literal":15,"TypeConstructor":16,"FunctionCall":17,"Operation":18,"Return":19,"FunctionDefinition":20,"Comment":21,"FunctionDeclaration":22,"VariableDeclaration":23,"STATEMENT":24,"HERECOMMENT":25,"Type":26,"CALL_START":27,"ArgumentDefs":28,")":29,",":30,"ArgumentList":31,"(":32,"Arguments":33,"=":34,"IDENTIFIER":35,"NUMBER":36,"RETURN":37,"VOID":38,"BOOL":39,"INT":40,"FLOAT":41,"VEC2":42,"VEC3":43,"VEC4":44,"BVEC2":45,"BVEC3":46,"BVEC4":47,"IVEC2":48,"IVEC3":49,"IVEC4":50,"MAT2":51,"MAT3":52,"MAT4":53,"MAT2X2":54,"MAT2X3":55,"MAT2X4":56,"MAT3X2":57,"MAT3X3":58,"MAT3X4":59,"MAT4X2":60,"MAT4X3":61,"MAT4X4":62,"SAMPLER1D":63,"SAMPLER2D":64,"SAMPLER3D":65,"SAMPLERCUBE":66,"SAMPLER1DSHADOW":67,"SAMPLER2DSHADOW":68,"UNARY":69,"-":70,"+":71,"--":72,"SimpleAssignable":73,"++":74,"?":75,"MATH":76,"SHIFT":77,"COMPARE":78,"LOGIC":79,"RELATION":80,"COMPOUND_ASSIGN":81,"INDENT":82,"OUTDENT":83,"EXTENDS":84,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",10:"{",11:"}",14:"Call",22:"FunctionDeclaration",24:"STATEMENT",25:"HERECOMMENT",27:"CALL_START",29:")",30:",",32:"(",34:"=",35:"IDENTIFIER",36:"NUMBER",37:"RETURN",38:"VOID",39:"BOOL",40:"INT",41:"FLOAT",42:"VEC2",43:"VEC3",44:"VEC4",45:"BVEC2",46:"BVEC3",47:"BVEC4",48:"IVEC2",49:"IVEC3",50:"IVEC4",51:"MAT2",52:"MAT3",53:"MAT4",54:"MAT2X2",55:"MAT2X3",56:"MAT2X4",57:"MAT3X2",58:"MAT3X3",59:"MAT3X4",60:"MAT4X2",61:"MAT4X3",62:"MAT4X4",63:"SAMPLER1D",64:"SAMPLER2D",65:"SAMPLER3D",66:"SAMPLERCUBE",67:"SAMPLER1DSHADOW",68:"SAMPLER2DSHADOW",69:"UNARY",70:"-",71:"+",72:"--",73:"SimpleAssignable",74:"++",75:"?",76:"MATH",77:"SHIFT",78:"COMPARE",79:"LOGIC",80:"RELATION",81:"COMPOUND_ASSIGN",82:"INDENT",83:"OUTDENT",84:"EXTENDS"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,2],[7,2],[7,1],[5,2],[5,3],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[9,2],[9,1],[9,1],[9,2],[9,2],[9,2],[9,1],[21,1],[23,2],[20,6],[20,5],[28,2],[28,4],[31,3],[31,3],[31,2],[31,2],[33,1],[33,3],[17,2],[13,3],[12,1],[15,1],[16,2],[19,1],[19,2],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[26,1],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,2],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,3],[18,5],[18,3]],
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
case 18:this.$ = $$[$0];
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
case 24:this.$ = new yy.Comment($$[$0]);
break;
case 25:this.$ = new yy.Variable($$[$0-1], $$[$0]);
break;
case 26:this.$ = new yy.Function($$[$0-5], $$[$0-4], $$[$0-2], $$[$0]);
break;
case 27:this.$ = new yy.Function($$[$0-4], $$[$0-3], [], $$[$0]);
break;
case 28:this.$ = [new yy.Variable($$[$0-1], $$[$0])];
break;
case 29:this.$ = $$[$0-3].concat([new yy.Variable($$[$0-1], $$[$0])]);
break;
case 30:this.$ = $$[$0-1];
break;
case 31:this.$ = $$[$0-1];
break;
case 32:this.$ = [];
break;
case 33:this.$ = [];
break;
case 34:this.$ = [$$[$0]];
break;
case 35:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 36:this.$ = new yy.Call($$[$0-1], $$[$0]);
break;
case 37:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 38:this.$ = new yy.Identifier($$[$0]);
break;
case 39:this.$ = new yy.Literal($$[$0]);
break;
case 40:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
case 41:this.$ = new yy.Return;
break;
case 42:this.$ = new yy.Return($$[$0]);
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
case 73:this.$ = $$[$0];
break;
case 74:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 75:this.$ = new yy.Op('-', $$[$0]);
break;
case 76:this.$ = new yy.Op('+', $$[$0]);
break;
case 77:this.$ = new yy.Op('--', $$[$0]);
break;
case 78:this.$ = new yy.Op('++', $$[$0]);
break;
case 79:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 80:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 81:this.$ = new yy.Existence($$[$0-1]);
break;
case 82:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 83:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 84:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 85:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 86:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 87:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 88:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 89:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 90:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 91:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,6:[1,21],7:4,8:6,9:7,10:[1,5],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:[1,18],23:19,24:[1,20],25:[1,32],26:24,35:[1,22],36:[1,23],37:[1,31],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{1:[3]},{1:[2,2],6:[1,21],7:64,8:6,9:7,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:[1,18],23:19,24:[1,20],25:[1,32],26:24,35:[1,22],36:[1,23],37:[1,31],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{6:[1,65]},{1:[2,4],6:[2,4],11:[2,4],14:[2,4],22:[2,4],24:[2,4],25:[2,4],35:[2,4],36:[2,4],37:[2,4],38:[2,4],39:[2,4],40:[2,4],41:[2,4],42:[2,4],43:[2,4],44:[2,4],45:[2,4],46:[2,4],47:[2,4],48:[2,4],49:[2,4],50:[2,4],51:[2,4],52:[2,4],53:[2,4],54:[2,4],55:[2,4],56:[2,4],57:[2,4],58:[2,4],59:[2,4],60:[2,4],61:[2,4],62:[2,4],63:[2,4],64:[2,4],65:[2,4],66:[2,4],67:[2,4],68:[2,4],69:[2,4],70:[2,4],71:[2,4],72:[2,4],73:[2,4],74:[2,4]},{4:67,6:[1,21],7:4,8:6,9:7,11:[1,66],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:[1,18],23:19,24:[1,20],25:[1,32],26:24,35:[1,22],36:[1,23],37:[1,31],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{6:[1,68],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76]},{1:[2,7],6:[2,7],11:[2,7],14:[2,7],22:[2,7],24:[2,7],25:[2,7],35:[2,7],36:[2,7],37:[2,7],38:[2,7],39:[2,7],40:[2,7],41:[2,7],42:[2,7],43:[2,7],44:[2,7],45:[2,7],46:[2,7],47:[2,7],48:[2,7],49:[2,7],50:[2,7],51:[2,7],52:[2,7],53:[2,7],54:[2,7],55:[2,7],56:[2,7],57:[2,7],58:[2,7],59:[2,7],60:[2,7],61:[2,7],62:[2,7],63:[2,7],64:[2,7],65:[2,7],66:[2,7],67:[2,7],68:[2,7],69:[2,7],70:[2,7],71:[2,7],72:[2,7],73:[2,7],74:[2,7]},{6:[2,10],27:[1,80],29:[2,10],30:[2,10],31:78,32:[1,79],34:[1,77],70:[2,10],71:[2,10],75:[2,10],76:[2,10],77:[2,10],78:[2,10],79:[2,10],80:[2,10],83:[2,10]},{6:[2,11],29:[2,11],30:[2,11],70:[2,11],71:[2,11],75:[2,11],76:[2,11],77:[2,11],78:[2,11],79:[2,11],80:[2,11],83:[2,11]},{6:[2,12],29:[2,12],30:[2,12],70:[2,12],71:[2,12],75:[2,12],76:[2,12],77:[2,12],78:[2,12],79:[2,12],80:[2,12],83:[2,12]},{6:[2,13],29:[2,13],30:[2,13],70:[2,13],71:[2,13],75:[2,13],76:[2,13],77:[2,13],78:[2,13],79:[2,13],80:[2,13],83:[2,13]},{6:[2,14],29:[2,14],30:[2,14],70:[2,14],71:[2,14],75:[2,14],76:[2,14],77:[2,14],78:[2,14],79:[2,14],80:[2,14],83:[2,14]},{6:[2,15],29:[2,15],30:[2,15],70:[2,15],71:[2,15],75:[2,15],76:[2,15],77:[2,15],78:[2,15],79:[2,15],80:[2,15],83:[2,15]},{6:[2,16],29:[2,16],30:[2,16],70:[2,16],71:[2,16],75:[2,16],76:[2,16],77:[2,16],78:[2,16],79:[2,16],80:[2,16],83:[2,16]},{6:[1,81]},{1:[2,18],6:[2,18],11:[2,18],14:[2,18],22:[2,18],24:[2,18],25:[2,18],35:[2,18],36:[2,18],37:[2,18],38:[2,18],39:[2,18],40:[2,18],41:[2,18],42:[2,18],43:[2,18],44:[2,18],45:[2,18],46:[2,18],47:[2,18],48:[2,18],49:[2,18],50:[2,18],51:[2,18],52:[2,18],53:[2,18],54:[2,18],55:[2,18],56:[2,18],57:[2,18],58:[2,18],59:[2,18],60:[2,18],61:[2,18],62:[2,18],63:[2,18],64:[2,18],65:[2,18],66:[2,18],67:[2,18],68:[2,18],69:[2,18],70:[2,18],71:[2,18],72:[2,18],73:[2,18],74:[2,18]},{1:[2,19],6:[2,19],11:[2,19],14:[2,19],22:[2,19],24:[2,19],25:[2,19],35:[2,19],36:[2,19],37:[2,19],38:[2,19],39:[2,19],40:[2,19],41:[2,19],42:[2,19],43:[2,19],44:[2,19],45:[2,19],46:[2,19],47:[2,19],48:[2,19],49:[2,19],50:[2,19],51:[2,19],52:[2,19],53:[2,19],54:[2,19],55:[2,19],56:[2,19],57:[2,19],58:[2,19],59:[2,19],60:[2,19],61:[2,19],62:[2,19],63:[2,19],64:[2,19],65:[2,19],66:[2,19],67:[2,19],68:[2,19],69:[2,19],70:[2,19],71:[2,19],72:[2,19],73:[2,19],74:[2,19]},{6:[1,82]},{6:[1,83]},{6:[1,84]},{1:[2,23],6:[2,23],11:[2,23],14:[2,23],22:[2,23],24:[2,23],25:[2,23],35:[2,23],36:[2,23],37:[2,23],38:[2,23],39:[2,23],40:[2,23],41:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23],47:[2,23],48:[2,23],49:[2,23],50:[2,23],51:[2,23],52:[2,23],53:[2,23],54:[2,23],55:[2,23],56:[2,23],57:[2,23],58:[2,23],59:[2,23],60:[2,23],61:[2,23],62:[2,23],63:[2,23],64:[2,23],65:[2,23],66:[2,23],67:[2,23],68:[2,23],69:[2,23],70:[2,23],71:[2,23],72:[2,23],73:[2,23],74:[2,23]},{6:[2,38],27:[2,38],29:[2,38],30:[2,38],32:[2,38],34:[2,38],70:[2,38],71:[2,38],75:[2,38],76:[2,38],77:[2,38],78:[2,38],79:[2,38],80:[2,38],83:[2,38]},{6:[2,39],29:[2,39],30:[2,39],70:[2,39],71:[2,39],75:[2,39],76:[2,39],77:[2,39],78:[2,39],79:[2,39],80:[2,39],83:[2,39]},{12:86,27:[1,80],31:85,32:[1,79],35:[1,22]},{8:87,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:89,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:90,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{73:[1,91]},{73:[1,92]},{72:[1,93],74:[1,94],81:[1,95],84:[1,96]},{6:[2,41],8:97,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{1:[2,24],6:[2,24],11:[2,24],14:[2,24],22:[2,24],24:[2,24],25:[2,24],35:[2,24],36:[2,24],37:[2,24],38:[2,24],39:[2,24],40:[2,24],41:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24],47:[2,24],48:[2,24],49:[2,24],50:[2,24],51:[2,24],52:[2,24],53:[2,24],54:[2,24],55:[2,24],56:[2,24],57:[2,24],58:[2,24],59:[2,24],60:[2,24],61:[2,24],62:[2,24],63:[2,24],64:[2,24],65:[2,24],66:[2,24],67:[2,24],68:[2,24],69:[2,24],70:[2,24],71:[2,24],72:[2,24],73:[2,24],74:[2,24]},{27:[2,43],32:[2,43],35:[2,43]},{27:[2,44],32:[2,44],35:[2,44]},{27:[2,45],32:[2,45],35:[2,45]},{27:[2,46],32:[2,46],35:[2,46]},{27:[2,47],32:[2,47],35:[2,47]},{27:[2,48],32:[2,48],35:[2,48]},{27:[2,49],32:[2,49],35:[2,49]},{27:[2,50],32:[2,50],35:[2,50]},{27:[2,51],32:[2,51],35:[2,51]},{27:[2,52],32:[2,52],35:[2,52]},{27:[2,53],32:[2,53],35:[2,53]},{27:[2,54],32:[2,54],35:[2,54]},{27:[2,55],32:[2,55],35:[2,55]},{27:[2,56],32:[2,56],35:[2,56]},{27:[2,57],32:[2,57],35:[2,57]},{27:[2,58],32:[2,58],35:[2,58]},{27:[2,59],32:[2,59],35:[2,59]},{27:[2,60],32:[2,60],35:[2,60]},{27:[2,61],32:[2,61],35:[2,61]},{27:[2,62],32:[2,62],35:[2,62]},{27:[2,63],32:[2,63],35:[2,63]},{27:[2,64],32:[2,64],35:[2,64]},{27:[2,65],32:[2,65],35:[2,65]},{27:[2,66],32:[2,66],35:[2,66]},{27:[2,67],32:[2,67],35:[2,67]},{27:[2,68],32:[2,68],35:[2,68]},{27:[2,69],32:[2,69],35:[2,69]},{27:[2,70],32:[2,70],35:[2,70]},{27:[2,71],32:[2,71],35:[2,71]},{27:[2,72],32:[2,72],35:[2,72]},{27:[2,73],32:[2,73],35:[2,73]},{1:[2,5],6:[2,5],11:[2,5],14:[2,5],22:[2,5],24:[2,5],25:[2,5],35:[2,5],36:[2,5],37:[2,5],38:[2,5],39:[2,5],40:[2,5],41:[2,5],42:[2,5],43:[2,5],44:[2,5],45:[2,5],46:[2,5],47:[2,5],48:[2,5],49:[2,5],50:[2,5],51:[2,5],52:[2,5],53:[2,5],54:[2,5],55:[2,5],56:[2,5],57:[2,5],58:[2,5],59:[2,5],60:[2,5],61:[2,5],62:[2,5],63:[2,5],64:[2,5],65:[2,5],66:[2,5],67:[2,5],68:[2,5],69:[2,5],70:[2,5],71:[2,5],72:[2,5],73:[2,5],74:[2,5]},{1:[2,3]},{1:[2,8],6:[2,8],11:[2,8],14:[2,8],22:[2,8],24:[2,8],25:[2,8],35:[2,8],36:[2,8],37:[2,8],38:[2,8],39:[2,8],40:[2,8],41:[2,8],42:[2,8],43:[2,8],44:[2,8],45:[2,8],46:[2,8],47:[2,8],48:[2,8],49:[2,8],50:[2,8],51:[2,8],52:[2,8],53:[2,8],54:[2,8],55:[2,8],56:[2,8],57:[2,8],58:[2,8],59:[2,8],60:[2,8],61:[2,8],62:[2,8],63:[2,8],64:[2,8],65:[2,8],66:[2,8],67:[2,8],68:[2,8],69:[2,8],70:[2,8],71:[2,8],72:[2,8],73:[2,8],74:[2,8]},{6:[1,21],7:64,8:6,9:7,11:[1,98],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:[1,18],23:19,24:[1,20],25:[1,32],26:24,35:[1,22],36:[1,23],37:[1,31],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{1:[2,6],6:[2,6],11:[2,6],14:[2,6],22:[2,6],24:[2,6],25:[2,6],35:[2,6],36:[2,6],37:[2,6],38:[2,6],39:[2,6],40:[2,6],41:[2,6],42:[2,6],43:[2,6],44:[2,6],45:[2,6],46:[2,6],47:[2,6],48:[2,6],49:[2,6],50:[2,6],51:[2,6],52:[2,6],53:[2,6],54:[2,6],55:[2,6],56:[2,6],57:[2,6],58:[2,6],59:[2,6],60:[2,6],61:[2,6],62:[2,6],63:[2,6],64:[2,6],65:[2,6],66:[2,6],67:[2,6],68:[2,6],69:[2,6],70:[2,6],71:[2,6],72:[2,6],73:[2,6],74:[2,6]},{6:[2,81],29:[2,81],30:[2,81],70:[2,81],71:[2,81],75:[2,81],76:[2,81],77:[2,81],78:[2,81],79:[2,81],80:[2,81],83:[2,81]},{8:99,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:100,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:101,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:102,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:103,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:104,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:105,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:106,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{6:[2,36],29:[2,36],30:[2,36],70:[2,36],71:[2,36],75:[2,36],76:[2,36],77:[2,36],78:[2,36],79:[2,36],80:[2,36],83:[2,36]},{8:109,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,29:[1,108],33:107,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{8:109,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,29:[1,111],33:110,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{1:[2,17],6:[2,17],11:[2,17],14:[2,17],22:[2,17],24:[2,17],25:[2,17],35:[2,17],36:[2,17],37:[2,17],38:[2,17],39:[2,17],40:[2,17],41:[2,17],42:[2,17],43:[2,17],44:[2,17],45:[2,17],46:[2,17],47:[2,17],48:[2,17],49:[2,17],50:[2,17],51:[2,17],52:[2,17],53:[2,17],54:[2,17],55:[2,17],56:[2,17],57:[2,17],58:[2,17],59:[2,17],60:[2,17],61:[2,17],62:[2,17],63:[2,17],64:[2,17],65:[2,17],66:[2,17],67:[2,17],68:[2,17],69:[2,17],70:[2,17],71:[2,17],72:[2,17],73:[2,17],74:[2,17]},{1:[2,20],6:[2,20],11:[2,20],14:[2,20],22:[2,20],24:[2,20],25:[2,20],35:[2,20],36:[2,20],37:[2,20],38:[2,20],39:[2,20],40:[2,20],41:[2,20],42:[2,20],43:[2,20],44:[2,20],45:[2,20],46:[2,20],47:[2,20],48:[2,20],49:[2,20],50:[2,20],51:[2,20],52:[2,20],53:[2,20],54:[2,20],55:[2,20],56:[2,20],57:[2,20],58:[2,20],59:[2,20],60:[2,20],61:[2,20],62:[2,20],63:[2,20],64:[2,20],65:[2,20],66:[2,20],67:[2,20],68:[2,20],69:[2,20],70:[2,20],71:[2,20],72:[2,20],73:[2,20],74:[2,20]},{1:[2,21],6:[2,21],11:[2,21],14:[2,21],22:[2,21],24:[2,21],25:[2,21],35:[2,21],36:[2,21],37:[2,21],38:[2,21],39:[2,21],40:[2,21],41:[2,21],42:[2,21],43:[2,21],44:[2,21],45:[2,21],46:[2,21],47:[2,21],48:[2,21],49:[2,21],50:[2,21],51:[2,21],52:[2,21],53:[2,21],54:[2,21],55:[2,21],56:[2,21],57:[2,21],58:[2,21],59:[2,21],60:[2,21],61:[2,21],62:[2,21],63:[2,21],64:[2,21],65:[2,21],66:[2,21],67:[2,21],68:[2,21],69:[2,21],70:[2,21],71:[2,21],72:[2,21],73:[2,21],74:[2,21]},{1:[2,22],6:[2,22],11:[2,22],14:[2,22],22:[2,22],24:[2,22],25:[2,22],35:[2,22],36:[2,22],37:[2,22],38:[2,22],39:[2,22],40:[2,22],41:[2,22],42:[2,22],43:[2,22],44:[2,22],45:[2,22],46:[2,22],47:[2,22],48:[2,22],49:[2,22],50:[2,22],51:[2,22],52:[2,22],53:[2,22],54:[2,22],55:[2,22],56:[2,22],57:[2,22],58:[2,22],59:[2,22],60:[2,22],61:[2,22],62:[2,22],63:[2,22],64:[2,22],65:[2,22],66:[2,22],67:[2,22],68:[2,22],69:[2,22],70:[2,22],71:[2,22],72:[2,22],73:[2,22],74:[2,22]},{6:[2,40],29:[2,40],30:[2,40],70:[2,40],71:[2,40],75:[2,40],76:[2,40],77:[2,40],78:[2,40],79:[2,40],80:[2,40],83:[2,40]},{6:[2,25],27:[1,112]},{6:[2,74],29:[2,74],30:[2,74],70:[2,74],71:[2,74],75:[1,69],76:[2,74],77:[2,74],78:[2,74],79:[2,74],80:[2,74],83:[2,74]},{27:[1,80],31:85,32:[1,79]},{6:[2,75],29:[2,75],30:[2,75],70:[2,75],71:[2,75],75:[1,69],76:[2,75],77:[2,75],78:[2,75],79:[2,75],80:[2,75],83:[2,75]},{6:[2,76],29:[2,76],30:[2,76],70:[2,76],71:[2,76],75:[1,69],76:[2,76],77:[2,76],78:[2,76],79:[2,76],80:[2,76],83:[2,76]},{6:[2,77],29:[2,77],30:[2,77],70:[2,77],71:[2,77],75:[2,77],76:[2,77],77:[2,77],78:[2,77],79:[2,77],80:[2,77],83:[2,77]},{6:[2,78],29:[2,78],30:[2,78],70:[2,78],71:[2,78],75:[2,78],76:[2,78],77:[2,78],78:[2,78],79:[2,78],80:[2,78],83:[2,78]},{6:[2,79],29:[2,79],30:[2,79],70:[2,79],71:[2,79],75:[2,79],76:[2,79],77:[2,79],78:[2,79],79:[2,79],80:[2,79],83:[2,79]},{6:[2,80],29:[2,80],30:[2,80],70:[2,80],71:[2,80],75:[2,80],76:[2,80],77:[2,80],78:[2,80],79:[2,80],80:[2,80],83:[2,80]},{8:113,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29],82:[1,114]},{8:115,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{6:[2,42],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76]},{1:[2,9],6:[2,9],11:[2,9],14:[2,9],22:[2,9],24:[2,9],25:[2,9],35:[2,9],36:[2,9],37:[2,9],38:[2,9],39:[2,9],40:[2,9],41:[2,9],42:[2,9],43:[2,9],44:[2,9],45:[2,9],46:[2,9],47:[2,9],48:[2,9],49:[2,9],50:[2,9],51:[2,9],52:[2,9],53:[2,9],54:[2,9],55:[2,9],56:[2,9],57:[2,9],58:[2,9],59:[2,9],60:[2,9],61:[2,9],62:[2,9],63:[2,9],64:[2,9],65:[2,9],66:[2,9],67:[2,9],68:[2,9],69:[2,9],70:[2,9],71:[2,9],72:[2,9],73:[2,9],74:[2,9]},{6:[2,82],29:[2,82],30:[2,82],70:[2,82],71:[2,82],75:[1,69],76:[1,72],77:[2,82],78:[2,82],79:[2,82],80:[2,82],83:[2,82]},{6:[2,83],29:[2,83],30:[2,83],70:[2,83],71:[2,83],75:[1,69],76:[1,72],77:[2,83],78:[2,83],79:[2,83],80:[2,83],83:[2,83]},{6:[2,84],29:[2,84],30:[2,84],70:[2,84],71:[2,84],75:[1,69],76:[2,84],77:[2,84],78:[2,84],79:[2,84],80:[2,84],83:[2,84]},{6:[2,85],29:[2,85],30:[2,85],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[2,85],78:[2,85],79:[2,85],80:[2,85],83:[2,85]},{6:[2,86],29:[2,86],30:[2,86],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[2,86],79:[2,86],80:[1,76],83:[2,86]},{6:[2,87],29:[2,87],30:[2,87],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[2,87],80:[1,76],83:[2,87]},{6:[2,88],29:[2,88],30:[2,88],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[2,88],79:[2,88],80:[2,88],83:[2,88]},{6:[2,37],29:[2,37],30:[2,37],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76],83:[2,37]},{29:[1,116],30:[1,117]},{6:[2,32],29:[2,32],30:[2,32],70:[2,32],71:[2,32],75:[2,32],76:[2,32],77:[2,32],78:[2,32],79:[2,32],80:[2,32],83:[2,32]},{29:[2,34],30:[2,34],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76]},{29:[1,118],30:[1,117]},{6:[2,33],29:[2,33],30:[2,33],70:[2,33],71:[2,33],75:[2,33],76:[2,33],77:[2,33],78:[2,33],79:[2,33],80:[2,33],83:[2,33]},{26:121,28:119,29:[1,120],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63]},{6:[2,89],29:[2,89],30:[2,89],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76],83:[2,89]},{8:122,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{6:[2,91],29:[2,91],30:[2,91],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76],83:[2,91]},{6:[2,30],29:[2,30],30:[2,30],70:[2,30],71:[2,30],75:[2,30],76:[2,30],77:[2,30],78:[2,30],79:[2,30],80:[2,30],83:[2,30]},{8:123,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:14,26:88,35:[1,22],36:[1,23],38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63],69:[1,25],70:[1,26],71:[1,27],72:[1,28],73:[1,30],74:[1,29]},{6:[2,31],29:[2,31],30:[2,31],70:[2,31],71:[2,31],75:[2,31],76:[2,31],77:[2,31],78:[2,31],79:[2,31],80:[2,31],83:[2,31]},{29:[1,124],30:[1,125]},{5:126,10:[1,5]},{12:127,35:[1,22]},{70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76],83:[1,128]},{29:[2,35],30:[2,35],70:[1,71],71:[1,70],75:[1,69],76:[1,72],77:[1,73],78:[1,74],79:[1,75],80:[1,76]},{5:129,10:[1,5]},{26:130,38:[1,33],39:[1,34],40:[1,35],41:[1,36],42:[1,37],43:[1,38],44:[1,39],45:[1,40],46:[1,41],47:[1,42],48:[1,43],49:[1,44],50:[1,45],51:[1,46],52:[1,47],53:[1,48],54:[1,49],55:[1,50],56:[1,51],57:[1,52],58:[1,53],59:[1,54],60:[1,55],61:[1,56],62:[1,57],63:[1,58],64:[1,59],65:[1,60],66:[1,61],67:[1,62],68:[1,63]},{1:[2,27],6:[2,27],11:[2,27],14:[2,27],22:[2,27],24:[2,27],25:[2,27],35:[2,27],36:[2,27],37:[2,27],38:[2,27],39:[2,27],40:[2,27],41:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[2,27],46:[2,27],47:[2,27],48:[2,27],49:[2,27],50:[2,27],51:[2,27],52:[2,27],53:[2,27],54:[2,27],55:[2,27],56:[2,27],57:[2,27],58:[2,27],59:[2,27],60:[2,27],61:[2,27],62:[2,27],63:[2,27],64:[2,27],65:[2,27],66:[2,27],67:[2,27],68:[2,27],69:[2,27],70:[2,27],71:[2,27],72:[2,27],73:[2,27],74:[2,27]},{29:[2,28],30:[2,28]},{6:[2,90],29:[2,90],30:[2,90],70:[2,90],71:[2,90],75:[2,90],76:[2,90],77:[2,90],78:[2,90],79:[2,90],80:[2,90],83:[2,90]},{1:[2,26],6:[2,26],11:[2,26],14:[2,26],22:[2,26],24:[2,26],25:[2,26],35:[2,26],36:[2,26],37:[2,26],38:[2,26],39:[2,26],40:[2,26],41:[2,26],42:[2,26],43:[2,26],44:[2,26],45:[2,26],46:[2,26],47:[2,26],48:[2,26],49:[2,26],50:[2,26],51:[2,26],52:[2,26],53:[2,26],54:[2,26],55:[2,26],56:[2,26],57:[2,26],58:[2,26],59:[2,26],60:[2,26],61:[2,26],62:[2,26],63:[2,26],64:[2,26],65:[2,26],66:[2,26],67:[2,26],68:[2,26],69:[2,26],70:[2,26],71:[2,26],72:[2,26],73:[2,26],74:[2,26]},{12:131,35:[1,22]},{29:[2,29],30:[2,29]}],
defaultActions: {65:[2,3]},
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
      var attribute, clone, func, name, node, uniform, variable, varying, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
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
      clone.entry_point = entry_point;
      _ref5 = program.nodes;
      for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
        node = _ref5[_m];
        if (node.is_function) if (node.name === omit) continue;
        clone.nodes.push(node);
      }
      _ref6 = program.functions;
      for (name in _ref6) {
        func = _ref6[name];
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
      this.nodes = [];
      this.uniforms = [];
      this.attributes = [];
      this.varyings = [];
      this.variables = [];
      this.functions = {};
      (_base = this.state).variables || (_base.variables = {});
      (_base2 = this.state).scope || (_base2.scope = new Scope());
    }

    Program.prototype.toSource = function() {
      var node, str, _i, _len, _ref;
      str = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.is_function) {
          if (node.name === this.entry_point) {
            str.push(node.toSource('main'));
          } else {
            str.push(node.toSource());
          }
        } else if (node.is_comment) {
          str.push(node.toSource());
        } else {
          str.push(node.toSource() + ";");
        }
      }
      return str.join("\n");
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
    Expression: [o('Value'), o('Invocation'), o('Code'), o('Operation'), o('Assign'), o('If'), o('Try'), o('While'), o('For'), o('Switch'), o('Class'), o('Throw'), o('GlslTypeConstructor')],
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
      }), o('BOOLEAN_VALUE', function() {
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
      }), o('GlslType CALL_START Param CALL_END', function() {
        $3.set_type($1);
        return $3;
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
    GlslType: [o('VOID'), o('BOOL'), o('INT'), o('FLOAT'), o('VEC2'), o('VEC3'), o("VEC4"), o("BVEC2"), o("BVEC3"), o("BVEC4"), o('IVEC2'), o('IVEC3'), o('IVEC4'), o('MAT2'), o("MAT3"), o("MAT4"), o('MAT2X2'), o('MAT2X3'), o('MAT2X4'), o("MAT3X2"), o("MAT3X3"), o("MAT3X4"), o("MAT4X2"), o("MAT4X3"), o("MAT4X4"), o('SAMPLER1D'), o('SAMPLER2D'), o('SAMPLER3D'), o('SAMPLERCUBE'), o('SAMPLER1DSHADOW'), o('SAMPLER2DSHADOW')],
    GlslTypeConstructor: [
      o('GlslType Arguments', function() {
        return new TypeConstructor($1, $2);
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
              return 'BOOLEAN_VALUE';
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

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOLEAN_VALUE', '++', '--', ']'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER', 'FLOAT', 'INT', 'BOOL', 'MAT2', 'MAT3', 'MAT4', 'MAT2X2', 'MAT2X3', 'MAT2X4', 'MAT3X2', 'MAT3X3', 'MAT3X4', 'MAT4X2', 'MAT4X3', 'MAT4X4', 'VEC2', 'VEC3', 'VEC4', 'IVEC2', 'IVEC3', 'IVEC4', 'BVEC2', 'BVEC3', 'BVEC4'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOLEAN_VALUE');

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
    Op: 'op',
    Comment: 'comment',
    TypeConstructor: 'type_constructor'
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
      var Function, dependent, existing, left, right, type, varname;
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
        varname = left.toVariableName();
        existing = shader.scope.lookup(varname, true);
        if (existing) {
          type = existing.type();
          right.cast(type, {
            state: shader
          });
        } else {
          type = this.right.type(shader);
        }
        shader.scope.define(left.toVariableName(), {
          type: type,
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
    _require["shader-script/nodes/comment"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Comment = (function(_super) {

    __extends(Comment, _super);

    function Comment() {
      Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.prototype.name = 'comment';

    Comment.prototype.compile = function(shader) {
      return this.glsl('Comment', this.comment);
    };

    return Comment;

  })(require('shader-script/glsl/nodes/comment').Comment);

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
    _require["shader-script/nodes/type_constructor"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.TypeConstructor = (function(_super) {

    __extends(TypeConstructor, _super);

    function TypeConstructor() {
      TypeConstructor.__super__.constructor.apply(this, arguments);
    }

    TypeConstructor.prototype.name = 'type_constructor';

    TypeConstructor.prototype.compile = function(shader) {
      var arg, compiled_arguments;
      compiled_arguments = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arg = _ref[_i];
          _results.push(arg.compile(shader));
        }
        return _results;
      }).call(this);
      return this.glsl('TypeConstructor', this.type(), compiled_arguments);
    };

    return TypeConstructor;

  })(require('shader-script/glsl/nodes/type_constructor').TypeConstructor);

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
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"Return":10,"Comment":11,"STATEMENT":12,"Value":13,"Invocation":14,"Code":15,"Operation":16,"Assign":17,"If":18,"Try":19,"While":20,"For":21,"Switch":22,"Class":23,"Throw":24,"GlslTypeConstructor":25,"INDENT":26,"OUTDENT":27,"Identifier":28,"IDENTIFIER":29,"AlphaNumeric":30,"NUMBER":31,"STRING":32,"Literal":33,"JS":34,"REGEX":35,"DEBUGGER":36,"BOOLEAN_VALUE":37,"Assignable":38,"=":39,"AssignObj":40,"ObjAssignable":41,":":42,"ThisProperty":43,"RETURN":44,"HERECOMMENT":45,"PARAM_START":46,"ParamList":47,"PARAM_END":48,"FuncGlyph":49,"->":50,"=>":51,"OptComma":52,",":53,"Param":54,"ParamVar":55,"...":56,"GlslType":57,"CALL_START":58,"CALL_END":59,"Array":60,"Object":61,"Splat":62,"SimpleAssignable":63,"Accessor":64,"Parenthetical":65,"Range":66,"This":67,".":68,"?.":69,"::":70,"Index":71,"INDEX_START":72,"IndexValue":73,"INDEX_END":74,"INDEX_SOAK":75,"Slice":76,"{":77,"AssignList":78,"}":79,"CLASS":80,"EXTENDS":81,"OptFuncExist":82,"Arguments":83,"SUPER":84,"FUNC_EXIST":85,"ArgList":86,"THIS":87,"@":88,"[":89,"]":90,"RangeDots":91,"..":92,"Arg":93,"SimpleArgs":94,"TRY":95,"Catch":96,"FINALLY":97,"CATCH":98,"THROW":99,"(":100,")":101,"WhileSource":102,"WHILE":103,"WHEN":104,"UNTIL":105,"Loop":106,"LOOP":107,"ForBody":108,"FOR":109,"ForStart":110,"ForSource":111,"ForVariables":112,"OWN":113,"ForValue":114,"FORIN":115,"FOROF":116,"BY":117,"SWITCH":118,"Whens":119,"ELSE":120,"When":121,"LEADING_WHEN":122,"IfBlock":123,"IF":124,"POST_IF":125,"UNARY":126,"-":127,"+":128,"--":129,"++":130,"?":131,"MATH":132,"SHIFT":133,"COMPARE":134,"LOGIC":135,"RELATION":136,"COMPOUND_ASSIGN":137,"VOID":138,"BOOL":139,"INT":140,"FLOAT":141,"VEC2":142,"VEC3":143,"VEC4":144,"BVEC2":145,"BVEC3":146,"BVEC4":147,"IVEC2":148,"IVEC3":149,"IVEC4":150,"MAT2":151,"MAT3":152,"MAT4":153,"MAT2X2":154,"MAT2X3":155,"MAT2X4":156,"MAT3X2":157,"MAT3X3":158,"MAT3X4":159,"MAT4X2":160,"MAT4X3":161,"MAT4X4":162,"SAMPLER1D":163,"SAMPLER2D":164,"SAMPLER3D":165,"SAMPLERCUBE":166,"SAMPLER1DSHADOW":167,"SAMPLER2DSHADOW":168,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",12:"STATEMENT",26:"INDENT",27:"OUTDENT",29:"IDENTIFIER",31:"NUMBER",32:"STRING",34:"JS",35:"REGEX",36:"DEBUGGER",37:"BOOLEAN_VALUE",39:"=",42:":",44:"RETURN",45:"HERECOMMENT",46:"PARAM_START",48:"PARAM_END",50:"->",51:"=>",53:",",56:"...",58:"CALL_START",59:"CALL_END",68:".",69:"?.",70:"::",72:"INDEX_START",74:"INDEX_END",75:"INDEX_SOAK",77:"{",79:"}",80:"CLASS",81:"EXTENDS",84:"SUPER",85:"FUNC_EXIST",87:"THIS",88:"@",89:"[",90:"]",92:"..",95:"TRY",97:"FINALLY",98:"CATCH",99:"THROW",100:"(",101:")",103:"WHILE",104:"WHEN",105:"UNTIL",107:"LOOP",109:"FOR",113:"OWN",115:"FORIN",116:"FOROF",117:"BY",118:"SWITCH",120:"ELSE",122:"LEADING_WHEN",124:"IF",125:"POST_IF",126:"UNARY",127:"-",128:"+",129:"--",130:"++",131:"?",132:"MATH",133:"SHIFT",134:"COMPARE",135:"LOGIC",136:"RELATION",137:"COMPOUND_ASSIGN",138:"VOID",139:"BOOL",140:"INT",141:"FLOAT",142:"VEC2",143:"VEC3",144:"VEC4",145:"BVEC2",146:"BVEC3",147:"BVEC4",148:"IVEC2",149:"IVEC3",150:"IVEC4",151:"MAT2",152:"MAT3",153:"MAT4",154:"MAT2X2",155:"MAT2X3",156:"MAT2X4",157:"MAT3X2",158:"MAT3X3",159:"MAT3X4",160:"MAT4X2",161:"MAT4X3",162:"MAT4X4",163:"SAMPLER1D",164:"SAMPLER2D",165:"SAMPLER3D",166:"SAMPLERCUBE",167:"SAMPLER1DSHADOW",168:"SAMPLER2DSHADOW"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[9,1],[9,1],[9,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[5,2],[5,3],[28,1],[30,1],[30,1],[33,1],[33,1],[33,1],[33,1],[33,1],[17,3],[17,4],[17,5],[40,1],[40,3],[40,5],[40,1],[41,1],[41,1],[41,1],[10,2],[10,1],[11,1],[15,5],[15,2],[49,1],[49,1],[52,0],[52,1],[47,0],[47,1],[47,3],[54,1],[54,2],[54,3],[54,4],[55,1],[55,1],[55,1],[55,1],[62,2],[63,1],[63,2],[63,2],[63,1],[38,1],[38,1],[38,1],[13,1],[13,1],[13,1],[13,1],[13,1],[64,2],[64,2],[64,2],[64,1],[64,1],[71,3],[71,2],[73,1],[73,1],[61,4],[78,0],[78,1],[78,3],[78,4],[78,6],[23,1],[23,2],[23,3],[23,4],[23,2],[23,3],[23,4],[23,5],[14,3],[14,3],[14,1],[14,2],[82,0],[82,1],[83,2],[83,4],[67,1],[67,1],[43,2],[60,2],[60,4],[91,1],[91,1],[66,5],[76,3],[76,2],[76,2],[76,1],[86,1],[86,3],[86,4],[86,4],[86,6],[93,1],[93,1],[94,1],[94,3],[19,2],[19,3],[19,4],[19,5],[96,3],[24,2],[65,3],[65,5],[102,2],[102,4],[102,2],[102,4],[20,2],[20,2],[20,2],[20,1],[106,2],[106,2],[21,2],[21,2],[21,2],[108,2],[108,2],[110,2],[110,3],[114,1],[114,1],[114,1],[112,1],[112,3],[111,2],[111,2],[111,4],[111,4],[111,4],[111,6],[111,6],[22,5],[22,7],[22,4],[22,6],[119,1],[119,2],[121,3],[121,4],[123,3],[123,5],[18,1],[18,3],[18,3],[18,3],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,5],[16,3],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[57,1],[25,2]],
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
case 24:this.$ = $$[$0];
break;
case 25:this.$ = new yy.Block;
break;
case 26:this.$ = $$[$0-1];
break;
case 27:this.$ = new yy.Identifier($$[$0]);
break;
case 28:this.$ = new yy.Literal($$[$0]);
break;
case 29:this.$ = new yy.Literal($$[$0]);
break;
case 30:this.$ = $$[$0];
break;
case 31:this.$ = new yy.Literal($$[$0]);
break;
case 32:this.$ = new yy.Literal($$[$0]);
break;
case 33:this.$ = new yy.Literal($$[$0]);
break;
case 34:this.$ = (function () {
        var val;
        val = new yy.Literal($$[$0]);
        if ($$[$0] === 'undefined') val.isUndefined = true;
        return val;
      }());
break;
case 35:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 36:this.$ = new yy.Assign($$[$0-3], $$[$0]);
break;
case 37:this.$ = new yy.Assign($$[$0-4], $$[$0-1]);
break;
case 38:this.$ = new yy.Value($$[$0]);
break;
case 39:this.$ = new yy.Assign(new yy.Value($$[$0-2]), $$[$0], 'object');
break;
case 40:this.$ = new yy.Assign(new yy.Value($$[$0-4]), $$[$0-1], 'object');
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = new yy.Return($$[$0]);
break;
case 46:this.$ = new yy.Return;
break;
case 47:this.$ = new yy.Comment($$[$0]);
break;
case 48:this.$ = new yy.Code($$[$0-3], $$[$0], $$[$0-1]);
break;
case 49:this.$ = new yy.Code([], $$[$0], $$[$0-1]);
break;
case 50:this.$ = 'func';
break;
case 51:this.$ = 'boundfunc';
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = $$[$0];
break;
case 54:this.$ = [];
break;
case 55:this.$ = [$$[$0]];
break;
case 56:this.$ = $$[$0-2].concat($$[$0]);
break;
case 57:this.$ = new yy.Param($$[$0]);
break;
case 58:this.$ = new yy.Param($$[$0-1], null, true);
break;
case 59:this.$ = new yy.Param($$[$0-2], $$[$0]);
break;
case 60:this.$ = (function () {
        $$[$0-1].set_type($$[$0-3]);
        return $$[$0-1];
      }());
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = $$[$0];
break;
case 65:this.$ = new yy.Splat($$[$0-1]);
break;
case 66:this.$ = new yy.Value($$[$0]);
break;
case 67:this.$ = $$[$0-1].add($$[$0]);
break;
case 68:this.$ = new yy.Value($$[$0-1], [].concat($$[$0]));
break;
case 69:this.$ = $$[$0];
break;
case 70:this.$ = $$[$0];
break;
case 71:this.$ = new yy.Value($$[$0]);
break;
case 72:this.$ = new yy.Value($$[$0]);
break;
case 73:this.$ = $$[$0];
break;
case 74:this.$ = new yy.Value($$[$0]);
break;
case 75:this.$ = new yy.Value($$[$0]);
break;
case 76:this.$ = new yy.Value($$[$0]);
break;
case 77:this.$ = $$[$0];
break;
case 78:this.$ = new yy.Access($$[$0]);
break;
case 79:this.$ = new yy.Access($$[$0], 'soak');
break;
case 80:this.$ = [new yy.Access(new yy.Literal('prototype')), new yy.Access($$[$0])];
break;
case 81:this.$ = new yy.Access(new yy.Literal('prototype'));
break;
case 82:this.$ = $$[$0];
break;
case 83:this.$ = $$[$0-1];
break;
case 84:this.$ = yy.extend($$[$0], {
          soak: true
        });
break;
case 85:this.$ = new yy.Index($$[$0]);
break;
case 86:this.$ = new yy.Slice($$[$0]);
break;
case 87:this.$ = new yy.Obj($$[$0-2], $$[$0-3].generated);
break;
case 88:this.$ = [];
break;
case 89:this.$ = [$$[$0]];
break;
case 90:this.$ = $$[$0-2].concat($$[$0]);
break;
case 91:this.$ = $$[$0-3].concat($$[$0]);
break;
case 92:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 93:this.$ = new yy.Class;
break;
case 94:this.$ = new yy.Class(null, null, $$[$0]);
break;
case 95:this.$ = new yy.Class(null, $$[$0]);
break;
case 96:this.$ = new yy.Class(null, $$[$0-1], $$[$0]);
break;
case 97:this.$ = new yy.Class($$[$0]);
break;
case 98:this.$ = new yy.Class($$[$0-1], null, $$[$0]);
break;
case 99:this.$ = new yy.Class($$[$0-2], $$[$0]);
break;
case 100:this.$ = new yy.Class($$[$0-3], $$[$0-1], $$[$0]);
break;
case 101:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 102:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 103:this.$ = new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]);
break;
case 104:this.$ = new yy.Call('super', $$[$0]);
break;
case 105:this.$ = false;
break;
case 106:this.$ = true;
break;
case 107:this.$ = [];
break;
case 108:this.$ = $$[$0-2];
break;
case 109:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 110:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 111:this.$ = new yy.Value(new yy.Literal('this'), [new yy.Access($$[$0])], 'this');
break;
case 112:this.$ = new yy.Arr([]);
break;
case 113:this.$ = new yy.Arr($$[$0-2]);
break;
case 114:this.$ = 'inclusive';
break;
case 115:this.$ = 'exclusive';
break;
case 116:this.$ = new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]);
break;
case 117:this.$ = new yy.Range($$[$0-2], $$[$0], $$[$0-1]);
break;
case 118:this.$ = new yy.Range($$[$0-1], null, $$[$0]);
break;
case 119:this.$ = new yy.Range(null, $$[$0], $$[$0-1]);
break;
case 120:this.$ = new yy.Range(null, null, $$[$0]);
break;
case 121:this.$ = [$$[$0]];
break;
case 122:this.$ = $$[$0-2].concat($$[$0]);
break;
case 123:this.$ = $$[$0-3].concat($$[$0]);
break;
case 124:this.$ = $$[$0-2];
break;
case 125:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 126:this.$ = $$[$0];
break;
case 127:this.$ = $$[$0];
break;
case 128:this.$ = $$[$0];
break;
case 129:this.$ = [].concat($$[$0-2], $$[$0]);
break;
case 130:this.$ = new yy.Try($$[$0]);
break;
case 131:this.$ = new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]);
break;
case 132:this.$ = new yy.Try($$[$0-2], null, null, $$[$0]);
break;
case 133:this.$ = new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]);
break;
case 134:this.$ = [$$[$0-1], $$[$0]];
break;
case 135:this.$ = new yy.Throw($$[$0]);
break;
case 136:this.$ = new yy.Parens($$[$0-1]);
break;
case 137:this.$ = new yy.Parens($$[$0-2]);
break;
case 138:this.$ = new yy.While($$[$0]);
break;
case 139:this.$ = new yy.While($$[$0-2], {
          guard: $$[$0]
        });
break;
case 140:this.$ = new yy.While($$[$0], {
          invert: true
        });
break;
case 141:this.$ = new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        });
break;
case 142:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 143:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 144:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 145:this.$ = $$[$0];
break;
case 146:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 147:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 148:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 149:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 150:this.$ = new yy.For($$[$0], $$[$0-1]);
break;
case 151:this.$ = {
          source: new yy.Value($$[$0])
        };
break;
case 152:this.$ = (function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }());
break;
case 153:this.$ = $$[$0];
break;
case 154:this.$ = (function () {
        $$[$0].own = true;
        return $$[$0];
      }());
break;
case 155:this.$ = $$[$0];
break;
case 156:this.$ = new yy.Value($$[$0]);
break;
case 157:this.$ = new yy.Value($$[$0]);
break;
case 158:this.$ = [$$[$0]];
break;
case 159:this.$ = [$$[$0-2], $$[$0]];
break;
case 160:this.$ = {
          source: $$[$0]
        };
break;
case 161:this.$ = {
          source: $$[$0],
          object: true
        };
break;
case 162:this.$ = {
          source: $$[$0-2],
          guard: $$[$0]
        };
break;
case 163:this.$ = {
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        };
break;
case 164:this.$ = {
          source: $$[$0-2],
          step: $$[$0]
        };
break;
case 165:this.$ = {
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        };
break;
case 166:this.$ = {
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        };
break;
case 167:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 168:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 169:this.$ = new yy.Switch(null, $$[$0-1]);
break;
case 170:this.$ = new yy.Switch(null, $$[$0-3], $$[$0-1]);
break;
case 171:this.$ = $$[$0];
break;
case 172:this.$ = $$[$0-1].concat($$[$0]);
break;
case 173:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 174:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 175:this.$ = new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        });
break;
case 176:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 177:this.$ = $$[$0];
break;
case 178:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 179:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 180:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 181:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 182:this.$ = new yy.Op('-', $$[$0]);
break;
case 183:this.$ = new yy.Op('+', $$[$0]);
break;
case 184:this.$ = new yy.Op('--', $$[$0]);
break;
case 185:this.$ = new yy.Op('++', $$[$0]);
break;
case 186:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 187:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 188:this.$ = new yy.Existence($$[$0-1]);
break;
case 189:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 190:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 191:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 192:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 193:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 194:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 195:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 196:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 197:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 198:this.$ = new yy.Extends($$[$0-2], $$[$0]);
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
case 229:this.$ = $$[$0];
break;
case 230:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,5],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[3]},{1:[2,2],6:[1,105]},{6:[1,106]},{1:[2,4],6:[2,4],27:[2,4],101:[2,4]},{4:108,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,27:[1,107],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,7],6:[2,7],27:[2,7],101:[2,7],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,8],6:[2,8],27:[2,8],101:[2,8],102:121,103:[1,65],105:[1,66],108:122,109:[1,68],110:69,125:[1,120]},{1:[2,12],6:[2,12],26:[2,12],27:[2,12],48:[2,12],53:[2,12],56:[2,12],58:[2,105],59:[2,12],64:124,68:[1,126],69:[1,127],70:[1,128],71:129,72:[1,130],74:[2,12],75:[1,131],79:[2,12],82:123,85:[1,125],90:[2,12],92:[2,12],101:[2,12],103:[2,12],104:[2,12],105:[2,12],109:[2,12],117:[2,12],125:[2,12],127:[2,12],128:[2,12],131:[2,12],132:[2,12],133:[2,12],134:[2,12],135:[2,12],136:[2,12]},{1:[2,13],6:[2,13],26:[2,13],27:[2,13],48:[2,13],53:[2,13],56:[2,13],58:[2,105],59:[2,13],64:133,68:[1,126],69:[1,127],70:[1,128],71:129,72:[1,130],74:[2,13],75:[1,131],79:[2,13],82:132,85:[1,125],90:[2,13],92:[2,13],101:[2,13],103:[2,13],104:[2,13],105:[2,13],109:[2,13],117:[2,13],125:[2,13],127:[2,13],128:[2,13],131:[2,13],132:[2,13],133:[2,13],134:[2,13],135:[2,13],136:[2,13]},{1:[2,14],6:[2,14],26:[2,14],27:[2,14],48:[2,14],53:[2,14],56:[2,14],59:[2,14],74:[2,14],79:[2,14],90:[2,14],92:[2,14],101:[2,14],103:[2,14],104:[2,14],105:[2,14],109:[2,14],117:[2,14],125:[2,14],127:[2,14],128:[2,14],131:[2,14],132:[2,14],133:[2,14],134:[2,14],135:[2,14],136:[2,14]},{1:[2,15],6:[2,15],26:[2,15],27:[2,15],48:[2,15],53:[2,15],56:[2,15],59:[2,15],74:[2,15],79:[2,15],90:[2,15],92:[2,15],101:[2,15],103:[2,15],104:[2,15],105:[2,15],109:[2,15],117:[2,15],125:[2,15],127:[2,15],128:[2,15],131:[2,15],132:[2,15],133:[2,15],134:[2,15],135:[2,15],136:[2,15]},{1:[2,16],6:[2,16],26:[2,16],27:[2,16],48:[2,16],53:[2,16],56:[2,16],59:[2,16],74:[2,16],79:[2,16],90:[2,16],92:[2,16],101:[2,16],103:[2,16],104:[2,16],105:[2,16],109:[2,16],117:[2,16],125:[2,16],127:[2,16],128:[2,16],131:[2,16],132:[2,16],133:[2,16],134:[2,16],135:[2,16],136:[2,16]},{1:[2,17],6:[2,17],26:[2,17],27:[2,17],48:[2,17],53:[2,17],56:[2,17],59:[2,17],74:[2,17],79:[2,17],90:[2,17],92:[2,17],101:[2,17],103:[2,17],104:[2,17],105:[2,17],109:[2,17],117:[2,17],125:[2,17],127:[2,17],128:[2,17],131:[2,17],132:[2,17],133:[2,17],134:[2,17],135:[2,17],136:[2,17]},{1:[2,18],6:[2,18],26:[2,18],27:[2,18],48:[2,18],53:[2,18],56:[2,18],59:[2,18],74:[2,18],79:[2,18],90:[2,18],92:[2,18],101:[2,18],103:[2,18],104:[2,18],105:[2,18],109:[2,18],117:[2,18],125:[2,18],127:[2,18],128:[2,18],131:[2,18],132:[2,18],133:[2,18],134:[2,18],135:[2,18],136:[2,18]},{1:[2,19],6:[2,19],26:[2,19],27:[2,19],48:[2,19],53:[2,19],56:[2,19],59:[2,19],74:[2,19],79:[2,19],90:[2,19],92:[2,19],101:[2,19],103:[2,19],104:[2,19],105:[2,19],109:[2,19],117:[2,19],125:[2,19],127:[2,19],128:[2,19],131:[2,19],132:[2,19],133:[2,19],134:[2,19],135:[2,19],136:[2,19]},{1:[2,20],6:[2,20],26:[2,20],27:[2,20],48:[2,20],53:[2,20],56:[2,20],59:[2,20],74:[2,20],79:[2,20],90:[2,20],92:[2,20],101:[2,20],103:[2,20],104:[2,20],105:[2,20],109:[2,20],117:[2,20],125:[2,20],127:[2,20],128:[2,20],131:[2,20],132:[2,20],133:[2,20],134:[2,20],135:[2,20],136:[2,20]},{1:[2,21],6:[2,21],26:[2,21],27:[2,21],48:[2,21],53:[2,21],56:[2,21],59:[2,21],74:[2,21],79:[2,21],90:[2,21],92:[2,21],101:[2,21],103:[2,21],104:[2,21],105:[2,21],109:[2,21],117:[2,21],125:[2,21],127:[2,21],128:[2,21],131:[2,21],132:[2,21],133:[2,21],134:[2,21],135:[2,21],136:[2,21]},{1:[2,22],6:[2,22],26:[2,22],27:[2,22],48:[2,22],53:[2,22],56:[2,22],59:[2,22],74:[2,22],79:[2,22],90:[2,22],92:[2,22],101:[2,22],103:[2,22],104:[2,22],105:[2,22],109:[2,22],117:[2,22],125:[2,22],127:[2,22],128:[2,22],131:[2,22],132:[2,22],133:[2,22],134:[2,22],135:[2,22],136:[2,22]},{1:[2,23],6:[2,23],26:[2,23],27:[2,23],48:[2,23],53:[2,23],56:[2,23],59:[2,23],74:[2,23],79:[2,23],90:[2,23],92:[2,23],101:[2,23],103:[2,23],104:[2,23],105:[2,23],109:[2,23],117:[2,23],125:[2,23],127:[2,23],128:[2,23],131:[2,23],132:[2,23],133:[2,23],134:[2,23],135:[2,23],136:[2,23]},{1:[2,24],6:[2,24],26:[2,24],27:[2,24],48:[2,24],53:[2,24],56:[2,24],59:[2,24],74:[2,24],79:[2,24],90:[2,24],92:[2,24],101:[2,24],103:[2,24],104:[2,24],105:[2,24],109:[2,24],117:[2,24],125:[2,24],127:[2,24],128:[2,24],131:[2,24],132:[2,24],133:[2,24],134:[2,24],135:[2,24],136:[2,24]},{1:[2,9],6:[2,9],27:[2,9],101:[2,9],103:[2,9],105:[2,9],109:[2,9],125:[2,9]},{1:[2,10],6:[2,10],27:[2,10],101:[2,10],103:[2,10],105:[2,10],109:[2,10],125:[2,10]},{1:[2,11],6:[2,11],27:[2,11],101:[2,11],103:[2,11],105:[2,11],109:[2,11],125:[2,11]},{1:[2,73],6:[2,73],26:[2,73],27:[2,73],39:[1,134],48:[2,73],53:[2,73],56:[2,73],58:[2,73],59:[2,73],68:[2,73],69:[2,73],70:[2,73],72:[2,73],74:[2,73],75:[2,73],79:[2,73],85:[2,73],90:[2,73],92:[2,73],101:[2,73],103:[2,73],104:[2,73],105:[2,73],109:[2,73],117:[2,73],125:[2,73],127:[2,73],128:[2,73],131:[2,73],132:[2,73],133:[2,73],134:[2,73],135:[2,73],136:[2,73]},{1:[2,74],6:[2,74],26:[2,74],27:[2,74],48:[2,74],53:[2,74],56:[2,74],58:[2,74],59:[2,74],68:[2,74],69:[2,74],70:[2,74],72:[2,74],74:[2,74],75:[2,74],79:[2,74],85:[2,74],90:[2,74],92:[2,74],101:[2,74],103:[2,74],104:[2,74],105:[2,74],109:[2,74],117:[2,74],125:[2,74],127:[2,74],128:[2,74],131:[2,74],132:[2,74],133:[2,74],134:[2,74],135:[2,74],136:[2,74]},{1:[2,75],6:[2,75],26:[2,75],27:[2,75],48:[2,75],53:[2,75],56:[2,75],58:[2,75],59:[2,75],68:[2,75],69:[2,75],70:[2,75],72:[2,75],74:[2,75],75:[2,75],79:[2,75],85:[2,75],90:[2,75],92:[2,75],101:[2,75],103:[2,75],104:[2,75],105:[2,75],109:[2,75],117:[2,75],125:[2,75],127:[2,75],128:[2,75],131:[2,75],132:[2,75],133:[2,75],134:[2,75],135:[2,75],136:[2,75]},{1:[2,76],6:[2,76],26:[2,76],27:[2,76],48:[2,76],53:[2,76],56:[2,76],58:[2,76],59:[2,76],68:[2,76],69:[2,76],70:[2,76],72:[2,76],74:[2,76],75:[2,76],79:[2,76],85:[2,76],90:[2,76],92:[2,76],101:[2,76],103:[2,76],104:[2,76],105:[2,76],109:[2,76],117:[2,76],125:[2,76],127:[2,76],128:[2,76],131:[2,76],132:[2,76],133:[2,76],134:[2,76],135:[2,76],136:[2,76]},{1:[2,77],6:[2,77],26:[2,77],27:[2,77],48:[2,77],53:[2,77],56:[2,77],58:[2,77],59:[2,77],68:[2,77],69:[2,77],70:[2,77],72:[2,77],74:[2,77],75:[2,77],79:[2,77],85:[2,77],90:[2,77],92:[2,77],101:[2,77],103:[2,77],104:[2,77],105:[2,77],109:[2,77],117:[2,77],125:[2,77],127:[2,77],128:[2,77],131:[2,77],132:[2,77],133:[2,77],134:[2,77],135:[2,77],136:[2,77]},{1:[2,103],6:[2,103],26:[2,103],27:[2,103],48:[2,103],53:[2,103],56:[2,103],58:[1,136],59:[2,103],68:[2,103],69:[2,103],70:[2,103],72:[2,103],74:[2,103],75:[2,103],79:[2,103],83:135,85:[2,103],90:[2,103],92:[2,103],101:[2,103],103:[2,103],104:[2,103],105:[2,103],109:[2,103],117:[2,103],125:[2,103],127:[2,103],128:[2,103],131:[2,103],132:[2,103],133:[2,103],134:[2,103],135:[2,103],136:[2,103]},{28:141,29:[1,104],43:142,47:137,48:[2,54],53:[2,54],54:138,55:139,57:140,60:143,61:144,77:[1,101],88:[1,145],89:[1,146],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{5:147,26:[1,5]},{8:148,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:150,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:151,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{13:153,14:154,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:155,43:63,60:49,61:50,63:152,65:26,66:27,67:28,77:[1,101],84:[1,29],87:[1,58],88:[1,59],89:[1,57],100:[1,56]},{13:153,14:154,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:155,43:63,60:49,61:50,63:156,65:26,66:27,67:28,77:[1,101],84:[1,29],87:[1,58],88:[1,59],89:[1,57],100:[1,56]},{1:[2,70],6:[2,70],26:[2,70],27:[2,70],39:[2,70],48:[2,70],53:[2,70],56:[2,70],58:[2,70],59:[2,70],68:[2,70],69:[2,70],70:[2,70],72:[2,70],74:[2,70],75:[2,70],79:[2,70],81:[1,160],85:[2,70],90:[2,70],92:[2,70],101:[2,70],103:[2,70],104:[2,70],105:[2,70],109:[2,70],117:[2,70],125:[2,70],127:[2,70],128:[2,70],129:[1,157],130:[1,158],131:[2,70],132:[2,70],133:[2,70],134:[2,70],135:[2,70],136:[2,70],137:[1,159]},{1:[2,177],6:[2,177],26:[2,177],27:[2,177],48:[2,177],53:[2,177],56:[2,177],59:[2,177],74:[2,177],79:[2,177],90:[2,177],92:[2,177],101:[2,177],103:[2,177],104:[2,177],105:[2,177],109:[2,177],117:[2,177],120:[1,161],125:[2,177],127:[2,177],128:[2,177],131:[2,177],132:[2,177],133:[2,177],134:[2,177],135:[2,177],136:[2,177]},{5:162,26:[1,5]},{5:163,26:[1,5]},{1:[2,145],6:[2,145],26:[2,145],27:[2,145],48:[2,145],53:[2,145],56:[2,145],59:[2,145],74:[2,145],79:[2,145],90:[2,145],92:[2,145],101:[2,145],103:[2,145],104:[2,145],105:[2,145],109:[2,145],117:[2,145],125:[2,145],127:[2,145],128:[2,145],131:[2,145],132:[2,145],133:[2,145],134:[2,145],135:[2,145],136:[2,145]},{5:164,26:[1,5]},{8:165,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,166],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,93],5:167,6:[2,93],13:153,14:154,26:[1,5],27:[2,93],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:155,43:63,48:[2,93],53:[2,93],56:[2,93],59:[2,93],60:49,61:50,63:169,65:26,66:27,67:28,74:[2,93],77:[1,101],79:[2,93],81:[1,168],84:[1,29],87:[1,58],88:[1,59],89:[1,57],90:[2,93],92:[2,93],100:[1,56],101:[2,93],103:[2,93],104:[2,93],105:[2,93],109:[2,93],117:[2,93],125:[2,93],127:[2,93],128:[2,93],131:[2,93],132:[2,93],133:[2,93],134:[2,93],135:[2,93],136:[2,93]},{8:170,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{58:[1,136],83:171},{1:[2,46],6:[2,46],8:172,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,27:[2,46],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],101:[2,46],102:40,103:[2,46],105:[2,46],106:41,107:[1,67],108:42,109:[2,46],110:69,118:[1,43],123:38,124:[1,64],125:[2,46],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,47],6:[2,47],26:[2,47],27:[2,47],53:[2,47],79:[2,47],101:[2,47],103:[2,47],105:[2,47],109:[2,47],125:[2,47]},{1:[2,71],6:[2,71],26:[2,71],27:[2,71],39:[2,71],48:[2,71],53:[2,71],56:[2,71],58:[2,71],59:[2,71],68:[2,71],69:[2,71],70:[2,71],72:[2,71],74:[2,71],75:[2,71],79:[2,71],85:[2,71],90:[2,71],92:[2,71],101:[2,71],103:[2,71],104:[2,71],105:[2,71],109:[2,71],117:[2,71],125:[2,71],127:[2,71],128:[2,71],131:[2,71],132:[2,71],133:[2,71],134:[2,71],135:[2,71],136:[2,71]},{1:[2,72],6:[2,72],26:[2,72],27:[2,72],39:[2,72],48:[2,72],53:[2,72],56:[2,72],58:[2,72],59:[2,72],68:[2,72],69:[2,72],70:[2,72],72:[2,72],74:[2,72],75:[2,72],79:[2,72],85:[2,72],90:[2,72],92:[2,72],101:[2,72],103:[2,72],104:[2,72],105:[2,72],109:[2,72],117:[2,72],125:[2,72],127:[2,72],128:[2,72],131:[2,72],132:[2,72],133:[2,72],134:[2,72],135:[2,72],136:[2,72]},{1:[2,30],6:[2,30],26:[2,30],27:[2,30],48:[2,30],53:[2,30],56:[2,30],58:[2,30],59:[2,30],68:[2,30],69:[2,30],70:[2,30],72:[2,30],74:[2,30],75:[2,30],79:[2,30],85:[2,30],90:[2,30],92:[2,30],101:[2,30],103:[2,30],104:[2,30],105:[2,30],109:[2,30],117:[2,30],125:[2,30],127:[2,30],128:[2,30],131:[2,30],132:[2,30],133:[2,30],134:[2,30],135:[2,30],136:[2,30]},{1:[2,31],6:[2,31],26:[2,31],27:[2,31],48:[2,31],53:[2,31],56:[2,31],58:[2,31],59:[2,31],68:[2,31],69:[2,31],70:[2,31],72:[2,31],74:[2,31],75:[2,31],79:[2,31],85:[2,31],90:[2,31],92:[2,31],101:[2,31],103:[2,31],104:[2,31],105:[2,31],109:[2,31],117:[2,31],125:[2,31],127:[2,31],128:[2,31],131:[2,31],132:[2,31],133:[2,31],134:[2,31],135:[2,31],136:[2,31]},{1:[2,32],6:[2,32],26:[2,32],27:[2,32],48:[2,32],53:[2,32],56:[2,32],58:[2,32],59:[2,32],68:[2,32],69:[2,32],70:[2,32],72:[2,32],74:[2,32],75:[2,32],79:[2,32],85:[2,32],90:[2,32],92:[2,32],101:[2,32],103:[2,32],104:[2,32],105:[2,32],109:[2,32],117:[2,32],125:[2,32],127:[2,32],128:[2,32],131:[2,32],132:[2,32],133:[2,32],134:[2,32],135:[2,32],136:[2,32]},{1:[2,33],6:[2,33],26:[2,33],27:[2,33],48:[2,33],53:[2,33],56:[2,33],58:[2,33],59:[2,33],68:[2,33],69:[2,33],70:[2,33],72:[2,33],74:[2,33],75:[2,33],79:[2,33],85:[2,33],90:[2,33],92:[2,33],101:[2,33],103:[2,33],104:[2,33],105:[2,33],109:[2,33],117:[2,33],125:[2,33],127:[2,33],128:[2,33],131:[2,33],132:[2,33],133:[2,33],134:[2,33],135:[2,33],136:[2,33]},{1:[2,34],6:[2,34],26:[2,34],27:[2,34],48:[2,34],53:[2,34],56:[2,34],58:[2,34],59:[2,34],68:[2,34],69:[2,34],70:[2,34],72:[2,34],74:[2,34],75:[2,34],79:[2,34],85:[2,34],90:[2,34],92:[2,34],101:[2,34],103:[2,34],104:[2,34],105:[2,34],109:[2,34],117:[2,34],125:[2,34],127:[2,34],128:[2,34],131:[2,34],132:[2,34],133:[2,34],134:[2,34],135:[2,34],136:[2,34]},{4:173,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,174],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:175,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,179],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,62:180,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],86:177,87:[1,58],88:[1,59],89:[1,57],90:[1,176],93:178,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,109],6:[2,109],26:[2,109],27:[2,109],48:[2,109],53:[2,109],56:[2,109],58:[2,109],59:[2,109],68:[2,109],69:[2,109],70:[2,109],72:[2,109],74:[2,109],75:[2,109],79:[2,109],85:[2,109],90:[2,109],92:[2,109],101:[2,109],103:[2,109],104:[2,109],105:[2,109],109:[2,109],117:[2,109],125:[2,109],127:[2,109],128:[2,109],131:[2,109],132:[2,109],133:[2,109],134:[2,109],135:[2,109],136:[2,109]},{1:[2,110],6:[2,110],26:[2,110],27:[2,110],28:181,29:[1,104],48:[2,110],53:[2,110],56:[2,110],58:[2,110],59:[2,110],68:[2,110],69:[2,110],70:[2,110],72:[2,110],74:[2,110],75:[2,110],79:[2,110],85:[2,110],90:[2,110],92:[2,110],101:[2,110],103:[2,110],104:[2,110],105:[2,110],109:[2,110],117:[2,110],125:[2,110],127:[2,110],128:[2,110],131:[2,110],132:[2,110],133:[2,110],134:[2,110],135:[2,110],136:[2,110]},{26:[2,50]},{26:[2,51]},{1:[2,66],6:[2,66],26:[2,66],27:[2,66],39:[2,66],48:[2,66],53:[2,66],56:[2,66],58:[2,66],59:[2,66],68:[2,66],69:[2,66],70:[2,66],72:[2,66],74:[2,66],75:[2,66],79:[2,66],81:[2,66],85:[2,66],90:[2,66],92:[2,66],101:[2,66],103:[2,66],104:[2,66],105:[2,66],109:[2,66],117:[2,66],125:[2,66],127:[2,66],128:[2,66],129:[2,66],130:[2,66],131:[2,66],132:[2,66],133:[2,66],134:[2,66],135:[2,66],136:[2,66],137:[2,66]},{1:[2,69],6:[2,69],26:[2,69],27:[2,69],39:[2,69],48:[2,69],53:[2,69],56:[2,69],58:[2,69],59:[2,69],68:[2,69],69:[2,69],70:[2,69],72:[2,69],74:[2,69],75:[2,69],79:[2,69],81:[2,69],85:[2,69],90:[2,69],92:[2,69],101:[2,69],103:[2,69],104:[2,69],105:[2,69],109:[2,69],117:[2,69],125:[2,69],127:[2,69],128:[2,69],129:[2,69],130:[2,69],131:[2,69],132:[2,69],133:[2,69],134:[2,69],135:[2,69],136:[2,69],137:[2,69]},{8:182,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:183,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:184,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{5:185,8:186,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,5],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{28:191,29:[1,104],60:192,61:193,66:187,77:[1,101],89:[1,57],112:188,113:[1,189],114:190},{111:194,115:[1,195],116:[1,196]},{58:[2,199]},{58:[2,200]},{58:[2,201]},{58:[2,202]},{58:[2,203]},{58:[2,204]},{58:[2,205]},{58:[2,206]},{58:[2,207]},{58:[2,208]},{58:[2,209]},{58:[2,210]},{58:[2,211]},{58:[2,212]},{58:[2,213]},{58:[2,214]},{58:[2,215]},{58:[2,216]},{58:[2,217]},{58:[2,218]},{58:[2,219]},{58:[2,220]},{58:[2,221]},{58:[2,222]},{58:[2,223]},{58:[2,224]},{58:[2,225]},{58:[2,226]},{58:[2,227]},{58:[2,228]},{58:[2,229]},{6:[2,88],11:200,26:[2,88],28:201,29:[1,104],30:202,31:[1,102],32:[1,103],40:198,41:199,43:203,45:[1,48],53:[2,88],78:197,79:[2,88],88:[1,145]},{1:[2,28],6:[2,28],26:[2,28],27:[2,28],42:[2,28],48:[2,28],53:[2,28],56:[2,28],58:[2,28],59:[2,28],68:[2,28],69:[2,28],70:[2,28],72:[2,28],74:[2,28],75:[2,28],79:[2,28],85:[2,28],90:[2,28],92:[2,28],101:[2,28],103:[2,28],104:[2,28],105:[2,28],109:[2,28],117:[2,28],125:[2,28],127:[2,28],128:[2,28],131:[2,28],132:[2,28],133:[2,28],134:[2,28],135:[2,28],136:[2,28]},{1:[2,29],6:[2,29],26:[2,29],27:[2,29],42:[2,29],48:[2,29],53:[2,29],56:[2,29],58:[2,29],59:[2,29],68:[2,29],69:[2,29],70:[2,29],72:[2,29],74:[2,29],75:[2,29],79:[2,29],85:[2,29],90:[2,29],92:[2,29],101:[2,29],103:[2,29],104:[2,29],105:[2,29],109:[2,29],117:[2,29],125:[2,29],127:[2,29],128:[2,29],131:[2,29],132:[2,29],133:[2,29],134:[2,29],135:[2,29],136:[2,29]},{1:[2,27],6:[2,27],26:[2,27],27:[2,27],39:[2,27],42:[2,27],48:[2,27],53:[2,27],56:[2,27],58:[2,27],59:[2,27],68:[2,27],69:[2,27],70:[2,27],72:[2,27],74:[2,27],75:[2,27],79:[2,27],81:[2,27],85:[2,27],90:[2,27],92:[2,27],101:[2,27],103:[2,27],104:[2,27],105:[2,27],109:[2,27],115:[2,27],116:[2,27],117:[2,27],125:[2,27],127:[2,27],128:[2,27],129:[2,27],130:[2,27],131:[2,27],132:[2,27],133:[2,27],134:[2,27],135:[2,27],136:[2,27],137:[2,27]},{1:[2,6],6:[2,6],7:204,8:6,9:7,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,27:[2,6],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],101:[2,6],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,3]},{1:[2,25],6:[2,25],26:[2,25],27:[2,25],48:[2,25],53:[2,25],56:[2,25],59:[2,25],74:[2,25],79:[2,25],90:[2,25],92:[2,25],97:[2,25],98:[2,25],101:[2,25],103:[2,25],104:[2,25],105:[2,25],109:[2,25],117:[2,25],120:[2,25],122:[2,25],125:[2,25],127:[2,25],128:[2,25],131:[2,25],132:[2,25],133:[2,25],134:[2,25],135:[2,25],136:[2,25]},{6:[1,105],27:[1,205]},{1:[2,188],6:[2,188],26:[2,188],27:[2,188],48:[2,188],53:[2,188],56:[2,188],59:[2,188],74:[2,188],79:[2,188],90:[2,188],92:[2,188],101:[2,188],103:[2,188],104:[2,188],105:[2,188],109:[2,188],117:[2,188],125:[2,188],127:[2,188],128:[2,188],131:[2,188],132:[2,188],133:[2,188],134:[2,188],135:[2,188],136:[2,188]},{8:206,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:207,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:208,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:209,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:210,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:211,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:212,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:213,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,144],6:[2,144],26:[2,144],27:[2,144],48:[2,144],53:[2,144],56:[2,144],59:[2,144],74:[2,144],79:[2,144],90:[2,144],92:[2,144],101:[2,144],103:[2,144],104:[2,144],105:[2,144],109:[2,144],117:[2,144],125:[2,144],127:[2,144],128:[2,144],131:[2,144],132:[2,144],133:[2,144],134:[2,144],135:[2,144],136:[2,144]},{1:[2,149],6:[2,149],26:[2,149],27:[2,149],48:[2,149],53:[2,149],56:[2,149],59:[2,149],74:[2,149],79:[2,149],90:[2,149],92:[2,149],101:[2,149],103:[2,149],104:[2,149],105:[2,149],109:[2,149],117:[2,149],125:[2,149],127:[2,149],128:[2,149],131:[2,149],132:[2,149],133:[2,149],134:[2,149],135:[2,149],136:[2,149]},{8:214,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,143],6:[2,143],26:[2,143],27:[2,143],48:[2,143],53:[2,143],56:[2,143],59:[2,143],74:[2,143],79:[2,143],90:[2,143],92:[2,143],101:[2,143],103:[2,143],104:[2,143],105:[2,143],109:[2,143],117:[2,143],125:[2,143],127:[2,143],128:[2,143],131:[2,143],132:[2,143],133:[2,143],134:[2,143],135:[2,143],136:[2,143]},{1:[2,148],6:[2,148],26:[2,148],27:[2,148],48:[2,148],53:[2,148],56:[2,148],59:[2,148],74:[2,148],79:[2,148],90:[2,148],92:[2,148],101:[2,148],103:[2,148],104:[2,148],105:[2,148],109:[2,148],117:[2,148],125:[2,148],127:[2,148],128:[2,148],131:[2,148],132:[2,148],133:[2,148],134:[2,148],135:[2,148],136:[2,148]},{58:[1,136],83:215},{1:[2,67],6:[2,67],26:[2,67],27:[2,67],39:[2,67],48:[2,67],53:[2,67],56:[2,67],58:[2,67],59:[2,67],68:[2,67],69:[2,67],70:[2,67],72:[2,67],74:[2,67],75:[2,67],79:[2,67],81:[2,67],85:[2,67],90:[2,67],92:[2,67],101:[2,67],103:[2,67],104:[2,67],105:[2,67],109:[2,67],117:[2,67],125:[2,67],127:[2,67],128:[2,67],129:[2,67],130:[2,67],131:[2,67],132:[2,67],133:[2,67],134:[2,67],135:[2,67],136:[2,67],137:[2,67]},{58:[2,106]},{28:216,29:[1,104]},{28:217,29:[1,104]},{1:[2,81],6:[2,81],26:[2,81],27:[2,81],28:218,29:[1,104],39:[2,81],48:[2,81],53:[2,81],56:[2,81],58:[2,81],59:[2,81],68:[2,81],69:[2,81],70:[2,81],72:[2,81],74:[2,81],75:[2,81],79:[2,81],81:[2,81],85:[2,81],90:[2,81],92:[2,81],101:[2,81],103:[2,81],104:[2,81],105:[2,81],109:[2,81],117:[2,81],125:[2,81],127:[2,81],128:[2,81],129:[2,81],130:[2,81],131:[2,81],132:[2,81],133:[2,81],134:[2,81],135:[2,81],136:[2,81],137:[2,81]},{1:[2,82],6:[2,82],26:[2,82],27:[2,82],39:[2,82],48:[2,82],53:[2,82],56:[2,82],58:[2,82],59:[2,82],68:[2,82],69:[2,82],70:[2,82],72:[2,82],74:[2,82],75:[2,82],79:[2,82],81:[2,82],85:[2,82],90:[2,82],92:[2,82],101:[2,82],103:[2,82],104:[2,82],105:[2,82],109:[2,82],117:[2,82],125:[2,82],127:[2,82],128:[2,82],129:[2,82],130:[2,82],131:[2,82],132:[2,82],133:[2,82],134:[2,82],135:[2,82],136:[2,82],137:[2,82]},{8:220,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],56:[1,224],57:46,60:49,61:50,63:37,65:26,66:27,67:28,73:219,76:221,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],91:222,92:[1,223],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{71:225,72:[1,130],75:[1,131]},{58:[1,136],83:226},{1:[2,68],6:[2,68],26:[2,68],27:[2,68],39:[2,68],48:[2,68],53:[2,68],56:[2,68],58:[2,68],59:[2,68],68:[2,68],69:[2,68],70:[2,68],72:[2,68],74:[2,68],75:[2,68],79:[2,68],81:[2,68],85:[2,68],90:[2,68],92:[2,68],101:[2,68],103:[2,68],104:[2,68],105:[2,68],109:[2,68],117:[2,68],125:[2,68],127:[2,68],128:[2,68],129:[2,68],130:[2,68],131:[2,68],132:[2,68],133:[2,68],134:[2,68],135:[2,68],136:[2,68],137:[2,68]},{6:[1,228],8:227,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,229],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,104],6:[2,104],26:[2,104],27:[2,104],48:[2,104],53:[2,104],56:[2,104],58:[2,104],59:[2,104],68:[2,104],69:[2,104],70:[2,104],72:[2,104],74:[2,104],75:[2,104],79:[2,104],85:[2,104],90:[2,104],92:[2,104],101:[2,104],103:[2,104],104:[2,104],105:[2,104],109:[2,104],117:[2,104],125:[2,104],127:[2,104],128:[2,104],131:[2,104],132:[2,104],133:[2,104],134:[2,104],135:[2,104],136:[2,104]},{8:232,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,179],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,59:[1,230],60:49,61:50,62:180,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],86:231,87:[1,58],88:[1,59],89:[1,57],93:178,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{48:[1,233],53:[1,234]},{48:[2,55],53:[2,55]},{39:[1,236],48:[2,57],53:[2,57],56:[1,235],59:[2,57]},{58:[1,237]},{39:[2,61],48:[2,61],53:[2,61],56:[2,61],59:[2,61]},{39:[2,62],48:[2,62],53:[2,62],56:[2,62],59:[2,62]},{39:[2,63],48:[2,63],53:[2,63],56:[2,63],59:[2,63]},{39:[2,64],48:[2,64],53:[2,64],56:[2,64],59:[2,64]},{28:181,29:[1,104]},{8:232,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,179],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,62:180,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],86:177,87:[1,58],88:[1,59],89:[1,57],90:[1,176],93:178,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,49],6:[2,49],26:[2,49],27:[2,49],48:[2,49],53:[2,49],56:[2,49],59:[2,49],74:[2,49],79:[2,49],90:[2,49],92:[2,49],101:[2,49],103:[2,49],104:[2,49],105:[2,49],109:[2,49],117:[2,49],125:[2,49],127:[2,49],128:[2,49],131:[2,49],132:[2,49],133:[2,49],134:[2,49],135:[2,49],136:[2,49]},{1:[2,181],6:[2,181],26:[2,181],27:[2,181],48:[2,181],53:[2,181],56:[2,181],59:[2,181],74:[2,181],79:[2,181],90:[2,181],92:[2,181],101:[2,181],102:118,103:[2,181],104:[2,181],105:[2,181],108:119,109:[2,181],110:69,117:[2,181],125:[2,181],127:[2,181],128:[2,181],131:[1,109],132:[2,181],133:[2,181],134:[2,181],135:[2,181],136:[2,181]},{102:121,103:[1,65],105:[1,66],108:122,109:[1,68],110:69,125:[1,120]},{1:[2,182],6:[2,182],26:[2,182],27:[2,182],48:[2,182],53:[2,182],56:[2,182],59:[2,182],74:[2,182],79:[2,182],90:[2,182],92:[2,182],101:[2,182],102:118,103:[2,182],104:[2,182],105:[2,182],108:119,109:[2,182],110:69,117:[2,182],125:[2,182],127:[2,182],128:[2,182],131:[1,109],132:[2,182],133:[2,182],134:[2,182],135:[2,182],136:[2,182]},{1:[2,183],6:[2,183],26:[2,183],27:[2,183],48:[2,183],53:[2,183],56:[2,183],59:[2,183],74:[2,183],79:[2,183],90:[2,183],92:[2,183],101:[2,183],102:118,103:[2,183],104:[2,183],105:[2,183],108:119,109:[2,183],110:69,117:[2,183],125:[2,183],127:[2,183],128:[2,183],131:[1,109],132:[2,183],133:[2,183],134:[2,183],135:[2,183],136:[2,183]},{1:[2,184],6:[2,184],26:[2,184],27:[2,184],48:[2,184],53:[2,184],56:[2,184],58:[2,70],59:[2,184],68:[2,70],69:[2,70],70:[2,70],72:[2,70],74:[2,184],75:[2,70],79:[2,184],85:[2,70],90:[2,184],92:[2,184],101:[2,184],103:[2,184],104:[2,184],105:[2,184],109:[2,184],117:[2,184],125:[2,184],127:[2,184],128:[2,184],131:[2,184],132:[2,184],133:[2,184],134:[2,184],135:[2,184],136:[2,184]},{58:[2,105],64:124,68:[1,126],69:[1,127],70:[1,128],71:129,72:[1,130],75:[1,131],82:123,85:[1,125]},{58:[2,105],64:133,68:[1,126],69:[1,127],70:[1,128],71:129,72:[1,130],75:[1,131],82:132,85:[1,125]},{58:[2,73],68:[2,73],69:[2,73],70:[2,73],72:[2,73],75:[2,73],85:[2,73]},{1:[2,185],6:[2,185],26:[2,185],27:[2,185],48:[2,185],53:[2,185],56:[2,185],58:[2,70],59:[2,185],68:[2,70],69:[2,70],70:[2,70],72:[2,70],74:[2,185],75:[2,70],79:[2,185],85:[2,70],90:[2,185],92:[2,185],101:[2,185],103:[2,185],104:[2,185],105:[2,185],109:[2,185],117:[2,185],125:[2,185],127:[2,185],128:[2,185],131:[2,185],132:[2,185],133:[2,185],134:[2,185],135:[2,185],136:[2,185]},{1:[2,186],6:[2,186],26:[2,186],27:[2,186],48:[2,186],53:[2,186],56:[2,186],59:[2,186],74:[2,186],79:[2,186],90:[2,186],92:[2,186],101:[2,186],103:[2,186],104:[2,186],105:[2,186],109:[2,186],117:[2,186],125:[2,186],127:[2,186],128:[2,186],131:[2,186],132:[2,186],133:[2,186],134:[2,186],135:[2,186],136:[2,186]},{1:[2,187],6:[2,187],26:[2,187],27:[2,187],48:[2,187],53:[2,187],56:[2,187],59:[2,187],74:[2,187],79:[2,187],90:[2,187],92:[2,187],101:[2,187],103:[2,187],104:[2,187],105:[2,187],109:[2,187],117:[2,187],125:[2,187],127:[2,187],128:[2,187],131:[2,187],132:[2,187],133:[2,187],134:[2,187],135:[2,187],136:[2,187]},{8:238,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,239],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:240,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{5:241,26:[1,5],124:[1,242]},{1:[2,130],6:[2,130],26:[2,130],27:[2,130],48:[2,130],53:[2,130],56:[2,130],59:[2,130],74:[2,130],79:[2,130],90:[2,130],92:[2,130],96:243,97:[1,244],98:[1,245],101:[2,130],103:[2,130],104:[2,130],105:[2,130],109:[2,130],117:[2,130],125:[2,130],127:[2,130],128:[2,130],131:[2,130],132:[2,130],133:[2,130],134:[2,130],135:[2,130],136:[2,130]},{1:[2,142],6:[2,142],26:[2,142],27:[2,142],48:[2,142],53:[2,142],56:[2,142],59:[2,142],74:[2,142],79:[2,142],90:[2,142],92:[2,142],101:[2,142],103:[2,142],104:[2,142],105:[2,142],109:[2,142],117:[2,142],125:[2,142],127:[2,142],128:[2,142],131:[2,142],132:[2,142],133:[2,142],134:[2,142],135:[2,142],136:[2,142]},{1:[2,150],6:[2,150],26:[2,150],27:[2,150],48:[2,150],53:[2,150],56:[2,150],59:[2,150],74:[2,150],79:[2,150],90:[2,150],92:[2,150],101:[2,150],103:[2,150],104:[2,150],105:[2,150],109:[2,150],117:[2,150],125:[2,150],127:[2,150],128:[2,150],131:[2,150],132:[2,150],133:[2,150],134:[2,150],135:[2,150],136:[2,150]},{26:[1,246],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{119:247,121:248,122:[1,249]},{1:[2,94],6:[2,94],26:[2,94],27:[2,94],48:[2,94],53:[2,94],56:[2,94],59:[2,94],74:[2,94],79:[2,94],90:[2,94],92:[2,94],101:[2,94],103:[2,94],104:[2,94],105:[2,94],109:[2,94],117:[2,94],125:[2,94],127:[2,94],128:[2,94],131:[2,94],132:[2,94],133:[2,94],134:[2,94],135:[2,94],136:[2,94]},{8:250,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,97],5:251,6:[2,97],26:[1,5],27:[2,97],48:[2,97],53:[2,97],56:[2,97],58:[2,70],59:[2,97],68:[2,70],69:[2,70],70:[2,70],72:[2,70],74:[2,97],75:[2,70],79:[2,97],81:[1,252],85:[2,70],90:[2,97],92:[2,97],101:[2,97],103:[2,97],104:[2,97],105:[2,97],109:[2,97],117:[2,97],125:[2,97],127:[2,97],128:[2,97],131:[2,97],132:[2,97],133:[2,97],134:[2,97],135:[2,97],136:[2,97]},{1:[2,135],6:[2,135],26:[2,135],27:[2,135],48:[2,135],53:[2,135],56:[2,135],59:[2,135],74:[2,135],79:[2,135],90:[2,135],92:[2,135],101:[2,135],102:118,103:[2,135],104:[2,135],105:[2,135],108:119,109:[2,135],110:69,117:[2,135],125:[2,135],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,230],6:[2,230],26:[2,230],27:[2,230],48:[2,230],53:[2,230],56:[2,230],59:[2,230],74:[2,230],79:[2,230],90:[2,230],92:[2,230],101:[2,230],103:[2,230],104:[2,230],105:[2,230],109:[2,230],117:[2,230],125:[2,230],127:[2,230],128:[2,230],131:[2,230],132:[2,230],133:[2,230],134:[2,230],135:[2,230],136:[2,230]},{1:[2,45],6:[2,45],27:[2,45],101:[2,45],102:118,103:[2,45],105:[2,45],108:119,109:[2,45],110:69,125:[2,45],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{6:[1,105],101:[1,253]},{4:254,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{6:[2,126],26:[2,126],53:[2,126],56:[1,256],90:[2,126],91:255,92:[1,223],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,112],6:[2,112],26:[2,112],27:[2,112],39:[2,112],48:[2,112],53:[2,112],56:[2,112],58:[2,112],59:[2,112],68:[2,112],69:[2,112],70:[2,112],72:[2,112],74:[2,112],75:[2,112],79:[2,112],85:[2,112],90:[2,112],92:[2,112],101:[2,112],103:[2,112],104:[2,112],105:[2,112],109:[2,112],115:[2,112],116:[2,112],117:[2,112],125:[2,112],127:[2,112],128:[2,112],131:[2,112],132:[2,112],133:[2,112],134:[2,112],135:[2,112],136:[2,112]},{6:[2,52],26:[2,52],52:257,53:[1,258],90:[2,52]},{6:[2,121],26:[2,121],27:[2,121],53:[2,121],59:[2,121],90:[2,121]},{8:232,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,179],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,62:180,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],86:259,87:[1,58],88:[1,59],89:[1,57],93:178,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{6:[2,127],26:[2,127],27:[2,127],53:[2,127],59:[2,127],90:[2,127]},{1:[2,111],6:[2,111],26:[2,111],27:[2,111],39:[2,111],42:[2,111],48:[2,111],53:[2,111],56:[2,111],58:[2,111],59:[2,111],68:[2,111],69:[2,111],70:[2,111],72:[2,111],74:[2,111],75:[2,111],79:[2,111],81:[2,111],85:[2,111],90:[2,111],92:[2,111],101:[2,111],103:[2,111],104:[2,111],105:[2,111],109:[2,111],117:[2,111],125:[2,111],127:[2,111],128:[2,111],129:[2,111],130:[2,111],131:[2,111],132:[2,111],133:[2,111],134:[2,111],135:[2,111],136:[2,111],137:[2,111]},{5:260,26:[1,5],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,138],6:[2,138],26:[2,138],27:[2,138],48:[2,138],53:[2,138],56:[2,138],59:[2,138],74:[2,138],79:[2,138],90:[2,138],92:[2,138],101:[2,138],102:118,103:[1,65],104:[1,261],105:[1,66],108:119,109:[1,68],110:69,117:[2,138],125:[2,138],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,140],6:[2,140],26:[2,140],27:[2,140],48:[2,140],53:[2,140],56:[2,140],59:[2,140],74:[2,140],79:[2,140],90:[2,140],92:[2,140],101:[2,140],102:118,103:[1,65],104:[1,262],105:[1,66],108:119,109:[1,68],110:69,117:[2,140],125:[2,140],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,146],6:[2,146],26:[2,146],27:[2,146],48:[2,146],53:[2,146],56:[2,146],59:[2,146],74:[2,146],79:[2,146],90:[2,146],92:[2,146],101:[2,146],103:[2,146],104:[2,146],105:[2,146],109:[2,146],117:[2,146],125:[2,146],127:[2,146],128:[2,146],131:[2,146],132:[2,146],133:[2,146],134:[2,146],135:[2,146],136:[2,146]},{1:[2,147],6:[2,147],26:[2,147],27:[2,147],48:[2,147],53:[2,147],56:[2,147],59:[2,147],74:[2,147],79:[2,147],90:[2,147],92:[2,147],101:[2,147],102:118,103:[1,65],104:[2,147],105:[1,66],108:119,109:[1,68],110:69,117:[2,147],125:[2,147],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,151],6:[2,151],26:[2,151],27:[2,151],48:[2,151],53:[2,151],56:[2,151],59:[2,151],74:[2,151],79:[2,151],90:[2,151],92:[2,151],101:[2,151],103:[2,151],104:[2,151],105:[2,151],109:[2,151],117:[2,151],125:[2,151],127:[2,151],128:[2,151],131:[2,151],132:[2,151],133:[2,151],134:[2,151],135:[2,151],136:[2,151]},{115:[2,153],116:[2,153]},{28:191,29:[1,104],60:192,61:193,77:[1,101],89:[1,146],112:263,114:190},{53:[1,264],115:[2,158],116:[2,158]},{53:[2,155],115:[2,155],116:[2,155]},{53:[2,156],115:[2,156],116:[2,156]},{53:[2,157],115:[2,157],116:[2,157]},{1:[2,152],6:[2,152],26:[2,152],27:[2,152],48:[2,152],53:[2,152],56:[2,152],59:[2,152],74:[2,152],79:[2,152],90:[2,152],92:[2,152],101:[2,152],103:[2,152],104:[2,152],105:[2,152],109:[2,152],117:[2,152],125:[2,152],127:[2,152],128:[2,152],131:[2,152],132:[2,152],133:[2,152],134:[2,152],135:[2,152],136:[2,152]},{8:265,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:266,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{6:[2,52],26:[2,52],52:267,53:[1,268],79:[2,52]},{6:[2,89],26:[2,89],27:[2,89],53:[2,89],79:[2,89]},{6:[2,38],26:[2,38],27:[2,38],42:[1,269],53:[2,38],79:[2,38]},{6:[2,41],26:[2,41],27:[2,41],53:[2,41],79:[2,41]},{6:[2,42],26:[2,42],27:[2,42],42:[2,42],53:[2,42],79:[2,42]},{6:[2,43],26:[2,43],27:[2,43],42:[2,43],53:[2,43],79:[2,43]},{6:[2,44],26:[2,44],27:[2,44],42:[2,44],53:[2,44],79:[2,44]},{1:[2,5],6:[2,5],27:[2,5],101:[2,5]},{1:[2,26],6:[2,26],26:[2,26],27:[2,26],48:[2,26],53:[2,26],56:[2,26],59:[2,26],74:[2,26],79:[2,26],90:[2,26],92:[2,26],97:[2,26],98:[2,26],101:[2,26],103:[2,26],104:[2,26],105:[2,26],109:[2,26],117:[2,26],120:[2,26],122:[2,26],125:[2,26],127:[2,26],128:[2,26],131:[2,26],132:[2,26],133:[2,26],134:[2,26],135:[2,26],136:[2,26]},{1:[2,189],6:[2,189],26:[2,189],27:[2,189],48:[2,189],53:[2,189],56:[2,189],59:[2,189],74:[2,189],79:[2,189],90:[2,189],92:[2,189],101:[2,189],102:118,103:[2,189],104:[2,189],105:[2,189],108:119,109:[2,189],110:69,117:[2,189],125:[2,189],127:[2,189],128:[2,189],131:[1,109],132:[1,112],133:[2,189],134:[2,189],135:[2,189],136:[2,189]},{1:[2,190],6:[2,190],26:[2,190],27:[2,190],48:[2,190],53:[2,190],56:[2,190],59:[2,190],74:[2,190],79:[2,190],90:[2,190],92:[2,190],101:[2,190],102:118,103:[2,190],104:[2,190],105:[2,190],108:119,109:[2,190],110:69,117:[2,190],125:[2,190],127:[2,190],128:[2,190],131:[1,109],132:[1,112],133:[2,190],134:[2,190],135:[2,190],136:[2,190]},{1:[2,191],6:[2,191],26:[2,191],27:[2,191],48:[2,191],53:[2,191],56:[2,191],59:[2,191],74:[2,191],79:[2,191],90:[2,191],92:[2,191],101:[2,191],102:118,103:[2,191],104:[2,191],105:[2,191],108:119,109:[2,191],110:69,117:[2,191],125:[2,191],127:[2,191],128:[2,191],131:[1,109],132:[2,191],133:[2,191],134:[2,191],135:[2,191],136:[2,191]},{1:[2,192],6:[2,192],26:[2,192],27:[2,192],48:[2,192],53:[2,192],56:[2,192],59:[2,192],74:[2,192],79:[2,192],90:[2,192],92:[2,192],101:[2,192],102:118,103:[2,192],104:[2,192],105:[2,192],108:119,109:[2,192],110:69,117:[2,192],125:[2,192],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[2,192],134:[2,192],135:[2,192],136:[2,192]},{1:[2,193],6:[2,193],26:[2,193],27:[2,193],48:[2,193],53:[2,193],56:[2,193],59:[2,193],74:[2,193],79:[2,193],90:[2,193],92:[2,193],101:[2,193],102:118,103:[2,193],104:[2,193],105:[2,193],108:119,109:[2,193],110:69,117:[2,193],125:[2,193],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[2,193],135:[2,193],136:[1,116]},{1:[2,194],6:[2,194],26:[2,194],27:[2,194],48:[2,194],53:[2,194],56:[2,194],59:[2,194],74:[2,194],79:[2,194],90:[2,194],92:[2,194],101:[2,194],102:118,103:[2,194],104:[2,194],105:[2,194],108:119,109:[2,194],110:69,117:[2,194],125:[2,194],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[2,194],136:[1,116]},{1:[2,195],6:[2,195],26:[2,195],27:[2,195],48:[2,195],53:[2,195],56:[2,195],59:[2,195],74:[2,195],79:[2,195],90:[2,195],92:[2,195],101:[2,195],102:118,103:[2,195],104:[2,195],105:[2,195],108:119,109:[2,195],110:69,117:[2,195],125:[2,195],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[2,195],135:[2,195],136:[2,195]},{1:[2,180],6:[2,180],26:[2,180],27:[2,180],48:[2,180],53:[2,180],56:[2,180],59:[2,180],74:[2,180],79:[2,180],90:[2,180],92:[2,180],101:[2,180],102:118,103:[1,65],104:[2,180],105:[1,66],108:119,109:[1,68],110:69,117:[2,180],125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,179],6:[2,179],26:[2,179],27:[2,179],48:[2,179],53:[2,179],56:[2,179],59:[2,179],74:[2,179],79:[2,179],90:[2,179],92:[2,179],101:[2,179],102:118,103:[1,65],104:[2,179],105:[1,66],108:119,109:[1,68],110:69,117:[2,179],125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,101],6:[2,101],26:[2,101],27:[2,101],48:[2,101],53:[2,101],56:[2,101],58:[2,101],59:[2,101],68:[2,101],69:[2,101],70:[2,101],72:[2,101],74:[2,101],75:[2,101],79:[2,101],85:[2,101],90:[2,101],92:[2,101],101:[2,101],103:[2,101],104:[2,101],105:[2,101],109:[2,101],117:[2,101],125:[2,101],127:[2,101],128:[2,101],131:[2,101],132:[2,101],133:[2,101],134:[2,101],135:[2,101],136:[2,101]},{1:[2,78],6:[2,78],26:[2,78],27:[2,78],39:[2,78],48:[2,78],53:[2,78],56:[2,78],58:[2,78],59:[2,78],68:[2,78],69:[2,78],70:[2,78],72:[2,78],74:[2,78],75:[2,78],79:[2,78],81:[2,78],85:[2,78],90:[2,78],92:[2,78],101:[2,78],103:[2,78],104:[2,78],105:[2,78],109:[2,78],117:[2,78],125:[2,78],127:[2,78],128:[2,78],129:[2,78],130:[2,78],131:[2,78],132:[2,78],133:[2,78],134:[2,78],135:[2,78],136:[2,78],137:[2,78]},{1:[2,79],6:[2,79],26:[2,79],27:[2,79],39:[2,79],48:[2,79],53:[2,79],56:[2,79],58:[2,79],59:[2,79],68:[2,79],69:[2,79],70:[2,79],72:[2,79],74:[2,79],75:[2,79],79:[2,79],81:[2,79],85:[2,79],90:[2,79],92:[2,79],101:[2,79],103:[2,79],104:[2,79],105:[2,79],109:[2,79],117:[2,79],125:[2,79],127:[2,79],128:[2,79],129:[2,79],130:[2,79],131:[2,79],132:[2,79],133:[2,79],134:[2,79],135:[2,79],136:[2,79],137:[2,79]},{1:[2,80],6:[2,80],26:[2,80],27:[2,80],39:[2,80],48:[2,80],53:[2,80],56:[2,80],58:[2,80],59:[2,80],68:[2,80],69:[2,80],70:[2,80],72:[2,80],74:[2,80],75:[2,80],79:[2,80],81:[2,80],85:[2,80],90:[2,80],92:[2,80],101:[2,80],103:[2,80],104:[2,80],105:[2,80],109:[2,80],117:[2,80],125:[2,80],127:[2,80],128:[2,80],129:[2,80],130:[2,80],131:[2,80],132:[2,80],133:[2,80],134:[2,80],135:[2,80],136:[2,80],137:[2,80]},{74:[1,270]},{56:[1,224],74:[2,85],91:271,92:[1,223],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{74:[2,86]},{8:272,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,74:[2,120],77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{12:[2,114],29:[2,114],31:[2,114],32:[2,114],34:[2,114],35:[2,114],36:[2,114],37:[2,114],44:[2,114],45:[2,114],46:[2,114],50:[2,114],51:[2,114],74:[2,114],77:[2,114],80:[2,114],84:[2,114],87:[2,114],88:[2,114],89:[2,114],95:[2,114],99:[2,114],100:[2,114],103:[2,114],105:[2,114],107:[2,114],109:[2,114],118:[2,114],124:[2,114],126:[2,114],127:[2,114],128:[2,114],129:[2,114],130:[2,114],138:[2,114],139:[2,114],140:[2,114],141:[2,114],142:[2,114],143:[2,114],144:[2,114],145:[2,114],146:[2,114],147:[2,114],148:[2,114],149:[2,114],150:[2,114],151:[2,114],152:[2,114],153:[2,114],154:[2,114],155:[2,114],156:[2,114],157:[2,114],158:[2,114],159:[2,114],160:[2,114],161:[2,114],162:[2,114],163:[2,114],164:[2,114],165:[2,114],166:[2,114],167:[2,114],168:[2,114]},{12:[2,115],29:[2,115],31:[2,115],32:[2,115],34:[2,115],35:[2,115],36:[2,115],37:[2,115],44:[2,115],45:[2,115],46:[2,115],50:[2,115],51:[2,115],74:[2,115],77:[2,115],80:[2,115],84:[2,115],87:[2,115],88:[2,115],89:[2,115],95:[2,115],99:[2,115],100:[2,115],103:[2,115],105:[2,115],107:[2,115],109:[2,115],118:[2,115],124:[2,115],126:[2,115],127:[2,115],128:[2,115],129:[2,115],130:[2,115],138:[2,115],139:[2,115],140:[2,115],141:[2,115],142:[2,115],143:[2,115],144:[2,115],145:[2,115],146:[2,115],147:[2,115],148:[2,115],149:[2,115],150:[2,115],151:[2,115],152:[2,115],153:[2,115],154:[2,115],155:[2,115],156:[2,115],157:[2,115],158:[2,115],159:[2,115],160:[2,115],161:[2,115],162:[2,115],163:[2,115],164:[2,115],165:[2,115],166:[2,115],167:[2,115],168:[2,115]},{1:[2,84],6:[2,84],26:[2,84],27:[2,84],39:[2,84],48:[2,84],53:[2,84],56:[2,84],58:[2,84],59:[2,84],68:[2,84],69:[2,84],70:[2,84],72:[2,84],74:[2,84],75:[2,84],79:[2,84],81:[2,84],85:[2,84],90:[2,84],92:[2,84],101:[2,84],103:[2,84],104:[2,84],105:[2,84],109:[2,84],117:[2,84],125:[2,84],127:[2,84],128:[2,84],129:[2,84],130:[2,84],131:[2,84],132:[2,84],133:[2,84],134:[2,84],135:[2,84],136:[2,84],137:[2,84]},{1:[2,102],6:[2,102],26:[2,102],27:[2,102],48:[2,102],53:[2,102],56:[2,102],58:[2,102],59:[2,102],68:[2,102],69:[2,102],70:[2,102],72:[2,102],74:[2,102],75:[2,102],79:[2,102],85:[2,102],90:[2,102],92:[2,102],101:[2,102],103:[2,102],104:[2,102],105:[2,102],109:[2,102],117:[2,102],125:[2,102],127:[2,102],128:[2,102],131:[2,102],132:[2,102],133:[2,102],134:[2,102],135:[2,102],136:[2,102]},{1:[2,35],6:[2,35],26:[2,35],27:[2,35],48:[2,35],53:[2,35],56:[2,35],59:[2,35],74:[2,35],79:[2,35],90:[2,35],92:[2,35],101:[2,35],102:118,103:[2,35],104:[2,35],105:[2,35],108:119,109:[2,35],110:69,117:[2,35],125:[2,35],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{8:273,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:274,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,107],6:[2,107],26:[2,107],27:[2,107],48:[2,107],53:[2,107],56:[2,107],58:[2,107],59:[2,107],68:[2,107],69:[2,107],70:[2,107],72:[2,107],74:[2,107],75:[2,107],79:[2,107],85:[2,107],90:[2,107],92:[2,107],101:[2,107],103:[2,107],104:[2,107],105:[2,107],109:[2,107],117:[2,107],125:[2,107],127:[2,107],128:[2,107],131:[2,107],132:[2,107],133:[2,107],134:[2,107],135:[2,107],136:[2,107]},{6:[2,52],26:[2,52],52:275,53:[1,258],59:[2,52]},{6:[2,126],26:[2,126],27:[2,126],53:[2,126],56:[1,276],59:[2,126],90:[2,126],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{49:277,50:[1,60],51:[1,61]},{28:141,29:[1,104],43:142,54:278,55:139,57:140,60:143,61:144,77:[1,101],88:[1,145],89:[1,146],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{48:[2,58],53:[2,58],59:[2,58]},{8:279,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{28:141,29:[1,104],43:142,54:280,55:139,57:140,60:143,61:144,77:[1,101],88:[1,145],89:[1,146],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,196],6:[2,196],26:[2,196],27:[2,196],48:[2,196],53:[2,196],56:[2,196],59:[2,196],74:[2,196],79:[2,196],90:[2,196],92:[2,196],101:[2,196],102:118,103:[2,196],104:[2,196],105:[2,196],108:119,109:[2,196],110:69,117:[2,196],125:[2,196],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{8:281,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,198],6:[2,198],26:[2,198],27:[2,198],48:[2,198],53:[2,198],56:[2,198],59:[2,198],74:[2,198],79:[2,198],90:[2,198],92:[2,198],101:[2,198],102:118,103:[2,198],104:[2,198],105:[2,198],108:119,109:[2,198],110:69,117:[2,198],125:[2,198],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,178],6:[2,178],26:[2,178],27:[2,178],48:[2,178],53:[2,178],56:[2,178],59:[2,178],74:[2,178],79:[2,178],90:[2,178],92:[2,178],101:[2,178],103:[2,178],104:[2,178],105:[2,178],109:[2,178],117:[2,178],125:[2,178],127:[2,178],128:[2,178],131:[2,178],132:[2,178],133:[2,178],134:[2,178],135:[2,178],136:[2,178]},{8:282,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,131],6:[2,131],26:[2,131],27:[2,131],48:[2,131],53:[2,131],56:[2,131],59:[2,131],74:[2,131],79:[2,131],90:[2,131],92:[2,131],97:[1,283],101:[2,131],103:[2,131],104:[2,131],105:[2,131],109:[2,131],117:[2,131],125:[2,131],127:[2,131],128:[2,131],131:[2,131],132:[2,131],133:[2,131],134:[2,131],135:[2,131],136:[2,131]},{5:284,26:[1,5]},{28:285,29:[1,104]},{119:286,121:248,122:[1,249]},{27:[1,287],120:[1,288],121:289,122:[1,249]},{27:[2,171],120:[2,171],122:[2,171]},{8:291,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],94:290,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,95],5:292,6:[2,95],26:[1,5],27:[2,95],48:[2,95],53:[2,95],56:[2,95],59:[2,95],74:[2,95],79:[2,95],90:[2,95],92:[2,95],101:[2,95],102:118,103:[1,65],104:[2,95],105:[1,66],108:119,109:[1,68],110:69,117:[2,95],125:[2,95],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,98],6:[2,98],26:[2,98],27:[2,98],48:[2,98],53:[2,98],56:[2,98],59:[2,98],74:[2,98],79:[2,98],90:[2,98],92:[2,98],101:[2,98],103:[2,98],104:[2,98],105:[2,98],109:[2,98],117:[2,98],125:[2,98],127:[2,98],128:[2,98],131:[2,98],132:[2,98],133:[2,98],134:[2,98],135:[2,98],136:[2,98]},{8:293,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,136],6:[2,136],26:[2,136],27:[2,136],48:[2,136],53:[2,136],56:[2,136],58:[2,136],59:[2,136],68:[2,136],69:[2,136],70:[2,136],72:[2,136],74:[2,136],75:[2,136],79:[2,136],85:[2,136],90:[2,136],92:[2,136],101:[2,136],103:[2,136],104:[2,136],105:[2,136],109:[2,136],117:[2,136],125:[2,136],127:[2,136],128:[2,136],131:[2,136],132:[2,136],133:[2,136],134:[2,136],135:[2,136],136:[2,136]},{6:[1,105],27:[1,294]},{8:295,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{6:[2,65],12:[2,115],26:[2,65],29:[2,115],31:[2,115],32:[2,115],34:[2,115],35:[2,115],36:[2,115],37:[2,115],44:[2,115],45:[2,115],46:[2,115],50:[2,115],51:[2,115],53:[2,65],77:[2,115],80:[2,115],84:[2,115],87:[2,115],88:[2,115],89:[2,115],90:[2,65],95:[2,115],99:[2,115],100:[2,115],103:[2,115],105:[2,115],107:[2,115],109:[2,115],118:[2,115],124:[2,115],126:[2,115],127:[2,115],128:[2,115],129:[2,115],130:[2,115],138:[2,115],139:[2,115],140:[2,115],141:[2,115],142:[2,115],143:[2,115],144:[2,115],145:[2,115],146:[2,115],147:[2,115],148:[2,115],149:[2,115],150:[2,115],151:[2,115],152:[2,115],153:[2,115],154:[2,115],155:[2,115],156:[2,115],157:[2,115],158:[2,115],159:[2,115],160:[2,115],161:[2,115],162:[2,115],163:[2,115],164:[2,115],165:[2,115],166:[2,115],167:[2,115],168:[2,115]},{6:[1,297],26:[1,298],90:[1,296]},{6:[2,53],8:232,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[2,53],27:[2,53],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,59:[2,53],60:49,61:50,62:180,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],90:[2,53],93:299,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{6:[2,52],26:[2,52],27:[2,52],52:300,53:[1,258]},{1:[2,175],6:[2,175],26:[2,175],27:[2,175],48:[2,175],53:[2,175],56:[2,175],59:[2,175],74:[2,175],79:[2,175],90:[2,175],92:[2,175],101:[2,175],103:[2,175],104:[2,175],105:[2,175],109:[2,175],117:[2,175],120:[2,175],125:[2,175],127:[2,175],128:[2,175],131:[2,175],132:[2,175],133:[2,175],134:[2,175],135:[2,175],136:[2,175]},{8:301,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:302,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{115:[2,154],116:[2,154]},{28:191,29:[1,104],60:192,61:193,77:[1,101],89:[1,146],114:303},{1:[2,160],6:[2,160],26:[2,160],27:[2,160],48:[2,160],53:[2,160],56:[2,160],59:[2,160],74:[2,160],79:[2,160],90:[2,160],92:[2,160],101:[2,160],102:118,103:[2,160],104:[1,304],105:[2,160],108:119,109:[2,160],110:69,117:[1,305],125:[2,160],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,161],6:[2,161],26:[2,161],27:[2,161],48:[2,161],53:[2,161],56:[2,161],59:[2,161],74:[2,161],79:[2,161],90:[2,161],92:[2,161],101:[2,161],102:118,103:[2,161],104:[1,306],105:[2,161],108:119,109:[2,161],110:69,117:[2,161],125:[2,161],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{6:[1,308],26:[1,309],79:[1,307]},{6:[2,53],11:200,26:[2,53],27:[2,53],28:201,29:[1,104],30:202,31:[1,102],32:[1,103],40:310,41:199,43:203,45:[1,48],79:[2,53],88:[1,145]},{8:311,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,312],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,83],6:[2,83],26:[2,83],27:[2,83],39:[2,83],48:[2,83],53:[2,83],56:[2,83],58:[2,83],59:[2,83],68:[2,83],69:[2,83],70:[2,83],72:[2,83],74:[2,83],75:[2,83],79:[2,83],81:[2,83],85:[2,83],90:[2,83],92:[2,83],101:[2,83],103:[2,83],104:[2,83],105:[2,83],109:[2,83],117:[2,83],125:[2,83],127:[2,83],128:[2,83],129:[2,83],130:[2,83],131:[2,83],132:[2,83],133:[2,83],134:[2,83],135:[2,83],136:[2,83],137:[2,83]},{8:313,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,74:[2,118],77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{74:[2,119],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,36],6:[2,36],26:[2,36],27:[2,36],48:[2,36],53:[2,36],56:[2,36],59:[2,36],74:[2,36],79:[2,36],90:[2,36],92:[2,36],101:[2,36],102:118,103:[2,36],104:[2,36],105:[2,36],108:119,109:[2,36],110:69,117:[2,36],125:[2,36],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{27:[1,314],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{6:[1,297],26:[1,298],59:[1,315]},{6:[2,65],26:[2,65],27:[2,65],53:[2,65],59:[2,65],90:[2,65]},{5:316,26:[1,5]},{48:[2,56],53:[2,56]},{48:[2,59],53:[2,59],59:[2,59],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{59:[1,317]},{27:[1,318],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{5:319,26:[1,5],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{5:320,26:[1,5]},{1:[2,132],6:[2,132],26:[2,132],27:[2,132],48:[2,132],53:[2,132],56:[2,132],59:[2,132],74:[2,132],79:[2,132],90:[2,132],92:[2,132],101:[2,132],103:[2,132],104:[2,132],105:[2,132],109:[2,132],117:[2,132],125:[2,132],127:[2,132],128:[2,132],131:[2,132],132:[2,132],133:[2,132],134:[2,132],135:[2,132],136:[2,132]},{5:321,26:[1,5]},{27:[1,322],120:[1,323],121:289,122:[1,249]},{1:[2,169],6:[2,169],26:[2,169],27:[2,169],48:[2,169],53:[2,169],56:[2,169],59:[2,169],74:[2,169],79:[2,169],90:[2,169],92:[2,169],101:[2,169],103:[2,169],104:[2,169],105:[2,169],109:[2,169],117:[2,169],125:[2,169],127:[2,169],128:[2,169],131:[2,169],132:[2,169],133:[2,169],134:[2,169],135:[2,169],136:[2,169]},{5:324,26:[1,5]},{27:[2,172],120:[2,172],122:[2,172]},{5:325,26:[1,5],53:[1,326]},{26:[2,128],53:[2,128],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,96],6:[2,96],26:[2,96],27:[2,96],48:[2,96],53:[2,96],56:[2,96],59:[2,96],74:[2,96],79:[2,96],90:[2,96],92:[2,96],101:[2,96],103:[2,96],104:[2,96],105:[2,96],109:[2,96],117:[2,96],125:[2,96],127:[2,96],128:[2,96],131:[2,96],132:[2,96],133:[2,96],134:[2,96],135:[2,96],136:[2,96]},{1:[2,99],5:327,6:[2,99],26:[1,5],27:[2,99],48:[2,99],53:[2,99],56:[2,99],59:[2,99],74:[2,99],79:[2,99],90:[2,99],92:[2,99],101:[2,99],102:118,103:[1,65],104:[2,99],105:[1,66],108:119,109:[1,68],110:69,117:[2,99],125:[2,99],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{101:[1,328]},{90:[1,329],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,113],6:[2,113],26:[2,113],27:[2,113],39:[2,113],48:[2,113],53:[2,113],56:[2,113],58:[2,113],59:[2,113],68:[2,113],69:[2,113],70:[2,113],72:[2,113],74:[2,113],75:[2,113],79:[2,113],85:[2,113],90:[2,113],92:[2,113],101:[2,113],103:[2,113],104:[2,113],105:[2,113],109:[2,113],115:[2,113],116:[2,113],117:[2,113],125:[2,113],127:[2,113],128:[2,113],131:[2,113],132:[2,113],133:[2,113],134:[2,113],135:[2,113],136:[2,113]},{8:232,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,62:180,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],93:330,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:232,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,26:[1,179],28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,62:180,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],86:331,87:[1,58],88:[1,59],89:[1,57],93:178,95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{6:[2,122],26:[2,122],27:[2,122],53:[2,122],59:[2,122],90:[2,122]},{6:[1,297],26:[1,298],27:[1,332]},{1:[2,139],6:[2,139],26:[2,139],27:[2,139],48:[2,139],53:[2,139],56:[2,139],59:[2,139],74:[2,139],79:[2,139],90:[2,139],92:[2,139],101:[2,139],102:118,103:[1,65],104:[2,139],105:[1,66],108:119,109:[1,68],110:69,117:[2,139],125:[2,139],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,141],6:[2,141],26:[2,141],27:[2,141],48:[2,141],53:[2,141],56:[2,141],59:[2,141],74:[2,141],79:[2,141],90:[2,141],92:[2,141],101:[2,141],102:118,103:[1,65],104:[2,141],105:[1,66],108:119,109:[1,68],110:69,117:[2,141],125:[2,141],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{115:[2,159],116:[2,159]},{8:333,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:334,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:335,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,87],6:[2,87],26:[2,87],27:[2,87],39:[2,87],48:[2,87],53:[2,87],56:[2,87],58:[2,87],59:[2,87],68:[2,87],69:[2,87],70:[2,87],72:[2,87],74:[2,87],75:[2,87],79:[2,87],85:[2,87],90:[2,87],92:[2,87],101:[2,87],103:[2,87],104:[2,87],105:[2,87],109:[2,87],115:[2,87],116:[2,87],117:[2,87],125:[2,87],127:[2,87],128:[2,87],131:[2,87],132:[2,87],133:[2,87],134:[2,87],135:[2,87],136:[2,87]},{11:200,28:201,29:[1,104],30:202,31:[1,102],32:[1,103],40:336,41:199,43:203,45:[1,48],88:[1,145]},{6:[2,88],11:200,26:[2,88],27:[2,88],28:201,29:[1,104],30:202,31:[1,102],32:[1,103],40:198,41:199,43:203,45:[1,48],53:[2,88],78:337,88:[1,145]},{6:[2,90],26:[2,90],27:[2,90],53:[2,90],79:[2,90]},{6:[2,39],26:[2,39],27:[2,39],53:[2,39],79:[2,39],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{8:338,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{74:[2,117],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,37],6:[2,37],26:[2,37],27:[2,37],48:[2,37],53:[2,37],56:[2,37],59:[2,37],74:[2,37],79:[2,37],90:[2,37],92:[2,37],101:[2,37],103:[2,37],104:[2,37],105:[2,37],109:[2,37],117:[2,37],125:[2,37],127:[2,37],128:[2,37],131:[2,37],132:[2,37],133:[2,37],134:[2,37],135:[2,37],136:[2,37]},{1:[2,108],6:[2,108],26:[2,108],27:[2,108],48:[2,108],53:[2,108],56:[2,108],58:[2,108],59:[2,108],68:[2,108],69:[2,108],70:[2,108],72:[2,108],74:[2,108],75:[2,108],79:[2,108],85:[2,108],90:[2,108],92:[2,108],101:[2,108],103:[2,108],104:[2,108],105:[2,108],109:[2,108],117:[2,108],125:[2,108],127:[2,108],128:[2,108],131:[2,108],132:[2,108],133:[2,108],134:[2,108],135:[2,108],136:[2,108]},{1:[2,48],6:[2,48],26:[2,48],27:[2,48],48:[2,48],53:[2,48],56:[2,48],59:[2,48],74:[2,48],79:[2,48],90:[2,48],92:[2,48],101:[2,48],103:[2,48],104:[2,48],105:[2,48],109:[2,48],117:[2,48],125:[2,48],127:[2,48],128:[2,48],131:[2,48],132:[2,48],133:[2,48],134:[2,48],135:[2,48],136:[2,48]},{48:[2,60],53:[2,60],59:[2,60]},{1:[2,197],6:[2,197],26:[2,197],27:[2,197],48:[2,197],53:[2,197],56:[2,197],59:[2,197],74:[2,197],79:[2,197],90:[2,197],92:[2,197],101:[2,197],103:[2,197],104:[2,197],105:[2,197],109:[2,197],117:[2,197],125:[2,197],127:[2,197],128:[2,197],131:[2,197],132:[2,197],133:[2,197],134:[2,197],135:[2,197],136:[2,197]},{1:[2,176],6:[2,176],26:[2,176],27:[2,176],48:[2,176],53:[2,176],56:[2,176],59:[2,176],74:[2,176],79:[2,176],90:[2,176],92:[2,176],101:[2,176],103:[2,176],104:[2,176],105:[2,176],109:[2,176],117:[2,176],120:[2,176],125:[2,176],127:[2,176],128:[2,176],131:[2,176],132:[2,176],133:[2,176],134:[2,176],135:[2,176],136:[2,176]},{1:[2,133],6:[2,133],26:[2,133],27:[2,133],48:[2,133],53:[2,133],56:[2,133],59:[2,133],74:[2,133],79:[2,133],90:[2,133],92:[2,133],101:[2,133],103:[2,133],104:[2,133],105:[2,133],109:[2,133],117:[2,133],125:[2,133],127:[2,133],128:[2,133],131:[2,133],132:[2,133],133:[2,133],134:[2,133],135:[2,133],136:[2,133]},{1:[2,134],6:[2,134],26:[2,134],27:[2,134],48:[2,134],53:[2,134],56:[2,134],59:[2,134],74:[2,134],79:[2,134],90:[2,134],92:[2,134],97:[2,134],101:[2,134],103:[2,134],104:[2,134],105:[2,134],109:[2,134],117:[2,134],125:[2,134],127:[2,134],128:[2,134],131:[2,134],132:[2,134],133:[2,134],134:[2,134],135:[2,134],136:[2,134]},{1:[2,167],6:[2,167],26:[2,167],27:[2,167],48:[2,167],53:[2,167],56:[2,167],59:[2,167],74:[2,167],79:[2,167],90:[2,167],92:[2,167],101:[2,167],103:[2,167],104:[2,167],105:[2,167],109:[2,167],117:[2,167],125:[2,167],127:[2,167],128:[2,167],131:[2,167],132:[2,167],133:[2,167],134:[2,167],135:[2,167],136:[2,167]},{5:339,26:[1,5]},{27:[1,340]},{6:[1,341],27:[2,173],120:[2,173],122:[2,173]},{8:342,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{1:[2,100],6:[2,100],26:[2,100],27:[2,100],48:[2,100],53:[2,100],56:[2,100],59:[2,100],74:[2,100],79:[2,100],90:[2,100],92:[2,100],101:[2,100],103:[2,100],104:[2,100],105:[2,100],109:[2,100],117:[2,100],125:[2,100],127:[2,100],128:[2,100],131:[2,100],132:[2,100],133:[2,100],134:[2,100],135:[2,100],136:[2,100]},{1:[2,137],6:[2,137],26:[2,137],27:[2,137],48:[2,137],53:[2,137],56:[2,137],58:[2,137],59:[2,137],68:[2,137],69:[2,137],70:[2,137],72:[2,137],74:[2,137],75:[2,137],79:[2,137],85:[2,137],90:[2,137],92:[2,137],101:[2,137],103:[2,137],104:[2,137],105:[2,137],109:[2,137],117:[2,137],125:[2,137],127:[2,137],128:[2,137],131:[2,137],132:[2,137],133:[2,137],134:[2,137],135:[2,137],136:[2,137]},{1:[2,116],6:[2,116],26:[2,116],27:[2,116],48:[2,116],53:[2,116],56:[2,116],58:[2,116],59:[2,116],68:[2,116],69:[2,116],70:[2,116],72:[2,116],74:[2,116],75:[2,116],79:[2,116],85:[2,116],90:[2,116],92:[2,116],101:[2,116],103:[2,116],104:[2,116],105:[2,116],109:[2,116],117:[2,116],125:[2,116],127:[2,116],128:[2,116],131:[2,116],132:[2,116],133:[2,116],134:[2,116],135:[2,116],136:[2,116]},{6:[2,123],26:[2,123],27:[2,123],53:[2,123],59:[2,123],90:[2,123]},{6:[2,52],26:[2,52],27:[2,52],52:343,53:[1,258]},{6:[2,124],26:[2,124],27:[2,124],53:[2,124],59:[2,124],90:[2,124]},{1:[2,162],6:[2,162],26:[2,162],27:[2,162],48:[2,162],53:[2,162],56:[2,162],59:[2,162],74:[2,162],79:[2,162],90:[2,162],92:[2,162],101:[2,162],102:118,103:[2,162],104:[2,162],105:[2,162],108:119,109:[2,162],110:69,117:[1,344],125:[2,162],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,164],6:[2,164],26:[2,164],27:[2,164],48:[2,164],53:[2,164],56:[2,164],59:[2,164],74:[2,164],79:[2,164],90:[2,164],92:[2,164],101:[2,164],102:118,103:[2,164],104:[1,345],105:[2,164],108:119,109:[2,164],110:69,117:[2,164],125:[2,164],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,163],6:[2,163],26:[2,163],27:[2,163],48:[2,163],53:[2,163],56:[2,163],59:[2,163],74:[2,163],79:[2,163],90:[2,163],92:[2,163],101:[2,163],102:118,103:[2,163],104:[2,163],105:[2,163],108:119,109:[2,163],110:69,117:[2,163],125:[2,163],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{6:[2,91],26:[2,91],27:[2,91],53:[2,91],79:[2,91]},{6:[2,52],26:[2,52],27:[2,52],52:346,53:[1,268]},{27:[1,347],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{27:[1,348]},{1:[2,170],6:[2,170],26:[2,170],27:[2,170],48:[2,170],53:[2,170],56:[2,170],59:[2,170],74:[2,170],79:[2,170],90:[2,170],92:[2,170],101:[2,170],103:[2,170],104:[2,170],105:[2,170],109:[2,170],117:[2,170],125:[2,170],127:[2,170],128:[2,170],131:[2,170],132:[2,170],133:[2,170],134:[2,170],135:[2,170],136:[2,170]},{27:[2,174],120:[2,174],122:[2,174]},{26:[2,129],53:[2,129],102:118,103:[1,65],105:[1,66],108:119,109:[1,68],110:69,125:[1,117],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{6:[1,297],26:[1,298],27:[1,349]},{8:350,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{8:351,9:149,10:21,11:22,12:[1,23],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:20,28:62,29:[1,104],30:51,31:[1,102],32:[1,103],33:25,34:[1,52],35:[1,53],36:[1,54],37:[1,55],38:24,43:63,44:[1,47],45:[1,48],46:[1,30],49:31,50:[1,60],51:[1,61],57:46,60:49,61:50,63:37,65:26,66:27,67:28,77:[1,101],80:[1,44],84:[1,29],87:[1,58],88:[1,59],89:[1,57],95:[1,39],99:[1,45],100:[1,56],102:40,103:[1,65],105:[1,66],106:41,107:[1,67],108:42,109:[1,68],110:69,118:[1,43],123:38,124:[1,64],126:[1,32],127:[1,33],128:[1,34],129:[1,35],130:[1,36],138:[1,70],139:[1,71],140:[1,72],141:[1,73],142:[1,74],143:[1,75],144:[1,76],145:[1,77],146:[1,78],147:[1,79],148:[1,80],149:[1,81],150:[1,82],151:[1,83],152:[1,84],153:[1,85],154:[1,86],155:[1,87],156:[1,88],157:[1,89],158:[1,90],159:[1,91],160:[1,92],161:[1,93],162:[1,94],163:[1,95],164:[1,96],165:[1,97],166:[1,98],167:[1,99],168:[1,100]},{6:[1,308],26:[1,309],27:[1,352]},{6:[2,40],26:[2,40],27:[2,40],53:[2,40],79:[2,40]},{1:[2,168],6:[2,168],26:[2,168],27:[2,168],48:[2,168],53:[2,168],56:[2,168],59:[2,168],74:[2,168],79:[2,168],90:[2,168],92:[2,168],101:[2,168],103:[2,168],104:[2,168],105:[2,168],109:[2,168],117:[2,168],125:[2,168],127:[2,168],128:[2,168],131:[2,168],132:[2,168],133:[2,168],134:[2,168],135:[2,168],136:[2,168]},{6:[2,125],26:[2,125],27:[2,125],53:[2,125],59:[2,125],90:[2,125]},{1:[2,165],6:[2,165],26:[2,165],27:[2,165],48:[2,165],53:[2,165],56:[2,165],59:[2,165],74:[2,165],79:[2,165],90:[2,165],92:[2,165],101:[2,165],102:118,103:[2,165],104:[2,165],105:[2,165],108:119,109:[2,165],110:69,117:[2,165],125:[2,165],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{1:[2,166],6:[2,166],26:[2,166],27:[2,166],48:[2,166],53:[2,166],56:[2,166],59:[2,166],74:[2,166],79:[2,166],90:[2,166],92:[2,166],101:[2,166],102:118,103:[2,166],104:[2,166],105:[2,166],108:119,109:[2,166],110:69,117:[2,166],125:[2,166],127:[1,111],128:[1,110],131:[1,109],132:[1,112],133:[1,113],134:[1,114],135:[1,115],136:[1,116]},{6:[2,92],26:[2,92],27:[2,92],53:[2,92],79:[2,92]}],
defaultActions: {60:[2,50],61:[2,51],70:[2,199],71:[2,200],72:[2,201],73:[2,202],74:[2,203],75:[2,204],76:[2,205],77:[2,206],78:[2,207],79:[2,208],80:[2,209],81:[2,210],82:[2,211],83:[2,212],84:[2,213],85:[2,214],86:[2,215],87:[2,216],88:[2,217],89:[2,218],90:[2,219],91:[2,220],92:[2,221],93:[2,222],94:[2,223],95:[2,224],96:[2,225],97:[2,226],98:[2,227],99:[2,228],100:[2,229],106:[2,3],125:[2,106],221:[2,86]},
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

  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS', 'FLOAT', 'INT', 'BOOL', 'MAT2', 'MAT3', 'MAT4', 'MAT2X2', 'MAT2X3', 'MAT2X4', 'MAT3X2', 'MAT3X3', 'MAT3X4', 'MAT4X2', 'MAT4X3', 'MAT4X4', 'VEC2', 'VEC3', 'VEC4', 'IVEC2', 'IVEC3', 'IVEC4', 'BVEC2', 'BVEC3', 'BVEC4'];

  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOLEAN_VALUE', 'UNARY', 'SUPER', '@', '->', '=>', '[', '(', '{', '--', '++'];

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
