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
    Comment: 'comment',
    StorageQualifier: 'storage_qualifier'
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
      if (this.options.scope) program.state.scope.push('block');
      lines = [];
      qual = program.state.scope.qualifier();
      if (this.lines) {
        _ref = this.lines;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _result = child.compile(program);
          if (_result !== null) lines.push(_result);
        }
      }
      if (this.options.scope) program.state.scope.pop();
      return {
        lines: lines,
        is_block: true,
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

    Op.prototype.cast = function(type, program) {};

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
      var block_node, line, name, options, program, subscope, _i, _len, _ref, _ref2, _ref3;
      if (state == null) state = {};
      if (state instanceof Program) {
        _ref = [state, state.state], program = _ref[0], state = _ref[1];
      } else {
        program = new Program(state);
      }
      block_node = this.block.compile(program);
      _ref2 = block_node.lines;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        line = _ref2[_i];
        program.nodes.push(line);
      }
      block_node.execute();
      if (subscope = state.scope.subscopes['block']) {
        _ref3 = subscope.definitions;
        for (name in _ref3) {
          options = _ref3[name];
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
    _require["shader-script/glsl/nodes/storage_qualifier"] = function() {
      var exports = {};
      (function() {
  var TypeConstructor, Value,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  TypeConstructor = require('shader-script/glsl/nodes/type_constructor').TypeConstructor;

  Value = require('shader-script/glsl/nodes/value').Value;

  exports.StorageQualifier = (function(_super) {

    __extends(StorageQualifier, _super);

    function StorageQualifier() {
      StorageQualifier.__super__.constructor.apply(this, arguments);
    }

    StorageQualifier.prototype.name = "_storage_qualifier";

    StorageQualifier.prototype.children = function() {
      return ['qualifier', 'type', 'names'];
    };

    StorageQualifier.prototype.compile = function(program) {
      var name, _i, _len, _ref,
        _this = this;
      _ref = this.names;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        program.state.scope.define(name, {
          type: this.type,
          builtin: true
        });
      }
      return {
        toSource: function() {
          return "" + _this.qualifier + " " + _this.type + " " + (_this.names.join(', '));
        },
        execute: function() {}
      };
    };

    return StorageQualifier;

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
        } else if (node.is_comment || node.is_block) {
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
      }), o('StorageQualifier = { StorageQualifierAssigns }', function() {
        return new StorageQualifier($1, $4);
      }), o('StorageQualifier = INDENT { StorageQualifierAssigns } OUTDENT', function() {
        return new StorageQualifier($1, $5);
      })
    ],
    StorageQualifier: [o('UNIFORMS'), o('VARYINGS'), o('CONSTS'), o('ATTRIBUTES')],
    StorageQualifierAssigns: [
      o('StorageQualifierAssign', function() {
        return [$1];
      }), o('StorageQualifierAssigns OptComma TERMINATOR StorageQualifierAssign', function() {
        return $1.concat($4);
      })
    ],
    StorageQualifierAssign: [
      o('Identifier : StorageQualifierName', function() {
        return {
          type: $1,
          names: [$3]
        };
      }), o('Identifier : [ StorageQualifierNameList ]', function() {
        return {
          type: $1,
          names: $4
        };
      })
    ],
    StorageQualifierName: [
      o('Identifier', function() {
        return $1;
      })
    ],
    StorageQualifierNameList: [
      o('StorageQualifierName', function() {
        return [$1];
      }), o('StorageQualifierNameList , StorageQualifierName', function() {
        $1.push($3);
        return $1;
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

  JS_KEYWORDS = ['centroid', 'break', 'continue', 'do', 'for', 'while', 'if', 'else', 'in', 'out', 'inout', 'float', 'int', 'void', 'bool', 'true', 'false', 'invariant', 'discard', 'return', 'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'bvec2', 'bvec3', 'bvec4', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow', 'sampler2DShadow', 'struct', 'asm', 'class', 'union', 'enum', 'typedef', 'template', 'this', 'packed', 'goto', 'switch', 'default', 'inline', 'noinline', 'volatile', 'public', 'static', 'extern', 'external', 'interface', 'long', 'short', 'double', 'half', 'fixed', 'unsigned', 'lowp', 'mediump', 'highp', 'precision', 'input', 'output', 'hvec2', 'hvec3', 'hvec4', 'dvec2', 'dvec3', 'dvec4', 'fvec2', 'fvec3', 'fvec4', 'sampler2DRect', 'sampler3DRect', 'sampler2DRectShadow', 'sizeof', 'cast', 'namespace', 'using', 'true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];

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

  JS_KEYWORDS.push('uniforms', 'varyings', 'attributes', 'consts');

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
    TypeConstructor: 'type_constructor',
    StorageQualifier: 'storage_qualifier'
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
    _require["shader-script/nodes/obj"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Obj = (function(_super) {

    __extends(Obj, _super);

    function Obj() {
      Obj.__super__.constructor.apply(this, arguments);
    }

    Obj.prototype.name = 'obj';

    Obj.prototype.children = function() {
      return ['assigns'];
    };

    Obj.prototype.type = function() {
      return null;
    };

    Obj.prototype.compile = function(shader) {
      var assign, assigns, compiled_node, qualifier;
      shader.scope.lock();
      qualifier = (function() {
        switch (this.qualifier) {
          case 'uniforms':
            return 'uniform';
          case 'varyings':
            return 'varying';
          case 'consts':
            return 'const';
          case 'attributes':
            return 'attribute';
        }
      }).call(this);
      assigns = (function() {
        var _i, _len, _ref, _results;
        _ref = this.assigns;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          assign = _ref[_i];
          _results.push(this.glsl('StorageQualifier', qualifier, assign.compile(shader)));
        }
        return _results;
      }).call(this);
      compiled_node = this.glsl('Block', assigns, {
        scope: false
      });
      shader.scope.unlock();
      console.log(0);
      return compiled_node;
    };

    return Obj;

  })(require('shader-script/nodes/base').Base);

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
    _require["shader-script/nodes/storage_qualifier"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.StorageQualifier = (function(_super) {

    __extends(StorageQualifier, _super);

    function StorageQualifier() {
      StorageQualifier.__super__.constructor.apply(this, arguments);
    }

    StorageQualifier.prototype.name = 'storage_qualifier';

    StorageQualifier.prototype.children = function() {
      return ['qualifier', 'assigns'];
    };

    StorageQualifier.prototype.compile = function(shader) {
      var assign, lines, name, names, qualifier, type, _i, _len, _ref;
      qualifier = this.qualifier.slice(0, -1);
      lines = [];
      _ref = this.assigns;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        assign = _ref[_i];
        type = assign.type.children[0].toString();
        names = (function() {
          var _j, _len2, _ref2, _results;
          _ref2 = assign.names;
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            name = _ref2[_j];
            name = name.children[0].toString();
            shader.scope.define(name, {
              type: type,
              builtin: true
            });
            _results.push(name);
          }
          return _results;
        })();
        lines.push(this.glsl('StorageQualifier', qualifier, type, names));
      }
      return this.glsl('Block', lines, {
        scope: false
      });
    };

    return StorageQualifier;

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
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"Return":10,"Comment":11,"STATEMENT":12,"StorageQualifier":13,"=":14,"{":15,"StorageQualifierAssigns":16,"}":17,"INDENT":18,"OUTDENT":19,"UNIFORMS":20,"VARYINGS":21,"CONSTS":22,"ATTRIBUTES":23,"StorageQualifierAssign":24,"OptComma":25,"Identifier":26,":":27,"StorageQualifierName":28,"[":29,"StorageQualifierNameList":30,"]":31,",":32,"Value":33,"Invocation":34,"Code":35,"Operation":36,"Assign":37,"If":38,"Try":39,"While":40,"For":41,"Switch":42,"Class":43,"Throw":44,"GlslTypeConstructor":45,"IDENTIFIER":46,"AlphaNumeric":47,"NUMBER":48,"STRING":49,"Literal":50,"JS":51,"REGEX":52,"DEBUGGER":53,"BOOLEAN_VALUE":54,"Assignable":55,"AssignObj":56,"ObjAssignable":57,"ThisProperty":58,"RETURN":59,"HERECOMMENT":60,"PARAM_START":61,"ParamList":62,"PARAM_END":63,"FuncGlyph":64,"->":65,"=>":66,"Param":67,"ParamVar":68,"...":69,"GlslType":70,"CALL_START":71,"CALL_END":72,"Array":73,"Object":74,"Splat":75,"SimpleAssignable":76,"Accessor":77,"Parenthetical":78,"Range":79,"This":80,".":81,"?.":82,"::":83,"Index":84,"INDEX_START":85,"IndexValue":86,"INDEX_END":87,"INDEX_SOAK":88,"Slice":89,"AssignList":90,"CLASS":91,"EXTENDS":92,"OptFuncExist":93,"Arguments":94,"SUPER":95,"FUNC_EXIST":96,"ArgList":97,"THIS":98,"@":99,"RangeDots":100,"..":101,"Arg":102,"SimpleArgs":103,"TRY":104,"Catch":105,"FINALLY":106,"CATCH":107,"THROW":108,"(":109,")":110,"WhileSource":111,"WHILE":112,"WHEN":113,"UNTIL":114,"Loop":115,"LOOP":116,"ForBody":117,"FOR":118,"ForStart":119,"ForSource":120,"ForVariables":121,"OWN":122,"ForValue":123,"FORIN":124,"FOROF":125,"BY":126,"SWITCH":127,"Whens":128,"ELSE":129,"When":130,"LEADING_WHEN":131,"IfBlock":132,"IF":133,"POST_IF":134,"UNARY":135,"-":136,"+":137,"--":138,"++":139,"?":140,"MATH":141,"SHIFT":142,"COMPARE":143,"LOGIC":144,"RELATION":145,"COMPOUND_ASSIGN":146,"VOID":147,"BOOL":148,"INT":149,"FLOAT":150,"VEC2":151,"VEC3":152,"VEC4":153,"BVEC2":154,"BVEC3":155,"BVEC4":156,"IVEC2":157,"IVEC3":158,"IVEC4":159,"MAT2":160,"MAT3":161,"MAT4":162,"MAT2X2":163,"MAT2X3":164,"MAT2X4":165,"MAT3X2":166,"MAT3X3":167,"MAT3X4":168,"MAT4X2":169,"MAT4X3":170,"MAT4X4":171,"SAMPLER1D":172,"SAMPLER2D":173,"SAMPLER3D":174,"SAMPLERCUBE":175,"SAMPLER1DSHADOW":176,"SAMPLER2DSHADOW":177,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",12:"STATEMENT",14:"=",15:"{",17:"}",18:"INDENT",19:"OUTDENT",20:"UNIFORMS",21:"VARYINGS",22:"CONSTS",23:"ATTRIBUTES",27:":",29:"[",31:"]",32:",",46:"IDENTIFIER",48:"NUMBER",49:"STRING",51:"JS",52:"REGEX",53:"DEBUGGER",54:"BOOLEAN_VALUE",59:"RETURN",60:"HERECOMMENT",61:"PARAM_START",63:"PARAM_END",65:"->",66:"=>",69:"...",71:"CALL_START",72:"CALL_END",81:".",82:"?.",83:"::",85:"INDEX_START",87:"INDEX_END",88:"INDEX_SOAK",91:"CLASS",92:"EXTENDS",95:"SUPER",96:"FUNC_EXIST",98:"THIS",99:"@",101:"..",104:"TRY",106:"FINALLY",107:"CATCH",108:"THROW",109:"(",110:")",112:"WHILE",113:"WHEN",114:"UNTIL",116:"LOOP",118:"FOR",122:"OWN",124:"FORIN",125:"FOROF",126:"BY",127:"SWITCH",129:"ELSE",131:"LEADING_WHEN",133:"IF",134:"POST_IF",135:"UNARY",136:"-",137:"+",138:"--",139:"++",140:"?",141:"MATH",142:"SHIFT",143:"COMPARE",144:"LOGIC",145:"RELATION",146:"COMPOUND_ASSIGN",147:"VOID",148:"BOOL",149:"INT",150:"FLOAT",151:"VEC2",152:"VEC3",153:"VEC4",154:"BVEC2",155:"BVEC3",156:"BVEC4",157:"IVEC2",158:"IVEC3",159:"IVEC4",160:"MAT2",161:"MAT3",162:"MAT4",163:"MAT2X2",164:"MAT2X3",165:"MAT2X4",166:"MAT3X2",167:"MAT3X3",168:"MAT3X4",169:"MAT4X2",170:"MAT4X3",171:"MAT4X4",172:"SAMPLER1D",173:"SAMPLER2D",174:"SAMPLER3D",175:"SAMPLERCUBE",176:"SAMPLER1DSHADOW",177:"SAMPLER2DSHADOW"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[9,1],[9,1],[9,1],[9,5],[9,7],[13,1],[13,1],[13,1],[13,1],[16,1],[16,4],[24,3],[24,5],[28,1],[30,1],[30,3],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[5,2],[5,3],[26,1],[47,1],[47,1],[50,1],[50,1],[50,1],[50,1],[50,1],[37,3],[37,4],[37,5],[56,1],[56,3],[56,5],[56,1],[57,1],[57,1],[57,1],[10,2],[10,1],[11,1],[35,5],[35,2],[64,1],[64,1],[25,0],[25,1],[62,0],[62,1],[62,3],[67,1],[67,2],[67,3],[67,4],[68,1],[68,1],[68,1],[68,1],[75,2],[76,1],[76,2],[76,2],[76,1],[55,1],[55,1],[55,1],[33,1],[33,1],[33,1],[33,1],[33,1],[77,2],[77,2],[77,2],[77,1],[77,1],[84,3],[84,2],[86,1],[86,1],[74,4],[90,0],[90,1],[90,3],[90,4],[90,6],[43,1],[43,2],[43,3],[43,4],[43,2],[43,3],[43,4],[43,5],[34,3],[34,3],[34,1],[34,2],[93,0],[93,1],[94,2],[94,4],[80,1],[80,1],[58,2],[73,2],[73,4],[100,1],[100,1],[79,5],[89,3],[89,2],[89,2],[89,1],[97,1],[97,3],[97,4],[97,4],[97,6],[102,1],[102,1],[103,1],[103,3],[39,2],[39,3],[39,4],[39,5],[105,3],[44,2],[78,3],[78,5],[111,2],[111,4],[111,2],[111,4],[40,2],[40,2],[40,2],[40,1],[115,2],[115,2],[41,2],[41,2],[41,2],[117,2],[117,2],[119,2],[119,3],[123,1],[123,1],[123,1],[121,1],[121,3],[120,2],[120,2],[120,4],[120,4],[120,4],[120,6],[120,6],[42,5],[42,7],[42,4],[42,6],[128,1],[128,2],[130,3],[130,4],[132,3],[132,5],[38,1],[38,3],[38,3],[38,3],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,5],[36,3],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[70,1],[45,2]],
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
case 12:this.$ = new yy.StorageQualifier($$[$0-4], $$[$0-1]);
break;
case 13:this.$ = new yy.StorageQualifier($$[$0-6], $$[$0-2]);
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = [$$[$0]];
break;
case 19:this.$ = $$[$0-3].concat($$[$0]);
break;
case 20:this.$ = {
          type: $$[$0-2],
          names: [$$[$0]]
        };
break;
case 21:this.$ = {
          type: $$[$0-4],
          names: $$[$0-1]
        };
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = [$$[$0]];
break;
case 24:this.$ = (function () {
        $$[$0-2].push($$[$0]);
        return $$[$0-2];
      }());
break;
case 25:this.$ = $$[$0];
break;
case 26:this.$ = $$[$0];
break;
case 27:this.$ = $$[$0];
break;
case 28:this.$ = $$[$0];
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = $$[$0];
break;
case 31:this.$ = $$[$0];
break;
case 32:this.$ = $$[$0];
break;
case 33:this.$ = $$[$0];
break;
case 34:this.$ = $$[$0];
break;
case 35:this.$ = $$[$0];
break;
case 36:this.$ = $$[$0];
break;
case 37:this.$ = $$[$0];
break;
case 38:this.$ = new yy.Block;
break;
case 39:this.$ = $$[$0-1];
break;
case 40:this.$ = new yy.Identifier($$[$0]);
break;
case 41:this.$ = new yy.Literal($$[$0]);
break;
case 42:this.$ = new yy.Literal($$[$0]);
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = new yy.Literal($$[$0]);
break;
case 45:this.$ = new yy.Literal($$[$0]);
break;
case 46:this.$ = new yy.Literal($$[$0]);
break;
case 47:this.$ = (function () {
        var val;
        val = new yy.Literal($$[$0]);
        if ($$[$0] === 'undefined') val.isUndefined = true;
        return val;
      }());
break;
case 48:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 49:this.$ = new yy.Assign($$[$0-3], $$[$0]);
break;
case 50:this.$ = new yy.Assign($$[$0-4], $$[$0-1]);
break;
case 51:this.$ = new yy.Value($$[$0]);
break;
case 52:this.$ = new yy.Assign(new yy.Value($$[$0-2]), $$[$0], 'object');
break;
case 53:this.$ = new yy.Assign(new yy.Value($$[$0-4]), $$[$0-1], 'object');
break;
case 54:this.$ = $$[$0];
break;
case 55:this.$ = $$[$0];
break;
case 56:this.$ = $$[$0];
break;
case 57:this.$ = $$[$0];
break;
case 58:this.$ = new yy.Return($$[$0]);
break;
case 59:this.$ = new yy.Return;
break;
case 60:this.$ = new yy.Comment($$[$0]);
break;
case 61:this.$ = new yy.Code($$[$0-3], $$[$0], $$[$0-1]);
break;
case 62:this.$ = new yy.Code([], $$[$0], $$[$0-1]);
break;
case 63:this.$ = 'func';
break;
case 64:this.$ = 'boundfunc';
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = $$[$0];
break;
case 67:this.$ = [];
break;
case 68:this.$ = [$$[$0]];
break;
case 69:this.$ = $$[$0-2].concat($$[$0]);
break;
case 70:this.$ = new yy.Param($$[$0]);
break;
case 71:this.$ = new yy.Param($$[$0-1], null, true);
break;
case 72:this.$ = new yy.Param($$[$0-2], $$[$0]);
break;
case 73:this.$ = (function () {
        $$[$0-1].set_type($$[$0-3]);
        return $$[$0-1];
      }());
break;
case 74:this.$ = $$[$0];
break;
case 75:this.$ = $$[$0];
break;
case 76:this.$ = $$[$0];
break;
case 77:this.$ = $$[$0];
break;
case 78:this.$ = new yy.Splat($$[$0-1]);
break;
case 79:this.$ = new yy.Value($$[$0]);
break;
case 80:this.$ = $$[$0-1].add($$[$0]);
break;
case 81:this.$ = new yy.Value($$[$0-1], [].concat($$[$0]));
break;
case 82:this.$ = $$[$0];
break;
case 83:this.$ = $$[$0];
break;
case 84:this.$ = new yy.Value($$[$0]);
break;
case 85:this.$ = new yy.Value($$[$0]);
break;
case 86:this.$ = $$[$0];
break;
case 87:this.$ = new yy.Value($$[$0]);
break;
case 88:this.$ = new yy.Value($$[$0]);
break;
case 89:this.$ = new yy.Value($$[$0]);
break;
case 90:this.$ = $$[$0];
break;
case 91:this.$ = new yy.Access($$[$0]);
break;
case 92:this.$ = new yy.Access($$[$0], 'soak');
break;
case 93:this.$ = [new yy.Access(new yy.Literal('prototype')), new yy.Access($$[$0])];
break;
case 94:this.$ = new yy.Access(new yy.Literal('prototype'));
break;
case 95:this.$ = $$[$0];
break;
case 96:this.$ = $$[$0-1];
break;
case 97:this.$ = yy.extend($$[$0], {
          soak: true
        });
break;
case 98:this.$ = new yy.Index($$[$0]);
break;
case 99:this.$ = new yy.Slice($$[$0]);
break;
case 100:this.$ = new yy.Obj($$[$0-2], $$[$0-3].generated);
break;
case 101:this.$ = [];
break;
case 102:this.$ = [$$[$0]];
break;
case 103:this.$ = $$[$0-2].concat($$[$0]);
break;
case 104:this.$ = $$[$0-3].concat($$[$0]);
break;
case 105:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 106:this.$ = new yy.Class;
break;
case 107:this.$ = new yy.Class(null, null, $$[$0]);
break;
case 108:this.$ = new yy.Class(null, $$[$0]);
break;
case 109:this.$ = new yy.Class(null, $$[$0-1], $$[$0]);
break;
case 110:this.$ = new yy.Class($$[$0]);
break;
case 111:this.$ = new yy.Class($$[$0-1], null, $$[$0]);
break;
case 112:this.$ = new yy.Class($$[$0-2], $$[$0]);
break;
case 113:this.$ = new yy.Class($$[$0-3], $$[$0-1], $$[$0]);
break;
case 114:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 115:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 116:this.$ = new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]);
break;
case 117:this.$ = new yy.Call('super', $$[$0]);
break;
case 118:this.$ = false;
break;
case 119:this.$ = true;
break;
case 120:this.$ = [];
break;
case 121:this.$ = $$[$0-2];
break;
case 122:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 123:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 124:this.$ = new yy.Value(new yy.Literal('this'), [new yy.Access($$[$0])], 'this');
break;
case 125:this.$ = new yy.Arr([]);
break;
case 126:this.$ = new yy.Arr($$[$0-2]);
break;
case 127:this.$ = 'inclusive';
break;
case 128:this.$ = 'exclusive';
break;
case 129:this.$ = new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]);
break;
case 130:this.$ = new yy.Range($$[$0-2], $$[$0], $$[$0-1]);
break;
case 131:this.$ = new yy.Range($$[$0-1], null, $$[$0]);
break;
case 132:this.$ = new yy.Range(null, $$[$0], $$[$0-1]);
break;
case 133:this.$ = new yy.Range(null, null, $$[$0]);
break;
case 134:this.$ = [$$[$0]];
break;
case 135:this.$ = $$[$0-2].concat($$[$0]);
break;
case 136:this.$ = $$[$0-3].concat($$[$0]);
break;
case 137:this.$ = $$[$0-2];
break;
case 138:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 139:this.$ = $$[$0];
break;
case 140:this.$ = $$[$0];
break;
case 141:this.$ = $$[$0];
break;
case 142:this.$ = [].concat($$[$0-2], $$[$0]);
break;
case 143:this.$ = new yy.Try($$[$0]);
break;
case 144:this.$ = new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]);
break;
case 145:this.$ = new yy.Try($$[$0-2], null, null, $$[$0]);
break;
case 146:this.$ = new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]);
break;
case 147:this.$ = [$$[$0-1], $$[$0]];
break;
case 148:this.$ = new yy.Throw($$[$0]);
break;
case 149:this.$ = new yy.Parens($$[$0-1]);
break;
case 150:this.$ = new yy.Parens($$[$0-2]);
break;
case 151:this.$ = new yy.While($$[$0]);
break;
case 152:this.$ = new yy.While($$[$0-2], {
          guard: $$[$0]
        });
break;
case 153:this.$ = new yy.While($$[$0], {
          invert: true
        });
break;
case 154:this.$ = new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        });
break;
case 155:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 156:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 157:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 158:this.$ = $$[$0];
break;
case 159:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 160:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 161:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 162:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 163:this.$ = new yy.For($$[$0], $$[$0-1]);
break;
case 164:this.$ = {
          source: new yy.Value($$[$0])
        };
break;
case 165:this.$ = (function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }());
break;
case 166:this.$ = $$[$0];
break;
case 167:this.$ = (function () {
        $$[$0].own = true;
        return $$[$0];
      }());
break;
case 168:this.$ = $$[$0];
break;
case 169:this.$ = new yy.Value($$[$0]);
break;
case 170:this.$ = new yy.Value($$[$0]);
break;
case 171:this.$ = [$$[$0]];
break;
case 172:this.$ = [$$[$0-2], $$[$0]];
break;
case 173:this.$ = {
          source: $$[$0]
        };
break;
case 174:this.$ = {
          source: $$[$0],
          object: true
        };
break;
case 175:this.$ = {
          source: $$[$0-2],
          guard: $$[$0]
        };
break;
case 176:this.$ = {
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        };
break;
case 177:this.$ = {
          source: $$[$0-2],
          step: $$[$0]
        };
break;
case 178:this.$ = {
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        };
break;
case 179:this.$ = {
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        };
break;
case 180:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 181:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 182:this.$ = new yy.Switch(null, $$[$0-1]);
break;
case 183:this.$ = new yy.Switch(null, $$[$0-3], $$[$0-1]);
break;
case 184:this.$ = $$[$0];
break;
case 185:this.$ = $$[$0-1].concat($$[$0]);
break;
case 186:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 187:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 188:this.$ = new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        });
break;
case 189:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 190:this.$ = $$[$0];
break;
case 191:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 192:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 193:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 194:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 195:this.$ = new yy.Op('-', $$[$0]);
break;
case 196:this.$ = new yy.Op('+', $$[$0]);
break;
case 197:this.$ = new yy.Op('--', $$[$0]);
break;
case 198:this.$ = new yy.Op('++', $$[$0]);
break;
case 199:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 200:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 201:this.$ = new yy.Existence($$[$0-1]);
break;
case 202:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 203:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 204:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 205:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 206:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 207:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 208:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 209:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 210:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 211:this.$ = new yy.Extends($$[$0-2], $$[$0]);
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
case 230:this.$ = $$[$0];
break;
case 231:this.$ = $$[$0];
break;
case 232:this.$ = $$[$0];
break;
case 233:this.$ = $$[$0];
break;
case 234:this.$ = $$[$0];
break;
case 235:this.$ = $$[$0];
break;
case 236:this.$ = $$[$0];
break;
case 237:this.$ = $$[$0];
break;
case 238:this.$ = $$[$0];
break;
case 239:this.$ = $$[$0];
break;
case 240:this.$ = $$[$0];
break;
case 241:this.$ = $$[$0];
break;
case 242:this.$ = $$[$0];
break;
case 243:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,5],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[3]},{1:[2,2],6:[1,110]},{6:[1,111]},{1:[2,4],6:[2,4],19:[2,4],110:[2,4]},{4:113,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],19:[1,112],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,7],6:[2,7],19:[2,7],110:[2,7],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,8],6:[2,8],19:[2,8],110:[2,8],111:126,112:[1,70],114:[1,71],117:127,118:[1,73],119:74,134:[1,125]},{1:[2,25],6:[2,25],17:[2,25],18:[2,25],19:[2,25],31:[2,25],32:[2,25],63:[2,25],69:[2,25],71:[2,118],72:[2,25],77:129,81:[1,131],82:[1,132],83:[1,133],84:134,85:[1,135],87:[2,25],88:[1,136],93:128,96:[1,130],101:[2,25],110:[2,25],112:[2,25],113:[2,25],114:[2,25],118:[2,25],126:[2,25],134:[2,25],136:[2,25],137:[2,25],140:[2,25],141:[2,25],142:[2,25],143:[2,25],144:[2,25],145:[2,25]},{1:[2,26],6:[2,26],17:[2,26],18:[2,26],19:[2,26],31:[2,26],32:[2,26],63:[2,26],69:[2,26],71:[2,118],72:[2,26],77:138,81:[1,131],82:[1,132],83:[1,133],84:134,85:[1,135],87:[2,26],88:[1,136],93:137,96:[1,130],101:[2,26],110:[2,26],112:[2,26],113:[2,26],114:[2,26],118:[2,26],126:[2,26],134:[2,26],136:[2,26],137:[2,26],140:[2,26],141:[2,26],142:[2,26],143:[2,26],144:[2,26],145:[2,26]},{1:[2,27],6:[2,27],17:[2,27],18:[2,27],19:[2,27],31:[2,27],32:[2,27],63:[2,27],69:[2,27],72:[2,27],87:[2,27],101:[2,27],110:[2,27],112:[2,27],113:[2,27],114:[2,27],118:[2,27],126:[2,27],134:[2,27],136:[2,27],137:[2,27],140:[2,27],141:[2,27],142:[2,27],143:[2,27],144:[2,27],145:[2,27]},{1:[2,28],6:[2,28],17:[2,28],18:[2,28],19:[2,28],31:[2,28],32:[2,28],63:[2,28],69:[2,28],72:[2,28],87:[2,28],101:[2,28],110:[2,28],112:[2,28],113:[2,28],114:[2,28],118:[2,28],126:[2,28],134:[2,28],136:[2,28],137:[2,28],140:[2,28],141:[2,28],142:[2,28],143:[2,28],144:[2,28],145:[2,28]},{1:[2,29],6:[2,29],17:[2,29],18:[2,29],19:[2,29],31:[2,29],32:[2,29],63:[2,29],69:[2,29],72:[2,29],87:[2,29],101:[2,29],110:[2,29],112:[2,29],113:[2,29],114:[2,29],118:[2,29],126:[2,29],134:[2,29],136:[2,29],137:[2,29],140:[2,29],141:[2,29],142:[2,29],143:[2,29],144:[2,29],145:[2,29]},{1:[2,30],6:[2,30],17:[2,30],18:[2,30],19:[2,30],31:[2,30],32:[2,30],63:[2,30],69:[2,30],72:[2,30],87:[2,30],101:[2,30],110:[2,30],112:[2,30],113:[2,30],114:[2,30],118:[2,30],126:[2,30],134:[2,30],136:[2,30],137:[2,30],140:[2,30],141:[2,30],142:[2,30],143:[2,30],144:[2,30],145:[2,30]},{1:[2,31],6:[2,31],17:[2,31],18:[2,31],19:[2,31],31:[2,31],32:[2,31],63:[2,31],69:[2,31],72:[2,31],87:[2,31],101:[2,31],110:[2,31],112:[2,31],113:[2,31],114:[2,31],118:[2,31],126:[2,31],134:[2,31],136:[2,31],137:[2,31],140:[2,31],141:[2,31],142:[2,31],143:[2,31],144:[2,31],145:[2,31]},{1:[2,32],6:[2,32],17:[2,32],18:[2,32],19:[2,32],31:[2,32],32:[2,32],63:[2,32],69:[2,32],72:[2,32],87:[2,32],101:[2,32],110:[2,32],112:[2,32],113:[2,32],114:[2,32],118:[2,32],126:[2,32],134:[2,32],136:[2,32],137:[2,32],140:[2,32],141:[2,32],142:[2,32],143:[2,32],144:[2,32],145:[2,32]},{1:[2,33],6:[2,33],17:[2,33],18:[2,33],19:[2,33],31:[2,33],32:[2,33],63:[2,33],69:[2,33],72:[2,33],87:[2,33],101:[2,33],110:[2,33],112:[2,33],113:[2,33],114:[2,33],118:[2,33],126:[2,33],134:[2,33],136:[2,33],137:[2,33],140:[2,33],141:[2,33],142:[2,33],143:[2,33],144:[2,33],145:[2,33]},{1:[2,34],6:[2,34],17:[2,34],18:[2,34],19:[2,34],31:[2,34],32:[2,34],63:[2,34],69:[2,34],72:[2,34],87:[2,34],101:[2,34],110:[2,34],112:[2,34],113:[2,34],114:[2,34],118:[2,34],126:[2,34],134:[2,34],136:[2,34],137:[2,34],140:[2,34],141:[2,34],142:[2,34],143:[2,34],144:[2,34],145:[2,34]},{1:[2,35],6:[2,35],17:[2,35],18:[2,35],19:[2,35],31:[2,35],32:[2,35],63:[2,35],69:[2,35],72:[2,35],87:[2,35],101:[2,35],110:[2,35],112:[2,35],113:[2,35],114:[2,35],118:[2,35],126:[2,35],134:[2,35],136:[2,35],137:[2,35],140:[2,35],141:[2,35],142:[2,35],143:[2,35],144:[2,35],145:[2,35]},{1:[2,36],6:[2,36],17:[2,36],18:[2,36],19:[2,36],31:[2,36],32:[2,36],63:[2,36],69:[2,36],72:[2,36],87:[2,36],101:[2,36],110:[2,36],112:[2,36],113:[2,36],114:[2,36],118:[2,36],126:[2,36],134:[2,36],136:[2,36],137:[2,36],140:[2,36],141:[2,36],142:[2,36],143:[2,36],144:[2,36],145:[2,36]},{1:[2,37],6:[2,37],17:[2,37],18:[2,37],19:[2,37],31:[2,37],32:[2,37],63:[2,37],69:[2,37],72:[2,37],87:[2,37],101:[2,37],110:[2,37],112:[2,37],113:[2,37],114:[2,37],118:[2,37],126:[2,37],134:[2,37],136:[2,37],137:[2,37],140:[2,37],141:[2,37],142:[2,37],143:[2,37],144:[2,37],145:[2,37]},{1:[2,9],6:[2,9],19:[2,9],110:[2,9],112:[2,9],114:[2,9],118:[2,9],134:[2,9]},{1:[2,10],6:[2,10],19:[2,10],110:[2,10],112:[2,10],114:[2,10],118:[2,10],134:[2,10]},{1:[2,11],6:[2,11],19:[2,11],110:[2,11],112:[2,11],114:[2,11],118:[2,11],134:[2,11]},{14:[1,139]},{1:[2,86],6:[2,86],14:[1,140],17:[2,86],18:[2,86],19:[2,86],31:[2,86],32:[2,86],63:[2,86],69:[2,86],71:[2,86],72:[2,86],81:[2,86],82:[2,86],83:[2,86],85:[2,86],87:[2,86],88:[2,86],96:[2,86],101:[2,86],110:[2,86],112:[2,86],113:[2,86],114:[2,86],118:[2,86],126:[2,86],134:[2,86],136:[2,86],137:[2,86],140:[2,86],141:[2,86],142:[2,86],143:[2,86],144:[2,86],145:[2,86]},{1:[2,87],6:[2,87],17:[2,87],18:[2,87],19:[2,87],31:[2,87],32:[2,87],63:[2,87],69:[2,87],71:[2,87],72:[2,87],81:[2,87],82:[2,87],83:[2,87],85:[2,87],87:[2,87],88:[2,87],96:[2,87],101:[2,87],110:[2,87],112:[2,87],113:[2,87],114:[2,87],118:[2,87],126:[2,87],134:[2,87],136:[2,87],137:[2,87],140:[2,87],141:[2,87],142:[2,87],143:[2,87],144:[2,87],145:[2,87]},{1:[2,88],6:[2,88],17:[2,88],18:[2,88],19:[2,88],31:[2,88],32:[2,88],63:[2,88],69:[2,88],71:[2,88],72:[2,88],81:[2,88],82:[2,88],83:[2,88],85:[2,88],87:[2,88],88:[2,88],96:[2,88],101:[2,88],110:[2,88],112:[2,88],113:[2,88],114:[2,88],118:[2,88],126:[2,88],134:[2,88],136:[2,88],137:[2,88],140:[2,88],141:[2,88],142:[2,88],143:[2,88],144:[2,88],145:[2,88]},{1:[2,89],6:[2,89],17:[2,89],18:[2,89],19:[2,89],31:[2,89],32:[2,89],63:[2,89],69:[2,89],71:[2,89],72:[2,89],81:[2,89],82:[2,89],83:[2,89],85:[2,89],87:[2,89],88:[2,89],96:[2,89],101:[2,89],110:[2,89],112:[2,89],113:[2,89],114:[2,89],118:[2,89],126:[2,89],134:[2,89],136:[2,89],137:[2,89],140:[2,89],141:[2,89],142:[2,89],143:[2,89],144:[2,89],145:[2,89]},{1:[2,90],6:[2,90],17:[2,90],18:[2,90],19:[2,90],31:[2,90],32:[2,90],63:[2,90],69:[2,90],71:[2,90],72:[2,90],81:[2,90],82:[2,90],83:[2,90],85:[2,90],87:[2,90],88:[2,90],96:[2,90],101:[2,90],110:[2,90],112:[2,90],113:[2,90],114:[2,90],118:[2,90],126:[2,90],134:[2,90],136:[2,90],137:[2,90],140:[2,90],141:[2,90],142:[2,90],143:[2,90],144:[2,90],145:[2,90]},{1:[2,116],6:[2,116],17:[2,116],18:[2,116],19:[2,116],31:[2,116],32:[2,116],63:[2,116],69:[2,116],71:[1,142],72:[2,116],81:[2,116],82:[2,116],83:[2,116],85:[2,116],87:[2,116],88:[2,116],94:141,96:[2,116],101:[2,116],110:[2,116],112:[2,116],113:[2,116],114:[2,116],118:[2,116],126:[2,116],134:[2,116],136:[2,116],137:[2,116],140:[2,116],141:[2,116],142:[2,116],143:[2,116],144:[2,116],145:[2,116]},{15:[1,106],26:147,29:[1,152],32:[2,67],46:[1,109],58:148,62:143,63:[2,67],67:144,68:145,70:146,73:149,74:150,99:[1,151],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{5:153,18:[1,5]},{8:154,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:156,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:157,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{15:[1,106],26:67,29:[1,62],33:159,34:160,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:161,58:68,73:54,74:55,76:158,78:27,79:28,80:29,95:[1,30],98:[1,63],99:[1,64],109:[1,61]},{15:[1,106],26:67,29:[1,62],33:159,34:160,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:161,58:68,73:54,74:55,76:162,78:27,79:28,80:29,95:[1,30],98:[1,63],99:[1,64],109:[1,61]},{1:[2,83],6:[2,83],14:[2,83],17:[2,83],18:[2,83],19:[2,83],31:[2,83],32:[2,83],63:[2,83],69:[2,83],71:[2,83],72:[2,83],81:[2,83],82:[2,83],83:[2,83],85:[2,83],87:[2,83],88:[2,83],92:[1,166],96:[2,83],101:[2,83],110:[2,83],112:[2,83],113:[2,83],114:[2,83],118:[2,83],126:[2,83],134:[2,83],136:[2,83],137:[2,83],138:[1,163],139:[1,164],140:[2,83],141:[2,83],142:[2,83],143:[2,83],144:[2,83],145:[2,83],146:[1,165]},{1:[2,190],6:[2,190],17:[2,190],18:[2,190],19:[2,190],31:[2,190],32:[2,190],63:[2,190],69:[2,190],72:[2,190],87:[2,190],101:[2,190],110:[2,190],112:[2,190],113:[2,190],114:[2,190],118:[2,190],126:[2,190],129:[1,167],134:[2,190],136:[2,190],137:[2,190],140:[2,190],141:[2,190],142:[2,190],143:[2,190],144:[2,190],145:[2,190]},{5:168,18:[1,5]},{5:169,18:[1,5]},{1:[2,158],6:[2,158],17:[2,158],18:[2,158],19:[2,158],31:[2,158],32:[2,158],63:[2,158],69:[2,158],72:[2,158],87:[2,158],101:[2,158],110:[2,158],112:[2,158],113:[2,158],114:[2,158],118:[2,158],126:[2,158],134:[2,158],136:[2,158],137:[2,158],140:[2,158],141:[2,158],142:[2,158],143:[2,158],144:[2,158],145:[2,158]},{5:170,18:[1,5]},{8:171,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,172],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,106],5:173,6:[2,106],15:[1,106],17:[2,106],18:[1,5],19:[2,106],26:67,29:[1,62],31:[2,106],32:[2,106],33:159,34:160,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:161,58:68,63:[2,106],69:[2,106],72:[2,106],73:54,74:55,76:175,78:27,79:28,80:29,87:[2,106],92:[1,174],95:[1,30],98:[1,63],99:[1,64],101:[2,106],109:[1,61],110:[2,106],112:[2,106],113:[2,106],114:[2,106],118:[2,106],126:[2,106],134:[2,106],136:[2,106],137:[2,106],140:[2,106],141:[2,106],142:[2,106],143:[2,106],144:[2,106],145:[2,106]},{8:176,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{71:[1,142],94:177},{1:[2,59],6:[2,59],8:178,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],19:[2,59],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],110:[2,59],111:41,112:[2,59],114:[2,59],115:42,116:[1,72],117:43,118:[2,59],119:74,127:[1,44],132:39,133:[1,69],134:[2,59],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,60],6:[2,60],17:[2,60],18:[2,60],19:[2,60],32:[2,60],110:[2,60],112:[2,60],114:[2,60],118:[2,60],134:[2,60]},{14:[2,14]},{14:[2,15]},{14:[2,16]},{14:[2,17]},{1:[2,84],6:[2,84],14:[2,84],17:[2,84],18:[2,84],19:[2,84],31:[2,84],32:[2,84],63:[2,84],69:[2,84],71:[2,84],72:[2,84],81:[2,84],82:[2,84],83:[2,84],85:[2,84],87:[2,84],88:[2,84],96:[2,84],101:[2,84],110:[2,84],112:[2,84],113:[2,84],114:[2,84],118:[2,84],126:[2,84],134:[2,84],136:[2,84],137:[2,84],140:[2,84],141:[2,84],142:[2,84],143:[2,84],144:[2,84],145:[2,84]},{1:[2,85],6:[2,85],14:[2,85],17:[2,85],18:[2,85],19:[2,85],31:[2,85],32:[2,85],63:[2,85],69:[2,85],71:[2,85],72:[2,85],81:[2,85],82:[2,85],83:[2,85],85:[2,85],87:[2,85],88:[2,85],96:[2,85],101:[2,85],110:[2,85],112:[2,85],113:[2,85],114:[2,85],118:[2,85],126:[2,85],134:[2,85],136:[2,85],137:[2,85],140:[2,85],141:[2,85],142:[2,85],143:[2,85],144:[2,85],145:[2,85]},{1:[2,43],6:[2,43],17:[2,43],18:[2,43],19:[2,43],31:[2,43],32:[2,43],63:[2,43],69:[2,43],71:[2,43],72:[2,43],81:[2,43],82:[2,43],83:[2,43],85:[2,43],87:[2,43],88:[2,43],96:[2,43],101:[2,43],110:[2,43],112:[2,43],113:[2,43],114:[2,43],118:[2,43],126:[2,43],134:[2,43],136:[2,43],137:[2,43],140:[2,43],141:[2,43],142:[2,43],143:[2,43],144:[2,43],145:[2,43]},{1:[2,44],6:[2,44],17:[2,44],18:[2,44],19:[2,44],31:[2,44],32:[2,44],63:[2,44],69:[2,44],71:[2,44],72:[2,44],81:[2,44],82:[2,44],83:[2,44],85:[2,44],87:[2,44],88:[2,44],96:[2,44],101:[2,44],110:[2,44],112:[2,44],113:[2,44],114:[2,44],118:[2,44],126:[2,44],134:[2,44],136:[2,44],137:[2,44],140:[2,44],141:[2,44],142:[2,44],143:[2,44],144:[2,44],145:[2,44]},{1:[2,45],6:[2,45],17:[2,45],18:[2,45],19:[2,45],31:[2,45],32:[2,45],63:[2,45],69:[2,45],71:[2,45],72:[2,45],81:[2,45],82:[2,45],83:[2,45],85:[2,45],87:[2,45],88:[2,45],96:[2,45],101:[2,45],110:[2,45],112:[2,45],113:[2,45],114:[2,45],118:[2,45],126:[2,45],134:[2,45],136:[2,45],137:[2,45],140:[2,45],141:[2,45],142:[2,45],143:[2,45],144:[2,45],145:[2,45]},{1:[2,46],6:[2,46],17:[2,46],18:[2,46],19:[2,46],31:[2,46],32:[2,46],63:[2,46],69:[2,46],71:[2,46],72:[2,46],81:[2,46],82:[2,46],83:[2,46],85:[2,46],87:[2,46],88:[2,46],96:[2,46],101:[2,46],110:[2,46],112:[2,46],113:[2,46],114:[2,46],118:[2,46],126:[2,46],134:[2,46],136:[2,46],137:[2,46],140:[2,46],141:[2,46],142:[2,46],143:[2,46],144:[2,46],145:[2,46]},{1:[2,47],6:[2,47],17:[2,47],18:[2,47],19:[2,47],31:[2,47],32:[2,47],63:[2,47],69:[2,47],71:[2,47],72:[2,47],81:[2,47],82:[2,47],83:[2,47],85:[2,47],87:[2,47],88:[2,47],96:[2,47],101:[2,47],110:[2,47],112:[2,47],113:[2,47],114:[2,47],118:[2,47],126:[2,47],134:[2,47],136:[2,47],137:[2,47],140:[2,47],141:[2,47],142:[2,47],143:[2,47],144:[2,47],145:[2,47]},{4:179,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,180],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:181,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,185],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],31:[1,182],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,75:186,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],97:183,98:[1,63],99:[1,64],102:184,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,122],6:[2,122],17:[2,122],18:[2,122],19:[2,122],31:[2,122],32:[2,122],63:[2,122],69:[2,122],71:[2,122],72:[2,122],81:[2,122],82:[2,122],83:[2,122],85:[2,122],87:[2,122],88:[2,122],96:[2,122],101:[2,122],110:[2,122],112:[2,122],113:[2,122],114:[2,122],118:[2,122],126:[2,122],134:[2,122],136:[2,122],137:[2,122],140:[2,122],141:[2,122],142:[2,122],143:[2,122],144:[2,122],145:[2,122]},{1:[2,123],6:[2,123],17:[2,123],18:[2,123],19:[2,123],26:187,31:[2,123],32:[2,123],46:[1,109],63:[2,123],69:[2,123],71:[2,123],72:[2,123],81:[2,123],82:[2,123],83:[2,123],85:[2,123],87:[2,123],88:[2,123],96:[2,123],101:[2,123],110:[2,123],112:[2,123],113:[2,123],114:[2,123],118:[2,123],126:[2,123],134:[2,123],136:[2,123],137:[2,123],140:[2,123],141:[2,123],142:[2,123],143:[2,123],144:[2,123],145:[2,123]},{18:[2,63]},{18:[2,64]},{1:[2,79],6:[2,79],14:[2,79],17:[2,79],18:[2,79],19:[2,79],31:[2,79],32:[2,79],63:[2,79],69:[2,79],71:[2,79],72:[2,79],81:[2,79],82:[2,79],83:[2,79],85:[2,79],87:[2,79],88:[2,79],92:[2,79],96:[2,79],101:[2,79],110:[2,79],112:[2,79],113:[2,79],114:[2,79],118:[2,79],126:[2,79],134:[2,79],136:[2,79],137:[2,79],138:[2,79],139:[2,79],140:[2,79],141:[2,79],142:[2,79],143:[2,79],144:[2,79],145:[2,79],146:[2,79]},{1:[2,82],6:[2,82],14:[2,82],17:[2,82],18:[2,82],19:[2,82],31:[2,82],32:[2,82],63:[2,82],69:[2,82],71:[2,82],72:[2,82],81:[2,82],82:[2,82],83:[2,82],85:[2,82],87:[2,82],88:[2,82],92:[2,82],96:[2,82],101:[2,82],110:[2,82],112:[2,82],113:[2,82],114:[2,82],118:[2,82],126:[2,82],134:[2,82],136:[2,82],137:[2,82],138:[2,82],139:[2,82],140:[2,82],141:[2,82],142:[2,82],143:[2,82],144:[2,82],145:[2,82],146:[2,82]},{8:188,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:189,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:190,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{5:191,8:192,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,5],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{15:[1,106],26:197,29:[1,62],46:[1,109],73:198,74:199,79:193,121:194,122:[1,195],123:196},{120:200,124:[1,201],125:[1,202]},{71:[2,212]},{71:[2,213]},{71:[2,214]},{71:[2,215]},{71:[2,216]},{71:[2,217]},{71:[2,218]},{71:[2,219]},{71:[2,220]},{71:[2,221]},{71:[2,222]},{71:[2,223]},{71:[2,224]},{71:[2,225]},{71:[2,226]},{71:[2,227]},{71:[2,228]},{71:[2,229]},{71:[2,230]},{71:[2,231]},{71:[2,232]},{71:[2,233]},{71:[2,234]},{71:[2,235]},{71:[2,236]},{71:[2,237]},{71:[2,238]},{71:[2,239]},{71:[2,240]},{71:[2,241]},{71:[2,242]},{6:[2,101],11:206,17:[2,101],18:[2,101],26:207,32:[2,101],46:[1,109],47:208,48:[1,107],49:[1,108],56:204,57:205,58:209,60:[1,49],90:203,99:[1,151]},{1:[2,41],6:[2,41],17:[2,41],18:[2,41],19:[2,41],27:[2,41],31:[2,41],32:[2,41],63:[2,41],69:[2,41],71:[2,41],72:[2,41],81:[2,41],82:[2,41],83:[2,41],85:[2,41],87:[2,41],88:[2,41],96:[2,41],101:[2,41],110:[2,41],112:[2,41],113:[2,41],114:[2,41],118:[2,41],126:[2,41],134:[2,41],136:[2,41],137:[2,41],140:[2,41],141:[2,41],142:[2,41],143:[2,41],144:[2,41],145:[2,41]},{1:[2,42],6:[2,42],17:[2,42],18:[2,42],19:[2,42],27:[2,42],31:[2,42],32:[2,42],63:[2,42],69:[2,42],71:[2,42],72:[2,42],81:[2,42],82:[2,42],83:[2,42],85:[2,42],87:[2,42],88:[2,42],96:[2,42],101:[2,42],110:[2,42],112:[2,42],113:[2,42],114:[2,42],118:[2,42],126:[2,42],134:[2,42],136:[2,42],137:[2,42],140:[2,42],141:[2,42],142:[2,42],143:[2,42],144:[2,42],145:[2,42]},{1:[2,40],6:[2,40],14:[2,40],17:[2,40],18:[2,40],19:[2,40],27:[2,40],31:[2,40],32:[2,40],63:[2,40],69:[2,40],71:[2,40],72:[2,40],81:[2,40],82:[2,40],83:[2,40],85:[2,40],87:[2,40],88:[2,40],92:[2,40],96:[2,40],101:[2,40],110:[2,40],112:[2,40],113:[2,40],114:[2,40],118:[2,40],124:[2,40],125:[2,40],126:[2,40],134:[2,40],136:[2,40],137:[2,40],138:[2,40],139:[2,40],140:[2,40],141:[2,40],142:[2,40],143:[2,40],144:[2,40],145:[2,40],146:[2,40]},{1:[2,6],6:[2,6],7:210,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],19:[2,6],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],110:[2,6],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,3]},{1:[2,38],6:[2,38],17:[2,38],18:[2,38],19:[2,38],31:[2,38],32:[2,38],63:[2,38],69:[2,38],72:[2,38],87:[2,38],101:[2,38],106:[2,38],107:[2,38],110:[2,38],112:[2,38],113:[2,38],114:[2,38],118:[2,38],126:[2,38],129:[2,38],131:[2,38],134:[2,38],136:[2,38],137:[2,38],140:[2,38],141:[2,38],142:[2,38],143:[2,38],144:[2,38],145:[2,38]},{6:[1,110],19:[1,211]},{1:[2,201],6:[2,201],17:[2,201],18:[2,201],19:[2,201],31:[2,201],32:[2,201],63:[2,201],69:[2,201],72:[2,201],87:[2,201],101:[2,201],110:[2,201],112:[2,201],113:[2,201],114:[2,201],118:[2,201],126:[2,201],134:[2,201],136:[2,201],137:[2,201],140:[2,201],141:[2,201],142:[2,201],143:[2,201],144:[2,201],145:[2,201]},{8:212,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:213,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:214,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:215,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:216,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:217,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:218,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:219,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,157],6:[2,157],17:[2,157],18:[2,157],19:[2,157],31:[2,157],32:[2,157],63:[2,157],69:[2,157],72:[2,157],87:[2,157],101:[2,157],110:[2,157],112:[2,157],113:[2,157],114:[2,157],118:[2,157],126:[2,157],134:[2,157],136:[2,157],137:[2,157],140:[2,157],141:[2,157],142:[2,157],143:[2,157],144:[2,157],145:[2,157]},{1:[2,162],6:[2,162],17:[2,162],18:[2,162],19:[2,162],31:[2,162],32:[2,162],63:[2,162],69:[2,162],72:[2,162],87:[2,162],101:[2,162],110:[2,162],112:[2,162],113:[2,162],114:[2,162],118:[2,162],126:[2,162],134:[2,162],136:[2,162],137:[2,162],140:[2,162],141:[2,162],142:[2,162],143:[2,162],144:[2,162],145:[2,162]},{8:220,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,156],6:[2,156],17:[2,156],18:[2,156],19:[2,156],31:[2,156],32:[2,156],63:[2,156],69:[2,156],72:[2,156],87:[2,156],101:[2,156],110:[2,156],112:[2,156],113:[2,156],114:[2,156],118:[2,156],126:[2,156],134:[2,156],136:[2,156],137:[2,156],140:[2,156],141:[2,156],142:[2,156],143:[2,156],144:[2,156],145:[2,156]},{1:[2,161],6:[2,161],17:[2,161],18:[2,161],19:[2,161],31:[2,161],32:[2,161],63:[2,161],69:[2,161],72:[2,161],87:[2,161],101:[2,161],110:[2,161],112:[2,161],113:[2,161],114:[2,161],118:[2,161],126:[2,161],134:[2,161],136:[2,161],137:[2,161],140:[2,161],141:[2,161],142:[2,161],143:[2,161],144:[2,161],145:[2,161]},{71:[1,142],94:221},{1:[2,80],6:[2,80],14:[2,80],17:[2,80],18:[2,80],19:[2,80],31:[2,80],32:[2,80],63:[2,80],69:[2,80],71:[2,80],72:[2,80],81:[2,80],82:[2,80],83:[2,80],85:[2,80],87:[2,80],88:[2,80],92:[2,80],96:[2,80],101:[2,80],110:[2,80],112:[2,80],113:[2,80],114:[2,80],118:[2,80],126:[2,80],134:[2,80],136:[2,80],137:[2,80],138:[2,80],139:[2,80],140:[2,80],141:[2,80],142:[2,80],143:[2,80],144:[2,80],145:[2,80],146:[2,80]},{71:[2,119]},{26:222,46:[1,109]},{26:223,46:[1,109]},{1:[2,94],6:[2,94],14:[2,94],17:[2,94],18:[2,94],19:[2,94],26:224,31:[2,94],32:[2,94],46:[1,109],63:[2,94],69:[2,94],71:[2,94],72:[2,94],81:[2,94],82:[2,94],83:[2,94],85:[2,94],87:[2,94],88:[2,94],92:[2,94],96:[2,94],101:[2,94],110:[2,94],112:[2,94],113:[2,94],114:[2,94],118:[2,94],126:[2,94],134:[2,94],136:[2,94],137:[2,94],138:[2,94],139:[2,94],140:[2,94],141:[2,94],142:[2,94],143:[2,94],144:[2,94],145:[2,94],146:[2,94]},{1:[2,95],6:[2,95],14:[2,95],17:[2,95],18:[2,95],19:[2,95],31:[2,95],32:[2,95],63:[2,95],69:[2,95],71:[2,95],72:[2,95],81:[2,95],82:[2,95],83:[2,95],85:[2,95],87:[2,95],88:[2,95],92:[2,95],96:[2,95],101:[2,95],110:[2,95],112:[2,95],113:[2,95],114:[2,95],118:[2,95],126:[2,95],134:[2,95],136:[2,95],137:[2,95],138:[2,95],139:[2,95],140:[2,95],141:[2,95],142:[2,95],143:[2,95],144:[2,95],145:[2,95],146:[2,95]},{8:226,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],69:[1,230],70:47,73:54,74:55,76:38,78:27,79:28,80:29,86:225,89:227,91:[1,45],95:[1,30],98:[1,63],99:[1,64],100:228,101:[1,229],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{84:231,85:[1,135],88:[1,136]},{71:[1,142],94:232},{1:[2,81],6:[2,81],14:[2,81],17:[2,81],18:[2,81],19:[2,81],31:[2,81],32:[2,81],63:[2,81],69:[2,81],71:[2,81],72:[2,81],81:[2,81],82:[2,81],83:[2,81],85:[2,81],87:[2,81],88:[2,81],92:[2,81],96:[2,81],101:[2,81],110:[2,81],112:[2,81],113:[2,81],114:[2,81],118:[2,81],126:[2,81],134:[2,81],136:[2,81],137:[2,81],138:[2,81],139:[2,81],140:[2,81],141:[2,81],142:[2,81],143:[2,81],144:[2,81],145:[2,81],146:[2,81]},{15:[1,233],18:[1,234]},{6:[1,236],8:235,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,237],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,117],6:[2,117],17:[2,117],18:[2,117],19:[2,117],31:[2,117],32:[2,117],63:[2,117],69:[2,117],71:[2,117],72:[2,117],81:[2,117],82:[2,117],83:[2,117],85:[2,117],87:[2,117],88:[2,117],96:[2,117],101:[2,117],110:[2,117],112:[2,117],113:[2,117],114:[2,117],118:[2,117],126:[2,117],134:[2,117],136:[2,117],137:[2,117],140:[2,117],141:[2,117],142:[2,117],143:[2,117],144:[2,117],145:[2,117]},{8:240,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,185],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,72:[1,238],73:54,74:55,75:186,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],97:239,98:[1,63],99:[1,64],102:184,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{32:[1,242],63:[1,241]},{32:[2,68],63:[2,68]},{14:[1,244],32:[2,70],63:[2,70],69:[1,243],72:[2,70]},{71:[1,245]},{14:[2,74],32:[2,74],63:[2,74],69:[2,74],72:[2,74]},{14:[2,75],32:[2,75],63:[2,75],69:[2,75],72:[2,75]},{14:[2,76],32:[2,76],63:[2,76],69:[2,76],72:[2,76]},{14:[2,77],32:[2,77],63:[2,77],69:[2,77],72:[2,77]},{26:187,46:[1,109]},{8:240,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,185],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],31:[1,182],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,75:186,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],97:183,98:[1,63],99:[1,64],102:184,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,62],6:[2,62],17:[2,62],18:[2,62],19:[2,62],31:[2,62],32:[2,62],63:[2,62],69:[2,62],72:[2,62],87:[2,62],101:[2,62],110:[2,62],112:[2,62],113:[2,62],114:[2,62],118:[2,62],126:[2,62],134:[2,62],136:[2,62],137:[2,62],140:[2,62],141:[2,62],142:[2,62],143:[2,62],144:[2,62],145:[2,62]},{1:[2,194],6:[2,194],17:[2,194],18:[2,194],19:[2,194],31:[2,194],32:[2,194],63:[2,194],69:[2,194],72:[2,194],87:[2,194],101:[2,194],110:[2,194],111:123,112:[2,194],113:[2,194],114:[2,194],117:124,118:[2,194],119:74,126:[2,194],134:[2,194],136:[2,194],137:[2,194],140:[1,114],141:[2,194],142:[2,194],143:[2,194],144:[2,194],145:[2,194]},{111:126,112:[1,70],114:[1,71],117:127,118:[1,73],119:74,134:[1,125]},{1:[2,195],6:[2,195],17:[2,195],18:[2,195],19:[2,195],31:[2,195],32:[2,195],63:[2,195],69:[2,195],72:[2,195],87:[2,195],101:[2,195],110:[2,195],111:123,112:[2,195],113:[2,195],114:[2,195],117:124,118:[2,195],119:74,126:[2,195],134:[2,195],136:[2,195],137:[2,195],140:[1,114],141:[2,195],142:[2,195],143:[2,195],144:[2,195],145:[2,195]},{1:[2,196],6:[2,196],17:[2,196],18:[2,196],19:[2,196],31:[2,196],32:[2,196],63:[2,196],69:[2,196],72:[2,196],87:[2,196],101:[2,196],110:[2,196],111:123,112:[2,196],113:[2,196],114:[2,196],117:124,118:[2,196],119:74,126:[2,196],134:[2,196],136:[2,196],137:[2,196],140:[1,114],141:[2,196],142:[2,196],143:[2,196],144:[2,196],145:[2,196]},{1:[2,197],6:[2,197],17:[2,197],18:[2,197],19:[2,197],31:[2,197],32:[2,197],63:[2,197],69:[2,197],71:[2,83],72:[2,197],81:[2,83],82:[2,83],83:[2,83],85:[2,83],87:[2,197],88:[2,83],96:[2,83],101:[2,197],110:[2,197],112:[2,197],113:[2,197],114:[2,197],118:[2,197],126:[2,197],134:[2,197],136:[2,197],137:[2,197],140:[2,197],141:[2,197],142:[2,197],143:[2,197],144:[2,197],145:[2,197]},{71:[2,118],77:129,81:[1,131],82:[1,132],83:[1,133],84:134,85:[1,135],88:[1,136],93:128,96:[1,130]},{71:[2,118],77:138,81:[1,131],82:[1,132],83:[1,133],84:134,85:[1,135],88:[1,136],93:137,96:[1,130]},{71:[2,86],81:[2,86],82:[2,86],83:[2,86],85:[2,86],88:[2,86],96:[2,86]},{1:[2,198],6:[2,198],17:[2,198],18:[2,198],19:[2,198],31:[2,198],32:[2,198],63:[2,198],69:[2,198],71:[2,83],72:[2,198],81:[2,83],82:[2,83],83:[2,83],85:[2,83],87:[2,198],88:[2,83],96:[2,83],101:[2,198],110:[2,198],112:[2,198],113:[2,198],114:[2,198],118:[2,198],126:[2,198],134:[2,198],136:[2,198],137:[2,198],140:[2,198],141:[2,198],142:[2,198],143:[2,198],144:[2,198],145:[2,198]},{1:[2,199],6:[2,199],17:[2,199],18:[2,199],19:[2,199],31:[2,199],32:[2,199],63:[2,199],69:[2,199],72:[2,199],87:[2,199],101:[2,199],110:[2,199],112:[2,199],113:[2,199],114:[2,199],118:[2,199],126:[2,199],134:[2,199],136:[2,199],137:[2,199],140:[2,199],141:[2,199],142:[2,199],143:[2,199],144:[2,199],145:[2,199]},{1:[2,200],6:[2,200],17:[2,200],18:[2,200],19:[2,200],31:[2,200],32:[2,200],63:[2,200],69:[2,200],72:[2,200],87:[2,200],101:[2,200],110:[2,200],112:[2,200],113:[2,200],114:[2,200],118:[2,200],126:[2,200],134:[2,200],136:[2,200],137:[2,200],140:[2,200],141:[2,200],142:[2,200],143:[2,200],144:[2,200],145:[2,200]},{8:246,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,247],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:248,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{5:249,18:[1,5],133:[1,250]},{1:[2,143],6:[2,143],17:[2,143],18:[2,143],19:[2,143],31:[2,143],32:[2,143],63:[2,143],69:[2,143],72:[2,143],87:[2,143],101:[2,143],105:251,106:[1,252],107:[1,253],110:[2,143],112:[2,143],113:[2,143],114:[2,143],118:[2,143],126:[2,143],134:[2,143],136:[2,143],137:[2,143],140:[2,143],141:[2,143],142:[2,143],143:[2,143],144:[2,143],145:[2,143]},{1:[2,155],6:[2,155],17:[2,155],18:[2,155],19:[2,155],31:[2,155],32:[2,155],63:[2,155],69:[2,155],72:[2,155],87:[2,155],101:[2,155],110:[2,155],112:[2,155],113:[2,155],114:[2,155],118:[2,155],126:[2,155],134:[2,155],136:[2,155],137:[2,155],140:[2,155],141:[2,155],142:[2,155],143:[2,155],144:[2,155],145:[2,155]},{1:[2,163],6:[2,163],17:[2,163],18:[2,163],19:[2,163],31:[2,163],32:[2,163],63:[2,163],69:[2,163],72:[2,163],87:[2,163],101:[2,163],110:[2,163],112:[2,163],113:[2,163],114:[2,163],118:[2,163],126:[2,163],134:[2,163],136:[2,163],137:[2,163],140:[2,163],141:[2,163],142:[2,163],143:[2,163],144:[2,163],145:[2,163]},{18:[1,254],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{128:255,130:256,131:[1,257]},{1:[2,107],6:[2,107],17:[2,107],18:[2,107],19:[2,107],31:[2,107],32:[2,107],63:[2,107],69:[2,107],72:[2,107],87:[2,107],101:[2,107],110:[2,107],112:[2,107],113:[2,107],114:[2,107],118:[2,107],126:[2,107],134:[2,107],136:[2,107],137:[2,107],140:[2,107],141:[2,107],142:[2,107],143:[2,107],144:[2,107],145:[2,107]},{8:258,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,110],5:259,6:[2,110],17:[2,110],18:[1,5],19:[2,110],31:[2,110],32:[2,110],63:[2,110],69:[2,110],71:[2,83],72:[2,110],81:[2,83],82:[2,83],83:[2,83],85:[2,83],87:[2,110],88:[2,83],92:[1,260],96:[2,83],101:[2,110],110:[2,110],112:[2,110],113:[2,110],114:[2,110],118:[2,110],126:[2,110],134:[2,110],136:[2,110],137:[2,110],140:[2,110],141:[2,110],142:[2,110],143:[2,110],144:[2,110],145:[2,110]},{1:[2,148],6:[2,148],17:[2,148],18:[2,148],19:[2,148],31:[2,148],32:[2,148],63:[2,148],69:[2,148],72:[2,148],87:[2,148],101:[2,148],110:[2,148],111:123,112:[2,148],113:[2,148],114:[2,148],117:124,118:[2,148],119:74,126:[2,148],134:[2,148],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,243],6:[2,243],17:[2,243],18:[2,243],19:[2,243],31:[2,243],32:[2,243],63:[2,243],69:[2,243],72:[2,243],87:[2,243],101:[2,243],110:[2,243],112:[2,243],113:[2,243],114:[2,243],118:[2,243],126:[2,243],134:[2,243],136:[2,243],137:[2,243],140:[2,243],141:[2,243],142:[2,243],143:[2,243],144:[2,243],145:[2,243]},{1:[2,58],6:[2,58],19:[2,58],110:[2,58],111:123,112:[2,58],114:[2,58],117:124,118:[2,58],119:74,134:[2,58],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{6:[1,110],110:[1,261]},{4:262,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{6:[2,139],18:[2,139],31:[2,139],32:[2,139],69:[1,264],100:263,101:[1,229],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,125],6:[2,125],14:[2,125],17:[2,125],18:[2,125],19:[2,125],31:[2,125],32:[2,125],63:[2,125],69:[2,125],71:[2,125],72:[2,125],81:[2,125],82:[2,125],83:[2,125],85:[2,125],87:[2,125],88:[2,125],96:[2,125],101:[2,125],110:[2,125],112:[2,125],113:[2,125],114:[2,125],118:[2,125],124:[2,125],125:[2,125],126:[2,125],134:[2,125],136:[2,125],137:[2,125],140:[2,125],141:[2,125],142:[2,125],143:[2,125],144:[2,125],145:[2,125]},{6:[2,65],18:[2,65],25:265,31:[2,65],32:[1,266]},{6:[2,134],18:[2,134],19:[2,134],31:[2,134],32:[2,134],72:[2,134]},{8:240,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,185],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,75:186,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],97:267,98:[1,63],99:[1,64],102:184,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{6:[2,140],18:[2,140],19:[2,140],31:[2,140],32:[2,140],72:[2,140]},{1:[2,124],6:[2,124],14:[2,124],17:[2,124],18:[2,124],19:[2,124],27:[2,124],31:[2,124],32:[2,124],63:[2,124],69:[2,124],71:[2,124],72:[2,124],81:[2,124],82:[2,124],83:[2,124],85:[2,124],87:[2,124],88:[2,124],92:[2,124],96:[2,124],101:[2,124],110:[2,124],112:[2,124],113:[2,124],114:[2,124],118:[2,124],126:[2,124],134:[2,124],136:[2,124],137:[2,124],138:[2,124],139:[2,124],140:[2,124],141:[2,124],142:[2,124],143:[2,124],144:[2,124],145:[2,124],146:[2,124]},{5:268,18:[1,5],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,151],6:[2,151],17:[2,151],18:[2,151],19:[2,151],31:[2,151],32:[2,151],63:[2,151],69:[2,151],72:[2,151],87:[2,151],101:[2,151],110:[2,151],111:123,112:[1,70],113:[1,269],114:[1,71],117:124,118:[1,73],119:74,126:[2,151],134:[2,151],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,153],6:[2,153],17:[2,153],18:[2,153],19:[2,153],31:[2,153],32:[2,153],63:[2,153],69:[2,153],72:[2,153],87:[2,153],101:[2,153],110:[2,153],111:123,112:[1,70],113:[1,270],114:[1,71],117:124,118:[1,73],119:74,126:[2,153],134:[2,153],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,159],6:[2,159],17:[2,159],18:[2,159],19:[2,159],31:[2,159],32:[2,159],63:[2,159],69:[2,159],72:[2,159],87:[2,159],101:[2,159],110:[2,159],112:[2,159],113:[2,159],114:[2,159],118:[2,159],126:[2,159],134:[2,159],136:[2,159],137:[2,159],140:[2,159],141:[2,159],142:[2,159],143:[2,159],144:[2,159],145:[2,159]},{1:[2,160],6:[2,160],17:[2,160],18:[2,160],19:[2,160],31:[2,160],32:[2,160],63:[2,160],69:[2,160],72:[2,160],87:[2,160],101:[2,160],110:[2,160],111:123,112:[1,70],113:[2,160],114:[1,71],117:124,118:[1,73],119:74,126:[2,160],134:[2,160],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,164],6:[2,164],17:[2,164],18:[2,164],19:[2,164],31:[2,164],32:[2,164],63:[2,164],69:[2,164],72:[2,164],87:[2,164],101:[2,164],110:[2,164],112:[2,164],113:[2,164],114:[2,164],118:[2,164],126:[2,164],134:[2,164],136:[2,164],137:[2,164],140:[2,164],141:[2,164],142:[2,164],143:[2,164],144:[2,164],145:[2,164]},{124:[2,166],125:[2,166]},{15:[1,106],26:197,29:[1,152],46:[1,109],73:198,74:199,121:271,123:196},{32:[1,272],124:[2,171],125:[2,171]},{32:[2,168],124:[2,168],125:[2,168]},{32:[2,169],124:[2,169],125:[2,169]},{32:[2,170],124:[2,170],125:[2,170]},{1:[2,165],6:[2,165],17:[2,165],18:[2,165],19:[2,165],31:[2,165],32:[2,165],63:[2,165],69:[2,165],72:[2,165],87:[2,165],101:[2,165],110:[2,165],112:[2,165],113:[2,165],114:[2,165],118:[2,165],126:[2,165],134:[2,165],136:[2,165],137:[2,165],140:[2,165],141:[2,165],142:[2,165],143:[2,165],144:[2,165],145:[2,165]},{8:273,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:274,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{6:[2,65],17:[2,65],18:[2,65],25:275,32:[1,276]},{6:[2,102],17:[2,102],18:[2,102],19:[2,102],32:[2,102]},{6:[2,51],17:[2,51],18:[2,51],19:[2,51],27:[1,277],32:[2,51]},{6:[2,54],17:[2,54],18:[2,54],19:[2,54],32:[2,54]},{6:[2,55],17:[2,55],18:[2,55],19:[2,55],27:[2,55],32:[2,55]},{6:[2,56],17:[2,56],18:[2,56],19:[2,56],27:[2,56],32:[2,56]},{6:[2,57],17:[2,57],18:[2,57],19:[2,57],27:[2,57],32:[2,57]},{1:[2,5],6:[2,5],19:[2,5],110:[2,5]},{1:[2,39],6:[2,39],17:[2,39],18:[2,39],19:[2,39],31:[2,39],32:[2,39],63:[2,39],69:[2,39],72:[2,39],87:[2,39],101:[2,39],106:[2,39],107:[2,39],110:[2,39],112:[2,39],113:[2,39],114:[2,39],118:[2,39],126:[2,39],129:[2,39],131:[2,39],134:[2,39],136:[2,39],137:[2,39],140:[2,39],141:[2,39],142:[2,39],143:[2,39],144:[2,39],145:[2,39]},{1:[2,202],6:[2,202],17:[2,202],18:[2,202],19:[2,202],31:[2,202],32:[2,202],63:[2,202],69:[2,202],72:[2,202],87:[2,202],101:[2,202],110:[2,202],111:123,112:[2,202],113:[2,202],114:[2,202],117:124,118:[2,202],119:74,126:[2,202],134:[2,202],136:[2,202],137:[2,202],140:[1,114],141:[1,117],142:[2,202],143:[2,202],144:[2,202],145:[2,202]},{1:[2,203],6:[2,203],17:[2,203],18:[2,203],19:[2,203],31:[2,203],32:[2,203],63:[2,203],69:[2,203],72:[2,203],87:[2,203],101:[2,203],110:[2,203],111:123,112:[2,203],113:[2,203],114:[2,203],117:124,118:[2,203],119:74,126:[2,203],134:[2,203],136:[2,203],137:[2,203],140:[1,114],141:[1,117],142:[2,203],143:[2,203],144:[2,203],145:[2,203]},{1:[2,204],6:[2,204],17:[2,204],18:[2,204],19:[2,204],31:[2,204],32:[2,204],63:[2,204],69:[2,204],72:[2,204],87:[2,204],101:[2,204],110:[2,204],111:123,112:[2,204],113:[2,204],114:[2,204],117:124,118:[2,204],119:74,126:[2,204],134:[2,204],136:[2,204],137:[2,204],140:[1,114],141:[2,204],142:[2,204],143:[2,204],144:[2,204],145:[2,204]},{1:[2,205],6:[2,205],17:[2,205],18:[2,205],19:[2,205],31:[2,205],32:[2,205],63:[2,205],69:[2,205],72:[2,205],87:[2,205],101:[2,205],110:[2,205],111:123,112:[2,205],113:[2,205],114:[2,205],117:124,118:[2,205],119:74,126:[2,205],134:[2,205],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[2,205],143:[2,205],144:[2,205],145:[2,205]},{1:[2,206],6:[2,206],17:[2,206],18:[2,206],19:[2,206],31:[2,206],32:[2,206],63:[2,206],69:[2,206],72:[2,206],87:[2,206],101:[2,206],110:[2,206],111:123,112:[2,206],113:[2,206],114:[2,206],117:124,118:[2,206],119:74,126:[2,206],134:[2,206],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[2,206],144:[2,206],145:[1,121]},{1:[2,207],6:[2,207],17:[2,207],18:[2,207],19:[2,207],31:[2,207],32:[2,207],63:[2,207],69:[2,207],72:[2,207],87:[2,207],101:[2,207],110:[2,207],111:123,112:[2,207],113:[2,207],114:[2,207],117:124,118:[2,207],119:74,126:[2,207],134:[2,207],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[2,207],145:[1,121]},{1:[2,208],6:[2,208],17:[2,208],18:[2,208],19:[2,208],31:[2,208],32:[2,208],63:[2,208],69:[2,208],72:[2,208],87:[2,208],101:[2,208],110:[2,208],111:123,112:[2,208],113:[2,208],114:[2,208],117:124,118:[2,208],119:74,126:[2,208],134:[2,208],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[2,208],144:[2,208],145:[2,208]},{1:[2,193],6:[2,193],17:[2,193],18:[2,193],19:[2,193],31:[2,193],32:[2,193],63:[2,193],69:[2,193],72:[2,193],87:[2,193],101:[2,193],110:[2,193],111:123,112:[1,70],113:[2,193],114:[1,71],117:124,118:[1,73],119:74,126:[2,193],134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,192],6:[2,192],17:[2,192],18:[2,192],19:[2,192],31:[2,192],32:[2,192],63:[2,192],69:[2,192],72:[2,192],87:[2,192],101:[2,192],110:[2,192],111:123,112:[1,70],113:[2,192],114:[1,71],117:124,118:[1,73],119:74,126:[2,192],134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,114],6:[2,114],17:[2,114],18:[2,114],19:[2,114],31:[2,114],32:[2,114],63:[2,114],69:[2,114],71:[2,114],72:[2,114],81:[2,114],82:[2,114],83:[2,114],85:[2,114],87:[2,114],88:[2,114],96:[2,114],101:[2,114],110:[2,114],112:[2,114],113:[2,114],114:[2,114],118:[2,114],126:[2,114],134:[2,114],136:[2,114],137:[2,114],140:[2,114],141:[2,114],142:[2,114],143:[2,114],144:[2,114],145:[2,114]},{1:[2,91],6:[2,91],14:[2,91],17:[2,91],18:[2,91],19:[2,91],31:[2,91],32:[2,91],63:[2,91],69:[2,91],71:[2,91],72:[2,91],81:[2,91],82:[2,91],83:[2,91],85:[2,91],87:[2,91],88:[2,91],92:[2,91],96:[2,91],101:[2,91],110:[2,91],112:[2,91],113:[2,91],114:[2,91],118:[2,91],126:[2,91],134:[2,91],136:[2,91],137:[2,91],138:[2,91],139:[2,91],140:[2,91],141:[2,91],142:[2,91],143:[2,91],144:[2,91],145:[2,91],146:[2,91]},{1:[2,92],6:[2,92],14:[2,92],17:[2,92],18:[2,92],19:[2,92],31:[2,92],32:[2,92],63:[2,92],69:[2,92],71:[2,92],72:[2,92],81:[2,92],82:[2,92],83:[2,92],85:[2,92],87:[2,92],88:[2,92],92:[2,92],96:[2,92],101:[2,92],110:[2,92],112:[2,92],113:[2,92],114:[2,92],118:[2,92],126:[2,92],134:[2,92],136:[2,92],137:[2,92],138:[2,92],139:[2,92],140:[2,92],141:[2,92],142:[2,92],143:[2,92],144:[2,92],145:[2,92],146:[2,92]},{1:[2,93],6:[2,93],14:[2,93],17:[2,93],18:[2,93],19:[2,93],31:[2,93],32:[2,93],63:[2,93],69:[2,93],71:[2,93],72:[2,93],81:[2,93],82:[2,93],83:[2,93],85:[2,93],87:[2,93],88:[2,93],92:[2,93],96:[2,93],101:[2,93],110:[2,93],112:[2,93],113:[2,93],114:[2,93],118:[2,93],126:[2,93],134:[2,93],136:[2,93],137:[2,93],138:[2,93],139:[2,93],140:[2,93],141:[2,93],142:[2,93],143:[2,93],144:[2,93],145:[2,93],146:[2,93]},{87:[1,278]},{69:[1,230],87:[2,98],100:279,101:[1,229],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{87:[2,99]},{8:280,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,87:[2,133],91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{12:[2,127],15:[2,127],20:[2,127],21:[2,127],22:[2,127],23:[2,127],29:[2,127],46:[2,127],48:[2,127],49:[2,127],51:[2,127],52:[2,127],53:[2,127],54:[2,127],59:[2,127],60:[2,127],61:[2,127],65:[2,127],66:[2,127],87:[2,127],91:[2,127],95:[2,127],98:[2,127],99:[2,127],104:[2,127],108:[2,127],109:[2,127],112:[2,127],114:[2,127],116:[2,127],118:[2,127],127:[2,127],133:[2,127],135:[2,127],136:[2,127],137:[2,127],138:[2,127],139:[2,127],147:[2,127],148:[2,127],149:[2,127],150:[2,127],151:[2,127],152:[2,127],153:[2,127],154:[2,127],155:[2,127],156:[2,127],157:[2,127],158:[2,127],159:[2,127],160:[2,127],161:[2,127],162:[2,127],163:[2,127],164:[2,127],165:[2,127],166:[2,127],167:[2,127],168:[2,127],169:[2,127],170:[2,127],171:[2,127],172:[2,127],173:[2,127],174:[2,127],175:[2,127],176:[2,127],177:[2,127]},{12:[2,128],15:[2,128],20:[2,128],21:[2,128],22:[2,128],23:[2,128],29:[2,128],46:[2,128],48:[2,128],49:[2,128],51:[2,128],52:[2,128],53:[2,128],54:[2,128],59:[2,128],60:[2,128],61:[2,128],65:[2,128],66:[2,128],87:[2,128],91:[2,128],95:[2,128],98:[2,128],99:[2,128],104:[2,128],108:[2,128],109:[2,128],112:[2,128],114:[2,128],116:[2,128],118:[2,128],127:[2,128],133:[2,128],135:[2,128],136:[2,128],137:[2,128],138:[2,128],139:[2,128],147:[2,128],148:[2,128],149:[2,128],150:[2,128],151:[2,128],152:[2,128],153:[2,128],154:[2,128],155:[2,128],156:[2,128],157:[2,128],158:[2,128],159:[2,128],160:[2,128],161:[2,128],162:[2,128],163:[2,128],164:[2,128],165:[2,128],166:[2,128],167:[2,128],168:[2,128],169:[2,128],170:[2,128],171:[2,128],172:[2,128],173:[2,128],174:[2,128],175:[2,128],176:[2,128],177:[2,128]},{1:[2,97],6:[2,97],14:[2,97],17:[2,97],18:[2,97],19:[2,97],31:[2,97],32:[2,97],63:[2,97],69:[2,97],71:[2,97],72:[2,97],81:[2,97],82:[2,97],83:[2,97],85:[2,97],87:[2,97],88:[2,97],92:[2,97],96:[2,97],101:[2,97],110:[2,97],112:[2,97],113:[2,97],114:[2,97],118:[2,97],126:[2,97],134:[2,97],136:[2,97],137:[2,97],138:[2,97],139:[2,97],140:[2,97],141:[2,97],142:[2,97],143:[2,97],144:[2,97],145:[2,97],146:[2,97]},{1:[2,115],6:[2,115],17:[2,115],18:[2,115],19:[2,115],31:[2,115],32:[2,115],63:[2,115],69:[2,115],71:[2,115],72:[2,115],81:[2,115],82:[2,115],83:[2,115],85:[2,115],87:[2,115],88:[2,115],96:[2,115],101:[2,115],110:[2,115],112:[2,115],113:[2,115],114:[2,115],118:[2,115],126:[2,115],134:[2,115],136:[2,115],137:[2,115],140:[2,115],141:[2,115],142:[2,115],143:[2,115],144:[2,115],145:[2,115]},{16:281,24:282,26:283,46:[1,109]},{15:[1,284]},{1:[2,48],6:[2,48],17:[2,48],18:[2,48],19:[2,48],31:[2,48],32:[2,48],63:[2,48],69:[2,48],72:[2,48],87:[2,48],101:[2,48],110:[2,48],111:123,112:[2,48],113:[2,48],114:[2,48],117:124,118:[2,48],119:74,126:[2,48],134:[2,48],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{8:285,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:286,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,120],6:[2,120],17:[2,120],18:[2,120],19:[2,120],31:[2,120],32:[2,120],63:[2,120],69:[2,120],71:[2,120],72:[2,120],81:[2,120],82:[2,120],83:[2,120],85:[2,120],87:[2,120],88:[2,120],96:[2,120],101:[2,120],110:[2,120],112:[2,120],113:[2,120],114:[2,120],118:[2,120],126:[2,120],134:[2,120],136:[2,120],137:[2,120],140:[2,120],141:[2,120],142:[2,120],143:[2,120],144:[2,120],145:[2,120]},{6:[2,65],18:[2,65],25:287,32:[1,266],72:[2,65]},{6:[2,139],18:[2,139],19:[2,139],31:[2,139],32:[2,139],69:[1,288],72:[2,139],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{64:289,65:[1,65],66:[1,66]},{15:[1,106],26:147,29:[1,152],46:[1,109],58:148,67:290,68:145,70:146,73:149,74:150,99:[1,151],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{32:[2,71],63:[2,71],72:[2,71]},{8:291,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{15:[1,106],26:147,29:[1,152],46:[1,109],58:148,67:292,68:145,70:146,73:149,74:150,99:[1,151],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,209],6:[2,209],17:[2,209],18:[2,209],19:[2,209],31:[2,209],32:[2,209],63:[2,209],69:[2,209],72:[2,209],87:[2,209],101:[2,209],110:[2,209],111:123,112:[2,209],113:[2,209],114:[2,209],117:124,118:[2,209],119:74,126:[2,209],134:[2,209],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{8:293,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,211],6:[2,211],17:[2,211],18:[2,211],19:[2,211],31:[2,211],32:[2,211],63:[2,211],69:[2,211],72:[2,211],87:[2,211],101:[2,211],110:[2,211],111:123,112:[2,211],113:[2,211],114:[2,211],117:124,118:[2,211],119:74,126:[2,211],134:[2,211],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,191],6:[2,191],17:[2,191],18:[2,191],19:[2,191],31:[2,191],32:[2,191],63:[2,191],69:[2,191],72:[2,191],87:[2,191],101:[2,191],110:[2,191],112:[2,191],113:[2,191],114:[2,191],118:[2,191],126:[2,191],134:[2,191],136:[2,191],137:[2,191],140:[2,191],141:[2,191],142:[2,191],143:[2,191],144:[2,191],145:[2,191]},{8:294,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,144],6:[2,144],17:[2,144],18:[2,144],19:[2,144],31:[2,144],32:[2,144],63:[2,144],69:[2,144],72:[2,144],87:[2,144],101:[2,144],106:[1,295],110:[2,144],112:[2,144],113:[2,144],114:[2,144],118:[2,144],126:[2,144],134:[2,144],136:[2,144],137:[2,144],140:[2,144],141:[2,144],142:[2,144],143:[2,144],144:[2,144],145:[2,144]},{5:296,18:[1,5]},{26:297,46:[1,109]},{128:298,130:256,131:[1,257]},{19:[1,299],129:[1,300],130:301,131:[1,257]},{19:[2,184],129:[2,184],131:[2,184]},{8:303,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],103:302,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,108],5:304,6:[2,108],17:[2,108],18:[1,5],19:[2,108],31:[2,108],32:[2,108],63:[2,108],69:[2,108],72:[2,108],87:[2,108],101:[2,108],110:[2,108],111:123,112:[1,70],113:[2,108],114:[1,71],117:124,118:[1,73],119:74,126:[2,108],134:[2,108],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,111],6:[2,111],17:[2,111],18:[2,111],19:[2,111],31:[2,111],32:[2,111],63:[2,111],69:[2,111],72:[2,111],87:[2,111],101:[2,111],110:[2,111],112:[2,111],113:[2,111],114:[2,111],118:[2,111],126:[2,111],134:[2,111],136:[2,111],137:[2,111],140:[2,111],141:[2,111],142:[2,111],143:[2,111],144:[2,111],145:[2,111]},{8:305,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,149],6:[2,149],17:[2,149],18:[2,149],19:[2,149],31:[2,149],32:[2,149],63:[2,149],69:[2,149],71:[2,149],72:[2,149],81:[2,149],82:[2,149],83:[2,149],85:[2,149],87:[2,149],88:[2,149],96:[2,149],101:[2,149],110:[2,149],112:[2,149],113:[2,149],114:[2,149],118:[2,149],126:[2,149],134:[2,149],136:[2,149],137:[2,149],140:[2,149],141:[2,149],142:[2,149],143:[2,149],144:[2,149],145:[2,149]},{6:[1,110],19:[1,306]},{8:307,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{6:[2,78],12:[2,128],15:[2,128],18:[2,78],20:[2,128],21:[2,128],22:[2,128],23:[2,128],29:[2,128],31:[2,78],32:[2,78],46:[2,128],48:[2,128],49:[2,128],51:[2,128],52:[2,128],53:[2,128],54:[2,128],59:[2,128],60:[2,128],61:[2,128],65:[2,128],66:[2,128],91:[2,128],95:[2,128],98:[2,128],99:[2,128],104:[2,128],108:[2,128],109:[2,128],112:[2,128],114:[2,128],116:[2,128],118:[2,128],127:[2,128],133:[2,128],135:[2,128],136:[2,128],137:[2,128],138:[2,128],139:[2,128],147:[2,128],148:[2,128],149:[2,128],150:[2,128],151:[2,128],152:[2,128],153:[2,128],154:[2,128],155:[2,128],156:[2,128],157:[2,128],158:[2,128],159:[2,128],160:[2,128],161:[2,128],162:[2,128],163:[2,128],164:[2,128],165:[2,128],166:[2,128],167:[2,128],168:[2,128],169:[2,128],170:[2,128],171:[2,128],172:[2,128],173:[2,128],174:[2,128],175:[2,128],176:[2,128],177:[2,128]},{6:[1,309],18:[1,310],31:[1,308]},{6:[2,66],8:240,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[2,66],19:[2,66],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],31:[2,66],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,72:[2,66],73:54,74:55,75:186,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],102:311,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{6:[2,65],18:[2,65],19:[2,65],25:312,32:[1,266]},{1:[2,188],6:[2,188],17:[2,188],18:[2,188],19:[2,188],31:[2,188],32:[2,188],63:[2,188],69:[2,188],72:[2,188],87:[2,188],101:[2,188],110:[2,188],112:[2,188],113:[2,188],114:[2,188],118:[2,188],126:[2,188],129:[2,188],134:[2,188],136:[2,188],137:[2,188],140:[2,188],141:[2,188],142:[2,188],143:[2,188],144:[2,188],145:[2,188]},{8:313,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:314,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{124:[2,167],125:[2,167]},{15:[1,106],26:197,29:[1,152],46:[1,109],73:198,74:199,123:315},{1:[2,173],6:[2,173],17:[2,173],18:[2,173],19:[2,173],31:[2,173],32:[2,173],63:[2,173],69:[2,173],72:[2,173],87:[2,173],101:[2,173],110:[2,173],111:123,112:[2,173],113:[1,316],114:[2,173],117:124,118:[2,173],119:74,126:[1,317],134:[2,173],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,174],6:[2,174],17:[2,174],18:[2,174],19:[2,174],31:[2,174],32:[2,174],63:[2,174],69:[2,174],72:[2,174],87:[2,174],101:[2,174],110:[2,174],111:123,112:[2,174],113:[1,318],114:[2,174],117:124,118:[2,174],119:74,126:[2,174],134:[2,174],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{6:[1,320],17:[1,319],18:[1,321]},{6:[2,66],11:206,17:[2,66],18:[2,66],19:[2,66],26:207,46:[1,109],47:208,48:[1,107],49:[1,108],56:322,57:205,58:209,60:[1,49],99:[1,151]},{8:323,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,324],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,96],6:[2,96],14:[2,96],17:[2,96],18:[2,96],19:[2,96],31:[2,96],32:[2,96],63:[2,96],69:[2,96],71:[2,96],72:[2,96],81:[2,96],82:[2,96],83:[2,96],85:[2,96],87:[2,96],88:[2,96],92:[2,96],96:[2,96],101:[2,96],110:[2,96],112:[2,96],113:[2,96],114:[2,96],118:[2,96],126:[2,96],134:[2,96],136:[2,96],137:[2,96],138:[2,96],139:[2,96],140:[2,96],141:[2,96],142:[2,96],143:[2,96],144:[2,96],145:[2,96],146:[2,96]},{8:325,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,87:[2,131],91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{87:[2,132],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{6:[2,65],17:[1,326],25:327,32:[1,328]},{6:[2,18],17:[2,18],32:[2,18]},{27:[1,329]},{16:330,24:282,26:283,46:[1,109]},{1:[2,49],6:[2,49],17:[2,49],18:[2,49],19:[2,49],31:[2,49],32:[2,49],63:[2,49],69:[2,49],72:[2,49],87:[2,49],101:[2,49],110:[2,49],111:123,112:[2,49],113:[2,49],114:[2,49],117:124,118:[2,49],119:74,126:[2,49],134:[2,49],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{19:[1,331],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{6:[1,309],18:[1,310],72:[1,332]},{6:[2,78],18:[2,78],19:[2,78],31:[2,78],32:[2,78],72:[2,78]},{5:333,18:[1,5]},{32:[2,69],63:[2,69]},{32:[2,72],63:[2,72],72:[2,72],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{72:[1,334]},{19:[1,335],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{5:336,18:[1,5],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{5:337,18:[1,5]},{1:[2,145],6:[2,145],17:[2,145],18:[2,145],19:[2,145],31:[2,145],32:[2,145],63:[2,145],69:[2,145],72:[2,145],87:[2,145],101:[2,145],110:[2,145],112:[2,145],113:[2,145],114:[2,145],118:[2,145],126:[2,145],134:[2,145],136:[2,145],137:[2,145],140:[2,145],141:[2,145],142:[2,145],143:[2,145],144:[2,145],145:[2,145]},{5:338,18:[1,5]},{19:[1,339],129:[1,340],130:301,131:[1,257]},{1:[2,182],6:[2,182],17:[2,182],18:[2,182],19:[2,182],31:[2,182],32:[2,182],63:[2,182],69:[2,182],72:[2,182],87:[2,182],101:[2,182],110:[2,182],112:[2,182],113:[2,182],114:[2,182],118:[2,182],126:[2,182],134:[2,182],136:[2,182],137:[2,182],140:[2,182],141:[2,182],142:[2,182],143:[2,182],144:[2,182],145:[2,182]},{5:341,18:[1,5]},{19:[2,185],129:[2,185],131:[2,185]},{5:342,18:[1,5],32:[1,343]},{18:[2,141],32:[2,141],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,109],6:[2,109],17:[2,109],18:[2,109],19:[2,109],31:[2,109],32:[2,109],63:[2,109],69:[2,109],72:[2,109],87:[2,109],101:[2,109],110:[2,109],112:[2,109],113:[2,109],114:[2,109],118:[2,109],126:[2,109],134:[2,109],136:[2,109],137:[2,109],140:[2,109],141:[2,109],142:[2,109],143:[2,109],144:[2,109],145:[2,109]},{1:[2,112],5:344,6:[2,112],17:[2,112],18:[1,5],19:[2,112],31:[2,112],32:[2,112],63:[2,112],69:[2,112],72:[2,112],87:[2,112],101:[2,112],110:[2,112],111:123,112:[1,70],113:[2,112],114:[1,71],117:124,118:[1,73],119:74,126:[2,112],134:[2,112],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{110:[1,345]},{31:[1,346],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,126],6:[2,126],14:[2,126],17:[2,126],18:[2,126],19:[2,126],31:[2,126],32:[2,126],63:[2,126],69:[2,126],71:[2,126],72:[2,126],81:[2,126],82:[2,126],83:[2,126],85:[2,126],87:[2,126],88:[2,126],96:[2,126],101:[2,126],110:[2,126],112:[2,126],113:[2,126],114:[2,126],118:[2,126],124:[2,126],125:[2,126],126:[2,126],134:[2,126],136:[2,126],137:[2,126],140:[2,126],141:[2,126],142:[2,126],143:[2,126],144:[2,126],145:[2,126]},{8:240,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,75:186,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],102:347,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:240,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,185],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,75:186,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],97:348,98:[1,63],99:[1,64],102:184,104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{6:[2,135],18:[2,135],19:[2,135],31:[2,135],32:[2,135],72:[2,135]},{6:[1,309],18:[1,310],19:[1,349]},{1:[2,152],6:[2,152],17:[2,152],18:[2,152],19:[2,152],31:[2,152],32:[2,152],63:[2,152],69:[2,152],72:[2,152],87:[2,152],101:[2,152],110:[2,152],111:123,112:[1,70],113:[2,152],114:[1,71],117:124,118:[1,73],119:74,126:[2,152],134:[2,152],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,154],6:[2,154],17:[2,154],18:[2,154],19:[2,154],31:[2,154],32:[2,154],63:[2,154],69:[2,154],72:[2,154],87:[2,154],101:[2,154],110:[2,154],111:123,112:[1,70],113:[2,154],114:[1,71],117:124,118:[1,73],119:74,126:[2,154],134:[2,154],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{124:[2,172],125:[2,172]},{8:350,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:351,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:352,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,100],6:[2,100],14:[2,100],17:[2,100],18:[2,100],19:[2,100],31:[2,100],32:[2,100],63:[2,100],69:[2,100],71:[2,100],72:[2,100],81:[2,100],82:[2,100],83:[2,100],85:[2,100],87:[2,100],88:[2,100],96:[2,100],101:[2,100],110:[2,100],112:[2,100],113:[2,100],114:[2,100],118:[2,100],124:[2,100],125:[2,100],126:[2,100],134:[2,100],136:[2,100],137:[2,100],140:[2,100],141:[2,100],142:[2,100],143:[2,100],144:[2,100],145:[2,100]},{11:206,26:207,46:[1,109],47:208,48:[1,107],49:[1,108],56:353,57:205,58:209,60:[1,49],99:[1,151]},{6:[2,101],11:206,18:[2,101],19:[2,101],26:207,32:[2,101],46:[1,109],47:208,48:[1,107],49:[1,108],56:204,57:205,58:209,60:[1,49],90:354,99:[1,151]},{6:[2,103],17:[2,103],18:[2,103],19:[2,103],32:[2,103]},{6:[2,52],17:[2,52],18:[2,52],19:[2,52],32:[2,52],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{8:355,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{87:[2,130],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,12],6:[2,12],19:[2,12],110:[2,12],112:[2,12],114:[2,12],118:[2,12],134:[2,12]},{6:[1,356]},{6:[2,66]},{26:359,28:357,29:[1,358],46:[1,109]},{6:[2,65],17:[1,360],25:327,32:[1,328]},{1:[2,50],6:[2,50],17:[2,50],18:[2,50],19:[2,50],31:[2,50],32:[2,50],63:[2,50],69:[2,50],72:[2,50],87:[2,50],101:[2,50],110:[2,50],112:[2,50],113:[2,50],114:[2,50],118:[2,50],126:[2,50],134:[2,50],136:[2,50],137:[2,50],140:[2,50],141:[2,50],142:[2,50],143:[2,50],144:[2,50],145:[2,50]},{1:[2,121],6:[2,121],17:[2,121],18:[2,121],19:[2,121],31:[2,121],32:[2,121],63:[2,121],69:[2,121],71:[2,121],72:[2,121],81:[2,121],82:[2,121],83:[2,121],85:[2,121],87:[2,121],88:[2,121],96:[2,121],101:[2,121],110:[2,121],112:[2,121],113:[2,121],114:[2,121],118:[2,121],126:[2,121],134:[2,121],136:[2,121],137:[2,121],140:[2,121],141:[2,121],142:[2,121],143:[2,121],144:[2,121],145:[2,121]},{1:[2,61],6:[2,61],17:[2,61],18:[2,61],19:[2,61],31:[2,61],32:[2,61],63:[2,61],69:[2,61],72:[2,61],87:[2,61],101:[2,61],110:[2,61],112:[2,61],113:[2,61],114:[2,61],118:[2,61],126:[2,61],134:[2,61],136:[2,61],137:[2,61],140:[2,61],141:[2,61],142:[2,61],143:[2,61],144:[2,61],145:[2,61]},{32:[2,73],63:[2,73],72:[2,73]},{1:[2,210],6:[2,210],17:[2,210],18:[2,210],19:[2,210],31:[2,210],32:[2,210],63:[2,210],69:[2,210],72:[2,210],87:[2,210],101:[2,210],110:[2,210],112:[2,210],113:[2,210],114:[2,210],118:[2,210],126:[2,210],134:[2,210],136:[2,210],137:[2,210],140:[2,210],141:[2,210],142:[2,210],143:[2,210],144:[2,210],145:[2,210]},{1:[2,189],6:[2,189],17:[2,189],18:[2,189],19:[2,189],31:[2,189],32:[2,189],63:[2,189],69:[2,189],72:[2,189],87:[2,189],101:[2,189],110:[2,189],112:[2,189],113:[2,189],114:[2,189],118:[2,189],126:[2,189],129:[2,189],134:[2,189],136:[2,189],137:[2,189],140:[2,189],141:[2,189],142:[2,189],143:[2,189],144:[2,189],145:[2,189]},{1:[2,146],6:[2,146],17:[2,146],18:[2,146],19:[2,146],31:[2,146],32:[2,146],63:[2,146],69:[2,146],72:[2,146],87:[2,146],101:[2,146],110:[2,146],112:[2,146],113:[2,146],114:[2,146],118:[2,146],126:[2,146],134:[2,146],136:[2,146],137:[2,146],140:[2,146],141:[2,146],142:[2,146],143:[2,146],144:[2,146],145:[2,146]},{1:[2,147],6:[2,147],17:[2,147],18:[2,147],19:[2,147],31:[2,147],32:[2,147],63:[2,147],69:[2,147],72:[2,147],87:[2,147],101:[2,147],106:[2,147],110:[2,147],112:[2,147],113:[2,147],114:[2,147],118:[2,147],126:[2,147],134:[2,147],136:[2,147],137:[2,147],140:[2,147],141:[2,147],142:[2,147],143:[2,147],144:[2,147],145:[2,147]},{1:[2,180],6:[2,180],17:[2,180],18:[2,180],19:[2,180],31:[2,180],32:[2,180],63:[2,180],69:[2,180],72:[2,180],87:[2,180],101:[2,180],110:[2,180],112:[2,180],113:[2,180],114:[2,180],118:[2,180],126:[2,180],134:[2,180],136:[2,180],137:[2,180],140:[2,180],141:[2,180],142:[2,180],143:[2,180],144:[2,180],145:[2,180]},{5:361,18:[1,5]},{19:[1,362]},{6:[1,363],19:[2,186],129:[2,186],131:[2,186]},{8:364,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{1:[2,113],6:[2,113],17:[2,113],18:[2,113],19:[2,113],31:[2,113],32:[2,113],63:[2,113],69:[2,113],72:[2,113],87:[2,113],101:[2,113],110:[2,113],112:[2,113],113:[2,113],114:[2,113],118:[2,113],126:[2,113],134:[2,113],136:[2,113],137:[2,113],140:[2,113],141:[2,113],142:[2,113],143:[2,113],144:[2,113],145:[2,113]},{1:[2,150],6:[2,150],17:[2,150],18:[2,150],19:[2,150],31:[2,150],32:[2,150],63:[2,150],69:[2,150],71:[2,150],72:[2,150],81:[2,150],82:[2,150],83:[2,150],85:[2,150],87:[2,150],88:[2,150],96:[2,150],101:[2,150],110:[2,150],112:[2,150],113:[2,150],114:[2,150],118:[2,150],126:[2,150],134:[2,150],136:[2,150],137:[2,150],140:[2,150],141:[2,150],142:[2,150],143:[2,150],144:[2,150],145:[2,150]},{1:[2,129],6:[2,129],17:[2,129],18:[2,129],19:[2,129],31:[2,129],32:[2,129],63:[2,129],69:[2,129],71:[2,129],72:[2,129],81:[2,129],82:[2,129],83:[2,129],85:[2,129],87:[2,129],88:[2,129],96:[2,129],101:[2,129],110:[2,129],112:[2,129],113:[2,129],114:[2,129],118:[2,129],126:[2,129],134:[2,129],136:[2,129],137:[2,129],140:[2,129],141:[2,129],142:[2,129],143:[2,129],144:[2,129],145:[2,129]},{6:[2,136],18:[2,136],19:[2,136],31:[2,136],32:[2,136],72:[2,136]},{6:[2,65],18:[2,65],19:[2,65],25:365,32:[1,266]},{6:[2,137],18:[2,137],19:[2,137],31:[2,137],32:[2,137],72:[2,137]},{1:[2,175],6:[2,175],17:[2,175],18:[2,175],19:[2,175],31:[2,175],32:[2,175],63:[2,175],69:[2,175],72:[2,175],87:[2,175],101:[2,175],110:[2,175],111:123,112:[2,175],113:[2,175],114:[2,175],117:124,118:[2,175],119:74,126:[1,366],134:[2,175],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,177],6:[2,177],17:[2,177],18:[2,177],19:[2,177],31:[2,177],32:[2,177],63:[2,177],69:[2,177],72:[2,177],87:[2,177],101:[2,177],110:[2,177],111:123,112:[2,177],113:[1,367],114:[2,177],117:124,118:[2,177],119:74,126:[2,177],134:[2,177],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,176],6:[2,176],17:[2,176],18:[2,176],19:[2,176],31:[2,176],32:[2,176],63:[2,176],69:[2,176],72:[2,176],87:[2,176],101:[2,176],110:[2,176],111:123,112:[2,176],113:[2,176],114:[2,176],117:124,118:[2,176],119:74,126:[2,176],134:[2,176],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{6:[2,104],17:[2,104],18:[2,104],19:[2,104],32:[2,104]},{6:[2,65],18:[2,65],19:[2,65],25:368,32:[1,276]},{19:[1,369],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{24:370,26:283,46:[1,109]},{6:[2,20],17:[2,20],32:[2,20]},{26:359,28:372,30:371,46:[1,109]},{6:[2,22],17:[2,22],31:[2,22],32:[2,22]},{19:[1,373]},{19:[1,374]},{1:[2,183],6:[2,183],17:[2,183],18:[2,183],19:[2,183],31:[2,183],32:[2,183],63:[2,183],69:[2,183],72:[2,183],87:[2,183],101:[2,183],110:[2,183],112:[2,183],113:[2,183],114:[2,183],118:[2,183],126:[2,183],134:[2,183],136:[2,183],137:[2,183],140:[2,183],141:[2,183],142:[2,183],143:[2,183],144:[2,183],145:[2,183]},{19:[2,187],129:[2,187],131:[2,187]},{18:[2,142],32:[2,142],111:123,112:[1,70],114:[1,71],117:124,118:[1,73],119:74,134:[1,122],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{6:[1,309],18:[1,310],19:[1,375]},{8:376,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{8:377,9:155,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],70:47,73:54,74:55,76:38,78:27,79:28,80:29,91:[1,45],95:[1,30],98:[1,63],99:[1,64],104:[1,40],108:[1,46],109:[1,61],111:41,112:[1,70],114:[1,71],115:42,116:[1,72],117:43,118:[1,73],119:74,127:[1,44],132:39,133:[1,69],135:[1,33],136:[1,34],137:[1,35],138:[1,36],139:[1,37],147:[1,75],148:[1,76],149:[1,77],150:[1,78],151:[1,79],152:[1,80],153:[1,81],154:[1,82],155:[1,83],156:[1,84],157:[1,85],158:[1,86],159:[1,87],160:[1,88],161:[1,89],162:[1,90],163:[1,91],164:[1,92],165:[1,93],166:[1,94],167:[1,95],168:[1,96],169:[1,97],170:[1,98],171:[1,99],172:[1,100],173:[1,101],174:[1,102],175:[1,103],176:[1,104],177:[1,105]},{6:[1,320],18:[1,321],19:[1,378]},{6:[2,53],17:[2,53],18:[2,53],19:[2,53],32:[2,53]},{6:[2,19],17:[2,19],32:[2,19]},{31:[1,379],32:[1,380]},{31:[2,23],32:[2,23]},{1:[2,13],6:[2,13],19:[2,13],110:[2,13],112:[2,13],114:[2,13],118:[2,13],134:[2,13]},{1:[2,181],6:[2,181],17:[2,181],18:[2,181],19:[2,181],31:[2,181],32:[2,181],63:[2,181],69:[2,181],72:[2,181],87:[2,181],101:[2,181],110:[2,181],112:[2,181],113:[2,181],114:[2,181],118:[2,181],126:[2,181],134:[2,181],136:[2,181],137:[2,181],140:[2,181],141:[2,181],142:[2,181],143:[2,181],144:[2,181],145:[2,181]},{6:[2,138],18:[2,138],19:[2,138],31:[2,138],32:[2,138],72:[2,138]},{1:[2,178],6:[2,178],17:[2,178],18:[2,178],19:[2,178],31:[2,178],32:[2,178],63:[2,178],69:[2,178],72:[2,178],87:[2,178],101:[2,178],110:[2,178],111:123,112:[2,178],113:[2,178],114:[2,178],117:124,118:[2,178],119:74,126:[2,178],134:[2,178],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{1:[2,179],6:[2,179],17:[2,179],18:[2,179],19:[2,179],31:[2,179],32:[2,179],63:[2,179],69:[2,179],72:[2,179],87:[2,179],101:[2,179],110:[2,179],111:123,112:[2,179],113:[2,179],114:[2,179],117:124,118:[2,179],119:74,126:[2,179],134:[2,179],136:[1,116],137:[1,115],140:[1,114],141:[1,117],142:[1,118],143:[1,119],144:[1,120],145:[1,121]},{6:[2,105],17:[2,105],18:[2,105],19:[2,105],32:[2,105]},{6:[2,21],17:[2,21],32:[2,21]},{26:359,28:381,46:[1,109]},{31:[2,24],32:[2,24]}],
defaultActions: {50:[2,14],51:[2,15],52:[2,16],53:[2,17],65:[2,63],66:[2,64],75:[2,212],76:[2,213],77:[2,214],78:[2,215],79:[2,216],80:[2,217],81:[2,218],82:[2,219],83:[2,220],84:[2,221],85:[2,222],86:[2,223],87:[2,224],88:[2,225],89:[2,226],90:[2,227],91:[2,228],92:[2,229],93:[2,230],94:[2,231],95:[2,232],96:[2,233],97:[2,234],98:[2,235],99:[2,236],100:[2,237],101:[2,238],102:[2,239],103:[2,240],104:[2,241],105:[2,242],111:[2,3],130:[2,119],227:[2,99],328:[2,66]},
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

    Scope.prototype.lock = function() {
      return this.delegate(function() {
        return this.locked = true;
      });
    };

    Scope.prototype.unlock = function() {
      return this.delegate(function() {
        return this.locked = false;
      });
    };

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
      if (this.locked) return def;
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
        if (this.locked) {
          return new Definition({
            name: name
          });
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
