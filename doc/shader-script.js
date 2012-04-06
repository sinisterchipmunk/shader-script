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
    exports.Extension = Extension = require('shader-script/extension').Extension;
    e = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(Extension, args, function() {});
    };
    e('radians', null, function(x) {
      return this.component_wise(x, function(y) {
        return y * Math.PI / 180;
      });
    });
    e('degrees', null, function(x) {
      return this.component_wise(x, function(y) {
        return y / Math.PI * 180;
      });
    });
    e('sin', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.sin(y);
      });
    });
    e('cos', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.cos(y);
      });
    });
    e('tan', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.tan(y);
      });
    });
    e('asin', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.asin(y);
      });
    });
    e('acos', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.acos(y);
      });
    });
    e('atan', null, function(y, x) {
      return this.component_wise(y, x, function(_y, _x) {
        if (_x === void 0) {
          return Math.atan(_y);
        } else {
          return Math.atan2(_y, _x);
        }
      });
    });
    e('pow', null, function(x, y) {
      return this.component_wise(x, y, function(_x, _y) {
        return Math.pow(_x, _y);
      });
    });
    e('exp', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.exp(y);
      });
    });
    e('log', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.log(y);
      });
    });
    e('exp2', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.pow(2, y);
      });
    });
    e('log2', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.log(y) / Math.log(2);
      });
    });
    e('sqrt', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.sqrt(y);
      });
    });
    e('inversesqrt', null, function(x) {
      return this.component_wise(x, function(y) {
        return 1 / Math.sqrt(y);
      });
    });
    e('abs', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.abs(y);
      });
    });
    e('sign', null, function(x) {
      return this.component_wise(x, function(y) {
        if (y > 0) {
          return 1;
        } else {
          if (y < 0) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    });
    e('floor', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.floor(y);
      });
    });
    e('ceil', null, function(x) {
      return this.component_wise(x, function(y) {
        return Math.ceil(y);
      });
    });
    e('fract', null, function(x) {
      return this.component_wise(x, function(y) {
        return y - Math.floor(y);
      });
    });
    e('mod', null, function(x, y) {
      return this.component_wise(x, y, function(_x, _y) {
        return _x - _y * Math.floor(_x / _y);
      });
    });
    e('min', null, function(x, y) {
      return this.component_wise(x, y, function(_x, _y) {
        return Math.min(_x, _y);
      });
    });
    e('max', null, function(x, y) {
      return this.component_wise(x, y, function(_x, _y) {
        return Math.max(_x, _y);
      });
    });
    e('clamp', null, function(x, min, max) {
      return this.component_wise(x, min, max, function(_x, _min, _max) {
        return Math.min(Math.max(_x, _min), _max);
      });
    });
    e('mix', null, function(min, max, a) {
      return this.component_wise(min, max, a, function(_min, _max, _a) {
        return _min * (1 - _a) + _max * _a;
      });
    });
    e('step', null, function(edge, x) {
      return this.component_wise(edge, x, function(_edge, _x) {
        if (_x < _edge) {
          return 0;
        } else {
          return 1;
        }
      });
    });
    e('smoothstep', null, function(edge0, edge1, x) {
      return this.component_wise(edge0, edge1, x, function(_edge0, _edge1, _x) {
        var t;
        t = Extension.invoke('clamp', (_x - _edge0) / (_edge1 - _edge0), 0, 1);
        return t * t * (3 - 2 * t);
      });
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
      return this.component_wise(x, y, function(_x, _y) {
        return _x * _y;
      });
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

    Definition.operators = require('shader-script/operators');

    Definition.prototype.perform = function(op, re) {
      var handler, type;
      type = this.type();
      if ((handler = Definition.operators[type]) && handler[op]) {
        return handler[op](this, re);
      } else {
        throw new Error("Operator not found for type " + type + ", op '" + op + "'");
      }
    };

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
        value: this.value,
        param_qualifier: this.param_qualifier
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
      if (options.param_qualifier) this.param_qualifier = options.param_qualifier;
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

    Definition.prototype.toSource = function() {
      if (this.param_qualifier) {
        return "" + this.param_qualifier + " " + (this.type()) + " " + this.name;
      } else {
        return "" + (this.type()) + " " + this.name;
      }
    };

    return Definition;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/extension"] = function() {
      var exports = {};
      (function() {
  var Extension, Program,
    __slice = Array.prototype.slice;

  Program = require('shader-script/glsl/program').Program;

  exports.Extension = Extension = (function() {

    Extension.prototype.return_type = function() {
      return this.type;
    };

    function Extension(name, type, callback, register) {
      this.name = name;
      this.type = type;
      this.callback = callback;
      if (register == null) register = true;
      if (register) Program.prototype.builtins[this.name] = this;
    }

    Extension.prototype.invoke = function() {
      var param, params;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      params = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = params.length; _i < _len; _i++) {
          param = params[_i];
          _results.push(param.execute().value);
        }
        return _results;
      })();
      return this.callback.apply(this, params);
    };

    Extension.prototype.component_wise = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = require('shader-script/operators')).component_wise.apply(_ref, args);
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
    Expression: [o('Assign'), o('Call'), o('Literal'), o('TypeConstructor'), o('FunctionCall'), o('Operation'), o('Parenthetical'), o('Assignable')],
    Statement: [
      o('Return TERMINATOR'), o('FunctionDefinition'), o('Comment'), o('If'), o('FunctionDeclaration TERMINATOR'), o('VariableDeclaration TERMINATOR'), o('StorageDeclaration TERMINATOR'), o('STATEMENT TERMINATOR', function() {
        return new Literal($1);
      }), o('TERMINATOR', function() {
        return {
          compile: function() {
            return null;
          }
        };
      })
    ],
    If: [
      o('IF Parenthetical { Body }', function() {
        return new If($2, $4, $1);
      }), o('If ELSE { Body }', function() {
        return $1.addElse($4);
      })
    ],
    StorageDeclaration: [
      o('StorageQualifier Type IdentifierList', function() {
        return new StorageQualifier($1, $2, $3);
      })
    ],
    IdentifierList: [
      o('Identifier', function() {
        return [$1];
      }), o('IdentifierList , Identifier', function() {
        return $1.concat([$3]);
      })
    ],
    StorageQualifier: [o('UNIFORM'), o('VARYING'), o('ATTRIBUTE'), o('CONST')],
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
      }), o('ParamQualifier Type Identifier', function() {
        return [new Variable($2, $3, $1)];
      }), o('ArgumentDefs , ParamQualifier Type Identifier', function() {
        return $1.concat([new Variable($4, $5, $3)]);
      })
    ],
    ParamQualifier: [o('IN'), o('OUT'), o('INOUT')],
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
      o('Assignable = Expression', function() {
        return new Assign($1, $3, '=');
      })
    ],
    Accessor: [
      o('Expression . Identifier', function() {
        return new Access($3, $1);
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
    Parenthetical: [
      o('( Expression )', function() {
        return new Parens($2);
      }), o('( INDENT Expression OUTDENT )', function() {
        return new Parens($3);
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
      }), o('Assignable --', function() {
        return new Op('--', $1, null, true);
      }), o('Assignable ++', function() {
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
      }), o('Assignable COMPOUND_ASSIGN\
       Expression', function() {
        return new Assign($1, $3, $2);
      }), o('Assignable COMPOUND_ASSIGN\
       INDENT Expression OUTDENT', function() {
        return new Assign($1, $4, $2);
      }), o('Assignable EXTENDS Expression', function() {
        return new Extends($1, $3);
      })
    ],
    Assignable: [o('Identifier'), o('Accessor')]
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

  RELATION = ['INSTANCEOF'];

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
    StorageQualifier: 'storage_qualifier',
    Parens: 'parens',
    Access: 'access',
    If: 'if'
  };

  for (node_name in nodes) {
    node_file = nodes[node_name];
    exports[node_name] = require("shader-script/glsl/nodes/" + node_file)[node_name];
  }

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/access"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Access = (function(_super) {

    __extends(Access, _super);

    function Access() {
      Access.__super__.constructor.apply(this, arguments);
    }

    Access.prototype.name = "_access";

    Access.prototype.children = function() {
      return ['accessor', 'source'];
    };

    Access.prototype.accessor_name = function() {
      return this.accessor.toVariableName();
    };

    Access.prototype.toVariableName = function() {
      return this.source.toVariableName();
    };

    Access.prototype.is_access = function() {
      return true;
    };

    Access.prototype.cast = function(type, program) {};

    Access.prototype.type = function(program) {
      var base_type;
      base_type = this.base_type(program);
      return base_type && ("" + base_type + (this.vector_length()));
    };

    Access.prototype.base_type = function(program) {
      var base_type, name;
      base_type = this.source.type(program);
      name = this.accessor_name();
      if (!base_type) return null;
      switch (base_type) {
        case 'int':
        case 'ivec2':
        case 'ivec3':
        case 'ivec4':
          return "ivec";
        case 'float':
        case 'vec2':
        case 'vec3':
        case 'vec4':
          return "vec";
        case 'bool':
        case 'bvec2':
        case 'bvec3':
        case 'bvec4':
          return "bvec";
        default:
          throw new Error("Cannot use component accessors for type " + base_type);
      }
    };

    Access.prototype.vector_length = function() {
      return this.accessor_name().length;
    };

    Access.prototype.compile = function(program) {
      var accessor, source, variable;
      accessor = this.accessor_name();
      source = this.source.compile(program);
      variable = this.definition({
        type: this.type(program)
      });
      return {
        iterate_components: function(max_length, assignment, callback) {
          var already_iterated, i, index, _i, _len, _results;
          already_iterated = [];
          _results = [];
          for (_i = 0, _len = accessor.length; _i < _len; _i++) {
            i = accessor[_i];
            index = (function() {
              switch (i) {
                case 'x':
                case 'r':
                case 's':
                  return 0;
                case 'y':
                case 'g':
                case 't':
                  return 1;
                case 'z':
                case 'b':
                case 'p':
                  return 2;
                case 'w':
                case 'a':
                case 'q':
                  return 3;
                default:
                  throw new Error("Unrecognized vector component: " + i);
              }
            })();
            if (assignment && already_iterated.indexOf(index) !== -1) {
              throw new Error("Can't specify the same component twice in the same assignment");
            }
            already_iterated.push(index);
            if (index <= max_length) {
              _results.push(callback(index));
            } else {
              throw new Error("Component " + i + " equates to vector index " + index + ", which exceeds vector length " + max_length);
            }
          }
          return _results;
        },
        filter_assignment: function(value) {
          var result, source_value;
          source_value = source.execute().value;
          result = source_value.slice(0);
          this.iterate_components(source_value.length, true, function(index) {
            return result[index] = value[index];
          });
          return result;
        },
        toSource: function() {
          return "" + (source.toSource()) + "." + accessor;
        },
        assign: function(value) {
          return source.execute().value = value;
        },
        execute: function() {
          var source_value;
          source_value = source.execute().value;
          variable.value = [];
          this.iterate_components(source_value.length, false, function(index) {
            return variable.value.push(source_value[index]);
          });
          return variable;
        }
      };
    };

    return Access;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/assign"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    Assign.prototype.name = "_assign";

    function Assign() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Assign.__super__.constructor.apply(this, args);
      if (!this.token) throw new Error("Expected a token");
    }

    Assign.prototype.children = function() {
      return ['left', 'right', 'token'];
    };

    Assign.prototype.compile = function(program) {
      var left, match, right, token;
      token = this.token;
      if (match = /^(.)=$/.exec(token)) {
        right = this.glsl('Op', match[1], this.left, this.right).compile(program);
      } else {
        right = this.right.compile(program);
      }
      left = this.left.compile(program);
      return {
        execute: function() {
          var lvalue, rvalue;
          lvalue = left.execute();
          rvalue = right.execute().value;
          if (left.filter_assignment) rvalue = left.filter_assignment(rvalue);
          if (left.assign) {
            left.assign(rvalue);
          } else {
            lvalue.value = rvalue;
          }
          return lvalue;
        },
        toSource: function() {
          return "" + (left.toSource()) + " = " + (right.toSource());
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
      if (this.options.indent === void 0) this.options.indent = this.options.scope;
    }

    Block.prototype.cast = function(type, program) {
      return this.lines[this.lines.length - 1].cast(type, program);
    };

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
          if (!child) continue;
          _result = child.compile(program);
          if (_result !== null) lines.push(_result);
        }
      }
      if (this.options.scope) program.state.scope.pop();
      return {
        lines: lines,
        is_block: true,
        execute: function() {
          var line, result;
          result = (function() {
            var _j, _len2, _results;
            _results = [];
            for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
              line = lines[_j];
              _results.push(line.execute());
            }
            return _results;
          })();
          return result[result.length - 1];
        },
        toSource: function() {
          var indent, line, result, src, trimmed;
          indent = _this.options.indent ? "  " : "";
          result = (function() {
            var _j, _len2, _results;
            _results = [];
            for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
              line = lines[_j];
              src = line.toSource();
              trimmed = src.trim();
              if (trimmed === "" || trimmed[trimmed.length - 1] === ';' || line.no_terminator) {
                _results.push(src);
              } else {
                _results.push(src + ";");
              }
            }
            return _results;
          })();
          result = result.join("\n").trim();
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
      var compiled_params, name, param,
        _this = this;
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
            return _this.definition({
              value: (_ref2 = program.builtins[name]).invoke.apply(_ref2, compiled_params)
            });
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
        no_terminator: true,
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
      if (this.return_type && this.return_type.type) {
        return this.return_type.type();
      } else {
        return this.return_type;
      }
    };

    Function.prototype.cast = function(type) {
      if (this.return_type && this.return_type.type) {
        return this.return_type.set_type(type);
      }
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
                  args[i].value = params[i].execute().value;
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
          return ("" + (_this.type() || 'void') + " " + fn_name + "(" + arg_list + ") {\n") + compiled_block.toSource() + "}";
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

    Identifier.prototype.cast = function(type, program) {};

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
          return variable;
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
    _require["shader-script/glsl/nodes/if"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.If = (function(_super) {

    __extends(If, _super);

    function If() {
      If.__super__.constructor.apply(this, arguments);
    }

    If.prototype.name = "if";

    If.prototype.children = function() {
      return ['expression', 'block', 'options'];
    };

    If.prototype.addElse = function(else_block) {
      this.else_block = else_block;
      return this;
    };

    If.prototype.compile = function(program) {
      var else_block, expression, if_block;
      expression = this.expression.compile(program);
      if_block = this.block.compile(program);
      else_block = this.else_block && this.else_block.compile(program);
      return {
        toSource: function() {
          var condition_source, else_block_source, if_block_source;
          if_block_source = if_block.toSource();
          condition_source = "if (" + (expression.toSource()) + ") {\n" + if_block_source + "}";
          if (else_block) {
            else_block_source = else_block.toSource();
            condition_source += " else {\n" + else_block_source + "}";
          }
          return condition_source;
        },
        compile: function() {
          return null;
        },
        execute: function() {
          if (expression.execute().value) {
            return if_block.execute();
          } else {
            if (else_block) return else_block.execute();
          }
        }
      };
    };

    return If;

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
      var type, value,
        _this = this;
      value = this.children[0];
      type = this.type(program);
      if (this.type() === 'float' && value.indexOf('.') === -1) value += ".0";
      return {
        execute: function() {
          return _this.definition({
            type: type,
            value: eval(value)
          });
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
      var left, op, right,
        _this = this;
      left = this.left.compile(program);
      op = this.op;
      right = this.right && this.right.compile(program);
      return {
        execute: function() {
          var le, re;
          if (right) re = right.execute();
          le = left.execute();
          return _this.definition({
            dependent: le,
            value: le.perform(op, re)
          });
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
    _require["shader-script/glsl/nodes/parens"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Parens = (function(_super) {

    __extends(Parens, _super);

    function Parens() {
      Parens.__super__.constructor.apply(this, arguments);
    }

    Parens.prototype.name = "_parens";

    Parens.prototype.children = function() {
      return ['body'];
    };

    Parens.prototype.type = function(program) {
      return this.body.type(program);
    };

    Parens.prototype.cast = function(type, program) {
      return this.body.cast(type);
    };

    Parens.prototype.compile = function(program) {
      var compiled_body;
      compiled_body = this.body.compile(program);
      return {
        toSource: function() {
          return "(" + (compiled_body.toSource()) + ")";
        },
        execute: function() {
          return compiled_body.execute();
        }
      };
    };

    return Parens;

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
      var block_node, program, _ref;
      if (state == null) state = {};
      if (state instanceof Program) {
        _ref = [state, state.state], program = _ref[0], state = _ref[1];
      } else {
        program = new Program(state);
      }
      this.block.options.indent = false;
      block_node = this.block.compile(program);
      program.root_node = block_node;
      block_node.execute();
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
      var default_value, i, name, names, variable,
        _this = this;
      names = (function() {
        var _i, _len, _ref, _results;
        _ref = this.names;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          if (typeof name !== 'string') name = name.toVariableName();
          default_value = (function() {
            var _results2, _results3, _results4, _results5, _results6, _results7;
            switch (this.type) {
              case 'ivec2':
              case 'bvec2':
              case 'vec2':
                return [Number.NaN, Number.NaN];
              case 'ivec3':
              case 'bvec3':
              case 'vec3':
                return [Number.NaN, Number.NaN, Number.NaN];
              case 'ivec4':
              case 'bvec4':
              case 'vec4':
                return [Number.NaN, Number.NaN, Number.NaN, Number.NaN];
              case 'mat2':
              case 'mat2x2':
                _results2 = [];
                for (i = 0; i < 4; i++) {
                  _results2.push(Number.NaN);
                }
                return _results2;
              case 'mat3':
              case 'mat3x3':
                _results3 = [];
                for (i = 0; i < 9; i++) {
                  _results3.push(Number.NaN);
                }
                return _results3;
              case 'mat4':
              case 'mat4x4':
                _results4 = [];
                for (i = 0; i < 16; i++) {
                  _results4.push(Number.NaN);
                }
                return _results4;
              case 'mat2x3':
              case 'mat3x2':
                _results5 = [];
                for (i = 0; i < 6; i++) {
                  _results5.push(Number.NaN);
                }
                return _results5;
              case 'mat2x4':
              case 'mat4x2':
                _results6 = [];
                for (i = 0; i < 8; i++) {
                  _results6.push(Number.NaN);
                }
                return _results6;
              case 'mat3x4':
              case 'mat4x3':
                _results7 = [];
                for (i = 0; i < 12; i++) {
                  _results7.push(Number.NaN);
                }
                return _results7;
              default:
                return;
            }
          }).call(this);
          variable = program.state.scope.define(name, {
            type: this.type,
            builtin: true,
            value: default_value
          });
          program.state.variables[name] = variable;
          _results.push(name);
        }
        return _results;
      }).call(this);
      return {
        toSource: function() {
          return "" + _this.qualifier + " " + _this.type + " " + (names.join(', '));
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

    TypeConstructor.prototype.variable = function() {};

    TypeConstructor.prototype.cast = function(type, shader) {
      if (!type) return;
      return this.cast_type = type;
    };

    TypeConstructor.prototype.type = function(shader) {
      if (typeof this.cast_type === 'string') {
        return this.cast_type;
      } else {
        return this.cast_type.type(shader);
      }
    };

    TypeConstructor.prototype.compile = function(program) {
      var arg, compiled_args, type,
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
      type = this.type();
      return {
        execute: function(state) {
          var arg, args, vector_length;
          args = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
              arg = compiled_args[_i];
              _results.push(arg.execute().value);
            }
            return _results;
          })();
          switch (type) {
            case 'vec2':
            case 'ivec2':
            case 'bvec2':
              vector_length = 2;
              break;
            case 'vec3':
            case 'ivec3':
            case 'bvec3':
              vector_length = 3;
              break;
            case 'vec4':
            case 'ivec4':
            case 'bvec4':
              vector_length = 4;
              break;
            default:
              return args;
          }
          if (args.length >= vector_length) {
            args = args.slice(0, vector_length);
          } else {
            while (args.length < vector_length) {
              args.push(0);
            }
          }
          return _this.definition({
            type: type,
            value: args
          });
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

    Value.prototype.is_access = function() {
      return this.children[0].is_access();
    };

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

    function Variable(type, name, param_qualifier) {
      this.param_qualifier = param_qualifier != null ? param_qualifier : null;
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
      variable = program.state.scope.define(name, this.variable ? this.variable.as_options() : {
        type: this.type
      });
      variable.param_qualifier || (variable.param_qualifier = this.param_qualifier);
      if (this.variable) variable.add_dependent(this.variable);
      if (variable.value === void 0) variable.value = Number.NaN;
      qualifier = program.state.scope.qualifier();
      if (qualifier === 'root.block' || qualifier === 'root.block.main.block') {
        program.state.variables[name] = variable;
      }
      return {
        execute: function() {
          return variable;
        },
        toSource: function() {
          return variable.toSource();
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
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"{":10,"}":11,"Assign":12,"Call":13,"Literal":14,"TypeConstructor":15,"FunctionCall":16,"Operation":17,"Parenthetical":18,"Assignable":19,"Return":20,"FunctionDefinition":21,"Comment":22,"If":23,"FunctionDeclaration":24,"VariableDeclaration":25,"StorageDeclaration":26,"STATEMENT":27,"IF":28,"ELSE":29,"StorageQualifier":30,"Type":31,"IdentifierList":32,"Identifier":33,",":34,"UNIFORM":35,"VARYING":36,"ATTRIBUTE":37,"CONST":38,"HERECOMMENT":39,"CALL_START":40,"ArgumentDefs":41,")":42,"ParamQualifier":43,"IN":44,"OUT":45,"INOUT":46,"ArgumentList":47,"(":48,"Arguments":49,"=":50,"Accessor":51,".":52,"IDENTIFIER":53,"NUMBER":54,"RETURN":55,"INDENT":56,"OUTDENT":57,"VOID":58,"BOOL":59,"INT":60,"FLOAT":61,"VEC2":62,"VEC3":63,"VEC4":64,"BVEC2":65,"BVEC3":66,"BVEC4":67,"IVEC2":68,"IVEC3":69,"IVEC4":70,"MAT2":71,"MAT3":72,"MAT4":73,"MAT2X2":74,"MAT2X3":75,"MAT2X4":76,"MAT3X2":77,"MAT3X3":78,"MAT3X4":79,"MAT4X2":80,"MAT4X3":81,"MAT4X4":82,"SAMPLER1D":83,"SAMPLER2D":84,"SAMPLER3D":85,"SAMPLERCUBE":86,"SAMPLER1DSHADOW":87,"SAMPLER2DSHADOW":88,"UNARY":89,"-":90,"+":91,"--":92,"++":93,"?":94,"MATH":95,"SHIFT":96,"COMPARE":97,"LOGIC":98,"RELATION":99,"COMPOUND_ASSIGN":100,"EXTENDS":101,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",10:"{",11:"}",13:"Call",24:"FunctionDeclaration",27:"STATEMENT",28:"IF",29:"ELSE",34:",",35:"UNIFORM",36:"VARYING",37:"ATTRIBUTE",38:"CONST",39:"HERECOMMENT",40:"CALL_START",42:")",44:"IN",45:"OUT",46:"INOUT",48:"(",50:"=",52:".",53:"IDENTIFIER",54:"NUMBER",55:"RETURN",56:"INDENT",57:"OUTDENT",58:"VOID",59:"BOOL",60:"INT",61:"FLOAT",62:"VEC2",63:"VEC3",64:"VEC4",65:"BVEC2",66:"BVEC3",67:"BVEC4",68:"IVEC2",69:"IVEC3",70:"IVEC4",71:"MAT2",72:"MAT3",73:"MAT4",74:"MAT2X2",75:"MAT2X3",76:"MAT2X4",77:"MAT3X2",78:"MAT3X3",79:"MAT3X4",80:"MAT4X2",81:"MAT4X3",82:"MAT4X4",83:"SAMPLER1D",84:"SAMPLER2D",85:"SAMPLER3D",86:"SAMPLERCUBE",87:"SAMPLER1DSHADOW",88:"SAMPLER2DSHADOW",89:"UNARY",90:"-",91:"+",92:"--",93:"++",94:"?",95:"MATH",96:"SHIFT",97:"COMPARE",98:"LOGIC",99:"RELATION",100:"COMPOUND_ASSIGN",101:"EXTENDS"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,2],[7,2],[7,1],[5,2],[5,3],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[9,2],[9,1],[9,1],[9,1],[9,2],[9,2],[9,2],[9,2],[9,1],[23,5],[23,5],[26,3],[32,1],[32,3],[30,1],[30,1],[30,1],[30,1],[22,1],[25,2],[21,6],[21,5],[41,2],[41,4],[41,3],[41,5],[43,1],[43,1],[43,1],[47,3],[47,3],[47,2],[47,2],[49,1],[49,3],[16,2],[12,3],[51,3],[33,1],[14,1],[15,2],[20,1],[20,2],[18,3],[18,5],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[17,2],[17,2],[17,2],[17,2],[17,2],[17,2],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,5],[17,3],[19,1],[19,1]],
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
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0-1];
break;
case 19:this.$ = $$[$0];
break;
case 20:this.$ = $$[$0];
break;
case 21:this.$ = $$[$0];
break;
case 22:this.$ = $$[$0-1];
break;
case 23:this.$ = $$[$0-1];
break;
case 24:this.$ = $$[$0-1];
break;
case 25:this.$ = new yy.Literal($$[$0-1]);
break;
case 26:this.$ = {
          compile: function() {
            return null;
          }
        };
break;
case 27:this.$ = new yy.If($$[$0-3], $$[$0-1], $$[$0-4]);
break;
case 28:this.$ = $$[$0-4].addElse($$[$0-1]);
break;
case 29:this.$ = new yy.StorageQualifier($$[$0-2], $$[$0-1], $$[$0]);
break;
case 30:this.$ = [$$[$0]];
break;
case 31:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 32:this.$ = $$[$0];
break;
case 33:this.$ = $$[$0];
break;
case 34:this.$ = $$[$0];
break;
case 35:this.$ = $$[$0];
break;
case 36:this.$ = new yy.Comment($$[$0]);
break;
case 37:this.$ = new yy.Variable($$[$0-1], $$[$0]);
break;
case 38:this.$ = new yy.Function($$[$0-5], $$[$0-4], $$[$0-2], $$[$0]);
break;
case 39:this.$ = new yy.Function($$[$0-4], $$[$0-3], [], $$[$0]);
break;
case 40:this.$ = [new yy.Variable($$[$0-1], $$[$0])];
break;
case 41:this.$ = $$[$0-3].concat([new yy.Variable($$[$0-1], $$[$0])]);
break;
case 42:this.$ = [new yy.Variable($$[$0-1], $$[$0], $$[$0-2])];
break;
case 43:this.$ = $$[$0-4].concat([new yy.Variable($$[$0-1], $$[$0], $$[$0-2])]);
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = $$[$0];
break;
case 46:this.$ = $$[$0];
break;
case 47:this.$ = $$[$0-1];
break;
case 48:this.$ = $$[$0-1];
break;
case 49:this.$ = [];
break;
case 50:this.$ = [];
break;
case 51:this.$ = [$$[$0]];
break;
case 52:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 53:this.$ = new yy.Call($$[$0-1], $$[$0]);
break;
case 54:this.$ = new yy.Assign($$[$0-2], $$[$0], '=');
break;
case 55:this.$ = new yy.Access($$[$0], $$[$0-2]);
break;
case 56:this.$ = new yy.Identifier($$[$0]);
break;
case 57:this.$ = new yy.Literal($$[$0]);
break;
case 58:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
case 59:this.$ = new yy.Return;
break;
case 60:this.$ = new yy.Return($$[$0]);
break;
case 61:this.$ = new yy.Parens($$[$0-1]);
break;
case 62:this.$ = new yy.Parens($$[$0-2]);
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
case 74:this.$ = $$[$0];
break;
case 75:this.$ = $$[$0];
break;
case 76:this.$ = $$[$0];
break;
case 77:this.$ = $$[$0];
break;
case 78:this.$ = $$[$0];
break;
case 79:this.$ = $$[$0];
break;
case 80:this.$ = $$[$0];
break;
case 81:this.$ = $$[$0];
break;
case 82:this.$ = $$[$0];
break;
case 83:this.$ = $$[$0];
break;
case 84:this.$ = $$[$0];
break;
case 85:this.$ = $$[$0];
break;
case 86:this.$ = $$[$0];
break;
case 87:this.$ = $$[$0];
break;
case 88:this.$ = $$[$0];
break;
case 89:this.$ = $$[$0];
break;
case 90:this.$ = $$[$0];
break;
case 91:this.$ = $$[$0];
break;
case 92:this.$ = $$[$0];
break;
case 93:this.$ = $$[$0];
break;
case 94:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 95:this.$ = new yy.Op('-', $$[$0]);
break;
case 96:this.$ = new yy.Op('+', $$[$0]);
break;
case 97:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 98:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 99:this.$ = new yy.Existence($$[$0-1]);
break;
case 100:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 101:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 102:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 103:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 104:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 105:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 106:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 107:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 108:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 109:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
case 110:this.$ = $$[$0];
break;
case 111:this.$ = $$[$0];
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,6:[1,24],7:4,8:6,9:7,10:[1,5],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{1:[3]},{1:[2,2],6:[1,24],7:73,8:6,9:7,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[1,74]},{1:[2,4],6:[2,4],11:[2,4],13:[2,4],24:[2,4],27:[2,4],28:[2,4],35:[2,4],36:[2,4],37:[2,4],38:[2,4],39:[2,4],48:[2,4],53:[2,4],54:[2,4],55:[2,4],58:[2,4],59:[2,4],60:[2,4],61:[2,4],62:[2,4],63:[2,4],64:[2,4],65:[2,4],66:[2,4],67:[2,4],68:[2,4],69:[2,4],70:[2,4],71:[2,4],72:[2,4],73:[2,4],74:[2,4],75:[2,4],76:[2,4],77:[2,4],78:[2,4],79:[2,4],80:[2,4],81:[2,4],82:[2,4],83:[2,4],84:[2,4],85:[2,4],86:[2,4],87:[2,4],88:[2,4],89:[2,4],90:[2,4],91:[2,4]},{4:76,6:[1,24],7:4,8:6,9:7,11:[1,75],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[1,77],52:[1,86],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{1:[2,7],6:[2,7],11:[2,7],13:[2,7],24:[2,7],27:[2,7],28:[2,7],35:[2,7],36:[2,7],37:[2,7],38:[2,7],39:[2,7],48:[2,7],53:[2,7],54:[2,7],55:[2,7],58:[2,7],59:[2,7],60:[2,7],61:[2,7],62:[2,7],63:[2,7],64:[2,7],65:[2,7],66:[2,7],67:[2,7],68:[2,7],69:[2,7],70:[2,7],71:[2,7],72:[2,7],73:[2,7],74:[2,7],75:[2,7],76:[2,7],77:[2,7],78:[2,7],79:[2,7],80:[2,7],81:[2,7],82:[2,7],83:[2,7],84:[2,7],85:[2,7],86:[2,7],87:[2,7],88:[2,7],89:[2,7],90:[2,7],91:[2,7]},{6:[2,10],34:[2,10],42:[2,10],52:[2,10],57:[2,10],90:[2,10],91:[2,10],94:[2,10],95:[2,10],96:[2,10],97:[2,10],98:[2,10],99:[2,10]},{6:[2,11],34:[2,11],42:[2,11],52:[2,11],57:[2,11],90:[2,11],91:[2,11],94:[2,11],95:[2,11],96:[2,11],97:[2,11],98:[2,11],99:[2,11]},{6:[2,12],34:[2,12],42:[2,12],52:[2,12],57:[2,12],90:[2,12],91:[2,12],94:[2,12],95:[2,12],96:[2,12],97:[2,12],98:[2,12],99:[2,12]},{6:[2,13],34:[2,13],42:[2,13],52:[2,13],57:[2,13],90:[2,13],91:[2,13],94:[2,13],95:[2,13],96:[2,13],97:[2,13],98:[2,13],99:[2,13]},{6:[2,14],34:[2,14],42:[2,14],52:[2,14],57:[2,14],90:[2,14],91:[2,14],94:[2,14],95:[2,14],96:[2,14],97:[2,14],98:[2,14],99:[2,14]},{6:[2,15],34:[2,15],42:[2,15],52:[2,15],57:[2,15],90:[2,15],91:[2,15],94:[2,15],95:[2,15],96:[2,15],97:[2,15],98:[2,15],99:[2,15]},{6:[2,16],34:[2,16],42:[2,16],52:[2,16],57:[2,16],90:[2,16],91:[2,16],94:[2,16],95:[2,16],96:[2,16],97:[2,16],98:[2,16],99:[2,16]},{6:[2,17],34:[2,17],42:[2,17],50:[1,87],52:[2,17],57:[2,17],90:[2,17],91:[2,17],92:[1,88],93:[1,89],94:[2,17],95:[2,17],96:[2,17],97:[2,17],98:[2,17],99:[2,17],100:[1,90],101:[1,91]},{6:[1,92]},{1:[2,19],6:[2,19],11:[2,19],13:[2,19],24:[2,19],27:[2,19],28:[2,19],35:[2,19],36:[2,19],37:[2,19],38:[2,19],39:[2,19],48:[2,19],53:[2,19],54:[2,19],55:[2,19],58:[2,19],59:[2,19],60:[2,19],61:[2,19],62:[2,19],63:[2,19],64:[2,19],65:[2,19],66:[2,19],67:[2,19],68:[2,19],69:[2,19],70:[2,19],71:[2,19],72:[2,19],73:[2,19],74:[2,19],75:[2,19],76:[2,19],77:[2,19],78:[2,19],79:[2,19],80:[2,19],81:[2,19],82:[2,19],83:[2,19],84:[2,19],85:[2,19],86:[2,19],87:[2,19],88:[2,19],89:[2,19],90:[2,19],91:[2,19]},{1:[2,20],6:[2,20],11:[2,20],13:[2,20],24:[2,20],27:[2,20],28:[2,20],35:[2,20],36:[2,20],37:[2,20],38:[2,20],39:[2,20],48:[2,20],53:[2,20],54:[2,20],55:[2,20],58:[2,20],59:[2,20],60:[2,20],61:[2,20],62:[2,20],63:[2,20],64:[2,20],65:[2,20],66:[2,20],67:[2,20],68:[2,20],69:[2,20],70:[2,20],71:[2,20],72:[2,20],73:[2,20],74:[2,20],75:[2,20],76:[2,20],77:[2,20],78:[2,20],79:[2,20],80:[2,20],81:[2,20],82:[2,20],83:[2,20],84:[2,20],85:[2,20],86:[2,20],87:[2,20],88:[2,20],89:[2,20],90:[2,20],91:[2,20]},{1:[2,21],6:[2,21],11:[2,21],13:[2,21],24:[2,21],27:[2,21],28:[2,21],29:[1,93],35:[2,21],36:[2,21],37:[2,21],38:[2,21],39:[2,21],48:[2,21],53:[2,21],54:[2,21],55:[2,21],58:[2,21],59:[2,21],60:[2,21],61:[2,21],62:[2,21],63:[2,21],64:[2,21],65:[2,21],66:[2,21],67:[2,21],68:[2,21],69:[2,21],70:[2,21],71:[2,21],72:[2,21],73:[2,21],74:[2,21],75:[2,21],76:[2,21],77:[2,21],78:[2,21],79:[2,21],80:[2,21],81:[2,21],82:[2,21],83:[2,21],84:[2,21],85:[2,21],86:[2,21],87:[2,21],88:[2,21],89:[2,21],90:[2,21],91:[2,21]},{6:[1,94]},{6:[1,95]},{6:[1,96]},{6:[1,97]},{1:[2,26],6:[2,26],11:[2,26],13:[2,26],24:[2,26],27:[2,26],28:[2,26],35:[2,26],36:[2,26],37:[2,26],38:[2,26],39:[2,26],48:[2,26],53:[2,26],54:[2,26],55:[2,26],58:[2,26],59:[2,26],60:[2,26],61:[2,26],62:[2,26],63:[2,26],64:[2,26],65:[2,26],66:[2,26],67:[2,26],68:[2,26],69:[2,26],70:[2,26],71:[2,26],72:[2,26],73:[2,26],74:[2,26],75:[2,26],76:[2,26],77:[2,26],78:[2,26],79:[2,26],80:[2,26],81:[2,26],82:[2,26],83:[2,26],84:[2,26],85:[2,26],86:[2,26],87:[2,26],88:[2,26],89:[2,26],90:[2,26],91:[2,26]},{6:[2,57],34:[2,57],42:[2,57],52:[2,57],57:[2,57],90:[2,57],91:[2,57],94:[2,57],95:[2,57],96:[2,57],97:[2,57],98:[2,57],99:[2,57]},{33:99,40:[1,101],47:98,48:[1,100],53:[1,68]},{6:[2,110],34:[2,110],40:[1,101],42:[2,110],47:102,48:[1,100],50:[2,110],52:[2,110],57:[2,110],90:[2,110],91:[2,110],92:[2,110],93:[2,110],94:[2,110],95:[2,110],96:[2,110],97:[2,110],98:[2,110],99:[2,110],100:[2,110],101:[2,110]},{8:103,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:105,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:106,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:107,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],56:[1,108],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[2,111],34:[2,111],42:[2,111],50:[2,111],52:[2,111],57:[2,111],90:[2,111],91:[2,111],92:[2,111],93:[2,111],94:[2,111],95:[2,111],96:[2,111],97:[2,111],98:[2,111],99:[2,111],100:[2,111],101:[2,111]},{6:[2,59],8:109,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{1:[2,36],6:[2,36],11:[2,36],13:[2,36],24:[2,36],27:[2,36],28:[2,36],35:[2,36],36:[2,36],37:[2,36],38:[2,36],39:[2,36],48:[2,36],53:[2,36],54:[2,36],55:[2,36],58:[2,36],59:[2,36],60:[2,36],61:[2,36],62:[2,36],63:[2,36],64:[2,36],65:[2,36],66:[2,36],67:[2,36],68:[2,36],69:[2,36],70:[2,36],71:[2,36],72:[2,36],73:[2,36],74:[2,36],75:[2,36],76:[2,36],77:[2,36],78:[2,36],79:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36],86:[2,36],87:[2,36],88:[2,36],89:[2,36],90:[2,36],91:[2,36]},{18:110,48:[1,31]},{31:111,58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67]},{40:[2,63],48:[2,63],53:[2,63]},{40:[2,64],48:[2,64],53:[2,64]},{40:[2,65],48:[2,65],53:[2,65]},{40:[2,66],48:[2,66],53:[2,66]},{40:[2,67],48:[2,67],53:[2,67]},{40:[2,68],48:[2,68],53:[2,68]},{40:[2,69],48:[2,69],53:[2,69]},{40:[2,70],48:[2,70],53:[2,70]},{40:[2,71],48:[2,71],53:[2,71]},{40:[2,72],48:[2,72],53:[2,72]},{40:[2,73],48:[2,73],53:[2,73]},{40:[2,74],48:[2,74],53:[2,74]},{40:[2,75],48:[2,75],53:[2,75]},{40:[2,76],48:[2,76],53:[2,76]},{40:[2,77],48:[2,77],53:[2,77]},{40:[2,78],48:[2,78],53:[2,78]},{40:[2,79],48:[2,79],53:[2,79]},{40:[2,80],48:[2,80],53:[2,80]},{40:[2,81],48:[2,81],53:[2,81]},{40:[2,82],48:[2,82],53:[2,82]},{40:[2,83],48:[2,83],53:[2,83]},{40:[2,84],48:[2,84],53:[2,84]},{40:[2,85],48:[2,85],53:[2,85]},{40:[2,86],48:[2,86],53:[2,86]},{40:[2,87],48:[2,87],53:[2,87]},{40:[2,88],48:[2,88],53:[2,88]},{40:[2,89],48:[2,89],53:[2,89]},{40:[2,90],48:[2,90],53:[2,90]},{40:[2,91],48:[2,91],53:[2,91]},{40:[2,92],48:[2,92],53:[2,92]},{40:[2,93],48:[2,93],53:[2,93]},{6:[2,56],34:[2,56],40:[2,56],42:[2,56],48:[2,56],50:[2,56],52:[2,56],57:[2,56],90:[2,56],91:[2,56],92:[2,56],93:[2,56],94:[2,56],95:[2,56],96:[2,56],97:[2,56],98:[2,56],99:[2,56],100:[2,56],101:[2,56]},{58:[2,32],59:[2,32],60:[2,32],61:[2,32],62:[2,32],63:[2,32],64:[2,32],65:[2,32],66:[2,32],67:[2,32],68:[2,32],69:[2,32],70:[2,32],71:[2,32],72:[2,32],73:[2,32],74:[2,32],75:[2,32],76:[2,32],77:[2,32],78:[2,32],79:[2,32],80:[2,32],81:[2,32],82:[2,32],83:[2,32],84:[2,32],85:[2,32],86:[2,32],87:[2,32],88:[2,32]},{58:[2,33],59:[2,33],60:[2,33],61:[2,33],62:[2,33],63:[2,33],64:[2,33],65:[2,33],66:[2,33],67:[2,33],68:[2,33],69:[2,33],70:[2,33],71:[2,33],72:[2,33],73:[2,33],74:[2,33],75:[2,33],76:[2,33],77:[2,33],78:[2,33],79:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33],86:[2,33],87:[2,33],88:[2,33]},{58:[2,34],59:[2,34],60:[2,34],61:[2,34],62:[2,34],63:[2,34],64:[2,34],65:[2,34],66:[2,34],67:[2,34],68:[2,34],69:[2,34],70:[2,34],71:[2,34],72:[2,34],73:[2,34],74:[2,34],75:[2,34],76:[2,34],77:[2,34],78:[2,34],79:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34],86:[2,34],87:[2,34],88:[2,34]},{58:[2,35],59:[2,35],60:[2,35],61:[2,35],62:[2,35],63:[2,35],64:[2,35],65:[2,35],66:[2,35],67:[2,35],68:[2,35],69:[2,35],70:[2,35],71:[2,35],72:[2,35],73:[2,35],74:[2,35],75:[2,35],76:[2,35],77:[2,35],78:[2,35],79:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35],86:[2,35],87:[2,35],88:[2,35]},{1:[2,5],6:[2,5],11:[2,5],13:[2,5],24:[2,5],27:[2,5],28:[2,5],35:[2,5],36:[2,5],37:[2,5],38:[2,5],39:[2,5],48:[2,5],53:[2,5],54:[2,5],55:[2,5],58:[2,5],59:[2,5],60:[2,5],61:[2,5],62:[2,5],63:[2,5],64:[2,5],65:[2,5],66:[2,5],67:[2,5],68:[2,5],69:[2,5],70:[2,5],71:[2,5],72:[2,5],73:[2,5],74:[2,5],75:[2,5],76:[2,5],77:[2,5],78:[2,5],79:[2,5],80:[2,5],81:[2,5],82:[2,5],83:[2,5],84:[2,5],85:[2,5],86:[2,5],87:[2,5],88:[2,5],89:[2,5],90:[2,5],91:[2,5]},{1:[2,3]},{1:[2,8],6:[2,8],11:[2,8],13:[2,8],24:[2,8],27:[2,8],28:[2,8],35:[2,8],36:[2,8],37:[2,8],38:[2,8],39:[2,8],48:[2,8],53:[2,8],54:[2,8],55:[2,8],58:[2,8],59:[2,8],60:[2,8],61:[2,8],62:[2,8],63:[2,8],64:[2,8],65:[2,8],66:[2,8],67:[2,8],68:[2,8],69:[2,8],70:[2,8],71:[2,8],72:[2,8],73:[2,8],74:[2,8],75:[2,8],76:[2,8],77:[2,8],78:[2,8],79:[2,8],80:[2,8],81:[2,8],82:[2,8],83:[2,8],84:[2,8],85:[2,8],86:[2,8],87:[2,8],88:[2,8],89:[2,8],90:[2,8],91:[2,8]},{6:[1,24],7:73,8:6,9:7,11:[1,112],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{1:[2,6],6:[2,6],11:[2,6],13:[2,6],24:[2,6],27:[2,6],28:[2,6],35:[2,6],36:[2,6],37:[2,6],38:[2,6],39:[2,6],48:[2,6],53:[2,6],54:[2,6],55:[2,6],58:[2,6],59:[2,6],60:[2,6],61:[2,6],62:[2,6],63:[2,6],64:[2,6],65:[2,6],66:[2,6],67:[2,6],68:[2,6],69:[2,6],70:[2,6],71:[2,6],72:[2,6],73:[2,6],74:[2,6],75:[2,6],76:[2,6],77:[2,6],78:[2,6],79:[2,6],80:[2,6],81:[2,6],82:[2,6],83:[2,6],84:[2,6],85:[2,6],86:[2,6],87:[2,6],88:[2,6],89:[2,6],90:[2,6],91:[2,6]},{6:[2,99],34:[2,99],42:[2,99],52:[2,99],57:[2,99],90:[2,99],91:[2,99],94:[2,99],95:[2,99],96:[2,99],97:[2,99],98:[2,99],99:[2,99]},{8:113,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:114,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:115,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:116,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:117,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:118,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:119,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{33:120,53:[1,68]},{8:121,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[2,97],34:[2,97],42:[2,97],52:[2,97],57:[2,97],90:[2,97],91:[2,97],94:[2,97],95:[2,97],96:[2,97],97:[2,97],98:[2,97],99:[2,97]},{6:[2,98],34:[2,98],42:[2,98],52:[2,98],57:[2,98],90:[2,98],91:[2,98],94:[2,98],95:[2,98],96:[2,98],97:[2,98],98:[2,98],99:[2,98]},{8:122,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],56:[1,123],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:124,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{1:[2,18],6:[2,18],11:[2,18],13:[2,18],24:[2,18],27:[2,18],28:[2,18],35:[2,18],36:[2,18],37:[2,18],38:[2,18],39:[2,18],48:[2,18],53:[2,18],54:[2,18],55:[2,18],58:[2,18],59:[2,18],60:[2,18],61:[2,18],62:[2,18],63:[2,18],64:[2,18],65:[2,18],66:[2,18],67:[2,18],68:[2,18],69:[2,18],70:[2,18],71:[2,18],72:[2,18],73:[2,18],74:[2,18],75:[2,18],76:[2,18],77:[2,18],78:[2,18],79:[2,18],80:[2,18],81:[2,18],82:[2,18],83:[2,18],84:[2,18],85:[2,18],86:[2,18],87:[2,18],88:[2,18],89:[2,18],90:[2,18],91:[2,18]},{10:[1,125]},{1:[2,22],6:[2,22],11:[2,22],13:[2,22],24:[2,22],27:[2,22],28:[2,22],35:[2,22],36:[2,22],37:[2,22],38:[2,22],39:[2,22],48:[2,22],53:[2,22],54:[2,22],55:[2,22],58:[2,22],59:[2,22],60:[2,22],61:[2,22],62:[2,22],63:[2,22],64:[2,22],65:[2,22],66:[2,22],67:[2,22],68:[2,22],69:[2,22],70:[2,22],71:[2,22],72:[2,22],73:[2,22],74:[2,22],75:[2,22],76:[2,22],77:[2,22],78:[2,22],79:[2,22],80:[2,22],81:[2,22],82:[2,22],83:[2,22],84:[2,22],85:[2,22],86:[2,22],87:[2,22],88:[2,22],89:[2,22],90:[2,22],91:[2,22]},{1:[2,23],6:[2,23],11:[2,23],13:[2,23],24:[2,23],27:[2,23],28:[2,23],35:[2,23],36:[2,23],37:[2,23],38:[2,23],39:[2,23],48:[2,23],53:[2,23],54:[2,23],55:[2,23],58:[2,23],59:[2,23],60:[2,23],61:[2,23],62:[2,23],63:[2,23],64:[2,23],65:[2,23],66:[2,23],67:[2,23],68:[2,23],69:[2,23],70:[2,23],71:[2,23],72:[2,23],73:[2,23],74:[2,23],75:[2,23],76:[2,23],77:[2,23],78:[2,23],79:[2,23],80:[2,23],81:[2,23],82:[2,23],83:[2,23],84:[2,23],85:[2,23],86:[2,23],87:[2,23],88:[2,23],89:[2,23],90:[2,23],91:[2,23]},{1:[2,24],6:[2,24],11:[2,24],13:[2,24],24:[2,24],27:[2,24],28:[2,24],35:[2,24],36:[2,24],37:[2,24],38:[2,24],39:[2,24],48:[2,24],53:[2,24],54:[2,24],55:[2,24],58:[2,24],59:[2,24],60:[2,24],61:[2,24],62:[2,24],63:[2,24],64:[2,24],65:[2,24],66:[2,24],67:[2,24],68:[2,24],69:[2,24],70:[2,24],71:[2,24],72:[2,24],73:[2,24],74:[2,24],75:[2,24],76:[2,24],77:[2,24],78:[2,24],79:[2,24],80:[2,24],81:[2,24],82:[2,24],83:[2,24],84:[2,24],85:[2,24],86:[2,24],87:[2,24],88:[2,24],89:[2,24],90:[2,24],91:[2,24]},{1:[2,25],6:[2,25],11:[2,25],13:[2,25],24:[2,25],27:[2,25],28:[2,25],35:[2,25],36:[2,25],37:[2,25],38:[2,25],39:[2,25],48:[2,25],53:[2,25],54:[2,25],55:[2,25],58:[2,25],59:[2,25],60:[2,25],61:[2,25],62:[2,25],63:[2,25],64:[2,25],65:[2,25],66:[2,25],67:[2,25],68:[2,25],69:[2,25],70:[2,25],71:[2,25],72:[2,25],73:[2,25],74:[2,25],75:[2,25],76:[2,25],77:[2,25],78:[2,25],79:[2,25],80:[2,25],81:[2,25],82:[2,25],83:[2,25],84:[2,25],85:[2,25],86:[2,25],87:[2,25],88:[2,25],89:[2,25],90:[2,25],91:[2,25]},{6:[2,58],34:[2,58],42:[2,58],52:[2,58],57:[2,58],90:[2,58],91:[2,58],94:[2,58],95:[2,58],96:[2,58],97:[2,58],98:[2,58],99:[2,58]},{6:[2,37],40:[1,126]},{8:129,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,42:[1,128],48:[1,31],49:127,51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{8:129,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,42:[1,131],48:[1,31],49:130,51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[2,53],34:[2,53],42:[2,53],52:[2,53],57:[2,53],90:[2,53],91:[2,53],94:[2,53],95:[2,53],96:[2,53],97:[2,53],98:[2,53],99:[2,53]},{6:[2,94],34:[2,94],42:[2,94],52:[1,86],57:[2,94],90:[2,94],91:[2,94],94:[1,78],95:[2,94],96:[2,94],97:[2,94],98:[2,94],99:[2,94]},{40:[1,101],47:98,48:[1,100]},{6:[2,95],34:[2,95],42:[2,95],52:[1,86],57:[2,95],90:[2,95],91:[2,95],94:[1,78],95:[2,95],96:[2,95],97:[2,95],98:[2,95],99:[2,95]},{6:[2,96],34:[2,96],42:[2,96],52:[1,86],57:[2,96],90:[2,96],91:[2,96],94:[1,78],95:[2,96],96:[2,96],97:[2,96],98:[2,96],99:[2,96]},{42:[1,132],52:[1,86],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{8:133,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[2,60],52:[1,86],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{10:[1,134]},{32:135,33:136,53:[1,68]},{1:[2,9],6:[2,9],11:[2,9],13:[2,9],24:[2,9],27:[2,9],28:[2,9],35:[2,9],36:[2,9],37:[2,9],38:[2,9],39:[2,9],48:[2,9],53:[2,9],54:[2,9],55:[2,9],58:[2,9],59:[2,9],60:[2,9],61:[2,9],62:[2,9],63:[2,9],64:[2,9],65:[2,9],66:[2,9],67:[2,9],68:[2,9],69:[2,9],70:[2,9],71:[2,9],72:[2,9],73:[2,9],74:[2,9],75:[2,9],76:[2,9],77:[2,9],78:[2,9],79:[2,9],80:[2,9],81:[2,9],82:[2,9],83:[2,9],84:[2,9],85:[2,9],86:[2,9],87:[2,9],88:[2,9],89:[2,9],90:[2,9],91:[2,9]},{6:[2,100],34:[2,100],42:[2,100],52:[1,86],57:[2,100],90:[2,100],91:[2,100],94:[1,78],95:[1,81],96:[2,100],97:[2,100],98:[2,100],99:[2,100]},{6:[2,101],34:[2,101],42:[2,101],52:[1,86],57:[2,101],90:[2,101],91:[2,101],94:[1,78],95:[1,81],96:[2,101],97:[2,101],98:[2,101],99:[2,101]},{6:[2,102],34:[2,102],42:[2,102],52:[1,86],57:[2,102],90:[2,102],91:[2,102],94:[1,78],95:[2,102],96:[2,102],97:[2,102],98:[2,102],99:[2,102]},{6:[2,103],34:[2,103],42:[2,103],52:[1,86],57:[2,103],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[2,103],97:[2,103],98:[2,103],99:[2,103]},{6:[2,104],34:[2,104],42:[2,104],52:[1,86],57:[2,104],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[2,104],98:[2,104],99:[1,85]},{6:[2,105],34:[2,105],42:[2,105],52:[1,86],57:[2,105],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[2,105],99:[1,85]},{6:[2,106],34:[2,106],42:[2,106],52:[1,86],57:[2,106],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[2,106],98:[2,106],99:[2,106]},{6:[2,55],34:[2,55],42:[2,55],50:[2,55],52:[2,55],57:[2,55],90:[2,55],91:[2,55],92:[2,55],93:[2,55],94:[2,55],95:[2,55],96:[2,55],97:[2,55],98:[2,55],99:[2,55],100:[2,55],101:[2,55]},{6:[2,54],34:[2,54],42:[2,54],52:[1,86],57:[2,54],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{6:[2,107],34:[2,107],42:[2,107],52:[1,86],57:[2,107],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{8:137,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[2,109],34:[2,109],42:[2,109],52:[1,86],57:[2,109],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{4:138,6:[1,24],7:4,8:6,9:7,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{31:141,41:139,42:[1,140],43:142,44:[1,143],45:[1,144],46:[1,145],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67]},{34:[1,147],42:[1,146]},{6:[2,49],34:[2,49],42:[2,49],52:[2,49],57:[2,49],90:[2,49],91:[2,49],94:[2,49],95:[2,49],96:[2,49],97:[2,49],98:[2,49],99:[2,49]},{34:[2,51],42:[2,51],52:[1,86],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{34:[1,147],42:[1,148]},{6:[2,50],34:[2,50],42:[2,50],52:[2,50],57:[2,50],90:[2,50],91:[2,50],94:[2,50],95:[2,50],96:[2,50],97:[2,50],98:[2,50],99:[2,50]},{6:[2,61],10:[2,61],34:[2,61],42:[2,61],52:[2,61],57:[2,61],90:[2,61],91:[2,61],94:[2,61],95:[2,61],96:[2,61],97:[2,61],98:[2,61],99:[2,61]},{52:[1,86],57:[1,149],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{4:150,6:[1,24],7:4,8:6,9:7,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[2,29],34:[1,151]},{6:[2,30],34:[2,30]},{52:[1,86],57:[1,152],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{6:[1,24],7:73,8:6,9:7,11:[1,153],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{34:[1,155],42:[1,154]},{5:156,10:[1,5]},{33:157,53:[1,68]},{31:158,58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67]},{58:[2,44],59:[2,44],60:[2,44],61:[2,44],62:[2,44],63:[2,44],64:[2,44],65:[2,44],66:[2,44],67:[2,44],68:[2,44],69:[2,44],70:[2,44],71:[2,44],72:[2,44],73:[2,44],74:[2,44],75:[2,44],76:[2,44],77:[2,44],78:[2,44],79:[2,44],80:[2,44],81:[2,44],82:[2,44],83:[2,44],84:[2,44],85:[2,44],86:[2,44],87:[2,44],88:[2,44]},{58:[2,45],59:[2,45],60:[2,45],61:[2,45],62:[2,45],63:[2,45],64:[2,45],65:[2,45],66:[2,45],67:[2,45],68:[2,45],69:[2,45],70:[2,45],71:[2,45],72:[2,45],73:[2,45],74:[2,45],75:[2,45],76:[2,45],77:[2,45],78:[2,45],79:[2,45],80:[2,45],81:[2,45],82:[2,45],83:[2,45],84:[2,45],85:[2,45],86:[2,45],87:[2,45],88:[2,45]},{58:[2,46],59:[2,46],60:[2,46],61:[2,46],62:[2,46],63:[2,46],64:[2,46],65:[2,46],66:[2,46],67:[2,46],68:[2,46],69:[2,46],70:[2,46],71:[2,46],72:[2,46],73:[2,46],74:[2,46],75:[2,46],76:[2,46],77:[2,46],78:[2,46],79:[2,46],80:[2,46],81:[2,46],82:[2,46],83:[2,46],84:[2,46],85:[2,46],86:[2,46],87:[2,46],88:[2,46]},{6:[2,47],34:[2,47],42:[2,47],52:[2,47],57:[2,47],90:[2,47],91:[2,47],94:[2,47],95:[2,47],96:[2,47],97:[2,47],98:[2,47],99:[2,47]},{8:159,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:104,33:27,48:[1,31],51:32,53:[1,68],54:[1,25],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{6:[2,48],34:[2,48],42:[2,48],52:[2,48],57:[2,48],90:[2,48],91:[2,48],94:[2,48],95:[2,48],96:[2,48],97:[2,48],98:[2,48],99:[2,48]},{42:[1,160]},{6:[1,24],7:73,8:6,9:7,11:[1,161],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:[1,23],28:[1,35],30:36,31:26,33:27,35:[1,69],36:[1,70],37:[1,71],38:[1,72],39:[1,34],48:[1,31],51:32,53:[1,68],54:[1,25],55:[1,33],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67],89:[1,28],90:[1,29],91:[1,30]},{33:162,53:[1,68]},{6:[2,108],34:[2,108],42:[2,108],52:[2,108],57:[2,108],90:[2,108],91:[2,108],94:[2,108],95:[2,108],96:[2,108],97:[2,108],98:[2,108],99:[2,108]},{1:[2,28],6:[2,28],11:[2,28],13:[2,28],24:[2,28],27:[2,28],28:[2,28],29:[2,28],35:[2,28],36:[2,28],37:[2,28],38:[2,28],39:[2,28],48:[2,28],53:[2,28],54:[2,28],55:[2,28],58:[2,28],59:[2,28],60:[2,28],61:[2,28],62:[2,28],63:[2,28],64:[2,28],65:[2,28],66:[2,28],67:[2,28],68:[2,28],69:[2,28],70:[2,28],71:[2,28],72:[2,28],73:[2,28],74:[2,28],75:[2,28],76:[2,28],77:[2,28],78:[2,28],79:[2,28],80:[2,28],81:[2,28],82:[2,28],83:[2,28],84:[2,28],85:[2,28],86:[2,28],87:[2,28],88:[2,28],89:[2,28],90:[2,28],91:[2,28]},{5:163,10:[1,5]},{31:164,43:165,44:[1,143],45:[1,144],46:[1,145],58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67]},{1:[2,39],6:[2,39],11:[2,39],13:[2,39],24:[2,39],27:[2,39],28:[2,39],35:[2,39],36:[2,39],37:[2,39],38:[2,39],39:[2,39],48:[2,39],53:[2,39],54:[2,39],55:[2,39],58:[2,39],59:[2,39],60:[2,39],61:[2,39],62:[2,39],63:[2,39],64:[2,39],65:[2,39],66:[2,39],67:[2,39],68:[2,39],69:[2,39],70:[2,39],71:[2,39],72:[2,39],73:[2,39],74:[2,39],75:[2,39],76:[2,39],77:[2,39],78:[2,39],79:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39],86:[2,39],87:[2,39],88:[2,39],89:[2,39],90:[2,39],91:[2,39]},{34:[2,40],42:[2,40]},{33:166,53:[1,68]},{34:[2,52],42:[2,52],52:[1,86],90:[1,80],91:[1,79],94:[1,78],95:[1,81],96:[1,82],97:[1,83],98:[1,84],99:[1,85]},{6:[2,62],10:[2,62],34:[2,62],42:[2,62],52:[2,62],57:[2,62],90:[2,62],91:[2,62],94:[2,62],95:[2,62],96:[2,62],97:[2,62],98:[2,62],99:[2,62]},{1:[2,27],6:[2,27],11:[2,27],13:[2,27],24:[2,27],27:[2,27],28:[2,27],29:[2,27],35:[2,27],36:[2,27],37:[2,27],38:[2,27],39:[2,27],48:[2,27],53:[2,27],54:[2,27],55:[2,27],58:[2,27],59:[2,27],60:[2,27],61:[2,27],62:[2,27],63:[2,27],64:[2,27],65:[2,27],66:[2,27],67:[2,27],68:[2,27],69:[2,27],70:[2,27],71:[2,27],72:[2,27],73:[2,27],74:[2,27],75:[2,27],76:[2,27],77:[2,27],78:[2,27],79:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27],86:[2,27],87:[2,27],88:[2,27],89:[2,27],90:[2,27],91:[2,27]},{6:[2,31],34:[2,31]},{1:[2,38],6:[2,38],11:[2,38],13:[2,38],24:[2,38],27:[2,38],28:[2,38],35:[2,38],36:[2,38],37:[2,38],38:[2,38],39:[2,38],48:[2,38],53:[2,38],54:[2,38],55:[2,38],58:[2,38],59:[2,38],60:[2,38],61:[2,38],62:[2,38],63:[2,38],64:[2,38],65:[2,38],66:[2,38],67:[2,38],68:[2,38],69:[2,38],70:[2,38],71:[2,38],72:[2,38],73:[2,38],74:[2,38],75:[2,38],76:[2,38],77:[2,38],78:[2,38],79:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38],86:[2,38],87:[2,38],88:[2,38],89:[2,38],90:[2,38],91:[2,38]},{33:167,53:[1,68]},{31:168,58:[1,37],59:[1,38],60:[1,39],61:[1,40],62:[1,41],63:[1,42],64:[1,43],65:[1,44],66:[1,45],67:[1,46],68:[1,47],69:[1,48],70:[1,49],71:[1,50],72:[1,51],73:[1,52],74:[1,53],75:[1,54],76:[1,55],77:[1,56],78:[1,57],79:[1,58],80:[1,59],81:[1,60],82:[1,61],83:[1,62],84:[1,63],85:[1,64],86:[1,65],87:[1,66],88:[1,67]},{34:[2,42],42:[2,42]},{34:[2,41],42:[2,41]},{33:169,53:[1,68]},{34:[2,43],42:[2,43]}],
defaultActions: {74:[2,3]},
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

    function Program(state) {
      var _base, _base2;
      this.state = state != null ? state : {};
      this.functions = {};
      (_base = this.state).variables || (_base.variables = {});
      (_base2 = this.state).scope || (_base2.scope = new Scope());
    }

    Program.prototype.toSource = function() {
      return this.root_node.toSource().trim();
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
      }), o('Identifier : INDENT StorageQualifierNameList OUTDENT', function() {
        return {
          type: $1,
          names: $4
        };
      }), o('Identifier : [ INDENT StorageQualifierNameList OUTDENT ]', function() {
        return {
          type: $1,
          names: $5
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
      }), o('StorageQualifierNameList TERMINATOR StorageQualifierName', function() {
        $1.push($3);
        return $1;
      }), o('StorageQualifierNameList , TERMINATOR StorageQualifierName', function() {
        $1.push($4);
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
        return new Assign($1, $3, '=');
      }), o('Assignable = TERMINATOR Expression', function() {
        return new Assign($1, $4, '=');
      }), o('Assignable = INDENT Expression OUTDENT', function() {
        return new Assign($1, $4, '=');
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
        return [].concat($1);
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
      }), o('ParamQualifier Param', function() {
        if ($2.length) {
          $2[0].param_qualifier = $1;
        } else {
          $2.param_qualifier = $1;
        }
        return $2;
      }), o('GlslType CALL_START Param CALL_END', function() {
        $3.set_type($1);
        return $3;
      }), o('GlslType CALL_START Param , ParamList CALL_END', function() {
        $3.set_type($1);
        $5.unshift($3);
        return $5;
      })
    ],
    ParamQualifier: [o('INOUT'), o('OUT')],
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
        $2.source = $1;
        return $2;
      }), o('Invocation Accessor', function() {
        $2.source = $1;
        return $2;
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
      o('( Expression )', function() {
        return new Parens($2);
      }), o('( INDENT Expression OUTDENT )', function() {
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
    StorageQualifier: 'storage_qualifier',
    Parens: 'parens',
    Access: 'access',
    If: 'if'
  };

  for (node_name in nodes) {
    node_file = nodes[node_name];
    exports[node_name] = require("shader-script/nodes/" + node_file)[node_name];
  }

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/access"] = function() {
      var exports = {};
      (function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/definition').Definition;

  exports.Access = (function(_super) {

    __extends(Access, _super);

    function Access() {
      Access.__super__.constructor.apply(this, arguments);
    }

    Access.prototype.name = "access";

    Access.prototype.children = function() {
      return ['accessor'];
    };

    Access.prototype.variable = function(shader) {
      return this._variable || (this._variable = new Definition({
        type: this.type(shader)
      }));
    };

    Access.prototype.compile = function(shader) {
      if (!this.source) throw new Error("Accessor has no source");
      return this.glsl('Access', this.glsl('Identifier', this.accessor_name()), this.source.compile(shader));
    };

    return Access;

  })(require('shader-script/glsl/nodes/access').Access);

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
        if (this.left.is_access() && this.left.type(shader) !== this.right.type(shader)) {
          right = this.glsl('Access', this.left.accessor, this.right.compile(shader));
        } else {
          right = this.right.compile(shader);
        }
        if (!left.toVariableName) {
          throw new Error("Can't use " + (JSON.stringify(left)) + " as lvalue");
        }
        if (!this.left.is_access()) {
          if (this.right.variable) dependent = this.right.variable(shader);
          varname = left.toVariableName();
          existing = shader.scope.lookup(varname, true);
          if (existing) {
            type = existing.type();
            if (right.cast) {
              right.cast(type, {
                state: shader
              });
            } else if (dependent) {
              dependent.set_type(type);
            }
          } else {
            type = this.right.type(shader);
          }
          shader.scope.define(left.toVariableName(), {
            type: type,
            dependent: dependent
          });
        }
        return this.glsl('Assign', left, right, this.token);
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

    Base.prototype.definition = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })((require('shader-script/definition').Definition), args, function() {});
    };

    Base.prototype.is_access = function() {
      return false;
    };

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

  exports.Base.prototype.component_wise = require('shader-script/extension').Extension.prototype.component_wise;

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

    Block.prototype.type = function(shader) {
      return this.lines[this.lines.length - 1].type(shader);
    };

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
      return this.variable(shader).type();
    };

    Function.prototype.compile = function(shader) {
      var compiled_body, compiled_func_name, compiled_params, function_scope, glsl, param, return_variable, str_func_name;
      if (!this.func_name) {
        throw new Error("GLSL doesn't support anonymous functions");
      }
      return_variable = this.variable(shader);
      compiled_func_name = this.func_name.compile(shader);
      str_func_name = this.func_name.toVariableName();
      if (str_func_name === 'vertex' || str_func_name === 'fragment') {
        if (str_func_name === shader.compile_target) {
          compiled_func_name = this.glsl('Identifier', 'main');
        } else {
          return null;
        }
      }
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
      glsl = this.glsl('Function', this.variable(shader), compiled_func_name, compiled_params, compiled_body);
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
    _require["shader-script/nodes/if"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.If = (function(_super) {

    __extends(If, _super);

    function If() {
      If.__super__.constructor.apply(this, arguments);
    }

    If.prototype.name = "if";

    If.prototype.compile = function(shader) {
      var _if;
      _if = this.glsl('If', this.expression.compile(shader), this.block.compile(shader), this.options);
      if (this.else_block) _if.addElse(this.else_block.compile(shader));
      return _if;
    };

    return If;

  })(require('shader-script/glsl/nodes/if').If);

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
  var Definition, signatures,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  signatures = require('shader-script/operators').signatures;

  Definition = require('shader-script/definition').Definition;

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
      var ltype, rtype, sig;
      if (!this.right) return this.left.type(shader);
      ltype = this.left.type(shader);
      rtype = this.right.type(shader);
      if (sig = signatures[ltype]) if (sig = sig[this.op]) return sig[rtype];
      return ltype || rtype;
    };

    Op.prototype.variable = function(shader) {
      this._variable || (this._variable = new Definition);
      this._variable.set_type(this.type(shader));
      return this._variable;
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

    Param.prototype.name = 'param';

    Param.prototype.children = function() {
      return ['name', 'default_value'];
    };

    function Param(name, default_value, param_qualifier) {
      this.param_qualifier = param_qualifier != null ? param_qualifier : 'in';
      Param.__super__.constructor.call(this, name, default_value);
    }

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
      var variable, varn;
      varn = this.toVariableName();
      variable = shader.scope.define(varn, {
        dependent: this.variable(),
        param_qualifier: this.param_qualifier
      });
      return this.glsl('Variable', variable);
    };

    return Param;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/parens"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Parens = (function(_super) {

    __extends(Parens, _super);

    function Parens() {
      Parens.__super__.constructor.apply(this, arguments);
    }

    Parens.prototype.name = "parens";

    Parens.prototype.children = function() {
      return ['body'];
    };

    Parens.prototype.type = function(shader) {
      return this.body.type(shader);
    };

    Parens.prototype.compile = function(shader) {
      return this.glsl('Parens', this.body.compile(shader));
    };

    return Parens;

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
      var fragment_root_node, shader, vertex_root_node;
      if (state == null) state = {};
      shader = new Shader(state);
      shader.compile_target = 'vertex';
      vertex_root_node = this.glsl('Root', this.block.compile(shader));
      shader.compile_target = 'fragment';
      fragment_root_node = this.glsl('Root', this.block.compile(shader));
      return {
        vertex: vertex_root_node.compile(state),
        fragment: fragment_root_node.compile(state)
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
      if (this.qualifier === 'attributes' && shader.compile_target === 'fragment') {
        return null;
      }
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
    _require["shader-script/operations"] = function() {
      var exports = {};
      (function() {
  var component_wise,
    __slice = Array.prototype.slice;

  component_wise = function() {
    var again, arg, args, argset, callback, i, resultset, size;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (i in args) {
      if (args[i] && args[i].splice) args[i] = args[i].splice(0);
    }
    callback = args.pop();
    resultset = [];
    again = true;
    while (again) {
      size = null;
      again = false;
      argset = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          if (arg && arg.length) {
            if (arg.length > 1) again = true;
            if (size && arg.length !== size) {
              throw new Error("All vectors must be the same size");
            }
            size = arg.length;
          }
          if (arg && arg.shift) {
            _results.push(arg.shift());
          } else {
            _results.push(arg);
          }
        }
        return _results;
      })();
      resultset.push(callback.apply(null, argset));
    }
    if (resultset.length === 1) {
      return resultset[0];
    } else {
      return resultset;
    }
  };

  exports.float = function(le, op, re) {};

}).call(this);

      return exports;
    };
    _require["shader-script/operators"] = function() {
      var exports = {};
      (function() {
  var component_wise, cw_add, cw_divide, cw_mult, cw_subt,
    __slice = Array.prototype.slice;

  exports.component_wise = component_wise = function() {
    var again, arg, args, argset, callback, i, resultset, size;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (i in args) {
      if (args[i] && args[i].splice) args[i] = args[i].splice(0);
    }
    callback = args.pop();
    resultset = [];
    again = true;
    while (again) {
      size = null;
      again = false;
      argset = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          if (arg && arg.length) {
            if (arg.length > 1) again = true;
            if (size && arg.length !== size) {
              throw new Error("All vectors must be the same size");
            }
            size = arg.length;
          }
          if (arg && arg.shift) {
            _results.push(arg.shift());
          } else {
            _results.push(arg);
          }
        }
        return _results;
      })();
      resultset.push(callback.apply(null, argset));
    }
    if (resultset.length === 1) {
      return resultset[0];
    } else {
      return resultset;
    }
  };

  cw_subt = function(le, re) {
    return component_wise(le.value, re && re.value, function(l, r) {
      if (r === void 0) {
        return -l;
      } else {
        return l - r;
      }
    });
  };

  cw_add = function(le, re) {
    return component_wise(le.value, re && re.value, function(l, r) {
      if (r === void 0) {
        return +l;
      } else {
        return l + r;
      }
    });
  };

  cw_mult = function(le, re) {
    return component_wise(le.value, re.value, function(l, r) {
      return l * r;
    });
  };

  cw_divide = function(le, re) {
    return component_wise(le.value, re.value, function(l, r) {
      return l / r;
    });
  };

  exports.signatures = {
    vec3: {
      '==': {
        vec3: 'vec3'
      },
      '-': {
        vec3: 'vec3'
      },
      '+': {
        vec3: 'vec3'
      },
      '/': {
        vec3: 'vec3'
      },
      '*': {
        vec3: 'vec3',
        mat3: 'vec3',
        mat4: 'vec3',
        float: 'vec3'
      }
    },
    vec4: {
      '==': {
        vec4: 'vec4'
      },
      '-': {
        vec4: 'vec4'
      },
      '+': {
        vec4: 'vec4'
      },
      '/': {
        vec4: 'vec4'
      },
      '*': {
        vec4: 'vec4',
        mat3: 'vec4',
        mat4: 'vec4',
        float: 'vec4'
      }
    },
    mat3: {
      '==': {
        mat3: 'mat3'
      },
      '-': {
        mat3: 'mat3'
      },
      '+': {
        mat3: 'mat3'
      },
      '/': {
        mat3: 'mat3'
      },
      '*': {
        vec3: 'vec3',
        vec4: 'vec4',
        mat3: 'mat3',
        float: 'mat3'
      }
    },
    mat4: {
      '==': {
        mat4: 'mat4'
      },
      '-': {
        mat4: 'mat4'
      },
      '+': {
        mat4: 'mat4'
      },
      '/': {
        mat4: 'mat4'
      },
      '*': {
        vec3: 'vec3',
        vec4: 'vec4',
        mat4: 'mat4',
        float: 'mat4'
      }
    }
  };

  exports.mat4 = {
    '==': function(le, re) {
      return le.value === re.value;
    },
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide,
    '*': function(le, re) {
      var dest, mat, vec, w, x, y, z, _ref;
      switch (re.type()) {
        case 'vec4':
          dest = [];
          mat = le.value;
          vec = re.value;
          _ref = [vec[0], vec[1], vec[2], vec[3]], x = _ref[0], y = _ref[1], z = _ref[2], w = _ref[3];
          dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
          dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
          dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
          dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
          return dest;
        default:
          return cw_mult(le, re);
      }
    }
  };

  exports.vec4 = {
    '==': function(le, re) {
      return le.value === re.value;
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.vec3 = {
    '==': function(le, re) {
      return le.value === re.value;
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.float = {
    '==': function(le, re) {
      return le.value === re.value;
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

}).call(this);

      return exports;
    };
    _require["shader-script/parser"] = function() {
      var exports = {};
      /* Jison generated parser */

var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"Return":10,"Comment":11,"STATEMENT":12,"StorageQualifier":13,"=":14,"{":15,"StorageQualifierAssigns":16,"}":17,"INDENT":18,"OUTDENT":19,"UNIFORMS":20,"VARYINGS":21,"CONSTS":22,"ATTRIBUTES":23,"StorageQualifierAssign":24,"OptComma":25,"Identifier":26,":":27,"StorageQualifierName":28,"[":29,"StorageQualifierNameList":30,"]":31,",":32,"Value":33,"Invocation":34,"Code":35,"Operation":36,"Assign":37,"If":38,"Try":39,"While":40,"For":41,"Switch":42,"Class":43,"Throw":44,"GlslTypeConstructor":45,"IDENTIFIER":46,"AlphaNumeric":47,"NUMBER":48,"STRING":49,"Literal":50,"JS":51,"REGEX":52,"DEBUGGER":53,"BOOLEAN_VALUE":54,"Assignable":55,"AssignObj":56,"ObjAssignable":57,"ThisProperty":58,"RETURN":59,"HERECOMMENT":60,"PARAM_START":61,"ParamList":62,"PARAM_END":63,"FuncGlyph":64,"->":65,"=>":66,"Param":67,"ParamVar":68,"...":69,"ParamQualifier":70,"GlslType":71,"CALL_START":72,"CALL_END":73,"INOUT":74,"OUT":75,"Array":76,"Object":77,"Splat":78,"SimpleAssignable":79,"Accessor":80,"Parenthetical":81,"Range":82,"This":83,".":84,"?.":85,"::":86,"Index":87,"INDEX_START":88,"IndexValue":89,"INDEX_END":90,"INDEX_SOAK":91,"Slice":92,"AssignList":93,"CLASS":94,"EXTENDS":95,"OptFuncExist":96,"Arguments":97,"SUPER":98,"FUNC_EXIST":99,"ArgList":100,"THIS":101,"@":102,"RangeDots":103,"..":104,"Arg":105,"SimpleArgs":106,"TRY":107,"Catch":108,"FINALLY":109,"CATCH":110,"THROW":111,"(":112,")":113,"WhileSource":114,"WHILE":115,"WHEN":116,"UNTIL":117,"Loop":118,"LOOP":119,"ForBody":120,"FOR":121,"ForStart":122,"ForSource":123,"ForVariables":124,"OWN":125,"ForValue":126,"FORIN":127,"FOROF":128,"BY":129,"SWITCH":130,"Whens":131,"ELSE":132,"When":133,"LEADING_WHEN":134,"IfBlock":135,"IF":136,"POST_IF":137,"UNARY":138,"-":139,"+":140,"--":141,"++":142,"?":143,"MATH":144,"SHIFT":145,"COMPARE":146,"LOGIC":147,"RELATION":148,"COMPOUND_ASSIGN":149,"VOID":150,"BOOL":151,"INT":152,"FLOAT":153,"VEC2":154,"VEC3":155,"VEC4":156,"BVEC2":157,"BVEC3":158,"BVEC4":159,"IVEC2":160,"IVEC3":161,"IVEC4":162,"MAT2":163,"MAT3":164,"MAT4":165,"MAT2X2":166,"MAT2X3":167,"MAT2X4":168,"MAT3X2":169,"MAT3X3":170,"MAT3X4":171,"MAT4X2":172,"MAT4X3":173,"MAT4X4":174,"SAMPLER1D":175,"SAMPLER2D":176,"SAMPLER3D":177,"SAMPLERCUBE":178,"SAMPLER1DSHADOW":179,"SAMPLER2DSHADOW":180,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",12:"STATEMENT",14:"=",15:"{",17:"}",18:"INDENT",19:"OUTDENT",20:"UNIFORMS",21:"VARYINGS",22:"CONSTS",23:"ATTRIBUTES",27:":",29:"[",31:"]",32:",",46:"IDENTIFIER",48:"NUMBER",49:"STRING",51:"JS",52:"REGEX",53:"DEBUGGER",54:"BOOLEAN_VALUE",59:"RETURN",60:"HERECOMMENT",61:"PARAM_START",63:"PARAM_END",65:"->",66:"=>",69:"...",72:"CALL_START",73:"CALL_END",74:"INOUT",75:"OUT",84:".",85:"?.",86:"::",88:"INDEX_START",90:"INDEX_END",91:"INDEX_SOAK",94:"CLASS",95:"EXTENDS",98:"SUPER",99:"FUNC_EXIST",101:"THIS",102:"@",104:"..",107:"TRY",109:"FINALLY",110:"CATCH",111:"THROW",112:"(",113:")",115:"WHILE",116:"WHEN",117:"UNTIL",119:"LOOP",121:"FOR",125:"OWN",127:"FORIN",128:"FOROF",129:"BY",130:"SWITCH",132:"ELSE",134:"LEADING_WHEN",136:"IF",137:"POST_IF",138:"UNARY",139:"-",140:"+",141:"--",142:"++",143:"?",144:"MATH",145:"SHIFT",146:"COMPARE",147:"LOGIC",148:"RELATION",149:"COMPOUND_ASSIGN",150:"VOID",151:"BOOL",152:"INT",153:"FLOAT",154:"VEC2",155:"VEC3",156:"VEC4",157:"BVEC2",158:"BVEC3",159:"BVEC4",160:"IVEC2",161:"IVEC3",162:"IVEC4",163:"MAT2",164:"MAT3",165:"MAT4",166:"MAT2X2",167:"MAT2X3",168:"MAT2X4",169:"MAT3X2",170:"MAT3X3",171:"MAT3X4",172:"MAT4X2",173:"MAT4X3",174:"MAT4X4",175:"SAMPLER1D",176:"SAMPLER2D",177:"SAMPLER3D",178:"SAMPLERCUBE",179:"SAMPLER1DSHADOW",180:"SAMPLER2DSHADOW"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[9,1],[9,1],[9,1],[9,5],[9,7],[13,1],[13,1],[13,1],[13,1],[16,1],[16,4],[24,3],[24,5],[24,5],[24,7],[28,1],[30,1],[30,3],[30,3],[30,4],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[5,2],[5,3],[26,1],[47,1],[47,1],[50,1],[50,1],[50,1],[50,1],[50,1],[37,3],[37,4],[37,5],[56,1],[56,3],[56,5],[56,1],[57,1],[57,1],[57,1],[10,2],[10,1],[11,1],[35,5],[35,2],[64,1],[64,1],[25,0],[25,1],[62,0],[62,1],[62,3],[67,1],[67,2],[67,3],[67,2],[67,4],[67,6],[70,1],[70,1],[68,1],[68,1],[68,1],[68,1],[78,2],[79,1],[79,2],[79,2],[79,1],[55,1],[55,1],[55,1],[33,1],[33,1],[33,1],[33,1],[33,1],[80,2],[80,2],[80,2],[80,1],[80,1],[87,3],[87,2],[89,1],[89,1],[77,4],[93,0],[93,1],[93,3],[93,4],[93,6],[43,1],[43,2],[43,3],[43,4],[43,2],[43,3],[43,4],[43,5],[34,3],[34,3],[34,1],[34,2],[96,0],[96,1],[97,2],[97,4],[83,1],[83,1],[58,2],[76,2],[76,4],[103,1],[103,1],[82,5],[92,3],[92,2],[92,2],[92,1],[100,1],[100,3],[100,4],[100,4],[100,6],[105,1],[105,1],[106,1],[106,3],[39,2],[39,3],[39,4],[39,5],[108,3],[44,2],[81,3],[81,5],[114,2],[114,4],[114,2],[114,4],[40,2],[40,2],[40,2],[40,1],[118,2],[118,2],[41,2],[41,2],[41,2],[120,2],[120,2],[122,2],[122,3],[126,1],[126,1],[126,1],[124,1],[124,3],[123,2],[123,2],[123,4],[123,4],[123,4],[123,6],[123,6],[42,5],[42,7],[42,4],[42,6],[131,1],[131,2],[133,3],[133,4],[135,3],[135,5],[38,1],[38,3],[38,3],[38,3],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,2],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,3],[36,5],[36,3],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[71,1],[45,2]],
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
case 22:this.$ = {
          type: $$[$0-4],
          names: $$[$0-1]
        };
break;
case 23:this.$ = {
          type: $$[$0-6],
          names: $$[$0-2]
        };
break;
case 24:this.$ = $$[$0];
break;
case 25:this.$ = [$$[$0]];
break;
case 26:this.$ = (function () {
        $$[$0-2].push($$[$0]);
        return $$[$0-2];
      }());
break;
case 27:this.$ = (function () {
        $$[$0-2].push($$[$0]);
        return $$[$0-2];
      }());
break;
case 28:this.$ = (function () {
        $$[$0-3].push($$[$0]);
        return $$[$0-3];
      }());
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
case 38:this.$ = $$[$0];
break;
case 39:this.$ = $$[$0];
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = new yy.Block;
break;
case 43:this.$ = $$[$0-1];
break;
case 44:this.$ = new yy.Identifier($$[$0]);
break;
case 45:this.$ = new yy.Literal($$[$0]);
break;
case 46:this.$ = new yy.Literal($$[$0]);
break;
case 47:this.$ = $$[$0];
break;
case 48:this.$ = new yy.Literal($$[$0]);
break;
case 49:this.$ = new yy.Literal($$[$0]);
break;
case 50:this.$ = new yy.Literal($$[$0]);
break;
case 51:this.$ = (function () {
        var val;
        val = new yy.Literal($$[$0]);
        if ($$[$0] === 'undefined') val.isUndefined = true;
        return val;
      }());
break;
case 52:this.$ = new yy.Assign($$[$0-2], $$[$0], '=');
break;
case 53:this.$ = new yy.Assign($$[$0-3], $$[$0], '=');
break;
case 54:this.$ = new yy.Assign($$[$0-4], $$[$0-1], '=');
break;
case 55:this.$ = new yy.Value($$[$0]);
break;
case 56:this.$ = new yy.Assign(new yy.Value($$[$0-2]), $$[$0], 'object');
break;
case 57:this.$ = new yy.Assign(new yy.Value($$[$0-4]), $$[$0-1], 'object');
break;
case 58:this.$ = $$[$0];
break;
case 59:this.$ = $$[$0];
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = new yy.Return($$[$0]);
break;
case 63:this.$ = new yy.Return;
break;
case 64:this.$ = new yy.Comment($$[$0]);
break;
case 65:this.$ = new yy.Code($$[$0-3], $$[$0], $$[$0-1]);
break;
case 66:this.$ = new yy.Code([], $$[$0], $$[$0-1]);
break;
case 67:this.$ = 'func';
break;
case 68:this.$ = 'boundfunc';
break;
case 69:this.$ = $$[$0];
break;
case 70:this.$ = $$[$0];
break;
case 71:this.$ = [];
break;
case 72:this.$ = [].concat($$[$0]);
break;
case 73:this.$ = $$[$0-2].concat($$[$0]);
break;
case 74:this.$ = new yy.Param($$[$0]);
break;
case 75:this.$ = new yy.Param($$[$0-1], null, true);
break;
case 76:this.$ = new yy.Param($$[$0-2], $$[$0]);
break;
case 77:this.$ = (function () {
        if ($$[$0].length) {
          $$[$0][0].param_qualifier = $$[$0-1];
        } else {
          $$[$0].param_qualifier = $$[$0-1];
        }
        return $$[$0];
      }());
break;
case 78:this.$ = (function () {
        $$[$0-1].set_type($$[$0-3]);
        return $$[$0-1];
      }());
break;
case 79:this.$ = (function () {
        $$[$0-3].set_type($$[$0-5]);
        $$[$0-1].unshift($$[$0-3]);
        return $$[$0-1];
      }());
break;
case 80:this.$ = $$[$0];
break;
case 81:this.$ = $$[$0];
break;
case 82:this.$ = $$[$0];
break;
case 83:this.$ = $$[$0];
break;
case 84:this.$ = $$[$0];
break;
case 85:this.$ = $$[$0];
break;
case 86:this.$ = new yy.Splat($$[$0-1]);
break;
case 87:this.$ = new yy.Value($$[$0]);
break;
case 88:this.$ = (function () {
        $$[$0].source = $$[$0-1];
        return $$[$0];
      }());
break;
case 89:this.$ = (function () {
        $$[$0].source = $$[$0-1];
        return $$[$0];
      }());
break;
case 90:this.$ = $$[$0];
break;
case 91:this.$ = $$[$0];
break;
case 92:this.$ = new yy.Value($$[$0]);
break;
case 93:this.$ = new yy.Value($$[$0]);
break;
case 94:this.$ = $$[$0];
break;
case 95:this.$ = new yy.Value($$[$0]);
break;
case 96:this.$ = new yy.Value($$[$0]);
break;
case 97:this.$ = new yy.Value($$[$0]);
break;
case 98:this.$ = $$[$0];
break;
case 99:this.$ = new yy.Access($$[$0]);
break;
case 100:this.$ = new yy.Access($$[$0], 'soak');
break;
case 101:this.$ = [new yy.Access(new yy.Literal('prototype')), new yy.Access($$[$0])];
break;
case 102:this.$ = new yy.Access(new yy.Literal('prototype'));
break;
case 103:this.$ = $$[$0];
break;
case 104:this.$ = $$[$0-1];
break;
case 105:this.$ = yy.extend($$[$0], {
          soak: true
        });
break;
case 106:this.$ = new yy.Index($$[$0]);
break;
case 107:this.$ = new yy.Slice($$[$0]);
break;
case 108:this.$ = new yy.Obj($$[$0-2], $$[$0-3].generated);
break;
case 109:this.$ = [];
break;
case 110:this.$ = [$$[$0]];
break;
case 111:this.$ = $$[$0-2].concat($$[$0]);
break;
case 112:this.$ = $$[$0-3].concat($$[$0]);
break;
case 113:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 114:this.$ = new yy.Class;
break;
case 115:this.$ = new yy.Class(null, null, $$[$0]);
break;
case 116:this.$ = new yy.Class(null, $$[$0]);
break;
case 117:this.$ = new yy.Class(null, $$[$0-1], $$[$0]);
break;
case 118:this.$ = new yy.Class($$[$0]);
break;
case 119:this.$ = new yy.Class($$[$0-1], null, $$[$0]);
break;
case 120:this.$ = new yy.Class($$[$0-2], $$[$0]);
break;
case 121:this.$ = new yy.Class($$[$0-3], $$[$0-1], $$[$0]);
break;
case 122:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 123:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 124:this.$ = new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]);
break;
case 125:this.$ = new yy.Call('super', $$[$0]);
break;
case 126:this.$ = false;
break;
case 127:this.$ = true;
break;
case 128:this.$ = [];
break;
case 129:this.$ = $$[$0-2];
break;
case 130:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 131:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 132:this.$ = new yy.Value(new yy.Literal('this'), [new yy.Access($$[$0])], 'this');
break;
case 133:this.$ = new yy.Arr([]);
break;
case 134:this.$ = new yy.Arr($$[$0-2]);
break;
case 135:this.$ = 'inclusive';
break;
case 136:this.$ = 'exclusive';
break;
case 137:this.$ = new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]);
break;
case 138:this.$ = new yy.Range($$[$0-2], $$[$0], $$[$0-1]);
break;
case 139:this.$ = new yy.Range($$[$0-1], null, $$[$0]);
break;
case 140:this.$ = new yy.Range(null, $$[$0], $$[$0-1]);
break;
case 141:this.$ = new yy.Range(null, null, $$[$0]);
break;
case 142:this.$ = [$$[$0]];
break;
case 143:this.$ = $$[$0-2].concat($$[$0]);
break;
case 144:this.$ = $$[$0-3].concat($$[$0]);
break;
case 145:this.$ = $$[$0-2];
break;
case 146:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 147:this.$ = $$[$0];
break;
case 148:this.$ = $$[$0];
break;
case 149:this.$ = $$[$0];
break;
case 150:this.$ = [].concat($$[$0-2], $$[$0]);
break;
case 151:this.$ = new yy.Try($$[$0]);
break;
case 152:this.$ = new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]);
break;
case 153:this.$ = new yy.Try($$[$0-2], null, null, $$[$0]);
break;
case 154:this.$ = new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]);
break;
case 155:this.$ = [$$[$0-1], $$[$0]];
break;
case 156:this.$ = new yy.Throw($$[$0]);
break;
case 157:this.$ = new yy.Parens($$[$0-1]);
break;
case 158:this.$ = new yy.Parens($$[$0-2]);
break;
case 159:this.$ = new yy.While($$[$0]);
break;
case 160:this.$ = new yy.While($$[$0-2], {
          guard: $$[$0]
        });
break;
case 161:this.$ = new yy.While($$[$0], {
          invert: true
        });
break;
case 162:this.$ = new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        });
break;
case 163:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 164:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 165:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 166:this.$ = $$[$0];
break;
case 167:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 168:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 169:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 170:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 171:this.$ = new yy.For($$[$0], $$[$0-1]);
break;
case 172:this.$ = {
          source: new yy.Value($$[$0])
        };
break;
case 173:this.$ = (function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }());
break;
case 174:this.$ = $$[$0];
break;
case 175:this.$ = (function () {
        $$[$0].own = true;
        return $$[$0];
      }());
break;
case 176:this.$ = $$[$0];
break;
case 177:this.$ = new yy.Value($$[$0]);
break;
case 178:this.$ = new yy.Value($$[$0]);
break;
case 179:this.$ = [$$[$0]];
break;
case 180:this.$ = [$$[$0-2], $$[$0]];
break;
case 181:this.$ = {
          source: $$[$0]
        };
break;
case 182:this.$ = {
          source: $$[$0],
          object: true
        };
break;
case 183:this.$ = {
          source: $$[$0-2],
          guard: $$[$0]
        };
break;
case 184:this.$ = {
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        };
break;
case 185:this.$ = {
          source: $$[$0-2],
          step: $$[$0]
        };
break;
case 186:this.$ = {
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        };
break;
case 187:this.$ = {
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        };
break;
case 188:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 189:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 190:this.$ = new yy.Switch(null, $$[$0-1]);
break;
case 191:this.$ = new yy.Switch(null, $$[$0-3], $$[$0-1]);
break;
case 192:this.$ = $$[$0];
break;
case 193:this.$ = $$[$0-1].concat($$[$0]);
break;
case 194:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 195:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 196:this.$ = new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        });
break;
case 197:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 198:this.$ = $$[$0];
break;
case 199:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 200:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 201:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 202:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 203:this.$ = new yy.Op('-', $$[$0]);
break;
case 204:this.$ = new yy.Op('+', $$[$0]);
break;
case 205:this.$ = new yy.Op('--', $$[$0]);
break;
case 206:this.$ = new yy.Op('++', $$[$0]);
break;
case 207:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 208:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 209:this.$ = new yy.Existence($$[$0-1]);
break;
case 210:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 211:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 212:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 213:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 214:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 215:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 216:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 217:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 218:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 219:this.$ = new yy.Extends($$[$0-2], $$[$0]);
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
case 243:this.$ = $$[$0];
break;
case 244:this.$ = $$[$0];
break;
case 245:this.$ = $$[$0];
break;
case 246:this.$ = $$[$0];
break;
case 247:this.$ = $$[$0];
break;
case 248:this.$ = $$[$0];
break;
case 249:this.$ = $$[$0];
break;
case 250:this.$ = $$[$0];
break;
case 251:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,5],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[3]},{1:[2,2],6:[1,110]},{6:[1,111]},{1:[2,4],6:[2,4],19:[2,4]},{4:113,7:4,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],19:[1,112],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,7],6:[2,7],19:[2,7],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,8],6:[2,8],19:[2,8],114:126,115:[1,70],117:[1,71],120:127,121:[1,73],122:74,137:[1,125]},{1:[2,29],6:[2,29],17:[2,29],18:[2,29],19:[2,29],31:[2,29],32:[2,29],63:[2,29],69:[2,29],72:[2,126],73:[2,29],80:129,84:[1,131],85:[1,132],86:[1,133],87:134,88:[1,135],90:[2,29],91:[1,136],96:128,99:[1,130],104:[2,29],113:[2,29],115:[2,29],116:[2,29],117:[2,29],121:[2,29],129:[2,29],137:[2,29],139:[2,29],140:[2,29],143:[2,29],144:[2,29],145:[2,29],146:[2,29],147:[2,29],148:[2,29]},{1:[2,30],6:[2,30],17:[2,30],18:[2,30],19:[2,30],31:[2,30],32:[2,30],63:[2,30],69:[2,30],72:[2,126],73:[2,30],80:138,84:[1,131],85:[1,132],86:[1,133],87:134,88:[1,135],90:[2,30],91:[1,136],96:137,99:[1,130],104:[2,30],113:[2,30],115:[2,30],116:[2,30],117:[2,30],121:[2,30],129:[2,30],137:[2,30],139:[2,30],140:[2,30],143:[2,30],144:[2,30],145:[2,30],146:[2,30],147:[2,30],148:[2,30]},{1:[2,31],6:[2,31],17:[2,31],18:[2,31],19:[2,31],31:[2,31],32:[2,31],63:[2,31],69:[2,31],73:[2,31],90:[2,31],104:[2,31],113:[2,31],115:[2,31],116:[2,31],117:[2,31],121:[2,31],129:[2,31],137:[2,31],139:[2,31],140:[2,31],143:[2,31],144:[2,31],145:[2,31],146:[2,31],147:[2,31],148:[2,31]},{1:[2,32],6:[2,32],17:[2,32],18:[2,32],19:[2,32],31:[2,32],32:[2,32],63:[2,32],69:[2,32],73:[2,32],90:[2,32],104:[2,32],113:[2,32],115:[2,32],116:[2,32],117:[2,32],121:[2,32],129:[2,32],137:[2,32],139:[2,32],140:[2,32],143:[2,32],144:[2,32],145:[2,32],146:[2,32],147:[2,32],148:[2,32]},{1:[2,33],6:[2,33],17:[2,33],18:[2,33],19:[2,33],31:[2,33],32:[2,33],63:[2,33],69:[2,33],73:[2,33],90:[2,33],104:[2,33],113:[2,33],115:[2,33],116:[2,33],117:[2,33],121:[2,33],129:[2,33],137:[2,33],139:[2,33],140:[2,33],143:[2,33],144:[2,33],145:[2,33],146:[2,33],147:[2,33],148:[2,33]},{1:[2,34],6:[2,34],17:[2,34],18:[2,34],19:[2,34],31:[2,34],32:[2,34],63:[2,34],69:[2,34],73:[2,34],90:[2,34],104:[2,34],113:[2,34],115:[2,34],116:[2,34],117:[2,34],121:[2,34],129:[2,34],137:[2,34],139:[2,34],140:[2,34],143:[2,34],144:[2,34],145:[2,34],146:[2,34],147:[2,34],148:[2,34]},{1:[2,35],6:[2,35],17:[2,35],18:[2,35],19:[2,35],31:[2,35],32:[2,35],63:[2,35],69:[2,35],73:[2,35],90:[2,35],104:[2,35],113:[2,35],115:[2,35],116:[2,35],117:[2,35],121:[2,35],129:[2,35],137:[2,35],139:[2,35],140:[2,35],143:[2,35],144:[2,35],145:[2,35],146:[2,35],147:[2,35],148:[2,35]},{1:[2,36],6:[2,36],17:[2,36],18:[2,36],19:[2,36],31:[2,36],32:[2,36],63:[2,36],69:[2,36],73:[2,36],90:[2,36],104:[2,36],113:[2,36],115:[2,36],116:[2,36],117:[2,36],121:[2,36],129:[2,36],137:[2,36],139:[2,36],140:[2,36],143:[2,36],144:[2,36],145:[2,36],146:[2,36],147:[2,36],148:[2,36]},{1:[2,37],6:[2,37],17:[2,37],18:[2,37],19:[2,37],31:[2,37],32:[2,37],63:[2,37],69:[2,37],73:[2,37],90:[2,37],104:[2,37],113:[2,37],115:[2,37],116:[2,37],117:[2,37],121:[2,37],129:[2,37],137:[2,37],139:[2,37],140:[2,37],143:[2,37],144:[2,37],145:[2,37],146:[2,37],147:[2,37],148:[2,37]},{1:[2,38],6:[2,38],17:[2,38],18:[2,38],19:[2,38],31:[2,38],32:[2,38],63:[2,38],69:[2,38],73:[2,38],90:[2,38],104:[2,38],113:[2,38],115:[2,38],116:[2,38],117:[2,38],121:[2,38],129:[2,38],137:[2,38],139:[2,38],140:[2,38],143:[2,38],144:[2,38],145:[2,38],146:[2,38],147:[2,38],148:[2,38]},{1:[2,39],6:[2,39],17:[2,39],18:[2,39],19:[2,39],31:[2,39],32:[2,39],63:[2,39],69:[2,39],73:[2,39],90:[2,39],104:[2,39],113:[2,39],115:[2,39],116:[2,39],117:[2,39],121:[2,39],129:[2,39],137:[2,39],139:[2,39],140:[2,39],143:[2,39],144:[2,39],145:[2,39],146:[2,39],147:[2,39],148:[2,39]},{1:[2,40],6:[2,40],17:[2,40],18:[2,40],19:[2,40],31:[2,40],32:[2,40],63:[2,40],69:[2,40],73:[2,40],90:[2,40],104:[2,40],113:[2,40],115:[2,40],116:[2,40],117:[2,40],121:[2,40],129:[2,40],137:[2,40],139:[2,40],140:[2,40],143:[2,40],144:[2,40],145:[2,40],146:[2,40],147:[2,40],148:[2,40]},{1:[2,41],6:[2,41],17:[2,41],18:[2,41],19:[2,41],31:[2,41],32:[2,41],63:[2,41],69:[2,41],73:[2,41],90:[2,41],104:[2,41],113:[2,41],115:[2,41],116:[2,41],117:[2,41],121:[2,41],129:[2,41],137:[2,41],139:[2,41],140:[2,41],143:[2,41],144:[2,41],145:[2,41],146:[2,41],147:[2,41],148:[2,41]},{1:[2,9],6:[2,9],19:[2,9],115:[2,9],117:[2,9],121:[2,9],137:[2,9]},{1:[2,10],6:[2,10],19:[2,10],115:[2,10],117:[2,10],121:[2,10],137:[2,10]},{1:[2,11],6:[2,11],19:[2,11],115:[2,11],117:[2,11],121:[2,11],137:[2,11]},{14:[1,139]},{1:[2,94],6:[2,94],14:[1,140],17:[2,94],18:[2,94],19:[2,94],31:[2,94],32:[2,94],63:[2,94],69:[2,94],72:[2,94],73:[2,94],84:[2,94],85:[2,94],86:[2,94],88:[2,94],90:[2,94],91:[2,94],99:[2,94],104:[2,94],113:[2,94],115:[2,94],116:[2,94],117:[2,94],121:[2,94],129:[2,94],137:[2,94],139:[2,94],140:[2,94],143:[2,94],144:[2,94],145:[2,94],146:[2,94],147:[2,94],148:[2,94]},{1:[2,95],6:[2,95],17:[2,95],18:[2,95],19:[2,95],31:[2,95],32:[2,95],63:[2,95],69:[2,95],72:[2,95],73:[2,95],84:[2,95],85:[2,95],86:[2,95],88:[2,95],90:[2,95],91:[2,95],99:[2,95],104:[2,95],113:[2,95],115:[2,95],116:[2,95],117:[2,95],121:[2,95],129:[2,95],137:[2,95],139:[2,95],140:[2,95],143:[2,95],144:[2,95],145:[2,95],146:[2,95],147:[2,95],148:[2,95]},{1:[2,96],6:[2,96],17:[2,96],18:[2,96],19:[2,96],31:[2,96],32:[2,96],63:[2,96],69:[2,96],72:[2,96],73:[2,96],84:[2,96],85:[2,96],86:[2,96],88:[2,96],90:[2,96],91:[2,96],99:[2,96],104:[2,96],113:[2,96],115:[2,96],116:[2,96],117:[2,96],121:[2,96],129:[2,96],137:[2,96],139:[2,96],140:[2,96],143:[2,96],144:[2,96],145:[2,96],146:[2,96],147:[2,96],148:[2,96]},{1:[2,97],6:[2,97],17:[2,97],18:[2,97],19:[2,97],31:[2,97],32:[2,97],63:[2,97],69:[2,97],72:[2,97],73:[2,97],84:[2,97],85:[2,97],86:[2,97],88:[2,97],90:[2,97],91:[2,97],99:[2,97],104:[2,97],113:[2,97],115:[2,97],116:[2,97],117:[2,97],121:[2,97],129:[2,97],137:[2,97],139:[2,97],140:[2,97],143:[2,97],144:[2,97],145:[2,97],146:[2,97],147:[2,97],148:[2,97]},{1:[2,98],6:[2,98],17:[2,98],18:[2,98],19:[2,98],31:[2,98],32:[2,98],63:[2,98],69:[2,98],72:[2,98],73:[2,98],84:[2,98],85:[2,98],86:[2,98],88:[2,98],90:[2,98],91:[2,98],99:[2,98],104:[2,98],113:[2,98],115:[2,98],116:[2,98],117:[2,98],121:[2,98],129:[2,98],137:[2,98],139:[2,98],140:[2,98],143:[2,98],144:[2,98],145:[2,98],146:[2,98],147:[2,98],148:[2,98]},{1:[2,124],6:[2,124],17:[2,124],18:[2,124],19:[2,124],31:[2,124],32:[2,124],63:[2,124],69:[2,124],72:[1,142],73:[2,124],84:[2,124],85:[2,124],86:[2,124],88:[2,124],90:[2,124],91:[2,124],97:141,99:[2,124],104:[2,124],113:[2,124],115:[2,124],116:[2,124],117:[2,124],121:[2,124],129:[2,124],137:[2,124],139:[2,124],140:[2,124],143:[2,124],144:[2,124],145:[2,124],146:[2,124],147:[2,124],148:[2,124]},{15:[1,106],26:148,29:[1,155],32:[2,71],46:[1,109],58:149,62:143,63:[2,71],67:144,68:145,70:146,71:147,74:[1,152],75:[1,153],76:150,77:151,102:[1,154],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{5:156,18:[1,5]},{8:157,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:159,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:160,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{15:[1,106],26:67,29:[1,62],33:162,34:163,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:164,58:68,76:54,77:55,79:161,81:27,82:28,83:29,98:[1,30],101:[1,63],102:[1,64],112:[1,61]},{15:[1,106],26:67,29:[1,62],33:162,34:163,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:164,58:68,76:54,77:55,79:165,81:27,82:28,83:29,98:[1,30],101:[1,63],102:[1,64],112:[1,61]},{1:[2,91],6:[2,91],14:[2,91],17:[2,91],18:[2,91],19:[2,91],31:[2,91],32:[2,91],63:[2,91],69:[2,91],72:[2,91],73:[2,91],84:[2,91],85:[2,91],86:[2,91],88:[2,91],90:[2,91],91:[2,91],95:[1,169],99:[2,91],104:[2,91],113:[2,91],115:[2,91],116:[2,91],117:[2,91],121:[2,91],129:[2,91],137:[2,91],139:[2,91],140:[2,91],141:[1,166],142:[1,167],143:[2,91],144:[2,91],145:[2,91],146:[2,91],147:[2,91],148:[2,91],149:[1,168]},{1:[2,198],6:[2,198],17:[2,198],18:[2,198],19:[2,198],31:[2,198],32:[2,198],63:[2,198],69:[2,198],73:[2,198],90:[2,198],104:[2,198],113:[2,198],115:[2,198],116:[2,198],117:[2,198],121:[2,198],129:[2,198],132:[1,170],137:[2,198],139:[2,198],140:[2,198],143:[2,198],144:[2,198],145:[2,198],146:[2,198],147:[2,198],148:[2,198]},{5:171,18:[1,5]},{5:172,18:[1,5]},{1:[2,166],6:[2,166],17:[2,166],18:[2,166],19:[2,166],31:[2,166],32:[2,166],63:[2,166],69:[2,166],73:[2,166],90:[2,166],104:[2,166],113:[2,166],115:[2,166],116:[2,166],117:[2,166],121:[2,166],129:[2,166],137:[2,166],139:[2,166],140:[2,166],143:[2,166],144:[2,166],145:[2,166],146:[2,166],147:[2,166],148:[2,166]},{5:173,18:[1,5]},{8:174,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,175],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,114],5:176,6:[2,114],15:[1,106],17:[2,114],18:[1,5],19:[2,114],26:67,29:[1,62],31:[2,114],32:[2,114],33:162,34:163,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:164,58:68,63:[2,114],69:[2,114],73:[2,114],76:54,77:55,79:178,81:27,82:28,83:29,90:[2,114],95:[1,177],98:[1,30],101:[1,63],102:[1,64],104:[2,114],112:[1,61],113:[2,114],115:[2,114],116:[2,114],117:[2,114],121:[2,114],129:[2,114],137:[2,114],139:[2,114],140:[2,114],143:[2,114],144:[2,114],145:[2,114],146:[2,114],147:[2,114],148:[2,114]},{8:179,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{72:[1,142],97:180},{1:[2,63],6:[2,63],8:181,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],19:[2,63],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[2,63],117:[2,63],118:42,119:[1,72],120:43,121:[2,63],122:74,130:[1,44],135:39,136:[1,69],137:[2,63],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,64],6:[2,64],17:[2,64],18:[2,64],19:[2,64],32:[2,64],115:[2,64],117:[2,64],121:[2,64],137:[2,64]},{14:[2,14]},{14:[2,15]},{14:[2,16]},{14:[2,17]},{1:[2,92],6:[2,92],14:[2,92],17:[2,92],18:[2,92],19:[2,92],31:[2,92],32:[2,92],63:[2,92],69:[2,92],72:[2,92],73:[2,92],84:[2,92],85:[2,92],86:[2,92],88:[2,92],90:[2,92],91:[2,92],99:[2,92],104:[2,92],113:[2,92],115:[2,92],116:[2,92],117:[2,92],121:[2,92],129:[2,92],137:[2,92],139:[2,92],140:[2,92],143:[2,92],144:[2,92],145:[2,92],146:[2,92],147:[2,92],148:[2,92]},{1:[2,93],6:[2,93],14:[2,93],17:[2,93],18:[2,93],19:[2,93],31:[2,93],32:[2,93],63:[2,93],69:[2,93],72:[2,93],73:[2,93],84:[2,93],85:[2,93],86:[2,93],88:[2,93],90:[2,93],91:[2,93],99:[2,93],104:[2,93],113:[2,93],115:[2,93],116:[2,93],117:[2,93],121:[2,93],129:[2,93],137:[2,93],139:[2,93],140:[2,93],143:[2,93],144:[2,93],145:[2,93],146:[2,93],147:[2,93],148:[2,93]},{1:[2,47],6:[2,47],17:[2,47],18:[2,47],19:[2,47],31:[2,47],32:[2,47],63:[2,47],69:[2,47],72:[2,47],73:[2,47],84:[2,47],85:[2,47],86:[2,47],88:[2,47],90:[2,47],91:[2,47],99:[2,47],104:[2,47],113:[2,47],115:[2,47],116:[2,47],117:[2,47],121:[2,47],129:[2,47],137:[2,47],139:[2,47],140:[2,47],143:[2,47],144:[2,47],145:[2,47],146:[2,47],147:[2,47],148:[2,47]},{1:[2,48],6:[2,48],17:[2,48],18:[2,48],19:[2,48],31:[2,48],32:[2,48],63:[2,48],69:[2,48],72:[2,48],73:[2,48],84:[2,48],85:[2,48],86:[2,48],88:[2,48],90:[2,48],91:[2,48],99:[2,48],104:[2,48],113:[2,48],115:[2,48],116:[2,48],117:[2,48],121:[2,48],129:[2,48],137:[2,48],139:[2,48],140:[2,48],143:[2,48],144:[2,48],145:[2,48],146:[2,48],147:[2,48],148:[2,48]},{1:[2,49],6:[2,49],17:[2,49],18:[2,49],19:[2,49],31:[2,49],32:[2,49],63:[2,49],69:[2,49],72:[2,49],73:[2,49],84:[2,49],85:[2,49],86:[2,49],88:[2,49],90:[2,49],91:[2,49],99:[2,49],104:[2,49],113:[2,49],115:[2,49],116:[2,49],117:[2,49],121:[2,49],129:[2,49],137:[2,49],139:[2,49],140:[2,49],143:[2,49],144:[2,49],145:[2,49],146:[2,49],147:[2,49],148:[2,49]},{1:[2,50],6:[2,50],17:[2,50],18:[2,50],19:[2,50],31:[2,50],32:[2,50],63:[2,50],69:[2,50],72:[2,50],73:[2,50],84:[2,50],85:[2,50],86:[2,50],88:[2,50],90:[2,50],91:[2,50],99:[2,50],104:[2,50],113:[2,50],115:[2,50],116:[2,50],117:[2,50],121:[2,50],129:[2,50],137:[2,50],139:[2,50],140:[2,50],143:[2,50],144:[2,50],145:[2,50],146:[2,50],147:[2,50],148:[2,50]},{1:[2,51],6:[2,51],17:[2,51],18:[2,51],19:[2,51],31:[2,51],32:[2,51],63:[2,51],69:[2,51],72:[2,51],73:[2,51],84:[2,51],85:[2,51],86:[2,51],88:[2,51],90:[2,51],91:[2,51],99:[2,51],104:[2,51],113:[2,51],115:[2,51],116:[2,51],117:[2,51],121:[2,51],129:[2,51],137:[2,51],139:[2,51],140:[2,51],143:[2,51],144:[2,51],145:[2,51],146:[2,51],147:[2,51],148:[2,51]},{8:182,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,183],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:184,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,188],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],31:[1,185],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,78:189,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],100:186,101:[1,63],102:[1,64],105:187,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,130],6:[2,130],17:[2,130],18:[2,130],19:[2,130],31:[2,130],32:[2,130],63:[2,130],69:[2,130],72:[2,130],73:[2,130],84:[2,130],85:[2,130],86:[2,130],88:[2,130],90:[2,130],91:[2,130],99:[2,130],104:[2,130],113:[2,130],115:[2,130],116:[2,130],117:[2,130],121:[2,130],129:[2,130],137:[2,130],139:[2,130],140:[2,130],143:[2,130],144:[2,130],145:[2,130],146:[2,130],147:[2,130],148:[2,130]},{1:[2,131],6:[2,131],17:[2,131],18:[2,131],19:[2,131],26:190,31:[2,131],32:[2,131],46:[1,109],63:[2,131],69:[2,131],72:[2,131],73:[2,131],84:[2,131],85:[2,131],86:[2,131],88:[2,131],90:[2,131],91:[2,131],99:[2,131],104:[2,131],113:[2,131],115:[2,131],116:[2,131],117:[2,131],121:[2,131],129:[2,131],137:[2,131],139:[2,131],140:[2,131],143:[2,131],144:[2,131],145:[2,131],146:[2,131],147:[2,131],148:[2,131]},{18:[2,67]},{18:[2,68]},{1:[2,87],6:[2,87],14:[2,87],17:[2,87],18:[2,87],19:[2,87],31:[2,87],32:[2,87],63:[2,87],69:[2,87],72:[2,87],73:[2,87],84:[2,87],85:[2,87],86:[2,87],88:[2,87],90:[2,87],91:[2,87],95:[2,87],99:[2,87],104:[2,87],113:[2,87],115:[2,87],116:[2,87],117:[2,87],121:[2,87],129:[2,87],137:[2,87],139:[2,87],140:[2,87],141:[2,87],142:[2,87],143:[2,87],144:[2,87],145:[2,87],146:[2,87],147:[2,87],148:[2,87],149:[2,87]},{1:[2,90],6:[2,90],14:[2,90],17:[2,90],18:[2,90],19:[2,90],31:[2,90],32:[2,90],63:[2,90],69:[2,90],72:[2,90],73:[2,90],84:[2,90],85:[2,90],86:[2,90],88:[2,90],90:[2,90],91:[2,90],95:[2,90],99:[2,90],104:[2,90],113:[2,90],115:[2,90],116:[2,90],117:[2,90],121:[2,90],129:[2,90],137:[2,90],139:[2,90],140:[2,90],141:[2,90],142:[2,90],143:[2,90],144:[2,90],145:[2,90],146:[2,90],147:[2,90],148:[2,90],149:[2,90]},{8:191,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:192,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:193,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{5:194,8:195,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,5],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{15:[1,106],26:200,29:[1,62],46:[1,109],76:201,77:202,82:196,124:197,125:[1,198],126:199},{123:203,127:[1,204],128:[1,205]},{72:[2,220]},{72:[2,221]},{72:[2,222]},{72:[2,223]},{72:[2,224]},{72:[2,225]},{72:[2,226]},{72:[2,227]},{72:[2,228]},{72:[2,229]},{72:[2,230]},{72:[2,231]},{72:[2,232]},{72:[2,233]},{72:[2,234]},{72:[2,235]},{72:[2,236]},{72:[2,237]},{72:[2,238]},{72:[2,239]},{72:[2,240]},{72:[2,241]},{72:[2,242]},{72:[2,243]},{72:[2,244]},{72:[2,245]},{72:[2,246]},{72:[2,247]},{72:[2,248]},{72:[2,249]},{72:[2,250]},{6:[2,109],11:209,17:[2,109],18:[2,109],26:210,32:[2,109],46:[1,109],47:211,48:[1,107],49:[1,108],56:207,57:208,58:212,60:[1,49],93:206,102:[1,154]},{1:[2,45],6:[2,45],17:[2,45],18:[2,45],19:[2,45],27:[2,45],31:[2,45],32:[2,45],63:[2,45],69:[2,45],72:[2,45],73:[2,45],84:[2,45],85:[2,45],86:[2,45],88:[2,45],90:[2,45],91:[2,45],99:[2,45],104:[2,45],113:[2,45],115:[2,45],116:[2,45],117:[2,45],121:[2,45],129:[2,45],137:[2,45],139:[2,45],140:[2,45],143:[2,45],144:[2,45],145:[2,45],146:[2,45],147:[2,45],148:[2,45]},{1:[2,46],6:[2,46],17:[2,46],18:[2,46],19:[2,46],27:[2,46],31:[2,46],32:[2,46],63:[2,46],69:[2,46],72:[2,46],73:[2,46],84:[2,46],85:[2,46],86:[2,46],88:[2,46],90:[2,46],91:[2,46],99:[2,46],104:[2,46],113:[2,46],115:[2,46],116:[2,46],117:[2,46],121:[2,46],129:[2,46],137:[2,46],139:[2,46],140:[2,46],143:[2,46],144:[2,46],145:[2,46],146:[2,46],147:[2,46],148:[2,46]},{1:[2,44],6:[2,44],14:[2,44],17:[2,44],18:[2,44],19:[2,44],27:[2,44],31:[2,44],32:[2,44],63:[2,44],69:[2,44],72:[2,44],73:[2,44],84:[2,44],85:[2,44],86:[2,44],88:[2,44],90:[2,44],91:[2,44],95:[2,44],99:[2,44],104:[2,44],113:[2,44],115:[2,44],116:[2,44],117:[2,44],121:[2,44],127:[2,44],128:[2,44],129:[2,44],137:[2,44],139:[2,44],140:[2,44],141:[2,44],142:[2,44],143:[2,44],144:[2,44],145:[2,44],146:[2,44],147:[2,44],148:[2,44],149:[2,44]},{1:[2,6],6:[2,6],7:213,8:6,9:7,10:21,11:22,12:[1,23],13:24,15:[1,106],19:[2,6],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,3]},{1:[2,42],6:[2,42],17:[2,42],18:[2,42],19:[2,42],31:[2,42],32:[2,42],63:[2,42],69:[2,42],73:[2,42],90:[2,42],104:[2,42],109:[2,42],110:[2,42],113:[2,42],115:[2,42],116:[2,42],117:[2,42],121:[2,42],129:[2,42],132:[2,42],134:[2,42],137:[2,42],139:[2,42],140:[2,42],143:[2,42],144:[2,42],145:[2,42],146:[2,42],147:[2,42],148:[2,42]},{6:[1,110],19:[1,214]},{1:[2,209],6:[2,209],17:[2,209],18:[2,209],19:[2,209],31:[2,209],32:[2,209],63:[2,209],69:[2,209],73:[2,209],90:[2,209],104:[2,209],113:[2,209],115:[2,209],116:[2,209],117:[2,209],121:[2,209],129:[2,209],137:[2,209],139:[2,209],140:[2,209],143:[2,209],144:[2,209],145:[2,209],146:[2,209],147:[2,209],148:[2,209]},{8:215,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:216,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:217,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:218,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:219,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:220,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:221,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:222,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,165],6:[2,165],17:[2,165],18:[2,165],19:[2,165],31:[2,165],32:[2,165],63:[2,165],69:[2,165],73:[2,165],90:[2,165],104:[2,165],113:[2,165],115:[2,165],116:[2,165],117:[2,165],121:[2,165],129:[2,165],137:[2,165],139:[2,165],140:[2,165],143:[2,165],144:[2,165],145:[2,165],146:[2,165],147:[2,165],148:[2,165]},{1:[2,170],6:[2,170],17:[2,170],18:[2,170],19:[2,170],31:[2,170],32:[2,170],63:[2,170],69:[2,170],73:[2,170],90:[2,170],104:[2,170],113:[2,170],115:[2,170],116:[2,170],117:[2,170],121:[2,170],129:[2,170],137:[2,170],139:[2,170],140:[2,170],143:[2,170],144:[2,170],145:[2,170],146:[2,170],147:[2,170],148:[2,170]},{8:223,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,164],6:[2,164],17:[2,164],18:[2,164],19:[2,164],31:[2,164],32:[2,164],63:[2,164],69:[2,164],73:[2,164],90:[2,164],104:[2,164],113:[2,164],115:[2,164],116:[2,164],117:[2,164],121:[2,164],129:[2,164],137:[2,164],139:[2,164],140:[2,164],143:[2,164],144:[2,164],145:[2,164],146:[2,164],147:[2,164],148:[2,164]},{1:[2,169],6:[2,169],17:[2,169],18:[2,169],19:[2,169],31:[2,169],32:[2,169],63:[2,169],69:[2,169],73:[2,169],90:[2,169],104:[2,169],113:[2,169],115:[2,169],116:[2,169],117:[2,169],121:[2,169],129:[2,169],137:[2,169],139:[2,169],140:[2,169],143:[2,169],144:[2,169],145:[2,169],146:[2,169],147:[2,169],148:[2,169]},{72:[1,142],97:224},{1:[2,88],6:[2,88],14:[2,88],17:[2,88],18:[2,88],19:[2,88],31:[2,88],32:[2,88],63:[2,88],69:[2,88],72:[2,88],73:[2,88],84:[2,88],85:[2,88],86:[2,88],88:[2,88],90:[2,88],91:[2,88],95:[2,88],99:[2,88],104:[2,88],113:[2,88],115:[2,88],116:[2,88],117:[2,88],121:[2,88],129:[2,88],137:[2,88],139:[2,88],140:[2,88],141:[2,88],142:[2,88],143:[2,88],144:[2,88],145:[2,88],146:[2,88],147:[2,88],148:[2,88],149:[2,88]},{72:[2,127]},{26:225,46:[1,109]},{26:226,46:[1,109]},{1:[2,102],6:[2,102],14:[2,102],17:[2,102],18:[2,102],19:[2,102],26:227,31:[2,102],32:[2,102],46:[1,109],63:[2,102],69:[2,102],72:[2,102],73:[2,102],84:[2,102],85:[2,102],86:[2,102],88:[2,102],90:[2,102],91:[2,102],95:[2,102],99:[2,102],104:[2,102],113:[2,102],115:[2,102],116:[2,102],117:[2,102],121:[2,102],129:[2,102],137:[2,102],139:[2,102],140:[2,102],141:[2,102],142:[2,102],143:[2,102],144:[2,102],145:[2,102],146:[2,102],147:[2,102],148:[2,102],149:[2,102]},{1:[2,103],6:[2,103],14:[2,103],17:[2,103],18:[2,103],19:[2,103],31:[2,103],32:[2,103],63:[2,103],69:[2,103],72:[2,103],73:[2,103],84:[2,103],85:[2,103],86:[2,103],88:[2,103],90:[2,103],91:[2,103],95:[2,103],99:[2,103],104:[2,103],113:[2,103],115:[2,103],116:[2,103],117:[2,103],121:[2,103],129:[2,103],137:[2,103],139:[2,103],140:[2,103],141:[2,103],142:[2,103],143:[2,103],144:[2,103],145:[2,103],146:[2,103],147:[2,103],148:[2,103],149:[2,103]},{8:229,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],69:[1,233],71:47,76:54,77:55,79:38,81:27,82:28,83:29,89:228,92:230,94:[1,45],98:[1,30],101:[1,63],102:[1,64],103:231,104:[1,232],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{87:234,88:[1,135],91:[1,136]},{72:[1,142],97:235},{1:[2,89],6:[2,89],14:[2,89],17:[2,89],18:[2,89],19:[2,89],31:[2,89],32:[2,89],63:[2,89],69:[2,89],72:[2,89],73:[2,89],84:[2,89],85:[2,89],86:[2,89],88:[2,89],90:[2,89],91:[2,89],95:[2,89],99:[2,89],104:[2,89],113:[2,89],115:[2,89],116:[2,89],117:[2,89],121:[2,89],129:[2,89],137:[2,89],139:[2,89],140:[2,89],141:[2,89],142:[2,89],143:[2,89],144:[2,89],145:[2,89],146:[2,89],147:[2,89],148:[2,89],149:[2,89]},{15:[1,236],18:[1,237]},{6:[1,239],8:238,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,240],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,125],6:[2,125],17:[2,125],18:[2,125],19:[2,125],31:[2,125],32:[2,125],63:[2,125],69:[2,125],72:[2,125],73:[2,125],84:[2,125],85:[2,125],86:[2,125],88:[2,125],90:[2,125],91:[2,125],99:[2,125],104:[2,125],113:[2,125],115:[2,125],116:[2,125],117:[2,125],121:[2,125],129:[2,125],137:[2,125],139:[2,125],140:[2,125],143:[2,125],144:[2,125],145:[2,125],146:[2,125],147:[2,125],148:[2,125]},{8:243,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,188],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,73:[1,241],76:54,77:55,78:189,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],100:242,101:[1,63],102:[1,64],105:187,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{32:[1,245],63:[1,244]},{32:[2,72],63:[2,72],73:[2,72]},{14:[1,247],32:[2,74],63:[2,74],69:[1,246],73:[2,74]},{15:[1,106],26:148,29:[1,155],46:[1,109],58:149,67:248,68:145,70:146,71:147,74:[1,152],75:[1,153],76:150,77:151,102:[1,154],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{72:[1,249]},{14:[2,82],32:[2,82],63:[2,82],69:[2,82],73:[2,82]},{14:[2,83],32:[2,83],63:[2,83],69:[2,83],73:[2,83]},{14:[2,84],32:[2,84],63:[2,84],69:[2,84],73:[2,84]},{14:[2,85],32:[2,85],63:[2,85],69:[2,85],73:[2,85]},{15:[2,80],29:[2,80],46:[2,80],74:[2,80],75:[2,80],102:[2,80],150:[2,80],151:[2,80],152:[2,80],153:[2,80],154:[2,80],155:[2,80],156:[2,80],157:[2,80],158:[2,80],159:[2,80],160:[2,80],161:[2,80],162:[2,80],163:[2,80],164:[2,80],165:[2,80],166:[2,80],167:[2,80],168:[2,80],169:[2,80],170:[2,80],171:[2,80],172:[2,80],173:[2,80],174:[2,80],175:[2,80],176:[2,80],177:[2,80],178:[2,80],179:[2,80],180:[2,80]},{15:[2,81],29:[2,81],46:[2,81],74:[2,81],75:[2,81],102:[2,81],150:[2,81],151:[2,81],152:[2,81],153:[2,81],154:[2,81],155:[2,81],156:[2,81],157:[2,81],158:[2,81],159:[2,81],160:[2,81],161:[2,81],162:[2,81],163:[2,81],164:[2,81],165:[2,81],166:[2,81],167:[2,81],168:[2,81],169:[2,81],170:[2,81],171:[2,81],172:[2,81],173:[2,81],174:[2,81],175:[2,81],176:[2,81],177:[2,81],178:[2,81],179:[2,81],180:[2,81]},{26:190,46:[1,109]},{8:243,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,188],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],31:[1,185],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,78:189,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],100:186,101:[1,63],102:[1,64],105:187,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,66],6:[2,66],17:[2,66],18:[2,66],19:[2,66],31:[2,66],32:[2,66],63:[2,66],69:[2,66],73:[2,66],90:[2,66],104:[2,66],113:[2,66],115:[2,66],116:[2,66],117:[2,66],121:[2,66],129:[2,66],137:[2,66],139:[2,66],140:[2,66],143:[2,66],144:[2,66],145:[2,66],146:[2,66],147:[2,66],148:[2,66]},{1:[2,202],6:[2,202],17:[2,202],18:[2,202],19:[2,202],31:[2,202],32:[2,202],63:[2,202],69:[2,202],73:[2,202],90:[2,202],104:[2,202],113:[2,202],114:123,115:[2,202],116:[2,202],117:[2,202],120:124,121:[2,202],122:74,129:[2,202],137:[2,202],139:[2,202],140:[2,202],143:[1,114],144:[2,202],145:[2,202],146:[2,202],147:[2,202],148:[2,202]},{114:126,115:[1,70],117:[1,71],120:127,121:[1,73],122:74,137:[1,125]},{1:[2,203],6:[2,203],17:[2,203],18:[2,203],19:[2,203],31:[2,203],32:[2,203],63:[2,203],69:[2,203],73:[2,203],90:[2,203],104:[2,203],113:[2,203],114:123,115:[2,203],116:[2,203],117:[2,203],120:124,121:[2,203],122:74,129:[2,203],137:[2,203],139:[2,203],140:[2,203],143:[1,114],144:[2,203],145:[2,203],146:[2,203],147:[2,203],148:[2,203]},{1:[2,204],6:[2,204],17:[2,204],18:[2,204],19:[2,204],31:[2,204],32:[2,204],63:[2,204],69:[2,204],73:[2,204],90:[2,204],104:[2,204],113:[2,204],114:123,115:[2,204],116:[2,204],117:[2,204],120:124,121:[2,204],122:74,129:[2,204],137:[2,204],139:[2,204],140:[2,204],143:[1,114],144:[2,204],145:[2,204],146:[2,204],147:[2,204],148:[2,204]},{1:[2,205],6:[2,205],17:[2,205],18:[2,205],19:[2,205],31:[2,205],32:[2,205],63:[2,205],69:[2,205],72:[2,91],73:[2,205],84:[2,91],85:[2,91],86:[2,91],88:[2,91],90:[2,205],91:[2,91],99:[2,91],104:[2,205],113:[2,205],115:[2,205],116:[2,205],117:[2,205],121:[2,205],129:[2,205],137:[2,205],139:[2,205],140:[2,205],143:[2,205],144:[2,205],145:[2,205],146:[2,205],147:[2,205],148:[2,205]},{72:[2,126],80:129,84:[1,131],85:[1,132],86:[1,133],87:134,88:[1,135],91:[1,136],96:128,99:[1,130]},{72:[2,126],80:138,84:[1,131],85:[1,132],86:[1,133],87:134,88:[1,135],91:[1,136],96:137,99:[1,130]},{72:[2,94],84:[2,94],85:[2,94],86:[2,94],88:[2,94],91:[2,94],99:[2,94]},{1:[2,206],6:[2,206],17:[2,206],18:[2,206],19:[2,206],31:[2,206],32:[2,206],63:[2,206],69:[2,206],72:[2,91],73:[2,206],84:[2,91],85:[2,91],86:[2,91],88:[2,91],90:[2,206],91:[2,91],99:[2,91],104:[2,206],113:[2,206],115:[2,206],116:[2,206],117:[2,206],121:[2,206],129:[2,206],137:[2,206],139:[2,206],140:[2,206],143:[2,206],144:[2,206],145:[2,206],146:[2,206],147:[2,206],148:[2,206]},{1:[2,207],6:[2,207],17:[2,207],18:[2,207],19:[2,207],31:[2,207],32:[2,207],63:[2,207],69:[2,207],73:[2,207],90:[2,207],104:[2,207],113:[2,207],115:[2,207],116:[2,207],117:[2,207],121:[2,207],129:[2,207],137:[2,207],139:[2,207],140:[2,207],143:[2,207],144:[2,207],145:[2,207],146:[2,207],147:[2,207],148:[2,207]},{1:[2,208],6:[2,208],17:[2,208],18:[2,208],19:[2,208],31:[2,208],32:[2,208],63:[2,208],69:[2,208],73:[2,208],90:[2,208],104:[2,208],113:[2,208],115:[2,208],116:[2,208],117:[2,208],121:[2,208],129:[2,208],137:[2,208],139:[2,208],140:[2,208],143:[2,208],144:[2,208],145:[2,208],146:[2,208],147:[2,208],148:[2,208]},{8:250,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,251],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:252,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{5:253,18:[1,5],136:[1,254]},{1:[2,151],6:[2,151],17:[2,151],18:[2,151],19:[2,151],31:[2,151],32:[2,151],63:[2,151],69:[2,151],73:[2,151],90:[2,151],104:[2,151],108:255,109:[1,256],110:[1,257],113:[2,151],115:[2,151],116:[2,151],117:[2,151],121:[2,151],129:[2,151],137:[2,151],139:[2,151],140:[2,151],143:[2,151],144:[2,151],145:[2,151],146:[2,151],147:[2,151],148:[2,151]},{1:[2,163],6:[2,163],17:[2,163],18:[2,163],19:[2,163],31:[2,163],32:[2,163],63:[2,163],69:[2,163],73:[2,163],90:[2,163],104:[2,163],113:[2,163],115:[2,163],116:[2,163],117:[2,163],121:[2,163],129:[2,163],137:[2,163],139:[2,163],140:[2,163],143:[2,163],144:[2,163],145:[2,163],146:[2,163],147:[2,163],148:[2,163]},{1:[2,171],6:[2,171],17:[2,171],18:[2,171],19:[2,171],31:[2,171],32:[2,171],63:[2,171],69:[2,171],73:[2,171],90:[2,171],104:[2,171],113:[2,171],115:[2,171],116:[2,171],117:[2,171],121:[2,171],129:[2,171],137:[2,171],139:[2,171],140:[2,171],143:[2,171],144:[2,171],145:[2,171],146:[2,171],147:[2,171],148:[2,171]},{18:[1,258],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{131:259,133:260,134:[1,261]},{1:[2,115],6:[2,115],17:[2,115],18:[2,115],19:[2,115],31:[2,115],32:[2,115],63:[2,115],69:[2,115],73:[2,115],90:[2,115],104:[2,115],113:[2,115],115:[2,115],116:[2,115],117:[2,115],121:[2,115],129:[2,115],137:[2,115],139:[2,115],140:[2,115],143:[2,115],144:[2,115],145:[2,115],146:[2,115],147:[2,115],148:[2,115]},{8:262,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,118],5:263,6:[2,118],17:[2,118],18:[1,5],19:[2,118],31:[2,118],32:[2,118],63:[2,118],69:[2,118],72:[2,91],73:[2,118],84:[2,91],85:[2,91],86:[2,91],88:[2,91],90:[2,118],91:[2,91],95:[1,264],99:[2,91],104:[2,118],113:[2,118],115:[2,118],116:[2,118],117:[2,118],121:[2,118],129:[2,118],137:[2,118],139:[2,118],140:[2,118],143:[2,118],144:[2,118],145:[2,118],146:[2,118],147:[2,118],148:[2,118]},{1:[2,156],6:[2,156],17:[2,156],18:[2,156],19:[2,156],31:[2,156],32:[2,156],63:[2,156],69:[2,156],73:[2,156],90:[2,156],104:[2,156],113:[2,156],114:123,115:[2,156],116:[2,156],117:[2,156],120:124,121:[2,156],122:74,129:[2,156],137:[2,156],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,251],6:[2,251],17:[2,251],18:[2,251],19:[2,251],31:[2,251],32:[2,251],63:[2,251],69:[2,251],73:[2,251],90:[2,251],104:[2,251],113:[2,251],115:[2,251],116:[2,251],117:[2,251],121:[2,251],129:[2,251],137:[2,251],139:[2,251],140:[2,251],143:[2,251],144:[2,251],145:[2,251],146:[2,251],147:[2,251],148:[2,251]},{1:[2,62],6:[2,62],19:[2,62],114:123,115:[2,62],117:[2,62],120:124,121:[2,62],122:74,137:[2,62],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{113:[1,265],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{8:266,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{6:[2,147],18:[2,147],31:[2,147],32:[2,147],69:[1,268],103:267,104:[1,232],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,133],6:[2,133],14:[2,133],17:[2,133],18:[2,133],19:[2,133],31:[2,133],32:[2,133],63:[2,133],69:[2,133],72:[2,133],73:[2,133],84:[2,133],85:[2,133],86:[2,133],88:[2,133],90:[2,133],91:[2,133],99:[2,133],104:[2,133],113:[2,133],115:[2,133],116:[2,133],117:[2,133],121:[2,133],127:[2,133],128:[2,133],129:[2,133],137:[2,133],139:[2,133],140:[2,133],143:[2,133],144:[2,133],145:[2,133],146:[2,133],147:[2,133],148:[2,133]},{6:[2,69],18:[2,69],25:269,31:[2,69],32:[1,270]},{6:[2,142],18:[2,142],19:[2,142],31:[2,142],32:[2,142],73:[2,142]},{8:243,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,188],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,78:189,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],100:271,101:[1,63],102:[1,64],105:187,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{6:[2,148],18:[2,148],19:[2,148],31:[2,148],32:[2,148],73:[2,148]},{1:[2,132],6:[2,132],14:[2,132],17:[2,132],18:[2,132],19:[2,132],27:[2,132],31:[2,132],32:[2,132],63:[2,132],69:[2,132],72:[2,132],73:[2,132],84:[2,132],85:[2,132],86:[2,132],88:[2,132],90:[2,132],91:[2,132],95:[2,132],99:[2,132],104:[2,132],113:[2,132],115:[2,132],116:[2,132],117:[2,132],121:[2,132],129:[2,132],137:[2,132],139:[2,132],140:[2,132],141:[2,132],142:[2,132],143:[2,132],144:[2,132],145:[2,132],146:[2,132],147:[2,132],148:[2,132],149:[2,132]},{5:272,18:[1,5],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,159],6:[2,159],17:[2,159],18:[2,159],19:[2,159],31:[2,159],32:[2,159],63:[2,159],69:[2,159],73:[2,159],90:[2,159],104:[2,159],113:[2,159],114:123,115:[1,70],116:[1,273],117:[1,71],120:124,121:[1,73],122:74,129:[2,159],137:[2,159],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,161],6:[2,161],17:[2,161],18:[2,161],19:[2,161],31:[2,161],32:[2,161],63:[2,161],69:[2,161],73:[2,161],90:[2,161],104:[2,161],113:[2,161],114:123,115:[1,70],116:[1,274],117:[1,71],120:124,121:[1,73],122:74,129:[2,161],137:[2,161],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,167],6:[2,167],17:[2,167],18:[2,167],19:[2,167],31:[2,167],32:[2,167],63:[2,167],69:[2,167],73:[2,167],90:[2,167],104:[2,167],113:[2,167],115:[2,167],116:[2,167],117:[2,167],121:[2,167],129:[2,167],137:[2,167],139:[2,167],140:[2,167],143:[2,167],144:[2,167],145:[2,167],146:[2,167],147:[2,167],148:[2,167]},{1:[2,168],6:[2,168],17:[2,168],18:[2,168],19:[2,168],31:[2,168],32:[2,168],63:[2,168],69:[2,168],73:[2,168],90:[2,168],104:[2,168],113:[2,168],114:123,115:[1,70],116:[2,168],117:[1,71],120:124,121:[1,73],122:74,129:[2,168],137:[2,168],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,172],6:[2,172],17:[2,172],18:[2,172],19:[2,172],31:[2,172],32:[2,172],63:[2,172],69:[2,172],73:[2,172],90:[2,172],104:[2,172],113:[2,172],115:[2,172],116:[2,172],117:[2,172],121:[2,172],129:[2,172],137:[2,172],139:[2,172],140:[2,172],143:[2,172],144:[2,172],145:[2,172],146:[2,172],147:[2,172],148:[2,172]},{127:[2,174],128:[2,174]},{15:[1,106],26:200,29:[1,155],46:[1,109],76:201,77:202,124:275,126:199},{32:[1,276],127:[2,179],128:[2,179]},{32:[2,176],127:[2,176],128:[2,176]},{32:[2,177],127:[2,177],128:[2,177]},{32:[2,178],127:[2,178],128:[2,178]},{1:[2,173],6:[2,173],17:[2,173],18:[2,173],19:[2,173],31:[2,173],32:[2,173],63:[2,173],69:[2,173],73:[2,173],90:[2,173],104:[2,173],113:[2,173],115:[2,173],116:[2,173],117:[2,173],121:[2,173],129:[2,173],137:[2,173],139:[2,173],140:[2,173],143:[2,173],144:[2,173],145:[2,173],146:[2,173],147:[2,173],148:[2,173]},{8:277,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:278,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{6:[2,69],17:[2,69],18:[2,69],25:279,32:[1,280]},{6:[2,110],17:[2,110],18:[2,110],19:[2,110],32:[2,110]},{6:[2,55],17:[2,55],18:[2,55],19:[2,55],27:[1,281],32:[2,55]},{6:[2,58],17:[2,58],18:[2,58],19:[2,58],32:[2,58]},{6:[2,59],17:[2,59],18:[2,59],19:[2,59],27:[2,59],32:[2,59]},{6:[2,60],17:[2,60],18:[2,60],19:[2,60],27:[2,60],32:[2,60]},{6:[2,61],17:[2,61],18:[2,61],19:[2,61],27:[2,61],32:[2,61]},{1:[2,5],6:[2,5],19:[2,5]},{1:[2,43],6:[2,43],17:[2,43],18:[2,43],19:[2,43],31:[2,43],32:[2,43],63:[2,43],69:[2,43],73:[2,43],90:[2,43],104:[2,43],109:[2,43],110:[2,43],113:[2,43],115:[2,43],116:[2,43],117:[2,43],121:[2,43],129:[2,43],132:[2,43],134:[2,43],137:[2,43],139:[2,43],140:[2,43],143:[2,43],144:[2,43],145:[2,43],146:[2,43],147:[2,43],148:[2,43]},{1:[2,210],6:[2,210],17:[2,210],18:[2,210],19:[2,210],31:[2,210],32:[2,210],63:[2,210],69:[2,210],73:[2,210],90:[2,210],104:[2,210],113:[2,210],114:123,115:[2,210],116:[2,210],117:[2,210],120:124,121:[2,210],122:74,129:[2,210],137:[2,210],139:[2,210],140:[2,210],143:[1,114],144:[1,117],145:[2,210],146:[2,210],147:[2,210],148:[2,210]},{1:[2,211],6:[2,211],17:[2,211],18:[2,211],19:[2,211],31:[2,211],32:[2,211],63:[2,211],69:[2,211],73:[2,211],90:[2,211],104:[2,211],113:[2,211],114:123,115:[2,211],116:[2,211],117:[2,211],120:124,121:[2,211],122:74,129:[2,211],137:[2,211],139:[2,211],140:[2,211],143:[1,114],144:[1,117],145:[2,211],146:[2,211],147:[2,211],148:[2,211]},{1:[2,212],6:[2,212],17:[2,212],18:[2,212],19:[2,212],31:[2,212],32:[2,212],63:[2,212],69:[2,212],73:[2,212],90:[2,212],104:[2,212],113:[2,212],114:123,115:[2,212],116:[2,212],117:[2,212],120:124,121:[2,212],122:74,129:[2,212],137:[2,212],139:[2,212],140:[2,212],143:[1,114],144:[2,212],145:[2,212],146:[2,212],147:[2,212],148:[2,212]},{1:[2,213],6:[2,213],17:[2,213],18:[2,213],19:[2,213],31:[2,213],32:[2,213],63:[2,213],69:[2,213],73:[2,213],90:[2,213],104:[2,213],113:[2,213],114:123,115:[2,213],116:[2,213],117:[2,213],120:124,121:[2,213],122:74,129:[2,213],137:[2,213],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[2,213],146:[2,213],147:[2,213],148:[2,213]},{1:[2,214],6:[2,214],17:[2,214],18:[2,214],19:[2,214],31:[2,214],32:[2,214],63:[2,214],69:[2,214],73:[2,214],90:[2,214],104:[2,214],113:[2,214],114:123,115:[2,214],116:[2,214],117:[2,214],120:124,121:[2,214],122:74,129:[2,214],137:[2,214],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[2,214],147:[2,214],148:[1,121]},{1:[2,215],6:[2,215],17:[2,215],18:[2,215],19:[2,215],31:[2,215],32:[2,215],63:[2,215],69:[2,215],73:[2,215],90:[2,215],104:[2,215],113:[2,215],114:123,115:[2,215],116:[2,215],117:[2,215],120:124,121:[2,215],122:74,129:[2,215],137:[2,215],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[2,215],148:[1,121]},{1:[2,216],6:[2,216],17:[2,216],18:[2,216],19:[2,216],31:[2,216],32:[2,216],63:[2,216],69:[2,216],73:[2,216],90:[2,216],104:[2,216],113:[2,216],114:123,115:[2,216],116:[2,216],117:[2,216],120:124,121:[2,216],122:74,129:[2,216],137:[2,216],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[2,216],147:[2,216],148:[2,216]},{1:[2,201],6:[2,201],17:[2,201],18:[2,201],19:[2,201],31:[2,201],32:[2,201],63:[2,201],69:[2,201],73:[2,201],90:[2,201],104:[2,201],113:[2,201],114:123,115:[1,70],116:[2,201],117:[1,71],120:124,121:[1,73],122:74,129:[2,201],137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,200],6:[2,200],17:[2,200],18:[2,200],19:[2,200],31:[2,200],32:[2,200],63:[2,200],69:[2,200],73:[2,200],90:[2,200],104:[2,200],113:[2,200],114:123,115:[1,70],116:[2,200],117:[1,71],120:124,121:[1,73],122:74,129:[2,200],137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,122],6:[2,122],17:[2,122],18:[2,122],19:[2,122],31:[2,122],32:[2,122],63:[2,122],69:[2,122],72:[2,122],73:[2,122],84:[2,122],85:[2,122],86:[2,122],88:[2,122],90:[2,122],91:[2,122],99:[2,122],104:[2,122],113:[2,122],115:[2,122],116:[2,122],117:[2,122],121:[2,122],129:[2,122],137:[2,122],139:[2,122],140:[2,122],143:[2,122],144:[2,122],145:[2,122],146:[2,122],147:[2,122],148:[2,122]},{1:[2,99],6:[2,99],14:[2,99],17:[2,99],18:[2,99],19:[2,99],31:[2,99],32:[2,99],63:[2,99],69:[2,99],72:[2,99],73:[2,99],84:[2,99],85:[2,99],86:[2,99],88:[2,99],90:[2,99],91:[2,99],95:[2,99],99:[2,99],104:[2,99],113:[2,99],115:[2,99],116:[2,99],117:[2,99],121:[2,99],129:[2,99],137:[2,99],139:[2,99],140:[2,99],141:[2,99],142:[2,99],143:[2,99],144:[2,99],145:[2,99],146:[2,99],147:[2,99],148:[2,99],149:[2,99]},{1:[2,100],6:[2,100],14:[2,100],17:[2,100],18:[2,100],19:[2,100],31:[2,100],32:[2,100],63:[2,100],69:[2,100],72:[2,100],73:[2,100],84:[2,100],85:[2,100],86:[2,100],88:[2,100],90:[2,100],91:[2,100],95:[2,100],99:[2,100],104:[2,100],113:[2,100],115:[2,100],116:[2,100],117:[2,100],121:[2,100],129:[2,100],137:[2,100],139:[2,100],140:[2,100],141:[2,100],142:[2,100],143:[2,100],144:[2,100],145:[2,100],146:[2,100],147:[2,100],148:[2,100],149:[2,100]},{1:[2,101],6:[2,101],14:[2,101],17:[2,101],18:[2,101],19:[2,101],31:[2,101],32:[2,101],63:[2,101],69:[2,101],72:[2,101],73:[2,101],84:[2,101],85:[2,101],86:[2,101],88:[2,101],90:[2,101],91:[2,101],95:[2,101],99:[2,101],104:[2,101],113:[2,101],115:[2,101],116:[2,101],117:[2,101],121:[2,101],129:[2,101],137:[2,101],139:[2,101],140:[2,101],141:[2,101],142:[2,101],143:[2,101],144:[2,101],145:[2,101],146:[2,101],147:[2,101],148:[2,101],149:[2,101]},{90:[1,282]},{69:[1,233],90:[2,106],103:283,104:[1,232],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{90:[2,107]},{8:284,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,90:[2,141],94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{12:[2,135],15:[2,135],20:[2,135],21:[2,135],22:[2,135],23:[2,135],29:[2,135],46:[2,135],48:[2,135],49:[2,135],51:[2,135],52:[2,135],53:[2,135],54:[2,135],59:[2,135],60:[2,135],61:[2,135],65:[2,135],66:[2,135],90:[2,135],94:[2,135],98:[2,135],101:[2,135],102:[2,135],107:[2,135],111:[2,135],112:[2,135],115:[2,135],117:[2,135],119:[2,135],121:[2,135],130:[2,135],136:[2,135],138:[2,135],139:[2,135],140:[2,135],141:[2,135],142:[2,135],150:[2,135],151:[2,135],152:[2,135],153:[2,135],154:[2,135],155:[2,135],156:[2,135],157:[2,135],158:[2,135],159:[2,135],160:[2,135],161:[2,135],162:[2,135],163:[2,135],164:[2,135],165:[2,135],166:[2,135],167:[2,135],168:[2,135],169:[2,135],170:[2,135],171:[2,135],172:[2,135],173:[2,135],174:[2,135],175:[2,135],176:[2,135],177:[2,135],178:[2,135],179:[2,135],180:[2,135]},{12:[2,136],15:[2,136],20:[2,136],21:[2,136],22:[2,136],23:[2,136],29:[2,136],46:[2,136],48:[2,136],49:[2,136],51:[2,136],52:[2,136],53:[2,136],54:[2,136],59:[2,136],60:[2,136],61:[2,136],65:[2,136],66:[2,136],90:[2,136],94:[2,136],98:[2,136],101:[2,136],102:[2,136],107:[2,136],111:[2,136],112:[2,136],115:[2,136],117:[2,136],119:[2,136],121:[2,136],130:[2,136],136:[2,136],138:[2,136],139:[2,136],140:[2,136],141:[2,136],142:[2,136],150:[2,136],151:[2,136],152:[2,136],153:[2,136],154:[2,136],155:[2,136],156:[2,136],157:[2,136],158:[2,136],159:[2,136],160:[2,136],161:[2,136],162:[2,136],163:[2,136],164:[2,136],165:[2,136],166:[2,136],167:[2,136],168:[2,136],169:[2,136],170:[2,136],171:[2,136],172:[2,136],173:[2,136],174:[2,136],175:[2,136],176:[2,136],177:[2,136],178:[2,136],179:[2,136],180:[2,136]},{1:[2,105],6:[2,105],14:[2,105],17:[2,105],18:[2,105],19:[2,105],31:[2,105],32:[2,105],63:[2,105],69:[2,105],72:[2,105],73:[2,105],84:[2,105],85:[2,105],86:[2,105],88:[2,105],90:[2,105],91:[2,105],95:[2,105],99:[2,105],104:[2,105],113:[2,105],115:[2,105],116:[2,105],117:[2,105],121:[2,105],129:[2,105],137:[2,105],139:[2,105],140:[2,105],141:[2,105],142:[2,105],143:[2,105],144:[2,105],145:[2,105],146:[2,105],147:[2,105],148:[2,105],149:[2,105]},{1:[2,123],6:[2,123],17:[2,123],18:[2,123],19:[2,123],31:[2,123],32:[2,123],63:[2,123],69:[2,123],72:[2,123],73:[2,123],84:[2,123],85:[2,123],86:[2,123],88:[2,123],90:[2,123],91:[2,123],99:[2,123],104:[2,123],113:[2,123],115:[2,123],116:[2,123],117:[2,123],121:[2,123],129:[2,123],137:[2,123],139:[2,123],140:[2,123],143:[2,123],144:[2,123],145:[2,123],146:[2,123],147:[2,123],148:[2,123]},{16:285,24:286,26:287,46:[1,109]},{15:[1,288]},{1:[2,52],6:[2,52],17:[2,52],18:[2,52],19:[2,52],31:[2,52],32:[2,52],63:[2,52],69:[2,52],73:[2,52],90:[2,52],104:[2,52],113:[2,52],114:123,115:[2,52],116:[2,52],117:[2,52],120:124,121:[2,52],122:74,129:[2,52],137:[2,52],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{8:289,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:290,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,128],6:[2,128],17:[2,128],18:[2,128],19:[2,128],31:[2,128],32:[2,128],63:[2,128],69:[2,128],72:[2,128],73:[2,128],84:[2,128],85:[2,128],86:[2,128],88:[2,128],90:[2,128],91:[2,128],99:[2,128],104:[2,128],113:[2,128],115:[2,128],116:[2,128],117:[2,128],121:[2,128],129:[2,128],137:[2,128],139:[2,128],140:[2,128],143:[2,128],144:[2,128],145:[2,128],146:[2,128],147:[2,128],148:[2,128]},{6:[2,69],18:[2,69],25:291,32:[1,270],73:[2,69]},{6:[2,147],18:[2,147],19:[2,147],31:[2,147],32:[2,147],69:[1,292],73:[2,147],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{64:293,65:[1,65],66:[1,66]},{15:[1,106],26:148,29:[1,155],46:[1,109],58:149,67:294,68:145,70:146,71:147,74:[1,152],75:[1,153],76:150,77:151,102:[1,154],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{32:[2,75],63:[2,75],73:[2,75]},{8:295,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{32:[2,77],63:[2,77],73:[2,77]},{15:[1,106],26:148,29:[1,155],46:[1,109],58:149,67:296,68:145,70:146,71:147,74:[1,152],75:[1,153],76:150,77:151,102:[1,154],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,217],6:[2,217],17:[2,217],18:[2,217],19:[2,217],31:[2,217],32:[2,217],63:[2,217],69:[2,217],73:[2,217],90:[2,217],104:[2,217],113:[2,217],114:123,115:[2,217],116:[2,217],117:[2,217],120:124,121:[2,217],122:74,129:[2,217],137:[2,217],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{8:297,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,219],6:[2,219],17:[2,219],18:[2,219],19:[2,219],31:[2,219],32:[2,219],63:[2,219],69:[2,219],73:[2,219],90:[2,219],104:[2,219],113:[2,219],114:123,115:[2,219],116:[2,219],117:[2,219],120:124,121:[2,219],122:74,129:[2,219],137:[2,219],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,199],6:[2,199],17:[2,199],18:[2,199],19:[2,199],31:[2,199],32:[2,199],63:[2,199],69:[2,199],73:[2,199],90:[2,199],104:[2,199],113:[2,199],115:[2,199],116:[2,199],117:[2,199],121:[2,199],129:[2,199],137:[2,199],139:[2,199],140:[2,199],143:[2,199],144:[2,199],145:[2,199],146:[2,199],147:[2,199],148:[2,199]},{8:298,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,152],6:[2,152],17:[2,152],18:[2,152],19:[2,152],31:[2,152],32:[2,152],63:[2,152],69:[2,152],73:[2,152],90:[2,152],104:[2,152],109:[1,299],113:[2,152],115:[2,152],116:[2,152],117:[2,152],121:[2,152],129:[2,152],137:[2,152],139:[2,152],140:[2,152],143:[2,152],144:[2,152],145:[2,152],146:[2,152],147:[2,152],148:[2,152]},{5:300,18:[1,5]},{26:301,46:[1,109]},{131:302,133:260,134:[1,261]},{19:[1,303],132:[1,304],133:305,134:[1,261]},{19:[2,192],132:[2,192],134:[2,192]},{8:307,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],106:306,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,116],5:308,6:[2,116],17:[2,116],18:[1,5],19:[2,116],31:[2,116],32:[2,116],63:[2,116],69:[2,116],73:[2,116],90:[2,116],104:[2,116],113:[2,116],114:123,115:[1,70],116:[2,116],117:[1,71],120:124,121:[1,73],122:74,129:[2,116],137:[2,116],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,119],6:[2,119],17:[2,119],18:[2,119],19:[2,119],31:[2,119],32:[2,119],63:[2,119],69:[2,119],73:[2,119],90:[2,119],104:[2,119],113:[2,119],115:[2,119],116:[2,119],117:[2,119],121:[2,119],129:[2,119],137:[2,119],139:[2,119],140:[2,119],143:[2,119],144:[2,119],145:[2,119],146:[2,119],147:[2,119],148:[2,119]},{8:309,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,157],6:[2,157],17:[2,157],18:[2,157],19:[2,157],31:[2,157],32:[2,157],63:[2,157],69:[2,157],72:[2,157],73:[2,157],84:[2,157],85:[2,157],86:[2,157],88:[2,157],90:[2,157],91:[2,157],99:[2,157],104:[2,157],113:[2,157],115:[2,157],116:[2,157],117:[2,157],121:[2,157],129:[2,157],137:[2,157],139:[2,157],140:[2,157],143:[2,157],144:[2,157],145:[2,157],146:[2,157],147:[2,157],148:[2,157]},{19:[1,310],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{8:311,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{6:[2,86],12:[2,136],15:[2,136],18:[2,86],20:[2,136],21:[2,136],22:[2,136],23:[2,136],29:[2,136],31:[2,86],32:[2,86],46:[2,136],48:[2,136],49:[2,136],51:[2,136],52:[2,136],53:[2,136],54:[2,136],59:[2,136],60:[2,136],61:[2,136],65:[2,136],66:[2,136],94:[2,136],98:[2,136],101:[2,136],102:[2,136],107:[2,136],111:[2,136],112:[2,136],115:[2,136],117:[2,136],119:[2,136],121:[2,136],130:[2,136],136:[2,136],138:[2,136],139:[2,136],140:[2,136],141:[2,136],142:[2,136],150:[2,136],151:[2,136],152:[2,136],153:[2,136],154:[2,136],155:[2,136],156:[2,136],157:[2,136],158:[2,136],159:[2,136],160:[2,136],161:[2,136],162:[2,136],163:[2,136],164:[2,136],165:[2,136],166:[2,136],167:[2,136],168:[2,136],169:[2,136],170:[2,136],171:[2,136],172:[2,136],173:[2,136],174:[2,136],175:[2,136],176:[2,136],177:[2,136],178:[2,136],179:[2,136],180:[2,136]},{6:[1,313],18:[1,314],31:[1,312]},{6:[2,70],8:243,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[2,70],19:[2,70],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],31:[2,70],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,73:[2,70],76:54,77:55,78:189,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],105:315,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{6:[2,69],18:[2,69],19:[2,69],25:316,32:[1,270]},{1:[2,196],6:[2,196],17:[2,196],18:[2,196],19:[2,196],31:[2,196],32:[2,196],63:[2,196],69:[2,196],73:[2,196],90:[2,196],104:[2,196],113:[2,196],115:[2,196],116:[2,196],117:[2,196],121:[2,196],129:[2,196],132:[2,196],137:[2,196],139:[2,196],140:[2,196],143:[2,196],144:[2,196],145:[2,196],146:[2,196],147:[2,196],148:[2,196]},{8:317,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:318,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{127:[2,175],128:[2,175]},{15:[1,106],26:200,29:[1,155],46:[1,109],76:201,77:202,126:319},{1:[2,181],6:[2,181],17:[2,181],18:[2,181],19:[2,181],31:[2,181],32:[2,181],63:[2,181],69:[2,181],73:[2,181],90:[2,181],104:[2,181],113:[2,181],114:123,115:[2,181],116:[1,320],117:[2,181],120:124,121:[2,181],122:74,129:[1,321],137:[2,181],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,182],6:[2,182],17:[2,182],18:[2,182],19:[2,182],31:[2,182],32:[2,182],63:[2,182],69:[2,182],73:[2,182],90:[2,182],104:[2,182],113:[2,182],114:123,115:[2,182],116:[1,322],117:[2,182],120:124,121:[2,182],122:74,129:[2,182],137:[2,182],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{6:[1,324],17:[1,323],18:[1,325]},{6:[2,70],11:209,17:[2,70],18:[2,70],19:[2,70],26:210,46:[1,109],47:211,48:[1,107],49:[1,108],56:326,57:208,58:212,60:[1,49],102:[1,154]},{8:327,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,328],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,104],6:[2,104],14:[2,104],17:[2,104],18:[2,104],19:[2,104],31:[2,104],32:[2,104],63:[2,104],69:[2,104],72:[2,104],73:[2,104],84:[2,104],85:[2,104],86:[2,104],88:[2,104],90:[2,104],91:[2,104],95:[2,104],99:[2,104],104:[2,104],113:[2,104],115:[2,104],116:[2,104],117:[2,104],121:[2,104],129:[2,104],137:[2,104],139:[2,104],140:[2,104],141:[2,104],142:[2,104],143:[2,104],144:[2,104],145:[2,104],146:[2,104],147:[2,104],148:[2,104],149:[2,104]},{8:329,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,90:[2,139],94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{90:[2,140],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{6:[2,69],17:[1,330],25:331,32:[1,332]},{6:[2,18],17:[2,18],32:[2,18]},{27:[1,333]},{16:334,24:286,26:287,46:[1,109]},{1:[2,53],6:[2,53],17:[2,53],18:[2,53],19:[2,53],31:[2,53],32:[2,53],63:[2,53],69:[2,53],73:[2,53],90:[2,53],104:[2,53],113:[2,53],114:123,115:[2,53],116:[2,53],117:[2,53],120:124,121:[2,53],122:74,129:[2,53],137:[2,53],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{19:[1,335],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{6:[1,313],18:[1,314],73:[1,336]},{6:[2,86],18:[2,86],19:[2,86],31:[2,86],32:[2,86],73:[2,86]},{5:337,18:[1,5]},{32:[2,73],63:[2,73],73:[2,73]},{32:[2,76],63:[2,76],73:[2,76],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{32:[1,339],73:[1,338]},{19:[1,340],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{5:341,18:[1,5],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{5:342,18:[1,5]},{1:[2,153],6:[2,153],17:[2,153],18:[2,153],19:[2,153],31:[2,153],32:[2,153],63:[2,153],69:[2,153],73:[2,153],90:[2,153],104:[2,153],113:[2,153],115:[2,153],116:[2,153],117:[2,153],121:[2,153],129:[2,153],137:[2,153],139:[2,153],140:[2,153],143:[2,153],144:[2,153],145:[2,153],146:[2,153],147:[2,153],148:[2,153]},{5:343,18:[1,5]},{19:[1,344],132:[1,345],133:305,134:[1,261]},{1:[2,190],6:[2,190],17:[2,190],18:[2,190],19:[2,190],31:[2,190],32:[2,190],63:[2,190],69:[2,190],73:[2,190],90:[2,190],104:[2,190],113:[2,190],115:[2,190],116:[2,190],117:[2,190],121:[2,190],129:[2,190],137:[2,190],139:[2,190],140:[2,190],143:[2,190],144:[2,190],145:[2,190],146:[2,190],147:[2,190],148:[2,190]},{5:346,18:[1,5]},{19:[2,193],132:[2,193],134:[2,193]},{5:347,18:[1,5],32:[1,348]},{18:[2,149],32:[2,149],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,117],6:[2,117],17:[2,117],18:[2,117],19:[2,117],31:[2,117],32:[2,117],63:[2,117],69:[2,117],73:[2,117],90:[2,117],104:[2,117],113:[2,117],115:[2,117],116:[2,117],117:[2,117],121:[2,117],129:[2,117],137:[2,117],139:[2,117],140:[2,117],143:[2,117],144:[2,117],145:[2,117],146:[2,117],147:[2,117],148:[2,117]},{1:[2,120],5:349,6:[2,120],17:[2,120],18:[1,5],19:[2,120],31:[2,120],32:[2,120],63:[2,120],69:[2,120],73:[2,120],90:[2,120],104:[2,120],113:[2,120],114:123,115:[1,70],116:[2,120],117:[1,71],120:124,121:[1,73],122:74,129:[2,120],137:[2,120],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{113:[1,350]},{31:[1,351],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,134],6:[2,134],14:[2,134],17:[2,134],18:[2,134],19:[2,134],31:[2,134],32:[2,134],63:[2,134],69:[2,134],72:[2,134],73:[2,134],84:[2,134],85:[2,134],86:[2,134],88:[2,134],90:[2,134],91:[2,134],99:[2,134],104:[2,134],113:[2,134],115:[2,134],116:[2,134],117:[2,134],121:[2,134],127:[2,134],128:[2,134],129:[2,134],137:[2,134],139:[2,134],140:[2,134],143:[2,134],144:[2,134],145:[2,134],146:[2,134],147:[2,134],148:[2,134]},{8:243,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,78:189,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],105:352,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:243,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],18:[1,188],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,78:189,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],100:353,101:[1,63],102:[1,64],105:187,107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{6:[2,143],18:[2,143],19:[2,143],31:[2,143],32:[2,143],73:[2,143]},{6:[1,313],18:[1,314],19:[1,354]},{1:[2,160],6:[2,160],17:[2,160],18:[2,160],19:[2,160],31:[2,160],32:[2,160],63:[2,160],69:[2,160],73:[2,160],90:[2,160],104:[2,160],113:[2,160],114:123,115:[1,70],116:[2,160],117:[1,71],120:124,121:[1,73],122:74,129:[2,160],137:[2,160],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,162],6:[2,162],17:[2,162],18:[2,162],19:[2,162],31:[2,162],32:[2,162],63:[2,162],69:[2,162],73:[2,162],90:[2,162],104:[2,162],113:[2,162],114:123,115:[1,70],116:[2,162],117:[1,71],120:124,121:[1,73],122:74,129:[2,162],137:[2,162],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{127:[2,180],128:[2,180]},{8:355,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:356,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:357,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,108],6:[2,108],14:[2,108],17:[2,108],18:[2,108],19:[2,108],31:[2,108],32:[2,108],63:[2,108],69:[2,108],72:[2,108],73:[2,108],84:[2,108],85:[2,108],86:[2,108],88:[2,108],90:[2,108],91:[2,108],99:[2,108],104:[2,108],113:[2,108],115:[2,108],116:[2,108],117:[2,108],121:[2,108],127:[2,108],128:[2,108],129:[2,108],137:[2,108],139:[2,108],140:[2,108],143:[2,108],144:[2,108],145:[2,108],146:[2,108],147:[2,108],148:[2,108]},{11:209,26:210,46:[1,109],47:211,48:[1,107],49:[1,108],56:358,57:208,58:212,60:[1,49],102:[1,154]},{6:[2,109],11:209,18:[2,109],19:[2,109],26:210,32:[2,109],46:[1,109],47:211,48:[1,107],49:[1,108],56:207,57:208,58:212,60:[1,49],93:359,102:[1,154]},{6:[2,111],17:[2,111],18:[2,111],19:[2,111],32:[2,111]},{6:[2,56],17:[2,56],18:[2,56],19:[2,56],32:[2,56],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{8:360,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{90:[2,138],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,12],6:[2,12],19:[2,12],115:[2,12],117:[2,12],121:[2,12],137:[2,12]},{6:[1,361]},{6:[2,70]},{18:[1,364],26:365,28:362,29:[1,363],46:[1,109]},{6:[2,69],17:[1,366],25:331,32:[1,332]},{1:[2,54],6:[2,54],17:[2,54],18:[2,54],19:[2,54],31:[2,54],32:[2,54],63:[2,54],69:[2,54],73:[2,54],90:[2,54],104:[2,54],113:[2,54],115:[2,54],116:[2,54],117:[2,54],121:[2,54],129:[2,54],137:[2,54],139:[2,54],140:[2,54],143:[2,54],144:[2,54],145:[2,54],146:[2,54],147:[2,54],148:[2,54]},{1:[2,129],6:[2,129],17:[2,129],18:[2,129],19:[2,129],31:[2,129],32:[2,129],63:[2,129],69:[2,129],72:[2,129],73:[2,129],84:[2,129],85:[2,129],86:[2,129],88:[2,129],90:[2,129],91:[2,129],99:[2,129],104:[2,129],113:[2,129],115:[2,129],116:[2,129],117:[2,129],121:[2,129],129:[2,129],137:[2,129],139:[2,129],140:[2,129],143:[2,129],144:[2,129],145:[2,129],146:[2,129],147:[2,129],148:[2,129]},{1:[2,65],6:[2,65],17:[2,65],18:[2,65],19:[2,65],31:[2,65],32:[2,65],63:[2,65],69:[2,65],73:[2,65],90:[2,65],104:[2,65],113:[2,65],115:[2,65],116:[2,65],117:[2,65],121:[2,65],129:[2,65],137:[2,65],139:[2,65],140:[2,65],143:[2,65],144:[2,65],145:[2,65],146:[2,65],147:[2,65],148:[2,65]},{32:[2,78],63:[2,78],73:[2,78]},{15:[1,106],26:148,29:[1,155],32:[2,71],46:[1,109],58:149,62:367,67:144,68:145,70:146,71:147,73:[2,71],74:[1,152],75:[1,153],76:150,77:151,102:[1,154],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,218],6:[2,218],17:[2,218],18:[2,218],19:[2,218],31:[2,218],32:[2,218],63:[2,218],69:[2,218],73:[2,218],90:[2,218],104:[2,218],113:[2,218],115:[2,218],116:[2,218],117:[2,218],121:[2,218],129:[2,218],137:[2,218],139:[2,218],140:[2,218],143:[2,218],144:[2,218],145:[2,218],146:[2,218],147:[2,218],148:[2,218]},{1:[2,197],6:[2,197],17:[2,197],18:[2,197],19:[2,197],31:[2,197],32:[2,197],63:[2,197],69:[2,197],73:[2,197],90:[2,197],104:[2,197],113:[2,197],115:[2,197],116:[2,197],117:[2,197],121:[2,197],129:[2,197],132:[2,197],137:[2,197],139:[2,197],140:[2,197],143:[2,197],144:[2,197],145:[2,197],146:[2,197],147:[2,197],148:[2,197]},{1:[2,154],6:[2,154],17:[2,154],18:[2,154],19:[2,154],31:[2,154],32:[2,154],63:[2,154],69:[2,154],73:[2,154],90:[2,154],104:[2,154],113:[2,154],115:[2,154],116:[2,154],117:[2,154],121:[2,154],129:[2,154],137:[2,154],139:[2,154],140:[2,154],143:[2,154],144:[2,154],145:[2,154],146:[2,154],147:[2,154],148:[2,154]},{1:[2,155],6:[2,155],17:[2,155],18:[2,155],19:[2,155],31:[2,155],32:[2,155],63:[2,155],69:[2,155],73:[2,155],90:[2,155],104:[2,155],109:[2,155],113:[2,155],115:[2,155],116:[2,155],117:[2,155],121:[2,155],129:[2,155],137:[2,155],139:[2,155],140:[2,155],143:[2,155],144:[2,155],145:[2,155],146:[2,155],147:[2,155],148:[2,155]},{1:[2,188],6:[2,188],17:[2,188],18:[2,188],19:[2,188],31:[2,188],32:[2,188],63:[2,188],69:[2,188],73:[2,188],90:[2,188],104:[2,188],113:[2,188],115:[2,188],116:[2,188],117:[2,188],121:[2,188],129:[2,188],137:[2,188],139:[2,188],140:[2,188],143:[2,188],144:[2,188],145:[2,188],146:[2,188],147:[2,188],148:[2,188]},{5:368,18:[1,5]},{19:[1,369]},{6:[1,370],19:[2,194],132:[2,194],134:[2,194]},{8:371,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{1:[2,121],6:[2,121],17:[2,121],18:[2,121],19:[2,121],31:[2,121],32:[2,121],63:[2,121],69:[2,121],73:[2,121],90:[2,121],104:[2,121],113:[2,121],115:[2,121],116:[2,121],117:[2,121],121:[2,121],129:[2,121],137:[2,121],139:[2,121],140:[2,121],143:[2,121],144:[2,121],145:[2,121],146:[2,121],147:[2,121],148:[2,121]},{1:[2,158],6:[2,158],17:[2,158],18:[2,158],19:[2,158],31:[2,158],32:[2,158],63:[2,158],69:[2,158],72:[2,158],73:[2,158],84:[2,158],85:[2,158],86:[2,158],88:[2,158],90:[2,158],91:[2,158],99:[2,158],104:[2,158],113:[2,158],115:[2,158],116:[2,158],117:[2,158],121:[2,158],129:[2,158],137:[2,158],139:[2,158],140:[2,158],143:[2,158],144:[2,158],145:[2,158],146:[2,158],147:[2,158],148:[2,158]},{1:[2,137],6:[2,137],17:[2,137],18:[2,137],19:[2,137],31:[2,137],32:[2,137],63:[2,137],69:[2,137],72:[2,137],73:[2,137],84:[2,137],85:[2,137],86:[2,137],88:[2,137],90:[2,137],91:[2,137],99:[2,137],104:[2,137],113:[2,137],115:[2,137],116:[2,137],117:[2,137],121:[2,137],129:[2,137],137:[2,137],139:[2,137],140:[2,137],143:[2,137],144:[2,137],145:[2,137],146:[2,137],147:[2,137],148:[2,137]},{6:[2,144],18:[2,144],19:[2,144],31:[2,144],32:[2,144],73:[2,144]},{6:[2,69],18:[2,69],19:[2,69],25:372,32:[1,270]},{6:[2,145],18:[2,145],19:[2,145],31:[2,145],32:[2,145],73:[2,145]},{1:[2,183],6:[2,183],17:[2,183],18:[2,183],19:[2,183],31:[2,183],32:[2,183],63:[2,183],69:[2,183],73:[2,183],90:[2,183],104:[2,183],113:[2,183],114:123,115:[2,183],116:[2,183],117:[2,183],120:124,121:[2,183],122:74,129:[1,373],137:[2,183],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,185],6:[2,185],17:[2,185],18:[2,185],19:[2,185],31:[2,185],32:[2,185],63:[2,185],69:[2,185],73:[2,185],90:[2,185],104:[2,185],113:[2,185],114:123,115:[2,185],116:[1,374],117:[2,185],120:124,121:[2,185],122:74,129:[2,185],137:[2,185],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,184],6:[2,184],17:[2,184],18:[2,184],19:[2,184],31:[2,184],32:[2,184],63:[2,184],69:[2,184],73:[2,184],90:[2,184],104:[2,184],113:[2,184],114:123,115:[2,184],116:[2,184],117:[2,184],120:124,121:[2,184],122:74,129:[2,184],137:[2,184],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{6:[2,112],17:[2,112],18:[2,112],19:[2,112],32:[2,112]},{6:[2,69],18:[2,69],19:[2,69],25:375,32:[1,280]},{19:[1,376],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{24:377,26:287,46:[1,109]},{6:[2,20],17:[2,20],32:[2,20]},{18:[1,379],26:365,28:380,30:378,46:[1,109]},{26:365,28:380,30:381,46:[1,109]},{6:[2,24],17:[2,24],19:[2,24],31:[2,24],32:[2,24]},{19:[1,382]},{32:[1,245],73:[1,383]},{19:[1,384]},{1:[2,191],6:[2,191],17:[2,191],18:[2,191],19:[2,191],31:[2,191],32:[2,191],63:[2,191],69:[2,191],73:[2,191],90:[2,191],104:[2,191],113:[2,191],115:[2,191],116:[2,191],117:[2,191],121:[2,191],129:[2,191],137:[2,191],139:[2,191],140:[2,191],143:[2,191],144:[2,191],145:[2,191],146:[2,191],147:[2,191],148:[2,191]},{19:[2,195],132:[2,195],134:[2,195]},{18:[2,150],32:[2,150],114:123,115:[1,70],117:[1,71],120:124,121:[1,73],122:74,137:[1,122],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{6:[1,313],18:[1,314],19:[1,385]},{8:386,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{8:387,9:158,10:21,11:22,12:[1,23],13:24,15:[1,106],20:[1,50],21:[1,51],22:[1,52],23:[1,53],26:67,29:[1,62],33:8,34:9,35:10,36:11,37:12,38:13,39:14,40:15,41:16,42:17,43:18,44:19,45:20,46:[1,109],47:56,48:[1,107],49:[1,108],50:26,51:[1,57],52:[1,58],53:[1,59],54:[1,60],55:25,58:68,59:[1,48],60:[1,49],61:[1,31],64:32,65:[1,65],66:[1,66],71:47,76:54,77:55,79:38,81:27,82:28,83:29,94:[1,45],98:[1,30],101:[1,63],102:[1,64],107:[1,40],111:[1,46],112:[1,61],114:41,115:[1,70],117:[1,71],118:42,119:[1,72],120:43,121:[1,73],122:74,130:[1,44],135:39,136:[1,69],138:[1,33],139:[1,34],140:[1,35],141:[1,36],142:[1,37],150:[1,75],151:[1,76],152:[1,77],153:[1,78],154:[1,79],155:[1,80],156:[1,81],157:[1,82],158:[1,83],159:[1,84],160:[1,85],161:[1,86],162:[1,87],163:[1,88],164:[1,89],165:[1,90],166:[1,91],167:[1,92],168:[1,93],169:[1,94],170:[1,95],171:[1,96],172:[1,97],173:[1,98],174:[1,99],175:[1,100],176:[1,101],177:[1,102],178:[1,103],179:[1,104],180:[1,105]},{6:[1,324],18:[1,325],19:[1,388]},{6:[2,57],17:[2,57],18:[2,57],19:[2,57],32:[2,57]},{6:[2,19],17:[2,19],32:[2,19]},{6:[1,391],31:[1,389],32:[1,390]},{26:365,28:380,30:392,46:[1,109]},{6:[2,25],19:[2,25],31:[2,25],32:[2,25]},{6:[1,391],19:[1,393],32:[1,390]},{1:[2,13],6:[2,13],19:[2,13],115:[2,13],117:[2,13],121:[2,13],137:[2,13]},{32:[2,79],63:[2,79],73:[2,79]},{1:[2,189],6:[2,189],17:[2,189],18:[2,189],19:[2,189],31:[2,189],32:[2,189],63:[2,189],69:[2,189],73:[2,189],90:[2,189],104:[2,189],113:[2,189],115:[2,189],116:[2,189],117:[2,189],121:[2,189],129:[2,189],137:[2,189],139:[2,189],140:[2,189],143:[2,189],144:[2,189],145:[2,189],146:[2,189],147:[2,189],148:[2,189]},{6:[2,146],18:[2,146],19:[2,146],31:[2,146],32:[2,146],73:[2,146]},{1:[2,186],6:[2,186],17:[2,186],18:[2,186],19:[2,186],31:[2,186],32:[2,186],63:[2,186],69:[2,186],73:[2,186],90:[2,186],104:[2,186],113:[2,186],114:123,115:[2,186],116:[2,186],117:[2,186],120:124,121:[2,186],122:74,129:[2,186],137:[2,186],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{1:[2,187],6:[2,187],17:[2,187],18:[2,187],19:[2,187],31:[2,187],32:[2,187],63:[2,187],69:[2,187],73:[2,187],90:[2,187],104:[2,187],113:[2,187],114:123,115:[2,187],116:[2,187],117:[2,187],120:124,121:[2,187],122:74,129:[2,187],137:[2,187],139:[1,116],140:[1,115],143:[1,114],144:[1,117],145:[1,118],146:[1,119],147:[1,120],148:[1,121]},{6:[2,113],17:[2,113],18:[2,113],19:[2,113],32:[2,113]},{6:[2,21],17:[2,21],32:[2,21]},{6:[1,395],26:365,28:394,46:[1,109]},{26:365,28:396,46:[1,109]},{6:[1,391],19:[1,397],32:[1,390]},{6:[2,22],17:[2,22],32:[2,22]},{6:[2,26],19:[2,26],31:[2,26],32:[2,26]},{26:365,28:398,46:[1,109]},{6:[2,27],19:[2,27],31:[2,27],32:[2,27]},{31:[1,399]},{6:[2,28],19:[2,28],31:[2,28],32:[2,28]},{6:[2,23],17:[2,23],32:[2,23]}],
defaultActions: {50:[2,14],51:[2,15],52:[2,16],53:[2,17],65:[2,67],66:[2,68],75:[2,220],76:[2,221],77:[2,222],78:[2,223],79:[2,224],80:[2,225],81:[2,226],82:[2,227],83:[2,228],84:[2,229],85:[2,230],86:[2,231],87:[2,232],88:[2,233],89:[2,234],90:[2,235],91:[2,236],92:[2,237],93:[2,238],94:[2,239],95:[2,240],96:[2,241],97:[2,242],98:[2,243],99:[2,244],100:[2,245],101:[2,246],102:[2,247],103:[2,248],104:[2,249],105:[2,250],111:[2,3],130:[2,127],230:[2,107],332:[2,70]},
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
      if (def = this.lookup(name, true)) {
        def.assign(options);
        return def;
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
      builtins = program.builtins && program.builtins._variables[name];
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

    function Simulator(glsl, variables) {
      var name, value;
      if (variables == null) variables = {};
      this.state = {};
      if (glsl.vertex) {
        this.vertex = compile_program('vertex', this.state, glsl.vertex);
      }
      if (glsl.fragment) {
        this.fragment = compile_program('fragment', this.state, glsl.fragment);
      }
      for (name in variables) {
        value = variables[name];
        this.state.variables[name].value = value;
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
