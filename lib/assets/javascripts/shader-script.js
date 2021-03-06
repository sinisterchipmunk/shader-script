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

  exports.builtins || (exports.builtins = require('shader-script/builtins').builtins);

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

  exports.compile = function(code) {
    var program;
    program = exports.compile_to_dom(code);
    return {
      vertex: program.vertex.toSource(),
      fragment: program.fragment.toSource()
    };
  };

  exports.compile_to_dom = function(code) {
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
    exports.builtins = Program.prototype.builtins = {
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
    e('all', null, function(x) {
      var result;
      result = true;
      this.component_wise(x, function(y) {
        return result && (result = y);
      });
      return result;
    });
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
    e('discard', null, function() {
      throw new Error("discarded");
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
        param_qualifier: this.param_qualifier,
        storage_qualifier: this.storage_qualifier
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
      if (options.storage_qualifier) {
        this.storage_qualifier = options.storage_qualifier;
      }
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

    Extension.prototype.autodetect_type = function(value) {
      var base;
      if (typeof value === 'number') {
        return 'float';
      } else if (value === true || value === false) {
        return 'bool';
      } else if (value.length) {
        base = this.autodetect_type(value[0]);
        switch (base) {
          case 'float':
            return "vec" + value.length;
          case 'int':
            return "ivec" + value.length;
          case 'bool':
            return "bvec" + value.length;
          default:
            throw new Error("Could not autodetect type of " + (JSON.stringify(value)) + " used as " + base);
        }
      } else {
        throw new Error("Could not autodetect type of " + (JSON.stringify(value)));
      }
    };

    Extension.prototype.invoke = function() {
      var i, k, param, params;
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
      for (i in params) {
        if (params[i] && params[i].length) {
          params[i] = (function() {
            var _i, _len, _ref, _results;
            _ref = params[i];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              k = _ref[_i];
              _results.push(k);
            }
            return _results;
          })();
        }
      }
      return this.callback.apply(this, params);
    };

    Extension.prototype.component_wise = require('shader-script/operators').component_wise;

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
      o('Return TERMINATOR'), o('FunctionDefinition'), o('Comment'), o('If'), o('FunctionDeclaration'), o('VariableDeclaration TERMINATOR'), o('StorageDeclaration TERMINATOR'), o('PrecisionSpecifier TERMINATOR'), o('STATEMENT TERMINATOR', function() {
        return new Literal($1);
      }), o('TERMINATOR', function() {
        return {
          compile: function() {
            return null;
          }
        };
      })
    ],
    PrecisionSpecifier: [
      o('PRECISION PrecisionLevel Type', function() {
        return new Precision($2, $3);
      })
    ],
    PrecisionLevel: [o('HIGHP'), o('MEDIUMP'), o('LOWP')],
    If: [
      o('IF Parenthetical { Body }', function() {
        return new If($2, $4, $1);
      }), o('IF Parenthetical { Body } ELSE { Body }', function() {
        return new If($2, $4, $1, $8);
      }), o('IF Parenthetical { Body } ELSE { }', function() {
        return new If($2, $4, $1, Block.wrap([]));
      }), o('IF Parenthetical { Body } ELSE Line', function() {
        return new If($2, $4, $1, Block.wrap([$7]));
      }), o('IF Parenthetical { }', function() {
        return new If($2, Block.wrap([]), $1);
      }), o('IF Parenthetical { } ELSE { Body }', function() {
        return new If($2, Block.wrap([]), $1, $7);
      }), o('IF Parenthetical { } ELSE { }', function() {
        return new If($2, Block.wrap([]), $1, Block.wrap([]));
      }), o('IF Parenthetical { } ELSE Line', function() {
        return new If($2, Block.wrap([]), $1, Block.wrap([$6]));
      }), o('IF Parenthetical Line', function() {
        return new If($2, Block.wrap([$3]), $1);
      }), o('IF Parenthetical Line ELSE { Body }', function() {
        return new If($2, Block.wrap([$3]), $1, $6);
      }), o('IF Parenthetical Line ELSE { }', function() {
        return new If($2, Block.wrap([$3]), $1, Block.wrap([]));
      }), o('IF Parenthetical Line ELSE Line', function() {
        return new If($2, Block.wrap([$3]), $1, Block.wrap([$5]));
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
      }), o('Type Identifier = Expression', function() {
        return new Variable($1, $2, $4);
      }), o('VariableDeclaration , Identifier', function() {
        var variable;
        if ($1.push) {
          variable = new Variable($1.lines[0].type, $3);
          return $1.push(variable);
        } else {
          variable = new Variable($1.type, $3);
          return new Block([$1, variable], {
            scope: false
          });
        }
      }), o('VariableDeclaration , Identifier = Expression', function() {
        var variable;
        if ($1.push) {
          variable = new Variable($1.lines[0].type, $3, $5);
          return $1.push(variable);
        } else {
          variable = new Variable($1.type, $3, $5);
          return new Block([$1, variable], {
            scope: false
          });
        }
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
      o('Type', function() {
        if ($1 === 'void') {
          return [];
        } else {
          return [new Variable($1, new Identifier("_unused"))];
        }
      }), o('Type Identifier', function() {
        return [new Variable($1, $2)];
      }), o('ArgumentDefs , Type Identifier', function() {
        return $1.concat([new Variable($3, $4)]);
      }), o('ParamQualifier Type Identifier', function() {
        return [new Variable($2, $3, null, $1)];
      }), o('ArgumentDefs , ParamQualifier Type Identifier', function() {
        return $1.concat([new Variable($4, $5, null, $3)]);
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
      }), o('CALL_START CALL_END', function() {
        return [];
      }), o('CALL_START Arguments CALL_END', function() {
        return $2;
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
      o('DISCARD', function() {
        return new Call(new Identifier('discard'), []);
      }), o('Identifier ArgumentList', function() {
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
      }), o('BOOLVAL', function() {
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
  var BOOLVAL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, STRICT_PROSCRIBED, TRAILING_SPACES, UNARY, WHITESPACE, compact, count, key, last, starts, _ref, _ref2,
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
              return 'BOOLVAL';
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
      size = indent.length - 1 - indent.lastIndexOf(';');
      noNewlines = true;
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

  COMMENT = /^\s*\/\*(.|[\r\n])*?\*\/|^\s*(\/\/[^\r\n]*)/;

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

  BOOLVAL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'];

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOLVAL', '++', '--', ']'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOLVAL');

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
    If: 'if',
    Precision: 'precision'
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
      var length, vector_type;
      if ((length = this.vector_length()) === 1) {
        return this.base_type(program);
      } else {
        vector_type = this.vector_type(program);
        return vector_type && ("" + vector_type + length);
      }
    };

    Access.prototype.base_type = function(program) {
      var vector_type;
      switch (vector_type = this.vector_type(program)) {
        case 'ivec':
          return 'int';
        case 'vec':
          return 'float';
        case 'bvec':
          return 'bool';
        default:
          throw new Error("Unexpected vector type: " + vector_type);
      }
    };

    Access.prototype.vector_type = function(program) {
      var name, vector_type;
      vector_type = this.source.type(program);
      name = this.accessor_name();
      if (!vector_type) return null;
      switch (vector_type) {
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
          throw new Error("Cannot use component accessors for type " + vector_type);
      }
    };

    Access.prototype.vector_length = function() {
      return this.accessor_name().length;
    };

    Access.prototype.compile = function(program) {
      var accessor, length, source, variable;
      accessor = this.accessor_name();
      source = this.source.compile(program);
      variable = this.definition({
        type: this.type(program)
      });
      length = this.vector_length();
      return {
        component_index: function(component) {
          var index;
          return index = (function() {
            switch (component) {
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
        },
        iterate_components: function(max_length, assignment, callback) {
          var already_iterated, i, index, _i, _len, _results;
          already_iterated = [];
          _results = [];
          for (_i = 0, _len = accessor.length; _i < _len; _i++) {
            i = accessor[_i];
            index = this.component_index(i);
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
          if (source_value.length === void 0) {
            throw new Error("Object " + (JSON.stringify(source_value)) + " has no property `length`");
          }
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
          if (length === 1) {
            variable.value = source_value[this.component_index(accessor)];
          } else {
            variable.value = [];
            if (source_value.length === void 0) {
              throw new Error("Object " + (JSON.stringify(source_value)) + ": no property `length`");
            }
            this.iterate_components(source_value.length, false, function(index) {
              return variable.value.push(source_value[index]);
            });
          }
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
  var Program,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Program = require("shader-script/glsl/program").Program;

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
          var builtin_variables, lvalue, rvalue, variable;
          lvalue = left.execute();
          rvalue = right.execute().value;
          if (left.filter_assignment) rvalue = left.filter_assignment(rvalue);
          builtin_variables = Program.prototype.builtins._variables;
          if (lvalue.name && (variable = builtin_variables.vertex[lvalue.name] || builtin_variables.fragment[lvalue.name])) {
            program.state.variables[lvalue.name] = lvalue;
          }
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
          var builtin, value, _ref;
          if (program.functions[name]) {
            return (_ref = program.functions[name]).invoke.apply(_ref, compiled_params);
          } else if (program.builtins[name]) {
            builtin = program.builtins[name];
            value = builtin.invoke.apply(builtin, compiled_params);
            return _this.definition({
              value: value,
              type: builtin.autodetect_type(value)
            });
          } else {
            throw new Error("function '" + name + "' is not defined");
          }
        },
        toSource: function() {
          var joined_params, param;
          if (name === 'discard') {
            return name;
          } else {
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
        no_terminator: true,
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

    Identifier.prototype.variable = function(program, scope, lookup_options) {
      if (this.children[0] instanceof Definition) {
        return this.children[0];
      } else {
        return (scope || program.state.scope).lookup(this.toVariableName(), lookup_options);
      }
    };

    Identifier.prototype.type = function(program) {
      return this.variable(program, null, {
        warn_NaN: false
      }).type();
    };

    Identifier.prototype.compile = function(program) {
      var scope,
        _this = this;
      scope = program.state.scope.current();
      return {
        execute: function(lookup_options) {
          return _this.variable(program, scope, lookup_options);
        },
        toSource: function() {
          return _this.variable(program, scope, {
            silent: true
          }).name;
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
      return ['expression', 'block', 'options', 'else_block'];
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
  var operators,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  operators = require('shader-script/operators');

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

    Op.prototype.type = function(program) {
      return operators.signatures[this.left.type(program)][this.op][this.right.type(program)];
    };

    Op.prototype.compile = function(program) {
      var left, op, right,
        _this = this;
      left = this.left.compile(program);
      op = this.op;
      right = this.right && this.right.compile(program);
      return {
        execute: function() {
          var le, re;
          if (right) {
            re = right.execute({
              warn_NaN: true
            });
          }
          le = left.execute({
            warn_NaN: true
          });
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
    _require["shader-script/glsl/nodes/precision"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Precision = (function(_super) {

    __extends(Precision, _super);

    function Precision() {
      Precision.__super__.constructor.apply(this, arguments);
    }

    Precision.prototype.name = "_precision";

    Precision.prototype.children = function() {
      return ['precision', 'type'];
    };

    Precision.prototype.compile = function(program) {
      var precision, type,
        _this = this;
      precision = this.precision.toLowerCase();
      type = this.type.toLowerCase();
      return {
        execute: function() {},
        toSource: function() {
          return "precision " + precision + " " + type;
        }
      };
    };

    return Precision;

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
          if (program.state.variables[name]) {
            variable = program.state.scope["import"](program.state.variables[name]);
          } else {
            variable = program.state.scope.define(name, {
              type: this.type,
              builtin: true,
              value: default_value,
              storage_qualifier: this.qualifier
            });
            program.state.variables[name] = variable;
          }
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
          var arg, arg_value, args, v, vector_length, _i, _j, _len, _len2;
          args = [];
          for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
            arg = compiled_args[_i];
            arg_value = arg.execute().value;
            if (arg_value.length) {
              for (_j = 0, _len2 = arg_value.length; _j < _len2; _j++) {
                v = arg_value[_j];
                args.push(v);
              }
            } else {
              args.push(arg_value);
            }
          }
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
              if (args.length === 1) {
                return _this.definition({
                  type: type,
                  value: args[0]
                });
              } else {
                return _this.definition({
                  type: type,
                  value: args
                });
              }
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
          return "" + (_this.type(program)) + "(" + (((function() {
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

    function Variable(type, name, value, param_qualifier) {
      this.value = value;
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
      var compiled_value, name, qualifier, variable, _base, _ref,
        _this = this;
      (_base = program.state).variables || (_base.variables = {});
      name = this.variable ? this.variable.name : this.name.toVariableName();
      variable = program.state.scope.define(name, this.variable ? this.variable.as_options() : {
        type: this.type
      });
      variable.param_qualifier || (variable.param_qualifier = this.param_qualifier);
      if (this.variable) variable.add_dependent(this.variable);
      compiled_value = (_ref = this.value) != null ? _ref.compile(program) : void 0;
      if (variable.value === void 0) variable.value = Number.NaN;
      qualifier = program.state.scope.qualifier();
      if (qualifier === 'root.block' || qualifier === 'root.block.main' || qualifier === 'root.block.main.block') {
        if (program.state.variables[name]) {
          variable = program.state.scope["import"](program.state.variables[name]);
        } else {
          program.state.variables[name] = variable;
        }
      }
      return {
        execute: function() {
          if (compiled_value) variable.value = compiled_value.execute().value;
          return variable;
        },
        toSource: function() {
          if (compiled_value) {
            return "" + (variable.toSource()) + " = " + (compiled_value.toSource());
          } else {
            return variable.toSource();
          }
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
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"{":10,"}":11,"Assign":12,"Call":13,"Literal":14,"TypeConstructor":15,"FunctionCall":16,"Operation":17,"Parenthetical":18,"Assignable":19,"Return":20,"FunctionDefinition":21,"Comment":22,"If":23,"FunctionDeclaration":24,"VariableDeclaration":25,"StorageDeclaration":26,"PrecisionSpecifier":27,"STATEMENT":28,"PRECISION":29,"PrecisionLevel":30,"Type":31,"HIGHP":32,"MEDIUMP":33,"LOWP":34,"IF":35,"ELSE":36,"StorageQualifier":37,"IdentifierList":38,"Identifier":39,",":40,"UNIFORM":41,"VARYING":42,"ATTRIBUTE":43,"CONST":44,"HERECOMMENT":45,"=":46,"CALL_START":47,"ArgumentDefs":48,")":49,"ParamQualifier":50,"IN":51,"OUT":52,"INOUT":53,"ArgumentList":54,"(":55,"Arguments":56,"CALL_END":57,"DISCARD":58,"Accessor":59,".":60,"IDENTIFIER":61,"NUMBER":62,"BOOLVAL":63,"RETURN":64,"INDENT":65,"OUTDENT":66,"VOID":67,"BOOL":68,"INT":69,"FLOAT":70,"VEC2":71,"VEC3":72,"VEC4":73,"BVEC2":74,"BVEC3":75,"BVEC4":76,"IVEC2":77,"IVEC3":78,"IVEC4":79,"MAT2":80,"MAT3":81,"MAT4":82,"MAT2X2":83,"MAT2X3":84,"MAT2X4":85,"MAT3X2":86,"MAT3X3":87,"MAT3X4":88,"MAT4X2":89,"MAT4X3":90,"MAT4X4":91,"SAMPLER1D":92,"SAMPLER2D":93,"SAMPLER3D":94,"SAMPLERCUBE":95,"SAMPLER1DSHADOW":96,"SAMPLER2DSHADOW":97,"UNARY":98,"-":99,"+":100,"--":101,"++":102,"?":103,"MATH":104,"SHIFT":105,"COMPARE":106,"LOGIC":107,"RELATION":108,"COMPOUND_ASSIGN":109,"EXTENDS":110,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",10:"{",11:"}",13:"Call",24:"FunctionDeclaration",28:"STATEMENT",29:"PRECISION",32:"HIGHP",33:"MEDIUMP",34:"LOWP",35:"IF",36:"ELSE",40:",",41:"UNIFORM",42:"VARYING",43:"ATTRIBUTE",44:"CONST",45:"HERECOMMENT",46:"=",47:"CALL_START",49:")",51:"IN",52:"OUT",53:"INOUT",55:"(",57:"CALL_END",58:"DISCARD",60:".",61:"IDENTIFIER",62:"NUMBER",63:"BOOLVAL",64:"RETURN",65:"INDENT",66:"OUTDENT",67:"VOID",68:"BOOL",69:"INT",70:"FLOAT",71:"VEC2",72:"VEC3",73:"VEC4",74:"BVEC2",75:"BVEC3",76:"BVEC4",77:"IVEC2",78:"IVEC3",79:"IVEC4",80:"MAT2",81:"MAT3",82:"MAT4",83:"MAT2X2",84:"MAT2X3",85:"MAT2X4",86:"MAT3X2",87:"MAT3X3",88:"MAT3X4",89:"MAT4X2",90:"MAT4X3",91:"MAT4X4",92:"SAMPLER1D",93:"SAMPLER2D",94:"SAMPLER3D",95:"SAMPLERCUBE",96:"SAMPLER1DSHADOW",97:"SAMPLER2DSHADOW",98:"UNARY",99:"-",100:"+",101:"--",102:"++",103:"?",104:"MATH",105:"SHIFT",106:"COMPARE",107:"LOGIC",108:"RELATION",109:"COMPOUND_ASSIGN",110:"EXTENDS"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,2],[7,2],[7,1],[5,2],[5,3],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[9,2],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,2],[9,2],[9,1],[27,3],[30,1],[30,1],[30,1],[23,5],[23,9],[23,8],[23,7],[23,4],[23,8],[23,7],[23,6],[23,3],[23,7],[23,6],[23,5],[26,3],[38,1],[38,3],[37,1],[37,1],[37,1],[37,1],[22,1],[25,2],[25,4],[25,3],[25,5],[21,6],[21,5],[48,1],[48,2],[48,4],[48,3],[48,5],[50,1],[50,1],[50,1],[54,3],[54,3],[54,2],[54,2],[54,2],[54,3],[56,1],[56,3],[16,1],[16,2],[12,3],[59,3],[39,1],[14,1],[14,1],[15,2],[20,1],[20,2],[18,3],[18,5],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[31,1],[17,2],[17,2],[17,2],[17,2],[17,2],[17,2],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,3],[17,5],[17,3],[19,1],[19,1]],
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
case 22:this.$ = $$[$0];
break;
case 23:this.$ = $$[$0-1];
break;
case 24:this.$ = $$[$0-1];
break;
case 25:this.$ = $$[$0-1];
break;
case 26:this.$ = new yy.Literal($$[$0-1]);
break;
case 27:this.$ = {
          compile: function() {
            return null;
          }
        };
break;
case 28:this.$ = new yy.Precision($$[$0-1], $$[$0]);
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = $$[$0];
break;
case 31:this.$ = $$[$0];
break;
case 32:this.$ = new yy.If($$[$0-3], $$[$0-1], $$[$0-4]);
break;
case 33:this.$ = new yy.If($$[$0-7], $$[$0-5], $$[$0-8], $$[$0-1]);
break;
case 34:this.$ = new yy.If($$[$0-6], $$[$0-4], $$[$0-7], yy.Block.wrap([]));
break;
case 35:this.$ = new yy.If($$[$0-5], $$[$0-3], $$[$0-6], yy.Block.wrap([$$[$0]]));
break;
case 36:this.$ = new yy.If($$[$0-2], yy.Block.wrap([]), $$[$0-3]);
break;
case 37:this.$ = new yy.If($$[$0-6], yy.Block.wrap([]), $$[$0-7], $$[$0-1]);
break;
case 38:this.$ = new yy.If($$[$0-5], yy.Block.wrap([]), $$[$0-6], yy.Block.wrap([]));
break;
case 39:this.$ = new yy.If($$[$0-4], yy.Block.wrap([]), $$[$0-5], yy.Block.wrap([$$[$0]]));
break;
case 40:this.$ = new yy.If($$[$0-1], yy.Block.wrap([$$[$0]]), $$[$0-2]);
break;
case 41:this.$ = new yy.If($$[$0-5], yy.Block.wrap([$$[$0-4]]), $$[$0-6], $$[$0-1]);
break;
case 42:this.$ = new yy.If($$[$0-4], yy.Block.wrap([$$[$0-3]]), $$[$0-5], yy.Block.wrap([]));
break;
case 43:this.$ = new yy.If($$[$0-3], yy.Block.wrap([$$[$0-2]]), $$[$0-4], yy.Block.wrap([$$[$0]]));
break;
case 44:this.$ = new yy.StorageQualifier($$[$0-2], $$[$0-1], $$[$0]);
break;
case 45:this.$ = [$$[$0]];
break;
case 46:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 47:this.$ = $$[$0];
break;
case 48:this.$ = $$[$0];
break;
case 49:this.$ = $$[$0];
break;
case 50:this.$ = $$[$0];
break;
case 51:this.$ = new yy.Comment($$[$0]);
break;
case 52:this.$ = new yy.Variable($$[$0-1], $$[$0]);
break;
case 53:this.$ = new yy.Variable($$[$0-3], $$[$0-2], $$[$0]);
break;
case 54:this.$ = (function () {
        var variable;
        if ($$[$0-2].push) {
          variable = new yy.Variable($$[$0-2].lines[0].type, $$[$0]);
          return $$[$0-2].push(variable);
        } else {
          variable = new yy.Variable($$[$0-2].type, $$[$0]);
          return new yy.Block([$$[$0-2], variable], {
            scope: false
          });
        }
      }());
break;
case 55:this.$ = (function () {
        var variable;
        if ($$[$0-4].push) {
          variable = new yy.Variable($$[$0-4].lines[0].type, $$[$0-2], $$[$0]);
          return $$[$0-4].push(variable);
        } else {
          variable = new yy.Variable($$[$0-4].type, $$[$0-2], $$[$0]);
          return new yy.Block([$$[$0-4], variable], {
            scope: false
          });
        }
      }());
break;
case 56:this.$ = new yy.Function($$[$0-5], $$[$0-4], $$[$0-2], $$[$0]);
break;
case 57:this.$ = new yy.Function($$[$0-4], $$[$0-3], [], $$[$0]);
break;
case 58:this.$ = (function () {
        if ($$[$0] === 'void') {
          return [];
        } else {
          return [new yy.Variable($$[$0], new yy.Identifier("_unused"))];
        }
      }());
break;
case 59:this.$ = [new yy.Variable($$[$0-1], $$[$0])];
break;
case 60:this.$ = $$[$0-3].concat([new yy.Variable($$[$0-1], $$[$0])]);
break;
case 61:this.$ = [new yy.Variable($$[$0-1], $$[$0], null, $$[$0-2])];
break;
case 62:this.$ = $$[$0-4].concat([new yy.Variable($$[$0-1], $$[$0], null, $$[$0-2])]);
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = $$[$0];
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = $$[$0-1];
break;
case 67:this.$ = $$[$0-1];
break;
case 68:this.$ = [];
break;
case 69:this.$ = [];
break;
case 70:this.$ = [];
break;
case 71:this.$ = $$[$0-1];
break;
case 72:this.$ = [$$[$0]];
break;
case 73:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 74:this.$ = new yy.Call(new yy.Identifier('discard'), []);
break;
case 75:this.$ = new yy.Call($$[$0-1], $$[$0]);
break;
case 76:this.$ = new yy.Assign($$[$0-2], $$[$0], '=');
break;
case 77:this.$ = new yy.Access($$[$0], $$[$0-2]);
break;
case 78:this.$ = new yy.Identifier($$[$0]);
break;
case 79:this.$ = new yy.Literal($$[$0]);
break;
case 80:this.$ = new yy.Literal($$[$0]);
break;
case 81:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
case 82:this.$ = new yy.Return;
break;
case 83:this.$ = new yy.Return($$[$0]);
break;
case 84:this.$ = new yy.Parens($$[$0-1]);
break;
case 85:this.$ = new yy.Parens($$[$0-2]);
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
case 94:this.$ = $$[$0];
break;
case 95:this.$ = $$[$0];
break;
case 96:this.$ = $$[$0];
break;
case 97:this.$ = $$[$0];
break;
case 98:this.$ = $$[$0];
break;
case 99:this.$ = $$[$0];
break;
case 100:this.$ = $$[$0];
break;
case 101:this.$ = $$[$0];
break;
case 102:this.$ = $$[$0];
break;
case 103:this.$ = $$[$0];
break;
case 104:this.$ = $$[$0];
break;
case 105:this.$ = $$[$0];
break;
case 106:this.$ = $$[$0];
break;
case 107:this.$ = $$[$0];
break;
case 108:this.$ = $$[$0];
break;
case 109:this.$ = $$[$0];
break;
case 110:this.$ = $$[$0];
break;
case 111:this.$ = $$[$0];
break;
case 112:this.$ = $$[$0];
break;
case 113:this.$ = $$[$0];
break;
case 114:this.$ = $$[$0];
break;
case 115:this.$ = $$[$0];
break;
case 116:this.$ = $$[$0];
break;
case 117:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 118:this.$ = new yy.Op('-', $$[$0]);
break;
case 119:this.$ = new yy.Op('+', $$[$0]);
break;
case 120:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 121:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 122:this.$ = new yy.Existence($$[$0-1]);
break;
case 123:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 124:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 125:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 126:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 127:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 128:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 129:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 130:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 131:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 132:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
case 133:this.$ = $$[$0];
break;
case 134:this.$ = $$[$0];
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,6:[1,25],7:4,8:6,9:7,10:[1,5],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[3]},{1:[2,2],6:[1,25],7:77,8:6,9:7,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[1,78]},{1:[2,4],6:[2,4],11:[2,4],13:[2,4],24:[2,4],28:[2,4],29:[2,4],35:[2,4],41:[2,4],42:[2,4],43:[2,4],44:[2,4],45:[2,4],55:[2,4],58:[2,4],61:[2,4],62:[2,4],63:[2,4],64:[2,4],67:[2,4],68:[2,4],69:[2,4],70:[2,4],71:[2,4],72:[2,4],73:[2,4],74:[2,4],75:[2,4],76:[2,4],77:[2,4],78:[2,4],79:[2,4],80:[2,4],81:[2,4],82:[2,4],83:[2,4],84:[2,4],85:[2,4],86:[2,4],87:[2,4],88:[2,4],89:[2,4],90:[2,4],91:[2,4],92:[2,4],93:[2,4],94:[2,4],95:[2,4],96:[2,4],97:[2,4],98:[2,4],99:[2,4],100:[2,4]},{4:80,6:[1,25],7:4,8:6,9:7,11:[1,79],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[1,81],60:[1,90],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{1:[2,7],6:[2,7],11:[2,7],13:[2,7],24:[2,7],28:[2,7],29:[2,7],35:[2,7],36:[2,7],41:[2,7],42:[2,7],43:[2,7],44:[2,7],45:[2,7],55:[2,7],58:[2,7],61:[2,7],62:[2,7],63:[2,7],64:[2,7],67:[2,7],68:[2,7],69:[2,7],70:[2,7],71:[2,7],72:[2,7],73:[2,7],74:[2,7],75:[2,7],76:[2,7],77:[2,7],78:[2,7],79:[2,7],80:[2,7],81:[2,7],82:[2,7],83:[2,7],84:[2,7],85:[2,7],86:[2,7],87:[2,7],88:[2,7],89:[2,7],90:[2,7],91:[2,7],92:[2,7],93:[2,7],94:[2,7],95:[2,7],96:[2,7],97:[2,7],98:[2,7],99:[2,7],100:[2,7]},{6:[2,10],40:[2,10],49:[2,10],57:[2,10],60:[2,10],66:[2,10],99:[2,10],100:[2,10],103:[2,10],104:[2,10],105:[2,10],106:[2,10],107:[2,10],108:[2,10]},{6:[2,11],40:[2,11],49:[2,11],57:[2,11],60:[2,11],66:[2,11],99:[2,11],100:[2,11],103:[2,11],104:[2,11],105:[2,11],106:[2,11],107:[2,11],108:[2,11]},{6:[2,12],40:[2,12],49:[2,12],57:[2,12],60:[2,12],66:[2,12],99:[2,12],100:[2,12],103:[2,12],104:[2,12],105:[2,12],106:[2,12],107:[2,12],108:[2,12]},{6:[2,13],40:[2,13],49:[2,13],57:[2,13],60:[2,13],66:[2,13],99:[2,13],100:[2,13],103:[2,13],104:[2,13],105:[2,13],106:[2,13],107:[2,13],108:[2,13]},{6:[2,14],40:[2,14],49:[2,14],57:[2,14],60:[2,14],66:[2,14],99:[2,14],100:[2,14],103:[2,14],104:[2,14],105:[2,14],106:[2,14],107:[2,14],108:[2,14]},{6:[2,15],40:[2,15],49:[2,15],57:[2,15],60:[2,15],66:[2,15],99:[2,15],100:[2,15],103:[2,15],104:[2,15],105:[2,15],106:[2,15],107:[2,15],108:[2,15]},{6:[2,16],40:[2,16],49:[2,16],57:[2,16],60:[2,16],66:[2,16],99:[2,16],100:[2,16],103:[2,16],104:[2,16],105:[2,16],106:[2,16],107:[2,16],108:[2,16]},{6:[2,17],40:[2,17],46:[1,91],49:[2,17],57:[2,17],60:[2,17],66:[2,17],99:[2,17],100:[2,17],101:[1,92],102:[1,93],103:[2,17],104:[2,17],105:[2,17],106:[2,17],107:[2,17],108:[2,17],109:[1,94],110:[1,95]},{6:[1,96]},{1:[2,19],6:[2,19],11:[2,19],13:[2,19],24:[2,19],28:[2,19],29:[2,19],35:[2,19],36:[2,19],41:[2,19],42:[2,19],43:[2,19],44:[2,19],45:[2,19],55:[2,19],58:[2,19],61:[2,19],62:[2,19],63:[2,19],64:[2,19],67:[2,19],68:[2,19],69:[2,19],70:[2,19],71:[2,19],72:[2,19],73:[2,19],74:[2,19],75:[2,19],76:[2,19],77:[2,19],78:[2,19],79:[2,19],80:[2,19],81:[2,19],82:[2,19],83:[2,19],84:[2,19],85:[2,19],86:[2,19],87:[2,19],88:[2,19],89:[2,19],90:[2,19],91:[2,19],92:[2,19],93:[2,19],94:[2,19],95:[2,19],96:[2,19],97:[2,19],98:[2,19],99:[2,19],100:[2,19]},{1:[2,20],6:[2,20],11:[2,20],13:[2,20],24:[2,20],28:[2,20],29:[2,20],35:[2,20],36:[2,20],41:[2,20],42:[2,20],43:[2,20],44:[2,20],45:[2,20],55:[2,20],58:[2,20],61:[2,20],62:[2,20],63:[2,20],64:[2,20],67:[2,20],68:[2,20],69:[2,20],70:[2,20],71:[2,20],72:[2,20],73:[2,20],74:[2,20],75:[2,20],76:[2,20],77:[2,20],78:[2,20],79:[2,20],80:[2,20],81:[2,20],82:[2,20],83:[2,20],84:[2,20],85:[2,20],86:[2,20],87:[2,20],88:[2,20],89:[2,20],90:[2,20],91:[2,20],92:[2,20],93:[2,20],94:[2,20],95:[2,20],96:[2,20],97:[2,20],98:[2,20],99:[2,20],100:[2,20]},{1:[2,21],6:[2,21],11:[2,21],13:[2,21],24:[2,21],28:[2,21],29:[2,21],35:[2,21],36:[2,21],41:[2,21],42:[2,21],43:[2,21],44:[2,21],45:[2,21],55:[2,21],58:[2,21],61:[2,21],62:[2,21],63:[2,21],64:[2,21],67:[2,21],68:[2,21],69:[2,21],70:[2,21],71:[2,21],72:[2,21],73:[2,21],74:[2,21],75:[2,21],76:[2,21],77:[2,21],78:[2,21],79:[2,21],80:[2,21],81:[2,21],82:[2,21],83:[2,21],84:[2,21],85:[2,21],86:[2,21],87:[2,21],88:[2,21],89:[2,21],90:[2,21],91:[2,21],92:[2,21],93:[2,21],94:[2,21],95:[2,21],96:[2,21],97:[2,21],98:[2,21],99:[2,21],100:[2,21]},{1:[2,22],6:[2,22],11:[2,22],13:[2,22],24:[2,22],28:[2,22],29:[2,22],35:[2,22],36:[2,22],41:[2,22],42:[2,22],43:[2,22],44:[2,22],45:[2,22],55:[2,22],58:[2,22],61:[2,22],62:[2,22],63:[2,22],64:[2,22],67:[2,22],68:[2,22],69:[2,22],70:[2,22],71:[2,22],72:[2,22],73:[2,22],74:[2,22],75:[2,22],76:[2,22],77:[2,22],78:[2,22],79:[2,22],80:[2,22],81:[2,22],82:[2,22],83:[2,22],84:[2,22],85:[2,22],86:[2,22],87:[2,22],88:[2,22],89:[2,22],90:[2,22],91:[2,22],92:[2,22],93:[2,22],94:[2,22],95:[2,22],96:[2,22],97:[2,22],98:[2,22],99:[2,22],100:[2,22]},{6:[1,97],40:[1,98]},{6:[1,99]},{6:[1,100]},{6:[1,101]},{1:[2,27],6:[2,27],11:[2,27],13:[2,27],24:[2,27],28:[2,27],29:[2,27],35:[2,27],36:[2,27],41:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[2,27],55:[2,27],58:[2,27],61:[2,27],62:[2,27],63:[2,27],64:[2,27],67:[2,27],68:[2,27],69:[2,27],70:[2,27],71:[2,27],72:[2,27],73:[2,27],74:[2,27],75:[2,27],76:[2,27],77:[2,27],78:[2,27],79:[2,27],80:[2,27],81:[2,27],82:[2,27],83:[2,27],84:[2,27],85:[2,27],86:[2,27],87:[2,27],88:[2,27],89:[2,27],90:[2,27],91:[2,27],92:[2,27],93:[2,27],94:[2,27],95:[2,27],96:[2,27],97:[2,27],98:[2,27],99:[2,27],100:[2,27]},{6:[2,79],40:[2,79],49:[2,79],57:[2,79],60:[2,79],66:[2,79],99:[2,79],100:[2,79],103:[2,79],104:[2,79],105:[2,79],106:[2,79],107:[2,79],108:[2,79]},{6:[2,80],40:[2,80],49:[2,80],57:[2,80],60:[2,80],66:[2,80],99:[2,80],100:[2,80],103:[2,80],104:[2,80],105:[2,80],106:[2,80],107:[2,80],108:[2,80]},{39:103,47:[1,105],54:102,55:[1,104],61:[1,72]},{6:[2,74],40:[2,74],49:[2,74],57:[2,74],60:[2,74],66:[2,74],99:[2,74],100:[2,74],103:[2,74],104:[2,74],105:[2,74],106:[2,74],107:[2,74],108:[2,74]},{6:[2,133],40:[2,133],46:[2,133],47:[1,105],49:[2,133],54:106,55:[1,104],57:[2,133],60:[2,133],66:[2,133],99:[2,133],100:[2,133],101:[2,133],102:[2,133],103:[2,133],104:[2,133],105:[2,133],106:[2,133],107:[2,133],108:[2,133],109:[2,133],110:[2,133]},{8:107,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:109,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:110,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:111,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],65:[1,112],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[2,134],40:[2,134],46:[2,134],49:[2,134],57:[2,134],60:[2,134],66:[2,134],99:[2,134],100:[2,134],101:[2,134],102:[2,134],103:[2,134],104:[2,134],105:[2,134],106:[2,134],107:[2,134],108:[2,134],109:[2,134],110:[2,134]},{6:[2,82],8:113,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,51],6:[2,51],11:[2,51],13:[2,51],24:[2,51],28:[2,51],29:[2,51],35:[2,51],36:[2,51],41:[2,51],42:[2,51],43:[2,51],44:[2,51],45:[2,51],55:[2,51],58:[2,51],61:[2,51],62:[2,51],63:[2,51],64:[2,51],67:[2,51],68:[2,51],69:[2,51],70:[2,51],71:[2,51],72:[2,51],73:[2,51],74:[2,51],75:[2,51],76:[2,51],77:[2,51],78:[2,51],79:[2,51],80:[2,51],81:[2,51],82:[2,51],83:[2,51],84:[2,51],85:[2,51],86:[2,51],87:[2,51],88:[2,51],89:[2,51],90:[2,51],91:[2,51],92:[2,51],93:[2,51],94:[2,51],95:[2,51],96:[2,51],97:[2,51],98:[2,51],99:[2,51],100:[2,51]},{18:114,55:[1,34]},{31:115,67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71]},{30:116,32:[1,117],33:[1,118],34:[1,119]},{6:[2,86],40:[2,86],47:[2,86],49:[2,86],55:[2,86],61:[2,86]},{6:[2,87],40:[2,87],47:[2,87],49:[2,87],55:[2,87],61:[2,87]},{6:[2,88],40:[2,88],47:[2,88],49:[2,88],55:[2,88],61:[2,88]},{6:[2,89],40:[2,89],47:[2,89],49:[2,89],55:[2,89],61:[2,89]},{6:[2,90],40:[2,90],47:[2,90],49:[2,90],55:[2,90],61:[2,90]},{6:[2,91],40:[2,91],47:[2,91],49:[2,91],55:[2,91],61:[2,91]},{6:[2,92],40:[2,92],47:[2,92],49:[2,92],55:[2,92],61:[2,92]},{6:[2,93],40:[2,93],47:[2,93],49:[2,93],55:[2,93],61:[2,93]},{6:[2,94],40:[2,94],47:[2,94],49:[2,94],55:[2,94],61:[2,94]},{6:[2,95],40:[2,95],47:[2,95],49:[2,95],55:[2,95],61:[2,95]},{6:[2,96],40:[2,96],47:[2,96],49:[2,96],55:[2,96],61:[2,96]},{6:[2,97],40:[2,97],47:[2,97],49:[2,97],55:[2,97],61:[2,97]},{6:[2,98],40:[2,98],47:[2,98],49:[2,98],55:[2,98],61:[2,98]},{6:[2,99],40:[2,99],47:[2,99],49:[2,99],55:[2,99],61:[2,99]},{6:[2,100],40:[2,100],47:[2,100],49:[2,100],55:[2,100],61:[2,100]},{6:[2,101],40:[2,101],47:[2,101],49:[2,101],55:[2,101],61:[2,101]},{6:[2,102],40:[2,102],47:[2,102],49:[2,102],55:[2,102],61:[2,102]},{6:[2,103],40:[2,103],47:[2,103],49:[2,103],55:[2,103],61:[2,103]},{6:[2,104],40:[2,104],47:[2,104],49:[2,104],55:[2,104],61:[2,104]},{6:[2,105],40:[2,105],47:[2,105],49:[2,105],55:[2,105],61:[2,105]},{6:[2,106],40:[2,106],47:[2,106],49:[2,106],55:[2,106],61:[2,106]},{6:[2,107],40:[2,107],47:[2,107],49:[2,107],55:[2,107],61:[2,107]},{6:[2,108],40:[2,108],47:[2,108],49:[2,108],55:[2,108],61:[2,108]},{6:[2,109],40:[2,109],47:[2,109],49:[2,109],55:[2,109],61:[2,109]},{6:[2,110],40:[2,110],47:[2,110],49:[2,110],55:[2,110],61:[2,110]},{6:[2,111],40:[2,111],47:[2,111],49:[2,111],55:[2,111],61:[2,111]},{6:[2,112],40:[2,112],47:[2,112],49:[2,112],55:[2,112],61:[2,112]},{6:[2,113],40:[2,113],47:[2,113],49:[2,113],55:[2,113],61:[2,113]},{6:[2,114],40:[2,114],47:[2,114],49:[2,114],55:[2,114],61:[2,114]},{6:[2,115],40:[2,115],47:[2,115],49:[2,115],55:[2,115],61:[2,115]},{6:[2,116],40:[2,116],47:[2,116],49:[2,116],55:[2,116],61:[2,116]},{6:[2,78],40:[2,78],46:[2,78],47:[2,78],49:[2,78],55:[2,78],57:[2,78],60:[2,78],66:[2,78],99:[2,78],100:[2,78],101:[2,78],102:[2,78],103:[2,78],104:[2,78],105:[2,78],106:[2,78],107:[2,78],108:[2,78],109:[2,78],110:[2,78]},{67:[2,47],68:[2,47],69:[2,47],70:[2,47],71:[2,47],72:[2,47],73:[2,47],74:[2,47],75:[2,47],76:[2,47],77:[2,47],78:[2,47],79:[2,47],80:[2,47],81:[2,47],82:[2,47],83:[2,47],84:[2,47],85:[2,47],86:[2,47],87:[2,47],88:[2,47],89:[2,47],90:[2,47],91:[2,47],92:[2,47],93:[2,47],94:[2,47],95:[2,47],96:[2,47],97:[2,47]},{67:[2,48],68:[2,48],69:[2,48],70:[2,48],71:[2,48],72:[2,48],73:[2,48],74:[2,48],75:[2,48],76:[2,48],77:[2,48],78:[2,48],79:[2,48],80:[2,48],81:[2,48],82:[2,48],83:[2,48],84:[2,48],85:[2,48],86:[2,48],87:[2,48],88:[2,48],89:[2,48],90:[2,48],91:[2,48],92:[2,48],93:[2,48],94:[2,48],95:[2,48],96:[2,48],97:[2,48]},{67:[2,49],68:[2,49],69:[2,49],70:[2,49],71:[2,49],72:[2,49],73:[2,49],74:[2,49],75:[2,49],76:[2,49],77:[2,49],78:[2,49],79:[2,49],80:[2,49],81:[2,49],82:[2,49],83:[2,49],84:[2,49],85:[2,49],86:[2,49],87:[2,49],88:[2,49],89:[2,49],90:[2,49],91:[2,49],92:[2,49],93:[2,49],94:[2,49],95:[2,49],96:[2,49],97:[2,49]},{67:[2,50],68:[2,50],69:[2,50],70:[2,50],71:[2,50],72:[2,50],73:[2,50],74:[2,50],75:[2,50],76:[2,50],77:[2,50],78:[2,50],79:[2,50],80:[2,50],81:[2,50],82:[2,50],83:[2,50],84:[2,50],85:[2,50],86:[2,50],87:[2,50],88:[2,50],89:[2,50],90:[2,50],91:[2,50],92:[2,50],93:[2,50],94:[2,50],95:[2,50],96:[2,50],97:[2,50]},{1:[2,5],6:[2,5],11:[2,5],13:[2,5],24:[2,5],28:[2,5],29:[2,5],35:[2,5],41:[2,5],42:[2,5],43:[2,5],44:[2,5],45:[2,5],55:[2,5],58:[2,5],61:[2,5],62:[2,5],63:[2,5],64:[2,5],67:[2,5],68:[2,5],69:[2,5],70:[2,5],71:[2,5],72:[2,5],73:[2,5],74:[2,5],75:[2,5],76:[2,5],77:[2,5],78:[2,5],79:[2,5],80:[2,5],81:[2,5],82:[2,5],83:[2,5],84:[2,5],85:[2,5],86:[2,5],87:[2,5],88:[2,5],89:[2,5],90:[2,5],91:[2,5],92:[2,5],93:[2,5],94:[2,5],95:[2,5],96:[2,5],97:[2,5],98:[2,5],99:[2,5],100:[2,5]},{1:[2,3]},{1:[2,8],6:[2,8],11:[2,8],13:[2,8],24:[2,8],28:[2,8],29:[2,8],35:[2,8],36:[2,8],41:[2,8],42:[2,8],43:[2,8],44:[2,8],45:[2,8],55:[2,8],58:[2,8],61:[2,8],62:[2,8],63:[2,8],64:[2,8],67:[2,8],68:[2,8],69:[2,8],70:[2,8],71:[2,8],72:[2,8],73:[2,8],74:[2,8],75:[2,8],76:[2,8],77:[2,8],78:[2,8],79:[2,8],80:[2,8],81:[2,8],82:[2,8],83:[2,8],84:[2,8],85:[2,8],86:[2,8],87:[2,8],88:[2,8],89:[2,8],90:[2,8],91:[2,8],92:[2,8],93:[2,8],94:[2,8],95:[2,8],96:[2,8],97:[2,8],98:[2,8],99:[2,8],100:[2,8]},{6:[1,25],7:77,8:6,9:7,11:[1,120],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,6],6:[2,6],11:[2,6],13:[2,6],24:[2,6],28:[2,6],29:[2,6],35:[2,6],36:[2,6],41:[2,6],42:[2,6],43:[2,6],44:[2,6],45:[2,6],55:[2,6],58:[2,6],61:[2,6],62:[2,6],63:[2,6],64:[2,6],67:[2,6],68:[2,6],69:[2,6],70:[2,6],71:[2,6],72:[2,6],73:[2,6],74:[2,6],75:[2,6],76:[2,6],77:[2,6],78:[2,6],79:[2,6],80:[2,6],81:[2,6],82:[2,6],83:[2,6],84:[2,6],85:[2,6],86:[2,6],87:[2,6],88:[2,6],89:[2,6],90:[2,6],91:[2,6],92:[2,6],93:[2,6],94:[2,6],95:[2,6],96:[2,6],97:[2,6],98:[2,6],99:[2,6],100:[2,6]},{6:[2,122],40:[2,122],49:[2,122],57:[2,122],60:[2,122],66:[2,122],99:[2,122],100:[2,122],103:[2,122],104:[2,122],105:[2,122],106:[2,122],107:[2,122],108:[2,122]},{8:121,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:122,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:123,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:124,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:125,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:126,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:127,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{39:128,61:[1,72]},{8:129,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[2,120],40:[2,120],49:[2,120],57:[2,120],60:[2,120],66:[2,120],99:[2,120],100:[2,120],103:[2,120],104:[2,120],105:[2,120],106:[2,120],107:[2,120],108:[2,120]},{6:[2,121],40:[2,121],49:[2,121],57:[2,121],60:[2,121],66:[2,121],99:[2,121],100:[2,121],103:[2,121],104:[2,121],105:[2,121],106:[2,121],107:[2,121],108:[2,121]},{8:130,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],65:[1,131],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:132,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,18],6:[2,18],11:[2,18],13:[2,18],24:[2,18],28:[2,18],29:[2,18],35:[2,18],36:[2,18],41:[2,18],42:[2,18],43:[2,18],44:[2,18],45:[2,18],55:[2,18],58:[2,18],61:[2,18],62:[2,18],63:[2,18],64:[2,18],67:[2,18],68:[2,18],69:[2,18],70:[2,18],71:[2,18],72:[2,18],73:[2,18],74:[2,18],75:[2,18],76:[2,18],77:[2,18],78:[2,18],79:[2,18],80:[2,18],81:[2,18],82:[2,18],83:[2,18],84:[2,18],85:[2,18],86:[2,18],87:[2,18],88:[2,18],89:[2,18],90:[2,18],91:[2,18],92:[2,18],93:[2,18],94:[2,18],95:[2,18],96:[2,18],97:[2,18],98:[2,18],99:[2,18],100:[2,18]},{1:[2,23],6:[2,23],11:[2,23],13:[2,23],24:[2,23],28:[2,23],29:[2,23],35:[2,23],36:[2,23],41:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],55:[2,23],58:[2,23],61:[2,23],62:[2,23],63:[2,23],64:[2,23],67:[2,23],68:[2,23],69:[2,23],70:[2,23],71:[2,23],72:[2,23],73:[2,23],74:[2,23],75:[2,23],76:[2,23],77:[2,23],78:[2,23],79:[2,23],80:[2,23],81:[2,23],82:[2,23],83:[2,23],84:[2,23],85:[2,23],86:[2,23],87:[2,23],88:[2,23],89:[2,23],90:[2,23],91:[2,23],92:[2,23],93:[2,23],94:[2,23],95:[2,23],96:[2,23],97:[2,23],98:[2,23],99:[2,23],100:[2,23]},{39:133,61:[1,72]},{1:[2,24],6:[2,24],11:[2,24],13:[2,24],24:[2,24],28:[2,24],29:[2,24],35:[2,24],36:[2,24],41:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],55:[2,24],58:[2,24],61:[2,24],62:[2,24],63:[2,24],64:[2,24],67:[2,24],68:[2,24],69:[2,24],70:[2,24],71:[2,24],72:[2,24],73:[2,24],74:[2,24],75:[2,24],76:[2,24],77:[2,24],78:[2,24],79:[2,24],80:[2,24],81:[2,24],82:[2,24],83:[2,24],84:[2,24],85:[2,24],86:[2,24],87:[2,24],88:[2,24],89:[2,24],90:[2,24],91:[2,24],92:[2,24],93:[2,24],94:[2,24],95:[2,24],96:[2,24],97:[2,24],98:[2,24],99:[2,24],100:[2,24]},{1:[2,25],6:[2,25],11:[2,25],13:[2,25],24:[2,25],28:[2,25],29:[2,25],35:[2,25],36:[2,25],41:[2,25],42:[2,25],43:[2,25],44:[2,25],45:[2,25],55:[2,25],58:[2,25],61:[2,25],62:[2,25],63:[2,25],64:[2,25],67:[2,25],68:[2,25],69:[2,25],70:[2,25],71:[2,25],72:[2,25],73:[2,25],74:[2,25],75:[2,25],76:[2,25],77:[2,25],78:[2,25],79:[2,25],80:[2,25],81:[2,25],82:[2,25],83:[2,25],84:[2,25],85:[2,25],86:[2,25],87:[2,25],88:[2,25],89:[2,25],90:[2,25],91:[2,25],92:[2,25],93:[2,25],94:[2,25],95:[2,25],96:[2,25],97:[2,25],98:[2,25],99:[2,25],100:[2,25]},{1:[2,26],6:[2,26],11:[2,26],13:[2,26],24:[2,26],28:[2,26],29:[2,26],35:[2,26],36:[2,26],41:[2,26],42:[2,26],43:[2,26],44:[2,26],45:[2,26],55:[2,26],58:[2,26],61:[2,26],62:[2,26],63:[2,26],64:[2,26],67:[2,26],68:[2,26],69:[2,26],70:[2,26],71:[2,26],72:[2,26],73:[2,26],74:[2,26],75:[2,26],76:[2,26],77:[2,26],78:[2,26],79:[2,26],80:[2,26],81:[2,26],82:[2,26],83:[2,26],84:[2,26],85:[2,26],86:[2,26],87:[2,26],88:[2,26],89:[2,26],90:[2,26],91:[2,26],92:[2,26],93:[2,26],94:[2,26],95:[2,26],96:[2,26],97:[2,26],98:[2,26],99:[2,26],100:[2,26]},{6:[2,81],40:[2,81],49:[2,81],57:[2,81],60:[2,81],66:[2,81],99:[2,81],100:[2,81],103:[2,81],104:[2,81],105:[2,81],106:[2,81],107:[2,81],108:[2,81]},{6:[2,52],40:[2,52],46:[1,135],47:[1,134]},{8:138,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,49:[1,137],55:[1,34],56:136,58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{8:138,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,49:[1,140],55:[1,34],56:139,57:[1,141],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[2,75],40:[2,75],49:[2,75],57:[2,75],60:[2,75],66:[2,75],99:[2,75],100:[2,75],103:[2,75],104:[2,75],105:[2,75],106:[2,75],107:[2,75],108:[2,75]},{6:[2,117],40:[2,117],49:[2,117],57:[2,117],60:[1,90],66:[2,117],99:[2,117],100:[2,117],103:[1,82],104:[2,117],105:[2,117],106:[2,117],107:[2,117],108:[2,117]},{47:[1,105],54:102,55:[1,104]},{6:[2,118],40:[2,118],49:[2,118],57:[2,118],60:[1,90],66:[2,118],99:[2,118],100:[2,118],103:[1,82],104:[2,118],105:[2,118],106:[2,118],107:[2,118],108:[2,118]},{6:[2,119],40:[2,119],49:[2,119],57:[2,119],60:[1,90],66:[2,119],99:[2,119],100:[2,119],103:[1,82],104:[2,119],105:[2,119],106:[2,119],107:[2,119],108:[2,119]},{49:[1,142],60:[1,90],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{8:143,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[2,83],60:[1,90],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{6:[1,25],7:145,8:6,9:7,10:[1,144],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{38:146,39:147,61:[1,72]},{31:148,67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71]},{67:[2,29],68:[2,29],69:[2,29],70:[2,29],71:[2,29],72:[2,29],73:[2,29],74:[2,29],75:[2,29],76:[2,29],77:[2,29],78:[2,29],79:[2,29],80:[2,29],81:[2,29],82:[2,29],83:[2,29],84:[2,29],85:[2,29],86:[2,29],87:[2,29],88:[2,29],89:[2,29],90:[2,29],91:[2,29],92:[2,29],93:[2,29],94:[2,29],95:[2,29],96:[2,29],97:[2,29]},{67:[2,30],68:[2,30],69:[2,30],70:[2,30],71:[2,30],72:[2,30],73:[2,30],74:[2,30],75:[2,30],76:[2,30],77:[2,30],78:[2,30],79:[2,30],80:[2,30],81:[2,30],82:[2,30],83:[2,30],84:[2,30],85:[2,30],86:[2,30],87:[2,30],88:[2,30],89:[2,30],90:[2,30],91:[2,30],92:[2,30],93:[2,30],94:[2,30],95:[2,30],96:[2,30],97:[2,30]},{67:[2,31],68:[2,31],69:[2,31],70:[2,31],71:[2,31],72:[2,31],73:[2,31],74:[2,31],75:[2,31],76:[2,31],77:[2,31],78:[2,31],79:[2,31],80:[2,31],81:[2,31],82:[2,31],83:[2,31],84:[2,31],85:[2,31],86:[2,31],87:[2,31],88:[2,31],89:[2,31],90:[2,31],91:[2,31],92:[2,31],93:[2,31],94:[2,31],95:[2,31],96:[2,31],97:[2,31]},{1:[2,9],6:[2,9],11:[2,9],13:[2,9],24:[2,9],28:[2,9],29:[2,9],35:[2,9],36:[2,9],41:[2,9],42:[2,9],43:[2,9],44:[2,9],45:[2,9],55:[2,9],58:[2,9],61:[2,9],62:[2,9],63:[2,9],64:[2,9],67:[2,9],68:[2,9],69:[2,9],70:[2,9],71:[2,9],72:[2,9],73:[2,9],74:[2,9],75:[2,9],76:[2,9],77:[2,9],78:[2,9],79:[2,9],80:[2,9],81:[2,9],82:[2,9],83:[2,9],84:[2,9],85:[2,9],86:[2,9],87:[2,9],88:[2,9],89:[2,9],90:[2,9],91:[2,9],92:[2,9],93:[2,9],94:[2,9],95:[2,9],96:[2,9],97:[2,9],98:[2,9],99:[2,9],100:[2,9]},{6:[2,123],40:[2,123],49:[2,123],57:[2,123],60:[1,90],66:[2,123],99:[2,123],100:[2,123],103:[1,82],104:[1,85],105:[2,123],106:[2,123],107:[2,123],108:[2,123]},{6:[2,124],40:[2,124],49:[2,124],57:[2,124],60:[1,90],66:[2,124],99:[2,124],100:[2,124],103:[1,82],104:[1,85],105:[2,124],106:[2,124],107:[2,124],108:[2,124]},{6:[2,125],40:[2,125],49:[2,125],57:[2,125],60:[1,90],66:[2,125],99:[2,125],100:[2,125],103:[1,82],104:[2,125],105:[2,125],106:[2,125],107:[2,125],108:[2,125]},{6:[2,126],40:[2,126],49:[2,126],57:[2,126],60:[1,90],66:[2,126],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[2,126],106:[2,126],107:[2,126],108:[2,126]},{6:[2,127],40:[2,127],49:[2,127],57:[2,127],60:[1,90],66:[2,127],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[2,127],107:[2,127],108:[1,89]},{6:[2,128],40:[2,128],49:[2,128],57:[2,128],60:[1,90],66:[2,128],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[2,128],108:[1,89]},{6:[2,129],40:[2,129],49:[2,129],57:[2,129],60:[1,90],66:[2,129],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[2,129],107:[2,129],108:[2,129]},{6:[2,77],40:[2,77],46:[2,77],49:[2,77],57:[2,77],60:[2,77],66:[2,77],99:[2,77],100:[2,77],101:[2,77],102:[2,77],103:[2,77],104:[2,77],105:[2,77],106:[2,77],107:[2,77],108:[2,77],109:[2,77],110:[2,77]},{6:[2,76],40:[2,76],49:[2,76],57:[2,76],60:[1,90],66:[2,76],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{6:[2,130],40:[2,130],49:[2,130],57:[2,130],60:[1,90],66:[2,130],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{8:149,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[2,132],40:[2,132],49:[2,132],57:[2,132],60:[1,90],66:[2,132],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{6:[2,54],40:[2,54],46:[1,150]},{31:153,48:151,49:[1,152],50:154,51:[1,155],52:[1,156],53:[1,157],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71]},{8:158,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{40:[1,160],49:[1,159]},{6:[2,68],40:[2,68],49:[2,68],57:[2,68],60:[2,68],66:[2,68],99:[2,68],100:[2,68],103:[2,68],104:[2,68],105:[2,68],106:[2,68],107:[2,68],108:[2,68]},{40:[2,72],49:[2,72],57:[2,72],60:[1,90],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{40:[1,160],49:[1,161],57:[1,162]},{6:[2,69],40:[2,69],49:[2,69],57:[2,69],60:[2,69],66:[2,69],99:[2,69],100:[2,69],103:[2,69],104:[2,69],105:[2,69],106:[2,69],107:[2,69],108:[2,69]},{6:[2,70],40:[2,70],49:[2,70],57:[2,70],60:[2,70],66:[2,70],99:[2,70],100:[2,70],103:[2,70],104:[2,70],105:[2,70],106:[2,70],107:[2,70],108:[2,70]},{6:[2,84],10:[2,84],13:[2,84],24:[2,84],28:[2,84],29:[2,84],35:[2,84],40:[2,84],41:[2,84],42:[2,84],43:[2,84],44:[2,84],45:[2,84],49:[2,84],55:[2,84],57:[2,84],58:[2,84],60:[2,84],61:[2,84],62:[2,84],63:[2,84],64:[2,84],66:[2,84],67:[2,84],68:[2,84],69:[2,84],70:[2,84],71:[2,84],72:[2,84],73:[2,84],74:[2,84],75:[2,84],76:[2,84],77:[2,84],78:[2,84],79:[2,84],80:[2,84],81:[2,84],82:[2,84],83:[2,84],84:[2,84],85:[2,84],86:[2,84],87:[2,84],88:[2,84],89:[2,84],90:[2,84],91:[2,84],92:[2,84],93:[2,84],94:[2,84],95:[2,84],96:[2,84],97:[2,84],98:[2,84],99:[2,84],100:[2,84],103:[2,84],104:[2,84],105:[2,84],106:[2,84],107:[2,84],108:[2,84]},{60:[1,90],66:[1,163],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{4:164,6:[1,25],7:4,8:6,9:7,11:[1,165],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,40],6:[2,40],11:[2,40],13:[2,40],24:[2,40],28:[2,40],29:[2,40],35:[2,40],36:[1,166],41:[2,40],42:[2,40],43:[2,40],44:[2,40],45:[2,40],55:[2,40],58:[2,40],61:[2,40],62:[2,40],63:[2,40],64:[2,40],67:[2,40],68:[2,40],69:[2,40],70:[2,40],71:[2,40],72:[2,40],73:[2,40],74:[2,40],75:[2,40],76:[2,40],77:[2,40],78:[2,40],79:[2,40],80:[2,40],81:[2,40],82:[2,40],83:[2,40],84:[2,40],85:[2,40],86:[2,40],87:[2,40],88:[2,40],89:[2,40],90:[2,40],91:[2,40],92:[2,40],93:[2,40],94:[2,40],95:[2,40],96:[2,40],97:[2,40],98:[2,40],99:[2,40],100:[2,40]},{6:[2,44],40:[1,167]},{6:[2,45],40:[2,45]},{6:[2,28]},{60:[1,90],66:[1,168],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{8:169,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{40:[1,171],49:[1,170]},{5:172,10:[1,5]},{39:173,40:[2,58],49:[2,58],61:[1,72]},{31:174,67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71]},{67:[2,63],68:[2,63],69:[2,63],70:[2,63],71:[2,63],72:[2,63],73:[2,63],74:[2,63],75:[2,63],76:[2,63],77:[2,63],78:[2,63],79:[2,63],80:[2,63],81:[2,63],82:[2,63],83:[2,63],84:[2,63],85:[2,63],86:[2,63],87:[2,63],88:[2,63],89:[2,63],90:[2,63],91:[2,63],92:[2,63],93:[2,63],94:[2,63],95:[2,63],96:[2,63],97:[2,63]},{67:[2,64],68:[2,64],69:[2,64],70:[2,64],71:[2,64],72:[2,64],73:[2,64],74:[2,64],75:[2,64],76:[2,64],77:[2,64],78:[2,64],79:[2,64],80:[2,64],81:[2,64],82:[2,64],83:[2,64],84:[2,64],85:[2,64],86:[2,64],87:[2,64],88:[2,64],89:[2,64],90:[2,64],91:[2,64],92:[2,64],93:[2,64],94:[2,64],95:[2,64],96:[2,64],97:[2,64]},{67:[2,65],68:[2,65],69:[2,65],70:[2,65],71:[2,65],72:[2,65],73:[2,65],74:[2,65],75:[2,65],76:[2,65],77:[2,65],78:[2,65],79:[2,65],80:[2,65],81:[2,65],82:[2,65],83:[2,65],84:[2,65],85:[2,65],86:[2,65],87:[2,65],88:[2,65],89:[2,65],90:[2,65],91:[2,65],92:[2,65],93:[2,65],94:[2,65],95:[2,65],96:[2,65],97:[2,65]},{6:[2,53],40:[2,53],60:[1,90],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{6:[2,66],40:[2,66],49:[2,66],57:[2,66],60:[2,66],66:[2,66],99:[2,66],100:[2,66],103:[2,66],104:[2,66],105:[2,66],106:[2,66],107:[2,66],108:[2,66]},{8:175,12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,31:108,39:30,55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{6:[2,67],40:[2,67],49:[2,67],57:[2,67],60:[2,67],66:[2,67],99:[2,67],100:[2,67],103:[2,67],104:[2,67],105:[2,67],106:[2,67],107:[2,67],108:[2,67]},{6:[2,71],40:[2,71],49:[2,71],57:[2,71],60:[2,71],66:[2,71],99:[2,71],100:[2,71],103:[2,71],104:[2,71],105:[2,71],106:[2,71],107:[2,71],108:[2,71]},{49:[1,176]},{6:[1,25],7:77,8:6,9:7,11:[1,177],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,36],6:[2,36],11:[2,36],13:[2,36],24:[2,36],28:[2,36],29:[2,36],35:[2,36],36:[1,178],41:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],55:[2,36],58:[2,36],61:[2,36],62:[2,36],63:[2,36],64:[2,36],67:[2,36],68:[2,36],69:[2,36],70:[2,36],71:[2,36],72:[2,36],73:[2,36],74:[2,36],75:[2,36],76:[2,36],77:[2,36],78:[2,36],79:[2,36],80:[2,36],81:[2,36],82:[2,36],83:[2,36],84:[2,36],85:[2,36],86:[2,36],87:[2,36],88:[2,36],89:[2,36],90:[2,36],91:[2,36],92:[2,36],93:[2,36],94:[2,36],95:[2,36],96:[2,36],97:[2,36],98:[2,36],99:[2,36],100:[2,36]},{6:[1,25],7:180,8:6,9:7,10:[1,179],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{39:181,61:[1,72]},{6:[2,131],40:[2,131],49:[2,131],57:[2,131],60:[2,131],66:[2,131],99:[2,131],100:[2,131],103:[2,131],104:[2,131],105:[2,131],106:[2,131],107:[2,131],108:[2,131]},{6:[2,55],40:[2,55],60:[1,90],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{5:182,10:[1,5]},{31:183,50:184,51:[1,155],52:[1,156],53:[1,157],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71]},{1:[2,57],6:[2,57],11:[2,57],13:[2,57],24:[2,57],28:[2,57],29:[2,57],35:[2,57],36:[2,57],41:[2,57],42:[2,57],43:[2,57],44:[2,57],45:[2,57],55:[2,57],58:[2,57],61:[2,57],62:[2,57],63:[2,57],64:[2,57],67:[2,57],68:[2,57],69:[2,57],70:[2,57],71:[2,57],72:[2,57],73:[2,57],74:[2,57],75:[2,57],76:[2,57],77:[2,57],78:[2,57],79:[2,57],80:[2,57],81:[2,57],82:[2,57],83:[2,57],84:[2,57],85:[2,57],86:[2,57],87:[2,57],88:[2,57],89:[2,57],90:[2,57],91:[2,57],92:[2,57],93:[2,57],94:[2,57],95:[2,57],96:[2,57],97:[2,57],98:[2,57],99:[2,57],100:[2,57]},{40:[2,59],49:[2,59]},{39:185,61:[1,72]},{40:[2,73],49:[2,73],57:[2,73],60:[1,90],99:[1,84],100:[1,83],103:[1,82],104:[1,85],105:[1,86],106:[1,87],107:[1,88],108:[1,89]},{6:[2,85],10:[2,85],13:[2,85],24:[2,85],28:[2,85],29:[2,85],35:[2,85],40:[2,85],41:[2,85],42:[2,85],43:[2,85],44:[2,85],45:[2,85],49:[2,85],55:[2,85],57:[2,85],58:[2,85],60:[2,85],61:[2,85],62:[2,85],63:[2,85],64:[2,85],66:[2,85],67:[2,85],68:[2,85],69:[2,85],70:[2,85],71:[2,85],72:[2,85],73:[2,85],74:[2,85],75:[2,85],76:[2,85],77:[2,85],78:[2,85],79:[2,85],80:[2,85],81:[2,85],82:[2,85],83:[2,85],84:[2,85],85:[2,85],86:[2,85],87:[2,85],88:[2,85],89:[2,85],90:[2,85],91:[2,85],92:[2,85],93:[2,85],94:[2,85],95:[2,85],96:[2,85],97:[2,85],98:[2,85],99:[2,85],100:[2,85],103:[2,85],104:[2,85],105:[2,85],106:[2,85],107:[2,85],108:[2,85]},{1:[2,32],6:[2,32],11:[2,32],13:[2,32],24:[2,32],28:[2,32],29:[2,32],35:[2,32],36:[1,186],41:[2,32],42:[2,32],43:[2,32],44:[2,32],45:[2,32],55:[2,32],58:[2,32],61:[2,32],62:[2,32],63:[2,32],64:[2,32],67:[2,32],68:[2,32],69:[2,32],70:[2,32],71:[2,32],72:[2,32],73:[2,32],74:[2,32],75:[2,32],76:[2,32],77:[2,32],78:[2,32],79:[2,32],80:[2,32],81:[2,32],82:[2,32],83:[2,32],84:[2,32],85:[2,32],86:[2,32],87:[2,32],88:[2,32],89:[2,32],90:[2,32],91:[2,32],92:[2,32],93:[2,32],94:[2,32],95:[2,32],96:[2,32],97:[2,32],98:[2,32],99:[2,32],100:[2,32]},{6:[1,25],7:188,8:6,9:7,10:[1,187],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{4:189,6:[1,25],7:4,8:6,9:7,11:[1,190],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,43],6:[2,43],11:[2,43],13:[2,43],24:[2,43],28:[2,43],29:[2,43],35:[2,43],36:[2,43],41:[2,43],42:[2,43],43:[2,43],44:[2,43],45:[2,43],55:[2,43],58:[2,43],61:[2,43],62:[2,43],63:[2,43],64:[2,43],67:[2,43],68:[2,43],69:[2,43],70:[2,43],71:[2,43],72:[2,43],73:[2,43],74:[2,43],75:[2,43],76:[2,43],77:[2,43],78:[2,43],79:[2,43],80:[2,43],81:[2,43],82:[2,43],83:[2,43],84:[2,43],85:[2,43],86:[2,43],87:[2,43],88:[2,43],89:[2,43],90:[2,43],91:[2,43],92:[2,43],93:[2,43],94:[2,43],95:[2,43],96:[2,43],97:[2,43],98:[2,43],99:[2,43],100:[2,43]},{6:[2,46],40:[2,46]},{1:[2,56],6:[2,56],11:[2,56],13:[2,56],24:[2,56],28:[2,56],29:[2,56],35:[2,56],36:[2,56],41:[2,56],42:[2,56],43:[2,56],44:[2,56],45:[2,56],55:[2,56],58:[2,56],61:[2,56],62:[2,56],63:[2,56],64:[2,56],67:[2,56],68:[2,56],69:[2,56],70:[2,56],71:[2,56],72:[2,56],73:[2,56],74:[2,56],75:[2,56],76:[2,56],77:[2,56],78:[2,56],79:[2,56],80:[2,56],81:[2,56],82:[2,56],83:[2,56],84:[2,56],85:[2,56],86:[2,56],87:[2,56],88:[2,56],89:[2,56],90:[2,56],91:[2,56],92:[2,56],93:[2,56],94:[2,56],95:[2,56],96:[2,56],97:[2,56],98:[2,56],99:[2,56],100:[2,56]},{39:191,61:[1,72]},{31:192,67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71]},{40:[2,61],49:[2,61]},{6:[1,25],7:194,8:6,9:7,10:[1,193],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{4:195,6:[1,25],7:4,8:6,9:7,11:[1,196],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,39],6:[2,39],11:[2,39],13:[2,39],24:[2,39],28:[2,39],29:[2,39],35:[2,39],36:[2,39],41:[2,39],42:[2,39],43:[2,39],44:[2,39],45:[2,39],55:[2,39],58:[2,39],61:[2,39],62:[2,39],63:[2,39],64:[2,39],67:[2,39],68:[2,39],69:[2,39],70:[2,39],71:[2,39],72:[2,39],73:[2,39],74:[2,39],75:[2,39],76:[2,39],77:[2,39],78:[2,39],79:[2,39],80:[2,39],81:[2,39],82:[2,39],83:[2,39],84:[2,39],85:[2,39],86:[2,39],87:[2,39],88:[2,39],89:[2,39],90:[2,39],91:[2,39],92:[2,39],93:[2,39],94:[2,39],95:[2,39],96:[2,39],97:[2,39],98:[2,39],99:[2,39],100:[2,39]},{6:[1,25],7:77,8:6,9:7,11:[1,197],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,42],6:[2,42],11:[2,42],13:[2,42],24:[2,42],28:[2,42],29:[2,42],35:[2,42],36:[2,42],41:[2,42],42:[2,42],43:[2,42],44:[2,42],45:[2,42],55:[2,42],58:[2,42],61:[2,42],62:[2,42],63:[2,42],64:[2,42],67:[2,42],68:[2,42],69:[2,42],70:[2,42],71:[2,42],72:[2,42],73:[2,42],74:[2,42],75:[2,42],76:[2,42],77:[2,42],78:[2,42],79:[2,42],80:[2,42],81:[2,42],82:[2,42],83:[2,42],84:[2,42],85:[2,42],86:[2,42],87:[2,42],88:[2,42],89:[2,42],90:[2,42],91:[2,42],92:[2,42],93:[2,42],94:[2,42],95:[2,42],96:[2,42],97:[2,42],98:[2,42],99:[2,42],100:[2,42]},{40:[2,60],49:[2,60]},{39:198,61:[1,72]},{4:199,6:[1,25],7:4,8:6,9:7,11:[1,200],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,35],6:[2,35],11:[2,35],13:[2,35],24:[2,35],28:[2,35],29:[2,35],35:[2,35],36:[2,35],41:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],55:[2,35],58:[2,35],61:[2,35],62:[2,35],63:[2,35],64:[2,35],67:[2,35],68:[2,35],69:[2,35],70:[2,35],71:[2,35],72:[2,35],73:[2,35],74:[2,35],75:[2,35],76:[2,35],77:[2,35],78:[2,35],79:[2,35],80:[2,35],81:[2,35],82:[2,35],83:[2,35],84:[2,35],85:[2,35],86:[2,35],87:[2,35],88:[2,35],89:[2,35],90:[2,35],91:[2,35],92:[2,35],93:[2,35],94:[2,35],95:[2,35],96:[2,35],97:[2,35],98:[2,35],99:[2,35],100:[2,35]},{6:[1,25],7:77,8:6,9:7,11:[1,201],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,38],6:[2,38],11:[2,38],13:[2,38],24:[2,38],28:[2,38],29:[2,38],35:[2,38],36:[2,38],41:[2,38],42:[2,38],43:[2,38],44:[2,38],45:[2,38],55:[2,38],58:[2,38],61:[2,38],62:[2,38],63:[2,38],64:[2,38],67:[2,38],68:[2,38],69:[2,38],70:[2,38],71:[2,38],72:[2,38],73:[2,38],74:[2,38],75:[2,38],76:[2,38],77:[2,38],78:[2,38],79:[2,38],80:[2,38],81:[2,38],82:[2,38],83:[2,38],84:[2,38],85:[2,38],86:[2,38],87:[2,38],88:[2,38],89:[2,38],90:[2,38],91:[2,38],92:[2,38],93:[2,38],94:[2,38],95:[2,38],96:[2,38],97:[2,38],98:[2,38],99:[2,38],100:[2,38]},{1:[2,41],6:[2,41],11:[2,41],13:[2,41],24:[2,41],28:[2,41],29:[2,41],35:[2,41],36:[2,41],41:[2,41],42:[2,41],43:[2,41],44:[2,41],45:[2,41],55:[2,41],58:[2,41],61:[2,41],62:[2,41],63:[2,41],64:[2,41],67:[2,41],68:[2,41],69:[2,41],70:[2,41],71:[2,41],72:[2,41],73:[2,41],74:[2,41],75:[2,41],76:[2,41],77:[2,41],78:[2,41],79:[2,41],80:[2,41],81:[2,41],82:[2,41],83:[2,41],84:[2,41],85:[2,41],86:[2,41],87:[2,41],88:[2,41],89:[2,41],90:[2,41],91:[2,41],92:[2,41],93:[2,41],94:[2,41],95:[2,41],96:[2,41],97:[2,41],98:[2,41],99:[2,41],100:[2,41]},{40:[2,62],49:[2,62]},{6:[1,25],7:77,8:6,9:7,11:[1,202],12:8,13:[1,9],14:10,15:11,16:12,17:13,18:14,19:15,20:16,21:17,22:18,23:19,24:[1,20],25:21,26:22,27:23,28:[1,24],29:[1,40],31:28,35:[1,38],37:39,39:30,41:[1,73],42:[1,74],43:[1,75],44:[1,76],45:[1,37],55:[1,34],58:[1,29],59:35,61:[1,72],62:[1,26],63:[1,27],64:[1,36],67:[1,41],68:[1,42],69:[1,43],70:[1,44],71:[1,45],72:[1,46],73:[1,47],74:[1,48],75:[1,49],76:[1,50],77:[1,51],78:[1,52],79:[1,53],80:[1,54],81:[1,55],82:[1,56],83:[1,57],84:[1,58],85:[1,59],86:[1,60],87:[1,61],88:[1,62],89:[1,63],90:[1,64],91:[1,65],92:[1,66],93:[1,67],94:[1,68],95:[1,69],96:[1,70],97:[1,71],98:[1,31],99:[1,32],100:[1,33]},{1:[2,34],6:[2,34],11:[2,34],13:[2,34],24:[2,34],28:[2,34],29:[2,34],35:[2,34],36:[2,34],41:[2,34],42:[2,34],43:[2,34],44:[2,34],45:[2,34],55:[2,34],58:[2,34],61:[2,34],62:[2,34],63:[2,34],64:[2,34],67:[2,34],68:[2,34],69:[2,34],70:[2,34],71:[2,34],72:[2,34],73:[2,34],74:[2,34],75:[2,34],76:[2,34],77:[2,34],78:[2,34],79:[2,34],80:[2,34],81:[2,34],82:[2,34],83:[2,34],84:[2,34],85:[2,34],86:[2,34],87:[2,34],88:[2,34],89:[2,34],90:[2,34],91:[2,34],92:[2,34],93:[2,34],94:[2,34],95:[2,34],96:[2,34],97:[2,34],98:[2,34],99:[2,34],100:[2,34]},{1:[2,37],6:[2,37],11:[2,37],13:[2,37],24:[2,37],28:[2,37],29:[2,37],35:[2,37],36:[2,37],41:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],55:[2,37],58:[2,37],61:[2,37],62:[2,37],63:[2,37],64:[2,37],67:[2,37],68:[2,37],69:[2,37],70:[2,37],71:[2,37],72:[2,37],73:[2,37],74:[2,37],75:[2,37],76:[2,37],77:[2,37],78:[2,37],79:[2,37],80:[2,37],81:[2,37],82:[2,37],83:[2,37],84:[2,37],85:[2,37],86:[2,37],87:[2,37],88:[2,37],89:[2,37],90:[2,37],91:[2,37],92:[2,37],93:[2,37],94:[2,37],95:[2,37],96:[2,37],97:[2,37],98:[2,37],99:[2,37],100:[2,37]},{1:[2,33],6:[2,33],11:[2,33],13:[2,33],24:[2,33],28:[2,33],29:[2,33],35:[2,33],36:[2,33],41:[2,33],42:[2,33],43:[2,33],44:[2,33],45:[2,33],55:[2,33],58:[2,33],61:[2,33],62:[2,33],63:[2,33],64:[2,33],67:[2,33],68:[2,33],69:[2,33],70:[2,33],71:[2,33],72:[2,33],73:[2,33],74:[2,33],75:[2,33],76:[2,33],77:[2,33],78:[2,33],79:[2,33],80:[2,33],81:[2,33],82:[2,33],83:[2,33],84:[2,33],85:[2,33],86:[2,33],87:[2,33],88:[2,33],89:[2,33],90:[2,33],91:[2,33],92:[2,33],93:[2,33],94:[2,33],95:[2,33],96:[2,33],97:[2,33],98:[2,33],99:[2,33],100:[2,33]}],
defaultActions: {78:[2,3],148:[2,28]},
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
    _require["shader-script/glsl/preprocessor"] = function() {
      var exports = {};
      (function() {

  exports.Preprocessor = (function() {
    var DIRECTIVE_ALLOWED, DIRECTIVE_EXPR_ACCUMULATING, DIRECTIVE_NAME_ACCUMULATING, DIRECTIVE_NOT_ALLOWED;

    DIRECTIVE_NOT_ALLOWED = 1;

    DIRECTIVE_ALLOWED = 2;

    DIRECTIVE_NAME_ACCUMULATING = 4;

    DIRECTIVE_EXPR_ACCUMULATING = 8;

    function Preprocessor(source, env) {
      this.source = source;
      this.env = env != null ? env : {};
      this.conditions = [];
      this.process();
    }

    Preprocessor.prototype.processDirective = function(name, directive, state) {
      var expression, variableName;
      switch (name.toLowerCase()) {
        case 'define':
          if (!this.conditionIsTrue()) return false;
          variableName = directive.slice(0, directive.indexOf(' '));
          expression = directive.slice(directive.indexOf(' ') + 1, directive.length);
          this.env[variableName] = expression;
          break;
        case 'ifdef':
          this.conditions.push(this.conditionIsTrue() && this.env[directive] !== void 0);
          break;
        case 'ifndef':
          this.conditions.push(this.conditionIsTrue() && this.env[directive] === void 0);
          break;
        case 'else':
          this.flipCondition();
          break;
        case 'endif':
          this.conditions.pop();
          break;
        default:
          throw new Error("Unhandled directive in state " + state + ": #" + name + " " + directive);
      }
      return this.conditionIsTrue();
    };

    Preprocessor.prototype.conditionIsTrue = function() {
      return this.conditions.length === 0 || this.conditions[this.conditions.length - 1];
    };

    Preprocessor.prototype.flipCondition = function() {
      switch (this.conditions.length) {
        case 0:
          break;
        case 1:
          return this.conditions[0] = !this.conditions[0];
        default:
          if (this.conditions[this.conditions.length - 2]) {
            return this.conditions[this.conditions.length - 1] = !this.conditions[this.conditions.length - 1];
          }
      }
    };

    Preprocessor.prototype.process = function() {
      var byte, check, directiveExpr, directiveName, lastNonWhiteByte, state, _i, _len, _ref,
        _this = this;
      this.result = "";
      lastNonWhiteByte = "";
      directiveName = "";
      directiveExpr = "";
      state = DIRECTIVE_ALLOWED;
      check = function(byte) {
        var _ref;
        if (byte === '#' && state === DIRECTIVE_ALLOWED) {
          state = DIRECTIVE_NAME_ACCUMULATING;
          return false;
        } else if (byte === '\n' && (state === DIRECTIVE_EXPR_ACCUMULATING || state === DIRECTIVE_NAME_ACCUMULATING)) {
          if (lastNonWhiteByte !== "\\") {
            _this.processDirective(directiveName, directiveExpr, state);
            state = DIRECTIVE_ALLOWED;
            _ref = ["", ""], directiveName = _ref[0], directiveExpr = _ref[1];
          }
          return true;
        } else if (byte === ' ' && state === DIRECTIVE_NAME_ACCUMULATING) {
          state = DIRECTIVE_EXPR_ACCUMULATING;
          return false;
        } else {
          if (!(byte === "\n" || byte === "\t" || byte === " ")) {
            lastNonWhiteByte = byte;
          }
          return true;
        }
      };
      _ref = this.source;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        byte = _ref[_i];
        if (!check(byte)) continue;
        if (byte === "\n") this.result += "\n";
        switch (state) {
          case DIRECTIVE_NAME_ACCUMULATING:
            directiveName += byte;
            break;
          case DIRECTIVE_EXPR_ACCUMULATING:
            directiveExpr += byte;
            break;
          default:
            if (byte !== "\n" ? this.conditionIsTrue() : void 0) {
              this.result += byte;
            }
        }
      }
      return check("\n");
    };

    Preprocessor.prototype.toString = function() {
      return this.result;
    };

    return Preprocessor;

  })();

}).call(this);

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
      }), o('PRECISION PrecisionSpecifier GlslType', function() {
        return new Precision($2, $3);
      })
    ],
    PrecisionSpecifier: [o('HIGHP'), o('MEDIUMP'), o('LOWP')],
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
      }), o('GlslTypeConstructor', function() {
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
      o('DISCARD', function() {
        return new Call(new Identifier('discard'), []);
      }), o('Value OptFuncExist Arguments', function() {
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
    If: 'if',
    Precision: 'precision'
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
  var Identifier,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Identifier = require("shader-script/glsl/nodes/identifier").Identifier;

  exports.Arr = (function(_super) {

    __extends(Arr, _super);

    function Arr() {
      Arr.__super__.constructor.apply(this, arguments);
    }

    Arr.prototype.name = "arr";

    Arr.prototype.children = function() {
      return ['elements'];
    };

    Arr.prototype.type = function(shader) {
      var ele, length, variable, _i, _len, _ref, _ref2;
      length = 0;
      _ref = this.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ele = _ref[_i];
        if (ele.name === 'value' && ((_ref2 = ele.children[0]) != null ? _ref2.name : void 0) === 'identifier') {
          variable = ele.variable(shader);
          length += (function() {
            switch (variable.type()) {
              case 'ivec2':
              case 'bvec2':
              case 'vec2':
                return 2;
              case 'ivec3':
              case 'bvec3':
              case 'vec3':
                return 3;
              case 'ivec4':
              case 'bvec4':
              case 'vec4':
                return 4;
              default:
                return 1;
            }
          })();
        } else {
          length += 1;
        }
      }
      return 'vec' + length.toString();
    };

    Arr.prototype.compile = function(shader) {
      var child;
      return this.glsl('TypeConstructor', this.type(shader), (function() {
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
          existing = shader.scope.lookup(varname, {
            silent: true
          });
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
    _require["shader-script/nodes/precision"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Precision = (function(_super) {

    __extends(Precision, _super);

    function Precision() {
      Precision.__super__.constructor.apply(this, arguments);
    }

    Precision.prototype.name = "precision";

    Precision.prototype.children = function() {
      return ['precision', 'type'];
    };

    Precision.prototype.compile = function(shader) {
      return this.glsl('Precision', this.precision, this.type);
    };

    return Precision;

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
      var arg;
      return this.glsl('TypeConstructor', this.type(), (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arg = _ref[_i];
          _results.push(arg.compile(shader));
        }
        return _results;
      }).call(this));
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
    _require["shader-script/operators"] = function() {
      var exports = {};
      (function() {
  var component_wise, cw_add, cw_divide, cw_mult, cw_subt,
    __slice = Array.prototype.slice;

  exports.component_wise = component_wise = function() {
    var again, arg, argi, args, argset, callback, i, k, result, resultset, size;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    callback = args.pop();
    for (i in args) {
      if (args[i] && args[i].length) {
        args[i] = (function() {
          var _i, _len, _ref, _results;
          _ref = args[i];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            k = _ref[_i];
            _results.push(k);
          }
          return _results;
        })();
      }
    }
    for (i in args) {
      if (args[i] && args[i].slice) args[i] = args[i].slice();
    }
    resultset = [];
    again = true;
    while (again) {
      size = null;
      again = false;
      argset = (function() {
        var _ref, _results;
        _results = [];
        for (argi = 0, _ref = args.length; 0 <= _ref ? argi < _ref : argi > _ref; 0 <= _ref ? argi++ : argi--) {
          arg = args[argi];
          if (arg && arg.length) {
            if (arg.length > 1) again = true;
            if (size && arg.length !== size) {
              throw new Error("All vectors must be the same size");
            }
            size = arg.length;
            args[argi] = arg.slice(1);
          }
          if (arg && arg.shift) {
            _results.push(arg.shift());
          } else {
            _results.push(arg);
          }
        }
        return _results;
      })();
      result = callback.apply(null, argset);
      resultset.push(result);
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
    vec2: {
      '-': {
        vec2: 'vec2',
        float: 'vec2'
      },
      '+': {
        vec2: 'vec2',
        float: 'vec2'
      },
      '/': {
        vec2: 'vec2',
        float: 'vec2'
      },
      '*': {
        vec2: 'vec2',
        float: 'vec2'
      }
    },
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

  exports.bool = {
    '!': function(le) {
      return !le;
    }
  };

  exports.mat4 = {
    '==': function(le, re) {
      return le.value === re.value;
    },
    '!=': function(le, re) {
      if (le.value !== re.value) {
        return 1;
      } else {
        return 0;
      }
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

  exports.mat3 = {
    '==': function(le, re) {
      return le.value === re.value;
    },
    '!=': function(le, re) {
      if (le.value !== re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide,
    '*': function(le, re) {
      var dest, matrix, vec, x, y, z, _ref;
      switch (re.type()) {
        case 'vec3':
          dest = [];
          matrix = le.value;
          vec = re.value;
          _ref = [vec[0], vec[1], vec[2]], x = _ref[0], y = _ref[1], z = _ref[2];
          dest[0] = x * matrix[0] + y * matrix[3] + z * matrix[6];
          dest[1] = x * matrix[1] + y * matrix[4] + z * matrix[7];
          dest[2] = x * matrix[2] + y * matrix[5] + z * matrix[8];
          return dest;
        default:
          return cw_mult(le, re);
      }
    }
  };

  exports.vec4 = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '!=': function(le, re) {
      if (le.value !== re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.vec3 = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '!=': function(le, re) {
      if (le.value !== re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.vec2 = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '!=': function(le, re) {
      if (le.value !== re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.float = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '!=': function(le, re) {
      if (le.value !== re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide,
    '>': function(le, re) {
      if (le.value > re.value) {
        return 1;
      } else {
        return 0;
      }
    }
  };

  exports.int = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '!=': function(le, re) {
      if (le.value !== re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide,
    '>': function(le, re) {
      if (le.value > re.value) {
        return 1;
      } else {
        return 0;
      }
    }
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
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"Return":10,"Comment":11,"STATEMENT":12,"StorageQualifier":13,"=":14,"{":15,"StorageQualifierAssigns":16,"}":17,"INDENT":18,"OUTDENT":19,"PRECISION":20,"PrecisionSpecifier":21,"GlslType":22,"HIGHP":23,"MEDIUMP":24,"LOWP":25,"UNIFORMS":26,"VARYINGS":27,"CONSTS":28,"ATTRIBUTES":29,"StorageQualifierAssign":30,"OptComma":31,"Identifier":32,":":33,"StorageQualifierName":34,"[":35,"StorageQualifierNameList":36,"]":37,",":38,"Value":39,"Invocation":40,"Code":41,"Operation":42,"Assign":43,"If":44,"Try":45,"While":46,"For":47,"Switch":48,"Class":49,"Throw":50,"IDENTIFIER":51,"AlphaNumeric":52,"NUMBER":53,"STRING":54,"Literal":55,"JS":56,"REGEX":57,"DEBUGGER":58,"BOOLEAN_VALUE":59,"Assignable":60,"AssignObj":61,"ObjAssignable":62,"ThisProperty":63,"RETURN":64,"HERECOMMENT":65,"PARAM_START":66,"ParamList":67,"PARAM_END":68,"FuncGlyph":69,"->":70,"=>":71,"Param":72,"ParamVar":73,"...":74,"ParamQualifier":75,"CALL_START":76,"CALL_END":77,"INOUT":78,"OUT":79,"Array":80,"Object":81,"Splat":82,"SimpleAssignable":83,"Accessor":84,"Parenthetical":85,"Range":86,"GlslTypeConstructor":87,"This":88,".":89,"?.":90,"::":91,"Index":92,"INDEX_START":93,"IndexValue":94,"INDEX_END":95,"INDEX_SOAK":96,"Slice":97,"AssignList":98,"CLASS":99,"EXTENDS":100,"DISCARD":101,"OptFuncExist":102,"Arguments":103,"SUPER":104,"FUNC_EXIST":105,"ArgList":106,"THIS":107,"@":108,"RangeDots":109,"..":110,"Arg":111,"SimpleArgs":112,"TRY":113,"Catch":114,"FINALLY":115,"CATCH":116,"THROW":117,"(":118,")":119,"WhileSource":120,"WHILE":121,"WHEN":122,"UNTIL":123,"Loop":124,"LOOP":125,"ForBody":126,"FOR":127,"ForStart":128,"ForSource":129,"ForVariables":130,"OWN":131,"ForValue":132,"FORIN":133,"FOROF":134,"BY":135,"SWITCH":136,"Whens":137,"ELSE":138,"When":139,"LEADING_WHEN":140,"IfBlock":141,"IF":142,"POST_IF":143,"UNARY":144,"-":145,"+":146,"--":147,"++":148,"?":149,"MATH":150,"SHIFT":151,"COMPARE":152,"LOGIC":153,"RELATION":154,"COMPOUND_ASSIGN":155,"VOID":156,"BOOL":157,"INT":158,"FLOAT":159,"VEC2":160,"VEC3":161,"VEC4":162,"BVEC2":163,"BVEC3":164,"BVEC4":165,"IVEC2":166,"IVEC3":167,"IVEC4":168,"MAT2":169,"MAT3":170,"MAT4":171,"MAT2X2":172,"MAT2X3":173,"MAT2X4":174,"MAT3X2":175,"MAT3X3":176,"MAT3X4":177,"MAT4X2":178,"MAT4X3":179,"MAT4X4":180,"SAMPLER1D":181,"SAMPLER2D":182,"SAMPLER3D":183,"SAMPLERCUBE":184,"SAMPLER1DSHADOW":185,"SAMPLER2DSHADOW":186,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",12:"STATEMENT",14:"=",15:"{",17:"}",18:"INDENT",19:"OUTDENT",20:"PRECISION",23:"HIGHP",24:"MEDIUMP",25:"LOWP",26:"UNIFORMS",27:"VARYINGS",28:"CONSTS",29:"ATTRIBUTES",33:":",35:"[",37:"]",38:",",51:"IDENTIFIER",53:"NUMBER",54:"STRING",56:"JS",57:"REGEX",58:"DEBUGGER",59:"BOOLEAN_VALUE",64:"RETURN",65:"HERECOMMENT",66:"PARAM_START",68:"PARAM_END",70:"->",71:"=>",74:"...",76:"CALL_START",77:"CALL_END",78:"INOUT",79:"OUT",89:".",90:"?.",91:"::",93:"INDEX_START",95:"INDEX_END",96:"INDEX_SOAK",99:"CLASS",100:"EXTENDS",101:"DISCARD",104:"SUPER",105:"FUNC_EXIST",107:"THIS",108:"@",110:"..",113:"TRY",115:"FINALLY",116:"CATCH",117:"THROW",118:"(",119:")",121:"WHILE",122:"WHEN",123:"UNTIL",125:"LOOP",127:"FOR",131:"OWN",133:"FORIN",134:"FOROF",135:"BY",136:"SWITCH",138:"ELSE",140:"LEADING_WHEN",142:"IF",143:"POST_IF",144:"UNARY",145:"-",146:"+",147:"--",148:"++",149:"?",150:"MATH",151:"SHIFT",152:"COMPARE",153:"LOGIC",154:"RELATION",155:"COMPOUND_ASSIGN",156:"VOID",157:"BOOL",158:"INT",159:"FLOAT",160:"VEC2",161:"VEC3",162:"VEC4",163:"BVEC2",164:"BVEC3",165:"BVEC4",166:"IVEC2",167:"IVEC3",168:"IVEC4",169:"MAT2",170:"MAT3",171:"MAT4",172:"MAT2X2",173:"MAT2X3",174:"MAT2X4",175:"MAT3X2",176:"MAT3X3",177:"MAT3X4",178:"MAT4X2",179:"MAT4X3",180:"MAT4X4",181:"SAMPLER1D",182:"SAMPLER2D",183:"SAMPLER3D",184:"SAMPLERCUBE",185:"SAMPLER1DSHADOW",186:"SAMPLER2DSHADOW"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[9,1],[9,1],[9,1],[9,5],[9,7],[9,3],[21,1],[21,1],[21,1],[13,1],[13,1],[13,1],[13,1],[16,1],[16,4],[30,3],[30,5],[30,5],[30,7],[34,1],[36,1],[36,3],[36,3],[36,4],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[5,2],[5,3],[32,1],[52,1],[52,1],[55,1],[55,1],[55,1],[55,1],[55,1],[43,3],[43,4],[43,5],[61,1],[61,3],[61,5],[61,1],[62,1],[62,1],[62,1],[10,2],[10,1],[11,1],[41,5],[41,2],[69,1],[69,1],[31,0],[31,1],[67,0],[67,1],[67,3],[72,1],[72,2],[72,3],[72,2],[72,4],[72,6],[75,1],[75,1],[73,1],[73,1],[73,1],[73,1],[82,2],[83,1],[83,2],[83,2],[83,1],[60,1],[60,1],[60,1],[39,1],[39,1],[39,1],[39,1],[39,1],[39,1],[84,2],[84,2],[84,2],[84,1],[84,1],[92,3],[92,2],[94,1],[94,1],[81,4],[98,0],[98,1],[98,3],[98,4],[98,6],[49,1],[49,2],[49,3],[49,4],[49,2],[49,3],[49,4],[49,5],[40,1],[40,3],[40,3],[40,1],[40,2],[102,0],[102,1],[103,2],[103,4],[88,1],[88,1],[63,2],[80,2],[80,4],[109,1],[109,1],[86,5],[97,3],[97,2],[97,2],[97,1],[106,1],[106,3],[106,4],[106,4],[106,6],[111,1],[111,1],[112,1],[112,3],[45,2],[45,3],[45,4],[45,5],[114,3],[50,2],[85,3],[85,5],[120,2],[120,4],[120,2],[120,4],[46,2],[46,2],[46,2],[46,1],[124,2],[124,2],[47,2],[47,2],[47,2],[126,2],[126,2],[128,2],[128,3],[132,1],[132,1],[132,1],[130,1],[130,3],[129,2],[129,2],[129,4],[129,4],[129,4],[129,6],[129,6],[48,5],[48,7],[48,4],[48,6],[137,1],[137,2],[139,3],[139,4],[141,3],[141,5],[44,1],[44,3],[44,3],[44,3],[42,2],[42,2],[42,2],[42,2],[42,2],[42,2],[42,2],[42,2],[42,3],[42,3],[42,3],[42,3],[42,3],[42,3],[42,3],[42,3],[42,5],[42,3],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[22,1],[87,2]],
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
case 14:this.$ = new yy.Precision($$[$0-1], $$[$0]);
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
case 22:this.$ = [$$[$0]];
break;
case 23:this.$ = $$[$0-3].concat($$[$0]);
break;
case 24:this.$ = {
          type: $$[$0-2],
          names: [$$[$0]]
        };
break;
case 25:this.$ = {
          type: $$[$0-4],
          names: $$[$0-1]
        };
break;
case 26:this.$ = {
          type: $$[$0-4],
          names: $$[$0-1]
        };
break;
case 27:this.$ = {
          type: $$[$0-6],
          names: $$[$0-2]
        };
break;
case 28:this.$ = $$[$0];
break;
case 29:this.$ = [$$[$0]];
break;
case 30:this.$ = (function () {
        $$[$0-2].push($$[$0]);
        return $$[$0-2];
      }());
break;
case 31:this.$ = (function () {
        $$[$0-2].push($$[$0]);
        return $$[$0-2];
      }());
break;
case 32:this.$ = (function () {
        $$[$0-3].push($$[$0]);
        return $$[$0-3];
      }());
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
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = new yy.Block;
break;
case 46:this.$ = $$[$0-1];
break;
case 47:this.$ = new yy.Identifier($$[$0]);
break;
case 48:this.$ = new yy.Literal($$[$0]);
break;
case 49:this.$ = new yy.Literal($$[$0]);
break;
case 50:this.$ = $$[$0];
break;
case 51:this.$ = new yy.Literal($$[$0]);
break;
case 52:this.$ = new yy.Literal($$[$0]);
break;
case 53:this.$ = new yy.Literal($$[$0]);
break;
case 54:this.$ = (function () {
        var val;
        val = new yy.Literal($$[$0]);
        if ($$[$0] === 'undefined') val.isUndefined = true;
        return val;
      }());
break;
case 55:this.$ = new yy.Assign($$[$0-2], $$[$0], '=');
break;
case 56:this.$ = new yy.Assign($$[$0-3], $$[$0], '=');
break;
case 57:this.$ = new yy.Assign($$[$0-4], $$[$0-1], '=');
break;
case 58:this.$ = new yy.Value($$[$0]);
break;
case 59:this.$ = new yy.Assign(new yy.Value($$[$0-2]), $$[$0], 'object');
break;
case 60:this.$ = new yy.Assign(new yy.Value($$[$0-4]), $$[$0-1], 'object');
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = $$[$0];
break;
case 65:this.$ = new yy.Return($$[$0]);
break;
case 66:this.$ = new yy.Return;
break;
case 67:this.$ = new yy.Comment($$[$0]);
break;
case 68:this.$ = new yy.Code($$[$0-3], $$[$0], $$[$0-1]);
break;
case 69:this.$ = new yy.Code([], $$[$0], $$[$0-1]);
break;
case 70:this.$ = 'func';
break;
case 71:this.$ = 'boundfunc';
break;
case 72:this.$ = $$[$0];
break;
case 73:this.$ = $$[$0];
break;
case 74:this.$ = [];
break;
case 75:this.$ = [].concat($$[$0]);
break;
case 76:this.$ = $$[$0-2].concat($$[$0]);
break;
case 77:this.$ = new yy.Param($$[$0]);
break;
case 78:this.$ = new yy.Param($$[$0-1], null, true);
break;
case 79:this.$ = new yy.Param($$[$0-2], $$[$0]);
break;
case 80:this.$ = (function () {
        if ($$[$0].length) {
          $$[$0][0].param_qualifier = $$[$0-1];
        } else {
          $$[$0].param_qualifier = $$[$0-1];
        }
        return $$[$0];
      }());
break;
case 81:this.$ = (function () {
        $$[$0-1].set_type($$[$0-3]);
        return $$[$0-1];
      }());
break;
case 82:this.$ = (function () {
        $$[$0-3].set_type($$[$0-5]);
        $$[$0-1].unshift($$[$0-3]);
        return $$[$0-1];
      }());
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
case 89:this.$ = new yy.Splat($$[$0-1]);
break;
case 90:this.$ = new yy.Value($$[$0]);
break;
case 91:this.$ = (function () {
        $$[$0].source = $$[$0-1];
        return $$[$0];
      }());
break;
case 92:this.$ = (function () {
        $$[$0].source = $$[$0-1];
        return $$[$0];
      }());
break;
case 93:this.$ = $$[$0];
break;
case 94:this.$ = $$[$0];
break;
case 95:this.$ = new yy.Value($$[$0]);
break;
case 96:this.$ = new yy.Value($$[$0]);
break;
case 97:this.$ = $$[$0];
break;
case 98:this.$ = new yy.Value($$[$0]);
break;
case 99:this.$ = new yy.Value($$[$0]);
break;
case 100:this.$ = new yy.Value($$[$0]);
break;
case 101:this.$ = new yy.Value($$[$0]);
break;
case 102:this.$ = $$[$0];
break;
case 103:this.$ = new yy.Access($$[$0]);
break;
case 104:this.$ = new yy.Access($$[$0], 'soak');
break;
case 105:this.$ = [new yy.Access(new yy.Literal('prototype')), new yy.Access($$[$0])];
break;
case 106:this.$ = new yy.Access(new yy.Literal('prototype'));
break;
case 107:this.$ = $$[$0];
break;
case 108:this.$ = $$[$0-1];
break;
case 109:this.$ = yy.extend($$[$0], {
          soak: true
        });
break;
case 110:this.$ = new yy.Index($$[$0]);
break;
case 111:this.$ = new yy.Slice($$[$0]);
break;
case 112:this.$ = new yy.Obj($$[$0-2], $$[$0-3].generated);
break;
case 113:this.$ = [];
break;
case 114:this.$ = [$$[$0]];
break;
case 115:this.$ = $$[$0-2].concat($$[$0]);
break;
case 116:this.$ = $$[$0-3].concat($$[$0]);
break;
case 117:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 118:this.$ = new yy.Class;
break;
case 119:this.$ = new yy.Class(null, null, $$[$0]);
break;
case 120:this.$ = new yy.Class(null, $$[$0]);
break;
case 121:this.$ = new yy.Class(null, $$[$0-1], $$[$0]);
break;
case 122:this.$ = new yy.Class($$[$0]);
break;
case 123:this.$ = new yy.Class($$[$0-1], null, $$[$0]);
break;
case 124:this.$ = new yy.Class($$[$0-2], $$[$0]);
break;
case 125:this.$ = new yy.Class($$[$0-3], $$[$0-1], $$[$0]);
break;
case 126:this.$ = new yy.Call(new yy.Identifier('discard'), []);
break;
case 127:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 128:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 129:this.$ = new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]);
break;
case 130:this.$ = new yy.Call('super', $$[$0]);
break;
case 131:this.$ = false;
break;
case 132:this.$ = true;
break;
case 133:this.$ = [];
break;
case 134:this.$ = $$[$0-2];
break;
case 135:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 136:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 137:this.$ = new yy.Value(new yy.Literal('this'), [new yy.Access($$[$0])], 'this');
break;
case 138:this.$ = new yy.Arr([]);
break;
case 139:this.$ = new yy.Arr($$[$0-2]);
break;
case 140:this.$ = 'inclusive';
break;
case 141:this.$ = 'exclusive';
break;
case 142:this.$ = new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]);
break;
case 143:this.$ = new yy.Range($$[$0-2], $$[$0], $$[$0-1]);
break;
case 144:this.$ = new yy.Range($$[$0-1], null, $$[$0]);
break;
case 145:this.$ = new yy.Range(null, $$[$0], $$[$0-1]);
break;
case 146:this.$ = new yy.Range(null, null, $$[$0]);
break;
case 147:this.$ = [$$[$0]];
break;
case 148:this.$ = $$[$0-2].concat($$[$0]);
break;
case 149:this.$ = $$[$0-3].concat($$[$0]);
break;
case 150:this.$ = $$[$0-2];
break;
case 151:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 152:this.$ = $$[$0];
break;
case 153:this.$ = $$[$0];
break;
case 154:this.$ = $$[$0];
break;
case 155:this.$ = [].concat($$[$0-2], $$[$0]);
break;
case 156:this.$ = new yy.Try($$[$0]);
break;
case 157:this.$ = new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]);
break;
case 158:this.$ = new yy.Try($$[$0-2], null, null, $$[$0]);
break;
case 159:this.$ = new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]);
break;
case 160:this.$ = [$$[$0-1], $$[$0]];
break;
case 161:this.$ = new yy.Throw($$[$0]);
break;
case 162:this.$ = new yy.Parens($$[$0-1]);
break;
case 163:this.$ = new yy.Parens($$[$0-2]);
break;
case 164:this.$ = new yy.While($$[$0]);
break;
case 165:this.$ = new yy.While($$[$0-2], {
          guard: $$[$0]
        });
break;
case 166:this.$ = new yy.While($$[$0], {
          invert: true
        });
break;
case 167:this.$ = new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        });
break;
case 168:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 169:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 170:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 171:this.$ = $$[$0];
break;
case 172:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 173:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 174:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 175:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 176:this.$ = new yy.For($$[$0], $$[$0-1]);
break;
case 177:this.$ = {
          source: new yy.Value($$[$0])
        };
break;
case 178:this.$ = (function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }());
break;
case 179:this.$ = $$[$0];
break;
case 180:this.$ = (function () {
        $$[$0].own = true;
        return $$[$0];
      }());
break;
case 181:this.$ = $$[$0];
break;
case 182:this.$ = new yy.Value($$[$0]);
break;
case 183:this.$ = new yy.Value($$[$0]);
break;
case 184:this.$ = [$$[$0]];
break;
case 185:this.$ = [$$[$0-2], $$[$0]];
break;
case 186:this.$ = {
          source: $$[$0]
        };
break;
case 187:this.$ = {
          source: $$[$0],
          object: true
        };
break;
case 188:this.$ = {
          source: $$[$0-2],
          guard: $$[$0]
        };
break;
case 189:this.$ = {
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        };
break;
case 190:this.$ = {
          source: $$[$0-2],
          step: $$[$0]
        };
break;
case 191:this.$ = {
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        };
break;
case 192:this.$ = {
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        };
break;
case 193:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 194:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 195:this.$ = new yy.Switch(null, $$[$0-1]);
break;
case 196:this.$ = new yy.Switch(null, $$[$0-3], $$[$0-1]);
break;
case 197:this.$ = $$[$0];
break;
case 198:this.$ = $$[$0-1].concat($$[$0]);
break;
case 199:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 200:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 201:this.$ = new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        });
break;
case 202:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 203:this.$ = $$[$0];
break;
case 204:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 205:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 206:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 207:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 208:this.$ = new yy.Op('-', $$[$0]);
break;
case 209:this.$ = new yy.Op('+', $$[$0]);
break;
case 210:this.$ = new yy.Op('--', $$[$0]);
break;
case 211:this.$ = new yy.Op('++', $$[$0]);
break;
case 212:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 213:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 214:this.$ = new yy.Existence($$[$0-1]);
break;
case 215:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 216:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 217:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 218:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 219:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 220:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 221:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 222:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 223:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 224:this.$ = new yy.Extends($$[$0-2], $$[$0]);
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
case 251:this.$ = $$[$0];
break;
case 252:this.$ = $$[$0];
break;
case 253:this.$ = $$[$0];
break;
case 254:this.$ = $$[$0];
break;
case 255:this.$ = $$[$0];
break;
case 256:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,5],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[3]},{1:[2,2],6:[1,112]},{6:[1,113]},{1:[2,4],6:[2,4],19:[2,4]},{4:115,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:23,15:[1,77],19:[1,114],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,7],6:[2,7],19:[2,7],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,8],6:[2,8],19:[2,8],120:128,121:[1,72],123:[1,73],126:129,127:[1,75],128:76,143:[1,127]},{1:[2,33],6:[2,33],17:[2,33],18:[2,33],19:[2,33],37:[2,33],38:[2,33],68:[2,33],74:[2,33],76:[2,131],77:[2,33],84:131,89:[1,133],90:[1,134],91:[1,135],92:136,93:[1,137],95:[2,33],96:[1,138],102:130,105:[1,132],110:[2,33],119:[2,33],121:[2,33],122:[2,33],123:[2,33],127:[2,33],135:[2,33],143:[2,33],145:[2,33],146:[2,33],149:[2,33],150:[2,33],151:[2,33],152:[2,33],153:[2,33],154:[2,33]},{1:[2,34],6:[2,34],17:[2,34],18:[2,34],19:[2,34],37:[2,34],38:[2,34],68:[2,34],74:[2,34],76:[2,131],77:[2,34],84:140,89:[1,133],90:[1,134],91:[1,135],92:136,93:[1,137],95:[2,34],96:[1,138],102:139,105:[1,132],110:[2,34],119:[2,34],121:[2,34],122:[2,34],123:[2,34],127:[2,34],135:[2,34],143:[2,34],145:[2,34],146:[2,34],149:[2,34],150:[2,34],151:[2,34],152:[2,34],153:[2,34],154:[2,34]},{1:[2,35],6:[2,35],17:[2,35],18:[2,35],19:[2,35],37:[2,35],38:[2,35],68:[2,35],74:[2,35],77:[2,35],95:[2,35],110:[2,35],119:[2,35],121:[2,35],122:[2,35],123:[2,35],127:[2,35],135:[2,35],143:[2,35],145:[2,35],146:[2,35],149:[2,35],150:[2,35],151:[2,35],152:[2,35],153:[2,35],154:[2,35]},{1:[2,36],6:[2,36],17:[2,36],18:[2,36],19:[2,36],37:[2,36],38:[2,36],68:[2,36],74:[2,36],77:[2,36],95:[2,36],110:[2,36],119:[2,36],121:[2,36],122:[2,36],123:[2,36],127:[2,36],135:[2,36],143:[2,36],145:[2,36],146:[2,36],149:[2,36],150:[2,36],151:[2,36],152:[2,36],153:[2,36],154:[2,36]},{1:[2,37],6:[2,37],17:[2,37],18:[2,37],19:[2,37],37:[2,37],38:[2,37],68:[2,37],74:[2,37],77:[2,37],95:[2,37],110:[2,37],119:[2,37],121:[2,37],122:[2,37],123:[2,37],127:[2,37],135:[2,37],143:[2,37],145:[2,37],146:[2,37],149:[2,37],150:[2,37],151:[2,37],152:[2,37],153:[2,37],154:[2,37]},{1:[2,38],6:[2,38],17:[2,38],18:[2,38],19:[2,38],37:[2,38],38:[2,38],68:[2,38],74:[2,38],77:[2,38],95:[2,38],110:[2,38],119:[2,38],121:[2,38],122:[2,38],123:[2,38],127:[2,38],135:[2,38],143:[2,38],145:[2,38],146:[2,38],149:[2,38],150:[2,38],151:[2,38],152:[2,38],153:[2,38],154:[2,38]},{1:[2,39],6:[2,39],17:[2,39],18:[2,39],19:[2,39],37:[2,39],38:[2,39],68:[2,39],74:[2,39],77:[2,39],95:[2,39],110:[2,39],119:[2,39],121:[2,39],122:[2,39],123:[2,39],127:[2,39],135:[2,39],143:[2,39],145:[2,39],146:[2,39],149:[2,39],150:[2,39],151:[2,39],152:[2,39],153:[2,39],154:[2,39]},{1:[2,40],6:[2,40],17:[2,40],18:[2,40],19:[2,40],37:[2,40],38:[2,40],68:[2,40],74:[2,40],77:[2,40],95:[2,40],110:[2,40],119:[2,40],121:[2,40],122:[2,40],123:[2,40],127:[2,40],135:[2,40],143:[2,40],145:[2,40],146:[2,40],149:[2,40],150:[2,40],151:[2,40],152:[2,40],153:[2,40],154:[2,40]},{1:[2,41],6:[2,41],17:[2,41],18:[2,41],19:[2,41],37:[2,41],38:[2,41],68:[2,41],74:[2,41],77:[2,41],95:[2,41],110:[2,41],119:[2,41],121:[2,41],122:[2,41],123:[2,41],127:[2,41],135:[2,41],143:[2,41],145:[2,41],146:[2,41],149:[2,41],150:[2,41],151:[2,41],152:[2,41],153:[2,41],154:[2,41]},{1:[2,42],6:[2,42],17:[2,42],18:[2,42],19:[2,42],37:[2,42],38:[2,42],68:[2,42],74:[2,42],77:[2,42],95:[2,42],110:[2,42],119:[2,42],121:[2,42],122:[2,42],123:[2,42],127:[2,42],135:[2,42],143:[2,42],145:[2,42],146:[2,42],149:[2,42],150:[2,42],151:[2,42],152:[2,42],153:[2,42],154:[2,42]},{1:[2,43],6:[2,43],17:[2,43],18:[2,43],19:[2,43],37:[2,43],38:[2,43],68:[2,43],74:[2,43],77:[2,43],95:[2,43],110:[2,43],119:[2,43],121:[2,43],122:[2,43],123:[2,43],127:[2,43],135:[2,43],143:[2,43],145:[2,43],146:[2,43],149:[2,43],150:[2,43],151:[2,43],152:[2,43],153:[2,43],154:[2,43]},{1:[2,44],6:[2,44],17:[2,44],18:[2,44],19:[2,44],37:[2,44],38:[2,44],68:[2,44],74:[2,44],77:[2,44],95:[2,44],110:[2,44],119:[2,44],121:[2,44],122:[2,44],123:[2,44],127:[2,44],135:[2,44],143:[2,44],145:[2,44],146:[2,44],149:[2,44],150:[2,44],151:[2,44],152:[2,44],153:[2,44],154:[2,44]},{1:[2,9],6:[2,9],19:[2,9],121:[2,9],123:[2,9],127:[2,9],143:[2,9]},{1:[2,10],6:[2,10],19:[2,10],121:[2,10],123:[2,10],127:[2,10],143:[2,10]},{1:[2,11],6:[2,11],19:[2,11],121:[2,11],123:[2,11],127:[2,11],143:[2,11]},{14:[1,141]},{21:142,23:[1,143],24:[1,144],25:[1,145]},{1:[2,97],6:[2,97],14:[1,146],17:[2,97],18:[2,97],19:[2,97],37:[2,97],38:[2,97],68:[2,97],74:[2,97],76:[2,97],77:[2,97],89:[2,97],90:[2,97],91:[2,97],93:[2,97],95:[2,97],96:[2,97],105:[2,97],110:[2,97],119:[2,97],121:[2,97],122:[2,97],123:[2,97],127:[2,97],135:[2,97],143:[2,97],145:[2,97],146:[2,97],149:[2,97],150:[2,97],151:[2,97],152:[2,97],153:[2,97],154:[2,97]},{1:[2,98],6:[2,98],17:[2,98],18:[2,98],19:[2,98],37:[2,98],38:[2,98],68:[2,98],74:[2,98],76:[2,98],77:[2,98],89:[2,98],90:[2,98],91:[2,98],93:[2,98],95:[2,98],96:[2,98],105:[2,98],110:[2,98],119:[2,98],121:[2,98],122:[2,98],123:[2,98],127:[2,98],135:[2,98],143:[2,98],145:[2,98],146:[2,98],149:[2,98],150:[2,98],151:[2,98],152:[2,98],153:[2,98],154:[2,98]},{1:[2,99],6:[2,99],17:[2,99],18:[2,99],19:[2,99],37:[2,99],38:[2,99],68:[2,99],74:[2,99],76:[2,99],77:[2,99],89:[2,99],90:[2,99],91:[2,99],93:[2,99],95:[2,99],96:[2,99],105:[2,99],110:[2,99],119:[2,99],121:[2,99],122:[2,99],123:[2,99],127:[2,99],135:[2,99],143:[2,99],145:[2,99],146:[2,99],149:[2,99],150:[2,99],151:[2,99],152:[2,99],153:[2,99],154:[2,99]},{1:[2,100],6:[2,100],17:[2,100],18:[2,100],19:[2,100],37:[2,100],38:[2,100],68:[2,100],74:[2,100],76:[2,100],77:[2,100],89:[2,100],90:[2,100],91:[2,100],93:[2,100],95:[2,100],96:[2,100],105:[2,100],110:[2,100],119:[2,100],121:[2,100],122:[2,100],123:[2,100],127:[2,100],135:[2,100],143:[2,100],145:[2,100],146:[2,100],149:[2,100],150:[2,100],151:[2,100],152:[2,100],153:[2,100],154:[2,100]},{1:[2,101],6:[2,101],17:[2,101],18:[2,101],19:[2,101],37:[2,101],38:[2,101],68:[2,101],74:[2,101],76:[2,101],77:[2,101],89:[2,101],90:[2,101],91:[2,101],93:[2,101],95:[2,101],96:[2,101],105:[2,101],110:[2,101],119:[2,101],121:[2,101],122:[2,101],123:[2,101],127:[2,101],135:[2,101],143:[2,101],145:[2,101],146:[2,101],149:[2,101],150:[2,101],151:[2,101],152:[2,101],153:[2,101],154:[2,101]},{1:[2,102],6:[2,102],17:[2,102],18:[2,102],19:[2,102],37:[2,102],38:[2,102],68:[2,102],74:[2,102],76:[2,102],77:[2,102],89:[2,102],90:[2,102],91:[2,102],93:[2,102],95:[2,102],96:[2,102],105:[2,102],110:[2,102],119:[2,102],121:[2,102],122:[2,102],123:[2,102],127:[2,102],135:[2,102],143:[2,102],145:[2,102],146:[2,102],149:[2,102],150:[2,102],151:[2,102],152:[2,102],153:[2,102],154:[2,102]},{1:[2,126],6:[2,126],17:[2,126],18:[2,126],19:[2,126],37:[2,126],38:[2,126],68:[2,126],74:[2,126],76:[2,126],77:[2,126],89:[2,126],90:[2,126],91:[2,126],93:[2,126],95:[2,126],96:[2,126],105:[2,126],110:[2,126],119:[2,126],121:[2,126],122:[2,126],123:[2,126],127:[2,126],135:[2,126],143:[2,126],145:[2,126],146:[2,126],149:[2,126],150:[2,126],151:[2,126],152:[2,126],153:[2,126],154:[2,126]},{1:[2,129],6:[2,129],17:[2,129],18:[2,129],19:[2,129],37:[2,129],38:[2,129],68:[2,129],74:[2,129],76:[1,148],77:[2,129],89:[2,129],90:[2,129],91:[2,129],93:[2,129],95:[2,129],96:[2,129],103:147,105:[2,129],110:[2,129],119:[2,129],121:[2,129],122:[2,129],123:[2,129],127:[2,129],135:[2,129],143:[2,129],145:[2,129],146:[2,129],149:[2,129],150:[2,129],151:[2,129],152:[2,129],153:[2,129],154:[2,129]},{15:[1,77],22:153,32:154,35:[1,161],38:[2,74],51:[1,111],63:155,67:149,68:[2,74],72:150,73:151,75:152,78:[1,158],79:[1,159],80:156,81:157,108:[1,160],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{5:162,18:[1,5]},{8:163,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:165,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:166,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{15:[1,77],22:64,32:69,35:[1,63],39:168,40:169,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:170,63:70,80:55,81:56,83:167,85:27,86:28,87:29,88:30,101:[1,31],104:[1,32],107:[1,65],108:[1,66],118:[1,62],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{15:[1,77],22:64,32:69,35:[1,63],39:168,40:169,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:170,63:70,80:55,81:56,83:171,85:27,86:28,87:29,88:30,101:[1,31],104:[1,32],107:[1,65],108:[1,66],118:[1,62],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,94],6:[2,94],14:[2,94],17:[2,94],18:[2,94],19:[2,94],37:[2,94],38:[2,94],68:[2,94],74:[2,94],76:[2,94],77:[2,94],89:[2,94],90:[2,94],91:[2,94],93:[2,94],95:[2,94],96:[2,94],100:[1,175],105:[2,94],110:[2,94],119:[2,94],121:[2,94],122:[2,94],123:[2,94],127:[2,94],135:[2,94],143:[2,94],145:[2,94],146:[2,94],147:[1,172],148:[1,173],149:[2,94],150:[2,94],151:[2,94],152:[2,94],153:[2,94],154:[2,94],155:[1,174]},{1:[2,203],6:[2,203],17:[2,203],18:[2,203],19:[2,203],37:[2,203],38:[2,203],68:[2,203],74:[2,203],77:[2,203],95:[2,203],110:[2,203],119:[2,203],121:[2,203],122:[2,203],123:[2,203],127:[2,203],135:[2,203],138:[1,176],143:[2,203],145:[2,203],146:[2,203],149:[2,203],150:[2,203],151:[2,203],152:[2,203],153:[2,203],154:[2,203]},{5:177,18:[1,5]},{5:178,18:[1,5]},{1:[2,171],6:[2,171],17:[2,171],18:[2,171],19:[2,171],37:[2,171],38:[2,171],68:[2,171],74:[2,171],77:[2,171],95:[2,171],110:[2,171],119:[2,171],121:[2,171],122:[2,171],123:[2,171],127:[2,171],135:[2,171],143:[2,171],145:[2,171],146:[2,171],149:[2,171],150:[2,171],151:[2,171],152:[2,171],153:[2,171],154:[2,171]},{5:179,18:[1,5]},{8:180,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,181],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,118],5:182,6:[2,118],15:[1,77],17:[2,118],18:[1,5],19:[2,118],22:64,32:69,35:[1,63],37:[2,118],38:[2,118],39:168,40:169,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:170,63:70,68:[2,118],74:[2,118],77:[2,118],80:55,81:56,83:184,85:27,86:28,87:29,88:30,95:[2,118],100:[1,183],101:[1,31],104:[1,32],107:[1,65],108:[1,66],110:[2,118],118:[1,62],119:[2,118],121:[2,118],122:[2,118],123:[2,118],127:[2,118],135:[2,118],143:[2,118],145:[2,118],146:[2,118],149:[2,118],150:[2,118],151:[2,118],152:[2,118],153:[2,118],154:[2,118],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:185,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,66],6:[2,66],8:186,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],19:[2,66],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[2,66],123:[2,66],124:44,125:[1,74],126:45,127:[2,66],128:76,136:[1,46],141:41,142:[1,71],143:[2,66],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,67],6:[2,67],17:[2,67],18:[2,67],19:[2,67],38:[2,67],121:[2,67],123:[2,67],127:[2,67],143:[2,67]},{14:[2,18]},{14:[2,19]},{14:[2,20]},{14:[2,21]},{1:[2,95],6:[2,95],14:[2,95],17:[2,95],18:[2,95],19:[2,95],37:[2,95],38:[2,95],68:[2,95],74:[2,95],76:[2,95],77:[2,95],89:[2,95],90:[2,95],91:[2,95],93:[2,95],95:[2,95],96:[2,95],105:[2,95],110:[2,95],119:[2,95],121:[2,95],122:[2,95],123:[2,95],127:[2,95],135:[2,95],143:[2,95],145:[2,95],146:[2,95],149:[2,95],150:[2,95],151:[2,95],152:[2,95],153:[2,95],154:[2,95]},{1:[2,96],6:[2,96],14:[2,96],17:[2,96],18:[2,96],19:[2,96],37:[2,96],38:[2,96],68:[2,96],74:[2,96],76:[2,96],77:[2,96],89:[2,96],90:[2,96],91:[2,96],93:[2,96],95:[2,96],96:[2,96],105:[2,96],110:[2,96],119:[2,96],121:[2,96],122:[2,96],123:[2,96],127:[2,96],135:[2,96],143:[2,96],145:[2,96],146:[2,96],149:[2,96],150:[2,96],151:[2,96],152:[2,96],153:[2,96],154:[2,96]},{1:[2,50],6:[2,50],17:[2,50],18:[2,50],19:[2,50],37:[2,50],38:[2,50],68:[2,50],74:[2,50],76:[2,50],77:[2,50],89:[2,50],90:[2,50],91:[2,50],93:[2,50],95:[2,50],96:[2,50],105:[2,50],110:[2,50],119:[2,50],121:[2,50],122:[2,50],123:[2,50],127:[2,50],135:[2,50],143:[2,50],145:[2,50],146:[2,50],149:[2,50],150:[2,50],151:[2,50],152:[2,50],153:[2,50],154:[2,50]},{1:[2,51],6:[2,51],17:[2,51],18:[2,51],19:[2,51],37:[2,51],38:[2,51],68:[2,51],74:[2,51],76:[2,51],77:[2,51],89:[2,51],90:[2,51],91:[2,51],93:[2,51],95:[2,51],96:[2,51],105:[2,51],110:[2,51],119:[2,51],121:[2,51],122:[2,51],123:[2,51],127:[2,51],135:[2,51],143:[2,51],145:[2,51],146:[2,51],149:[2,51],150:[2,51],151:[2,51],152:[2,51],153:[2,51],154:[2,51]},{1:[2,52],6:[2,52],17:[2,52],18:[2,52],19:[2,52],37:[2,52],38:[2,52],68:[2,52],74:[2,52],76:[2,52],77:[2,52],89:[2,52],90:[2,52],91:[2,52],93:[2,52],95:[2,52],96:[2,52],105:[2,52],110:[2,52],119:[2,52],121:[2,52],122:[2,52],123:[2,52],127:[2,52],135:[2,52],143:[2,52],145:[2,52],146:[2,52],149:[2,52],150:[2,52],151:[2,52],152:[2,52],153:[2,52],154:[2,52]},{1:[2,53],6:[2,53],17:[2,53],18:[2,53],19:[2,53],37:[2,53],38:[2,53],68:[2,53],74:[2,53],76:[2,53],77:[2,53],89:[2,53],90:[2,53],91:[2,53],93:[2,53],95:[2,53],96:[2,53],105:[2,53],110:[2,53],119:[2,53],121:[2,53],122:[2,53],123:[2,53],127:[2,53],135:[2,53],143:[2,53],145:[2,53],146:[2,53],149:[2,53],150:[2,53],151:[2,53],152:[2,53],153:[2,53],154:[2,53]},{1:[2,54],6:[2,54],17:[2,54],18:[2,54],19:[2,54],37:[2,54],38:[2,54],68:[2,54],74:[2,54],76:[2,54],77:[2,54],89:[2,54],90:[2,54],91:[2,54],93:[2,54],95:[2,54],96:[2,54],105:[2,54],110:[2,54],119:[2,54],121:[2,54],122:[2,54],123:[2,54],127:[2,54],135:[2,54],143:[2,54],145:[2,54],146:[2,54],149:[2,54],150:[2,54],151:[2,54],152:[2,54],153:[2,54],154:[2,54]},{8:187,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,188],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:189,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,193],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],37:[1,190],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,82:194,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],106:191,107:[1,65],108:[1,66],111:192,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{76:[1,148],103:195},{1:[2,135],6:[2,135],17:[2,135],18:[2,135],19:[2,135],37:[2,135],38:[2,135],68:[2,135],74:[2,135],76:[2,135],77:[2,135],89:[2,135],90:[2,135],91:[2,135],93:[2,135],95:[2,135],96:[2,135],105:[2,135],110:[2,135],119:[2,135],121:[2,135],122:[2,135],123:[2,135],127:[2,135],135:[2,135],143:[2,135],145:[2,135],146:[2,135],149:[2,135],150:[2,135],151:[2,135],152:[2,135],153:[2,135],154:[2,135]},{1:[2,136],6:[2,136],17:[2,136],18:[2,136],19:[2,136],32:196,37:[2,136],38:[2,136],51:[1,111],68:[2,136],74:[2,136],76:[2,136],77:[2,136],89:[2,136],90:[2,136],91:[2,136],93:[2,136],95:[2,136],96:[2,136],105:[2,136],110:[2,136],119:[2,136],121:[2,136],122:[2,136],123:[2,136],127:[2,136],135:[2,136],143:[2,136],145:[2,136],146:[2,136],149:[2,136],150:[2,136],151:[2,136],152:[2,136],153:[2,136],154:[2,136]},{18:[2,70]},{18:[2,71]},{1:[2,90],6:[2,90],14:[2,90],17:[2,90],18:[2,90],19:[2,90],37:[2,90],38:[2,90],68:[2,90],74:[2,90],76:[2,90],77:[2,90],89:[2,90],90:[2,90],91:[2,90],93:[2,90],95:[2,90],96:[2,90],100:[2,90],105:[2,90],110:[2,90],119:[2,90],121:[2,90],122:[2,90],123:[2,90],127:[2,90],135:[2,90],143:[2,90],145:[2,90],146:[2,90],147:[2,90],148:[2,90],149:[2,90],150:[2,90],151:[2,90],152:[2,90],153:[2,90],154:[2,90],155:[2,90]},{1:[2,93],6:[2,93],14:[2,93],17:[2,93],18:[2,93],19:[2,93],37:[2,93],38:[2,93],68:[2,93],74:[2,93],76:[2,93],77:[2,93],89:[2,93],90:[2,93],91:[2,93],93:[2,93],95:[2,93],96:[2,93],100:[2,93],105:[2,93],110:[2,93],119:[2,93],121:[2,93],122:[2,93],123:[2,93],127:[2,93],135:[2,93],143:[2,93],145:[2,93],146:[2,93],147:[2,93],148:[2,93],149:[2,93],150:[2,93],151:[2,93],152:[2,93],153:[2,93],154:[2,93],155:[2,93]},{8:197,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:198,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:199,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{5:200,8:201,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,5],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{15:[1,77],32:206,35:[1,63],51:[1,111],80:207,81:208,86:202,130:203,131:[1,204],132:205},{129:209,133:[1,210],134:[1,211]},{6:[2,113],11:215,17:[2,113],18:[2,113],32:216,38:[2,113],51:[1,111],52:217,53:[1,78],54:[1,79],61:213,62:214,63:218,65:[1,50],98:212,108:[1,160]},{1:[2,48],6:[2,48],17:[2,48],18:[2,48],19:[2,48],33:[2,48],37:[2,48],38:[2,48],68:[2,48],74:[2,48],76:[2,48],77:[2,48],89:[2,48],90:[2,48],91:[2,48],93:[2,48],95:[2,48],96:[2,48],105:[2,48],110:[2,48],119:[2,48],121:[2,48],122:[2,48],123:[2,48],127:[2,48],135:[2,48],143:[2,48],145:[2,48],146:[2,48],149:[2,48],150:[2,48],151:[2,48],152:[2,48],153:[2,48],154:[2,48]},{1:[2,49],6:[2,49],17:[2,49],18:[2,49],19:[2,49],33:[2,49],37:[2,49],38:[2,49],68:[2,49],74:[2,49],76:[2,49],77:[2,49],89:[2,49],90:[2,49],91:[2,49],93:[2,49],95:[2,49],96:[2,49],105:[2,49],110:[2,49],119:[2,49],121:[2,49],122:[2,49],123:[2,49],127:[2,49],135:[2,49],143:[2,49],145:[2,49],146:[2,49],149:[2,49],150:[2,49],151:[2,49],152:[2,49],153:[2,49],154:[2,49]},{1:[2,225],6:[2,225],19:[2,225],76:[2,225],121:[2,225],123:[2,225],127:[2,225],143:[2,225]},{1:[2,226],6:[2,226],19:[2,226],76:[2,226],121:[2,226],123:[2,226],127:[2,226],143:[2,226]},{1:[2,227],6:[2,227],19:[2,227],76:[2,227],121:[2,227],123:[2,227],127:[2,227],143:[2,227]},{1:[2,228],6:[2,228],19:[2,228],76:[2,228],121:[2,228],123:[2,228],127:[2,228],143:[2,228]},{1:[2,229],6:[2,229],19:[2,229],76:[2,229],121:[2,229],123:[2,229],127:[2,229],143:[2,229]},{1:[2,230],6:[2,230],19:[2,230],76:[2,230],121:[2,230],123:[2,230],127:[2,230],143:[2,230]},{1:[2,231],6:[2,231],19:[2,231],76:[2,231],121:[2,231],123:[2,231],127:[2,231],143:[2,231]},{1:[2,232],6:[2,232],19:[2,232],76:[2,232],121:[2,232],123:[2,232],127:[2,232],143:[2,232]},{1:[2,233],6:[2,233],19:[2,233],76:[2,233],121:[2,233],123:[2,233],127:[2,233],143:[2,233]},{1:[2,234],6:[2,234],19:[2,234],76:[2,234],121:[2,234],123:[2,234],127:[2,234],143:[2,234]},{1:[2,235],6:[2,235],19:[2,235],76:[2,235],121:[2,235],123:[2,235],127:[2,235],143:[2,235]},{1:[2,236],6:[2,236],19:[2,236],76:[2,236],121:[2,236],123:[2,236],127:[2,236],143:[2,236]},{1:[2,237],6:[2,237],19:[2,237],76:[2,237],121:[2,237],123:[2,237],127:[2,237],143:[2,237]},{1:[2,238],6:[2,238],19:[2,238],76:[2,238],121:[2,238],123:[2,238],127:[2,238],143:[2,238]},{1:[2,239],6:[2,239],19:[2,239],76:[2,239],121:[2,239],123:[2,239],127:[2,239],143:[2,239]},{1:[2,240],6:[2,240],19:[2,240],76:[2,240],121:[2,240],123:[2,240],127:[2,240],143:[2,240]},{1:[2,241],6:[2,241],19:[2,241],76:[2,241],121:[2,241],123:[2,241],127:[2,241],143:[2,241]},{1:[2,242],6:[2,242],19:[2,242],76:[2,242],121:[2,242],123:[2,242],127:[2,242],143:[2,242]},{1:[2,243],6:[2,243],19:[2,243],76:[2,243],121:[2,243],123:[2,243],127:[2,243],143:[2,243]},{1:[2,244],6:[2,244],19:[2,244],76:[2,244],121:[2,244],123:[2,244],127:[2,244],143:[2,244]},{1:[2,245],6:[2,245],19:[2,245],76:[2,245],121:[2,245],123:[2,245],127:[2,245],143:[2,245]},{1:[2,246],6:[2,246],19:[2,246],76:[2,246],121:[2,246],123:[2,246],127:[2,246],143:[2,246]},{1:[2,247],6:[2,247],19:[2,247],76:[2,247],121:[2,247],123:[2,247],127:[2,247],143:[2,247]},{1:[2,248],6:[2,248],19:[2,248],76:[2,248],121:[2,248],123:[2,248],127:[2,248],143:[2,248]},{1:[2,249],6:[2,249],19:[2,249],76:[2,249],121:[2,249],123:[2,249],127:[2,249],143:[2,249]},{1:[2,250],6:[2,250],19:[2,250],76:[2,250],121:[2,250],123:[2,250],127:[2,250],143:[2,250]},{1:[2,251],6:[2,251],19:[2,251],76:[2,251],121:[2,251],123:[2,251],127:[2,251],143:[2,251]},{1:[2,252],6:[2,252],19:[2,252],76:[2,252],121:[2,252],123:[2,252],127:[2,252],143:[2,252]},{1:[2,253],6:[2,253],19:[2,253],76:[2,253],121:[2,253],123:[2,253],127:[2,253],143:[2,253]},{1:[2,254],6:[2,254],19:[2,254],76:[2,254],121:[2,254],123:[2,254],127:[2,254],143:[2,254]},{1:[2,255],6:[2,255],19:[2,255],76:[2,255],121:[2,255],123:[2,255],127:[2,255],143:[2,255]},{1:[2,47],6:[2,47],14:[2,47],17:[2,47],18:[2,47],19:[2,47],33:[2,47],37:[2,47],38:[2,47],68:[2,47],74:[2,47],76:[2,47],77:[2,47],89:[2,47],90:[2,47],91:[2,47],93:[2,47],95:[2,47],96:[2,47],100:[2,47],105:[2,47],110:[2,47],119:[2,47],121:[2,47],122:[2,47],123:[2,47],127:[2,47],133:[2,47],134:[2,47],135:[2,47],143:[2,47],145:[2,47],146:[2,47],147:[2,47],148:[2,47],149:[2,47],150:[2,47],151:[2,47],152:[2,47],153:[2,47],154:[2,47],155:[2,47]},{1:[2,6],6:[2,6],7:219,8:6,9:7,10:20,11:21,12:[1,22],13:23,15:[1,77],19:[2,6],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,3]},{1:[2,45],6:[2,45],17:[2,45],18:[2,45],19:[2,45],37:[2,45],38:[2,45],68:[2,45],74:[2,45],77:[2,45],95:[2,45],110:[2,45],115:[2,45],116:[2,45],119:[2,45],121:[2,45],122:[2,45],123:[2,45],127:[2,45],135:[2,45],138:[2,45],140:[2,45],143:[2,45],145:[2,45],146:[2,45],149:[2,45],150:[2,45],151:[2,45],152:[2,45],153:[2,45],154:[2,45]},{6:[1,112],19:[1,220]},{1:[2,214],6:[2,214],17:[2,214],18:[2,214],19:[2,214],37:[2,214],38:[2,214],68:[2,214],74:[2,214],77:[2,214],95:[2,214],110:[2,214],119:[2,214],121:[2,214],122:[2,214],123:[2,214],127:[2,214],135:[2,214],143:[2,214],145:[2,214],146:[2,214],149:[2,214],150:[2,214],151:[2,214],152:[2,214],153:[2,214],154:[2,214]},{8:221,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:222,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:223,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:224,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:225,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:226,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:227,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:228,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,170],6:[2,170],17:[2,170],18:[2,170],19:[2,170],37:[2,170],38:[2,170],68:[2,170],74:[2,170],77:[2,170],95:[2,170],110:[2,170],119:[2,170],121:[2,170],122:[2,170],123:[2,170],127:[2,170],135:[2,170],143:[2,170],145:[2,170],146:[2,170],149:[2,170],150:[2,170],151:[2,170],152:[2,170],153:[2,170],154:[2,170]},{1:[2,175],6:[2,175],17:[2,175],18:[2,175],19:[2,175],37:[2,175],38:[2,175],68:[2,175],74:[2,175],77:[2,175],95:[2,175],110:[2,175],119:[2,175],121:[2,175],122:[2,175],123:[2,175],127:[2,175],135:[2,175],143:[2,175],145:[2,175],146:[2,175],149:[2,175],150:[2,175],151:[2,175],152:[2,175],153:[2,175],154:[2,175]},{8:229,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,169],6:[2,169],17:[2,169],18:[2,169],19:[2,169],37:[2,169],38:[2,169],68:[2,169],74:[2,169],77:[2,169],95:[2,169],110:[2,169],119:[2,169],121:[2,169],122:[2,169],123:[2,169],127:[2,169],135:[2,169],143:[2,169],145:[2,169],146:[2,169],149:[2,169],150:[2,169],151:[2,169],152:[2,169],153:[2,169],154:[2,169]},{1:[2,174],6:[2,174],17:[2,174],18:[2,174],19:[2,174],37:[2,174],38:[2,174],68:[2,174],74:[2,174],77:[2,174],95:[2,174],110:[2,174],119:[2,174],121:[2,174],122:[2,174],123:[2,174],127:[2,174],135:[2,174],143:[2,174],145:[2,174],146:[2,174],149:[2,174],150:[2,174],151:[2,174],152:[2,174],153:[2,174],154:[2,174]},{76:[1,148],103:230},{1:[2,91],6:[2,91],14:[2,91],17:[2,91],18:[2,91],19:[2,91],37:[2,91],38:[2,91],68:[2,91],74:[2,91],76:[2,91],77:[2,91],89:[2,91],90:[2,91],91:[2,91],93:[2,91],95:[2,91],96:[2,91],100:[2,91],105:[2,91],110:[2,91],119:[2,91],121:[2,91],122:[2,91],123:[2,91],127:[2,91],135:[2,91],143:[2,91],145:[2,91],146:[2,91],147:[2,91],148:[2,91],149:[2,91],150:[2,91],151:[2,91],152:[2,91],153:[2,91],154:[2,91],155:[2,91]},{76:[2,132]},{32:231,51:[1,111]},{32:232,51:[1,111]},{1:[2,106],6:[2,106],14:[2,106],17:[2,106],18:[2,106],19:[2,106],32:233,37:[2,106],38:[2,106],51:[1,111],68:[2,106],74:[2,106],76:[2,106],77:[2,106],89:[2,106],90:[2,106],91:[2,106],93:[2,106],95:[2,106],96:[2,106],100:[2,106],105:[2,106],110:[2,106],119:[2,106],121:[2,106],122:[2,106],123:[2,106],127:[2,106],135:[2,106],143:[2,106],145:[2,106],146:[2,106],147:[2,106],148:[2,106],149:[2,106],150:[2,106],151:[2,106],152:[2,106],153:[2,106],154:[2,106],155:[2,106]},{1:[2,107],6:[2,107],14:[2,107],17:[2,107],18:[2,107],19:[2,107],37:[2,107],38:[2,107],68:[2,107],74:[2,107],76:[2,107],77:[2,107],89:[2,107],90:[2,107],91:[2,107],93:[2,107],95:[2,107],96:[2,107],100:[2,107],105:[2,107],110:[2,107],119:[2,107],121:[2,107],122:[2,107],123:[2,107],127:[2,107],135:[2,107],143:[2,107],145:[2,107],146:[2,107],147:[2,107],148:[2,107],149:[2,107],150:[2,107],151:[2,107],152:[2,107],153:[2,107],154:[2,107],155:[2,107]},{8:235,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],74:[1,239],80:55,81:56,83:40,85:27,86:28,87:29,88:30,94:234,97:236,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],109:237,110:[1,238],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{92:240,93:[1,137],96:[1,138]},{76:[1,148],103:241},{1:[2,92],6:[2,92],14:[2,92],17:[2,92],18:[2,92],19:[2,92],37:[2,92],38:[2,92],68:[2,92],74:[2,92],76:[2,92],77:[2,92],89:[2,92],90:[2,92],91:[2,92],93:[2,92],95:[2,92],96:[2,92],100:[2,92],105:[2,92],110:[2,92],119:[2,92],121:[2,92],122:[2,92],123:[2,92],127:[2,92],135:[2,92],143:[2,92],145:[2,92],146:[2,92],147:[2,92],148:[2,92],149:[2,92],150:[2,92],151:[2,92],152:[2,92],153:[2,92],154:[2,92],155:[2,92]},{15:[1,242],18:[1,243]},{22:244,156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{156:[2,15],157:[2,15],158:[2,15],159:[2,15],160:[2,15],161:[2,15],162:[2,15],163:[2,15],164:[2,15],165:[2,15],166:[2,15],167:[2,15],168:[2,15],169:[2,15],170:[2,15],171:[2,15],172:[2,15],173:[2,15],174:[2,15],175:[2,15],176:[2,15],177:[2,15],178:[2,15],179:[2,15],180:[2,15],181:[2,15],182:[2,15],183:[2,15],184:[2,15],185:[2,15],186:[2,15]},{156:[2,16],157:[2,16],158:[2,16],159:[2,16],160:[2,16],161:[2,16],162:[2,16],163:[2,16],164:[2,16],165:[2,16],166:[2,16],167:[2,16],168:[2,16],169:[2,16],170:[2,16],171:[2,16],172:[2,16],173:[2,16],174:[2,16],175:[2,16],176:[2,16],177:[2,16],178:[2,16],179:[2,16],180:[2,16],181:[2,16],182:[2,16],183:[2,16],184:[2,16],185:[2,16],186:[2,16]},{156:[2,17],157:[2,17],158:[2,17],159:[2,17],160:[2,17],161:[2,17],162:[2,17],163:[2,17],164:[2,17],165:[2,17],166:[2,17],167:[2,17],168:[2,17],169:[2,17],170:[2,17],171:[2,17],172:[2,17],173:[2,17],174:[2,17],175:[2,17],176:[2,17],177:[2,17],178:[2,17],179:[2,17],180:[2,17],181:[2,17],182:[2,17],183:[2,17],184:[2,17],185:[2,17],186:[2,17]},{6:[1,246],8:245,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,247],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,130],6:[2,130],17:[2,130],18:[2,130],19:[2,130],37:[2,130],38:[2,130],68:[2,130],74:[2,130],76:[2,130],77:[2,130],89:[2,130],90:[2,130],91:[2,130],93:[2,130],95:[2,130],96:[2,130],105:[2,130],110:[2,130],119:[2,130],121:[2,130],122:[2,130],123:[2,130],127:[2,130],135:[2,130],143:[2,130],145:[2,130],146:[2,130],149:[2,130],150:[2,130],151:[2,130],152:[2,130],153:[2,130],154:[2,130]},{8:250,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,193],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],77:[1,248],80:55,81:56,82:194,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],106:249,107:[1,65],108:[1,66],111:192,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{38:[1,252],68:[1,251]},{38:[2,75],68:[2,75],77:[2,75]},{14:[1,254],38:[2,77],68:[2,77],74:[1,253],77:[2,77]},{15:[1,77],22:153,32:154,35:[1,161],51:[1,111],63:155,72:255,73:151,75:152,78:[1,158],79:[1,159],80:156,81:157,108:[1,160],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{76:[1,256]},{14:[2,85],38:[2,85],68:[2,85],74:[2,85],77:[2,85]},{14:[2,86],38:[2,86],68:[2,86],74:[2,86],77:[2,86]},{14:[2,87],38:[2,87],68:[2,87],74:[2,87],77:[2,87]},{14:[2,88],38:[2,88],68:[2,88],74:[2,88],77:[2,88]},{15:[2,83],35:[2,83],51:[2,83],78:[2,83],79:[2,83],108:[2,83],156:[2,83],157:[2,83],158:[2,83],159:[2,83],160:[2,83],161:[2,83],162:[2,83],163:[2,83],164:[2,83],165:[2,83],166:[2,83],167:[2,83],168:[2,83],169:[2,83],170:[2,83],171:[2,83],172:[2,83],173:[2,83],174:[2,83],175:[2,83],176:[2,83],177:[2,83],178:[2,83],179:[2,83],180:[2,83],181:[2,83],182:[2,83],183:[2,83],184:[2,83],185:[2,83],186:[2,83]},{15:[2,84],35:[2,84],51:[2,84],78:[2,84],79:[2,84],108:[2,84],156:[2,84],157:[2,84],158:[2,84],159:[2,84],160:[2,84],161:[2,84],162:[2,84],163:[2,84],164:[2,84],165:[2,84],166:[2,84],167:[2,84],168:[2,84],169:[2,84],170:[2,84],171:[2,84],172:[2,84],173:[2,84],174:[2,84],175:[2,84],176:[2,84],177:[2,84],178:[2,84],179:[2,84],180:[2,84],181:[2,84],182:[2,84],183:[2,84],184:[2,84],185:[2,84],186:[2,84]},{32:196,51:[1,111]},{8:250,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,193],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],37:[1,190],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,82:194,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],106:191,107:[1,65],108:[1,66],111:192,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,69],6:[2,69],17:[2,69],18:[2,69],19:[2,69],37:[2,69],38:[2,69],68:[2,69],74:[2,69],77:[2,69],95:[2,69],110:[2,69],119:[2,69],121:[2,69],122:[2,69],123:[2,69],127:[2,69],135:[2,69],143:[2,69],145:[2,69],146:[2,69],149:[2,69],150:[2,69],151:[2,69],152:[2,69],153:[2,69],154:[2,69]},{1:[2,207],6:[2,207],17:[2,207],18:[2,207],19:[2,207],37:[2,207],38:[2,207],68:[2,207],74:[2,207],77:[2,207],95:[2,207],110:[2,207],119:[2,207],120:125,121:[2,207],122:[2,207],123:[2,207],126:126,127:[2,207],128:76,135:[2,207],143:[2,207],145:[2,207],146:[2,207],149:[1,116],150:[2,207],151:[2,207],152:[2,207],153:[2,207],154:[2,207]},{120:128,121:[1,72],123:[1,73],126:129,127:[1,75],128:76,143:[1,127]},{1:[2,208],6:[2,208],17:[2,208],18:[2,208],19:[2,208],37:[2,208],38:[2,208],68:[2,208],74:[2,208],77:[2,208],95:[2,208],110:[2,208],119:[2,208],120:125,121:[2,208],122:[2,208],123:[2,208],126:126,127:[2,208],128:76,135:[2,208],143:[2,208],145:[2,208],146:[2,208],149:[1,116],150:[2,208],151:[2,208],152:[2,208],153:[2,208],154:[2,208]},{1:[2,209],6:[2,209],17:[2,209],18:[2,209],19:[2,209],37:[2,209],38:[2,209],68:[2,209],74:[2,209],77:[2,209],95:[2,209],110:[2,209],119:[2,209],120:125,121:[2,209],122:[2,209],123:[2,209],126:126,127:[2,209],128:76,135:[2,209],143:[2,209],145:[2,209],146:[2,209],149:[1,116],150:[2,209],151:[2,209],152:[2,209],153:[2,209],154:[2,209]},{1:[2,210],6:[2,210],17:[2,210],18:[2,210],19:[2,210],37:[2,210],38:[2,210],68:[2,210],74:[2,210],76:[2,94],77:[2,210],89:[2,94],90:[2,94],91:[2,94],93:[2,94],95:[2,210],96:[2,94],105:[2,94],110:[2,210],119:[2,210],121:[2,210],122:[2,210],123:[2,210],127:[2,210],135:[2,210],143:[2,210],145:[2,210],146:[2,210],149:[2,210],150:[2,210],151:[2,210],152:[2,210],153:[2,210],154:[2,210]},{76:[2,131],84:131,89:[1,133],90:[1,134],91:[1,135],92:136,93:[1,137],96:[1,138],102:130,105:[1,132]},{76:[2,131],84:140,89:[1,133],90:[1,134],91:[1,135],92:136,93:[1,137],96:[1,138],102:139,105:[1,132]},{76:[2,97],89:[2,97],90:[2,97],91:[2,97],93:[2,97],96:[2,97],105:[2,97]},{1:[2,211],6:[2,211],17:[2,211],18:[2,211],19:[2,211],37:[2,211],38:[2,211],68:[2,211],74:[2,211],76:[2,94],77:[2,211],89:[2,94],90:[2,94],91:[2,94],93:[2,94],95:[2,211],96:[2,94],105:[2,94],110:[2,211],119:[2,211],121:[2,211],122:[2,211],123:[2,211],127:[2,211],135:[2,211],143:[2,211],145:[2,211],146:[2,211],149:[2,211],150:[2,211],151:[2,211],152:[2,211],153:[2,211],154:[2,211]},{1:[2,212],6:[2,212],17:[2,212],18:[2,212],19:[2,212],37:[2,212],38:[2,212],68:[2,212],74:[2,212],77:[2,212],95:[2,212],110:[2,212],119:[2,212],121:[2,212],122:[2,212],123:[2,212],127:[2,212],135:[2,212],143:[2,212],145:[2,212],146:[2,212],149:[2,212],150:[2,212],151:[2,212],152:[2,212],153:[2,212],154:[2,212]},{1:[2,213],6:[2,213],17:[2,213],18:[2,213],19:[2,213],37:[2,213],38:[2,213],68:[2,213],74:[2,213],77:[2,213],95:[2,213],110:[2,213],119:[2,213],121:[2,213],122:[2,213],123:[2,213],127:[2,213],135:[2,213],143:[2,213],145:[2,213],146:[2,213],149:[2,213],150:[2,213],151:[2,213],152:[2,213],153:[2,213],154:[2,213]},{8:257,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,258],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:259,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{5:260,18:[1,5],142:[1,261]},{1:[2,156],6:[2,156],17:[2,156],18:[2,156],19:[2,156],37:[2,156],38:[2,156],68:[2,156],74:[2,156],77:[2,156],95:[2,156],110:[2,156],114:262,115:[1,263],116:[1,264],119:[2,156],121:[2,156],122:[2,156],123:[2,156],127:[2,156],135:[2,156],143:[2,156],145:[2,156],146:[2,156],149:[2,156],150:[2,156],151:[2,156],152:[2,156],153:[2,156],154:[2,156]},{1:[2,168],6:[2,168],17:[2,168],18:[2,168],19:[2,168],37:[2,168],38:[2,168],68:[2,168],74:[2,168],77:[2,168],95:[2,168],110:[2,168],119:[2,168],121:[2,168],122:[2,168],123:[2,168],127:[2,168],135:[2,168],143:[2,168],145:[2,168],146:[2,168],149:[2,168],150:[2,168],151:[2,168],152:[2,168],153:[2,168],154:[2,168]},{1:[2,176],6:[2,176],17:[2,176],18:[2,176],19:[2,176],37:[2,176],38:[2,176],68:[2,176],74:[2,176],77:[2,176],95:[2,176],110:[2,176],119:[2,176],121:[2,176],122:[2,176],123:[2,176],127:[2,176],135:[2,176],143:[2,176],145:[2,176],146:[2,176],149:[2,176],150:[2,176],151:[2,176],152:[2,176],153:[2,176],154:[2,176]},{18:[1,265],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{137:266,139:267,140:[1,268]},{1:[2,119],6:[2,119],17:[2,119],18:[2,119],19:[2,119],37:[2,119],38:[2,119],68:[2,119],74:[2,119],77:[2,119],95:[2,119],110:[2,119],119:[2,119],121:[2,119],122:[2,119],123:[2,119],127:[2,119],135:[2,119],143:[2,119],145:[2,119],146:[2,119],149:[2,119],150:[2,119],151:[2,119],152:[2,119],153:[2,119],154:[2,119]},{8:269,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,122],5:270,6:[2,122],17:[2,122],18:[1,5],19:[2,122],37:[2,122],38:[2,122],68:[2,122],74:[2,122],76:[2,94],77:[2,122],89:[2,94],90:[2,94],91:[2,94],93:[2,94],95:[2,122],96:[2,94],100:[1,271],105:[2,94],110:[2,122],119:[2,122],121:[2,122],122:[2,122],123:[2,122],127:[2,122],135:[2,122],143:[2,122],145:[2,122],146:[2,122],149:[2,122],150:[2,122],151:[2,122],152:[2,122],153:[2,122],154:[2,122]},{1:[2,161],6:[2,161],17:[2,161],18:[2,161],19:[2,161],37:[2,161],38:[2,161],68:[2,161],74:[2,161],77:[2,161],95:[2,161],110:[2,161],119:[2,161],120:125,121:[2,161],122:[2,161],123:[2,161],126:126,127:[2,161],128:76,135:[2,161],143:[2,161],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,65],6:[2,65],19:[2,65],120:125,121:[2,65],123:[2,65],126:126,127:[2,65],128:76,143:[2,65],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{119:[1,272],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{8:273,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{6:[2,152],18:[2,152],37:[2,152],38:[2,152],74:[1,275],109:274,110:[1,238],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,138],6:[2,138],14:[2,138],17:[2,138],18:[2,138],19:[2,138],37:[2,138],38:[2,138],68:[2,138],74:[2,138],76:[2,138],77:[2,138],89:[2,138],90:[2,138],91:[2,138],93:[2,138],95:[2,138],96:[2,138],105:[2,138],110:[2,138],119:[2,138],121:[2,138],122:[2,138],123:[2,138],127:[2,138],133:[2,138],134:[2,138],135:[2,138],143:[2,138],145:[2,138],146:[2,138],149:[2,138],150:[2,138],151:[2,138],152:[2,138],153:[2,138],154:[2,138]},{6:[2,72],18:[2,72],31:276,37:[2,72],38:[1,277]},{6:[2,147],18:[2,147],19:[2,147],37:[2,147],38:[2,147],77:[2,147]},{8:250,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,193],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,82:194,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],106:278,107:[1,65],108:[1,66],111:192,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{6:[2,153],18:[2,153],19:[2,153],37:[2,153],38:[2,153],77:[2,153]},{1:[2,256],6:[2,256],17:[2,256],18:[2,256],19:[2,256],37:[2,256],38:[2,256],68:[2,256],74:[2,256],76:[2,256],77:[2,256],89:[2,256],90:[2,256],91:[2,256],93:[2,256],95:[2,256],96:[2,256],105:[2,256],110:[2,256],119:[2,256],121:[2,256],122:[2,256],123:[2,256],127:[2,256],135:[2,256],143:[2,256],145:[2,256],146:[2,256],149:[2,256],150:[2,256],151:[2,256],152:[2,256],153:[2,256],154:[2,256]},{1:[2,137],6:[2,137],14:[2,137],17:[2,137],18:[2,137],19:[2,137],33:[2,137],37:[2,137],38:[2,137],68:[2,137],74:[2,137],76:[2,137],77:[2,137],89:[2,137],90:[2,137],91:[2,137],93:[2,137],95:[2,137],96:[2,137],100:[2,137],105:[2,137],110:[2,137],119:[2,137],121:[2,137],122:[2,137],123:[2,137],127:[2,137],135:[2,137],143:[2,137],145:[2,137],146:[2,137],147:[2,137],148:[2,137],149:[2,137],150:[2,137],151:[2,137],152:[2,137],153:[2,137],154:[2,137],155:[2,137]},{5:279,18:[1,5],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,164],6:[2,164],17:[2,164],18:[2,164],19:[2,164],37:[2,164],38:[2,164],68:[2,164],74:[2,164],77:[2,164],95:[2,164],110:[2,164],119:[2,164],120:125,121:[1,72],122:[1,280],123:[1,73],126:126,127:[1,75],128:76,135:[2,164],143:[2,164],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,166],6:[2,166],17:[2,166],18:[2,166],19:[2,166],37:[2,166],38:[2,166],68:[2,166],74:[2,166],77:[2,166],95:[2,166],110:[2,166],119:[2,166],120:125,121:[1,72],122:[1,281],123:[1,73],126:126,127:[1,75],128:76,135:[2,166],143:[2,166],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,172],6:[2,172],17:[2,172],18:[2,172],19:[2,172],37:[2,172],38:[2,172],68:[2,172],74:[2,172],77:[2,172],95:[2,172],110:[2,172],119:[2,172],121:[2,172],122:[2,172],123:[2,172],127:[2,172],135:[2,172],143:[2,172],145:[2,172],146:[2,172],149:[2,172],150:[2,172],151:[2,172],152:[2,172],153:[2,172],154:[2,172]},{1:[2,173],6:[2,173],17:[2,173],18:[2,173],19:[2,173],37:[2,173],38:[2,173],68:[2,173],74:[2,173],77:[2,173],95:[2,173],110:[2,173],119:[2,173],120:125,121:[1,72],122:[2,173],123:[1,73],126:126,127:[1,75],128:76,135:[2,173],143:[2,173],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,177],6:[2,177],17:[2,177],18:[2,177],19:[2,177],37:[2,177],38:[2,177],68:[2,177],74:[2,177],77:[2,177],95:[2,177],110:[2,177],119:[2,177],121:[2,177],122:[2,177],123:[2,177],127:[2,177],135:[2,177],143:[2,177],145:[2,177],146:[2,177],149:[2,177],150:[2,177],151:[2,177],152:[2,177],153:[2,177],154:[2,177]},{133:[2,179],134:[2,179]},{15:[1,77],32:206,35:[1,161],51:[1,111],80:207,81:208,130:282,132:205},{38:[1,283],133:[2,184],134:[2,184]},{38:[2,181],133:[2,181],134:[2,181]},{38:[2,182],133:[2,182],134:[2,182]},{38:[2,183],133:[2,183],134:[2,183]},{1:[2,178],6:[2,178],17:[2,178],18:[2,178],19:[2,178],37:[2,178],38:[2,178],68:[2,178],74:[2,178],77:[2,178],95:[2,178],110:[2,178],119:[2,178],121:[2,178],122:[2,178],123:[2,178],127:[2,178],135:[2,178],143:[2,178],145:[2,178],146:[2,178],149:[2,178],150:[2,178],151:[2,178],152:[2,178],153:[2,178],154:[2,178]},{8:284,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:285,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{6:[2,72],17:[2,72],18:[2,72],31:286,38:[1,287]},{6:[2,114],17:[2,114],18:[2,114],19:[2,114],38:[2,114]},{6:[2,58],17:[2,58],18:[2,58],19:[2,58],33:[1,288],38:[2,58]},{6:[2,61],17:[2,61],18:[2,61],19:[2,61],38:[2,61]},{6:[2,62],17:[2,62],18:[2,62],19:[2,62],33:[2,62],38:[2,62]},{6:[2,63],17:[2,63],18:[2,63],19:[2,63],33:[2,63],38:[2,63]},{6:[2,64],17:[2,64],18:[2,64],19:[2,64],33:[2,64],38:[2,64]},{1:[2,5],6:[2,5],19:[2,5]},{1:[2,46],6:[2,46],17:[2,46],18:[2,46],19:[2,46],37:[2,46],38:[2,46],68:[2,46],74:[2,46],77:[2,46],95:[2,46],110:[2,46],115:[2,46],116:[2,46],119:[2,46],121:[2,46],122:[2,46],123:[2,46],127:[2,46],135:[2,46],138:[2,46],140:[2,46],143:[2,46],145:[2,46],146:[2,46],149:[2,46],150:[2,46],151:[2,46],152:[2,46],153:[2,46],154:[2,46]},{1:[2,215],6:[2,215],17:[2,215],18:[2,215],19:[2,215],37:[2,215],38:[2,215],68:[2,215],74:[2,215],77:[2,215],95:[2,215],110:[2,215],119:[2,215],120:125,121:[2,215],122:[2,215],123:[2,215],126:126,127:[2,215],128:76,135:[2,215],143:[2,215],145:[2,215],146:[2,215],149:[1,116],150:[1,119],151:[2,215],152:[2,215],153:[2,215],154:[2,215]},{1:[2,216],6:[2,216],17:[2,216],18:[2,216],19:[2,216],37:[2,216],38:[2,216],68:[2,216],74:[2,216],77:[2,216],95:[2,216],110:[2,216],119:[2,216],120:125,121:[2,216],122:[2,216],123:[2,216],126:126,127:[2,216],128:76,135:[2,216],143:[2,216],145:[2,216],146:[2,216],149:[1,116],150:[1,119],151:[2,216],152:[2,216],153:[2,216],154:[2,216]},{1:[2,217],6:[2,217],17:[2,217],18:[2,217],19:[2,217],37:[2,217],38:[2,217],68:[2,217],74:[2,217],77:[2,217],95:[2,217],110:[2,217],119:[2,217],120:125,121:[2,217],122:[2,217],123:[2,217],126:126,127:[2,217],128:76,135:[2,217],143:[2,217],145:[2,217],146:[2,217],149:[1,116],150:[2,217],151:[2,217],152:[2,217],153:[2,217],154:[2,217]},{1:[2,218],6:[2,218],17:[2,218],18:[2,218],19:[2,218],37:[2,218],38:[2,218],68:[2,218],74:[2,218],77:[2,218],95:[2,218],110:[2,218],119:[2,218],120:125,121:[2,218],122:[2,218],123:[2,218],126:126,127:[2,218],128:76,135:[2,218],143:[2,218],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[2,218],152:[2,218],153:[2,218],154:[2,218]},{1:[2,219],6:[2,219],17:[2,219],18:[2,219],19:[2,219],37:[2,219],38:[2,219],68:[2,219],74:[2,219],77:[2,219],95:[2,219],110:[2,219],119:[2,219],120:125,121:[2,219],122:[2,219],123:[2,219],126:126,127:[2,219],128:76,135:[2,219],143:[2,219],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[2,219],153:[2,219],154:[1,123]},{1:[2,220],6:[2,220],17:[2,220],18:[2,220],19:[2,220],37:[2,220],38:[2,220],68:[2,220],74:[2,220],77:[2,220],95:[2,220],110:[2,220],119:[2,220],120:125,121:[2,220],122:[2,220],123:[2,220],126:126,127:[2,220],128:76,135:[2,220],143:[2,220],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[2,220],154:[1,123]},{1:[2,221],6:[2,221],17:[2,221],18:[2,221],19:[2,221],37:[2,221],38:[2,221],68:[2,221],74:[2,221],77:[2,221],95:[2,221],110:[2,221],119:[2,221],120:125,121:[2,221],122:[2,221],123:[2,221],126:126,127:[2,221],128:76,135:[2,221],143:[2,221],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[2,221],153:[2,221],154:[2,221]},{1:[2,206],6:[2,206],17:[2,206],18:[2,206],19:[2,206],37:[2,206],38:[2,206],68:[2,206],74:[2,206],77:[2,206],95:[2,206],110:[2,206],119:[2,206],120:125,121:[1,72],122:[2,206],123:[1,73],126:126,127:[1,75],128:76,135:[2,206],143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,205],6:[2,205],17:[2,205],18:[2,205],19:[2,205],37:[2,205],38:[2,205],68:[2,205],74:[2,205],77:[2,205],95:[2,205],110:[2,205],119:[2,205],120:125,121:[1,72],122:[2,205],123:[1,73],126:126,127:[1,75],128:76,135:[2,205],143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,127],6:[2,127],17:[2,127],18:[2,127],19:[2,127],37:[2,127],38:[2,127],68:[2,127],74:[2,127],76:[2,127],77:[2,127],89:[2,127],90:[2,127],91:[2,127],93:[2,127],95:[2,127],96:[2,127],105:[2,127],110:[2,127],119:[2,127],121:[2,127],122:[2,127],123:[2,127],127:[2,127],135:[2,127],143:[2,127],145:[2,127],146:[2,127],149:[2,127],150:[2,127],151:[2,127],152:[2,127],153:[2,127],154:[2,127]},{1:[2,103],6:[2,103],14:[2,103],17:[2,103],18:[2,103],19:[2,103],37:[2,103],38:[2,103],68:[2,103],74:[2,103],76:[2,103],77:[2,103],89:[2,103],90:[2,103],91:[2,103],93:[2,103],95:[2,103],96:[2,103],100:[2,103],105:[2,103],110:[2,103],119:[2,103],121:[2,103],122:[2,103],123:[2,103],127:[2,103],135:[2,103],143:[2,103],145:[2,103],146:[2,103],147:[2,103],148:[2,103],149:[2,103],150:[2,103],151:[2,103],152:[2,103],153:[2,103],154:[2,103],155:[2,103]},{1:[2,104],6:[2,104],14:[2,104],17:[2,104],18:[2,104],19:[2,104],37:[2,104],38:[2,104],68:[2,104],74:[2,104],76:[2,104],77:[2,104],89:[2,104],90:[2,104],91:[2,104],93:[2,104],95:[2,104],96:[2,104],100:[2,104],105:[2,104],110:[2,104],119:[2,104],121:[2,104],122:[2,104],123:[2,104],127:[2,104],135:[2,104],143:[2,104],145:[2,104],146:[2,104],147:[2,104],148:[2,104],149:[2,104],150:[2,104],151:[2,104],152:[2,104],153:[2,104],154:[2,104],155:[2,104]},{1:[2,105],6:[2,105],14:[2,105],17:[2,105],18:[2,105],19:[2,105],37:[2,105],38:[2,105],68:[2,105],74:[2,105],76:[2,105],77:[2,105],89:[2,105],90:[2,105],91:[2,105],93:[2,105],95:[2,105],96:[2,105],100:[2,105],105:[2,105],110:[2,105],119:[2,105],121:[2,105],122:[2,105],123:[2,105],127:[2,105],135:[2,105],143:[2,105],145:[2,105],146:[2,105],147:[2,105],148:[2,105],149:[2,105],150:[2,105],151:[2,105],152:[2,105],153:[2,105],154:[2,105],155:[2,105]},{95:[1,289]},{74:[1,239],95:[2,110],109:290,110:[1,238],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{95:[2,111]},{8:291,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,95:[2,146],99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{12:[2,140],15:[2,140],20:[2,140],26:[2,140],27:[2,140],28:[2,140],29:[2,140],35:[2,140],51:[2,140],53:[2,140],54:[2,140],56:[2,140],57:[2,140],58:[2,140],59:[2,140],64:[2,140],65:[2,140],66:[2,140],70:[2,140],71:[2,140],95:[2,140],99:[2,140],101:[2,140],104:[2,140],107:[2,140],108:[2,140],113:[2,140],117:[2,140],118:[2,140],121:[2,140],123:[2,140],125:[2,140],127:[2,140],136:[2,140],142:[2,140],144:[2,140],145:[2,140],146:[2,140],147:[2,140],148:[2,140],156:[2,140],157:[2,140],158:[2,140],159:[2,140],160:[2,140],161:[2,140],162:[2,140],163:[2,140],164:[2,140],165:[2,140],166:[2,140],167:[2,140],168:[2,140],169:[2,140],170:[2,140],171:[2,140],172:[2,140],173:[2,140],174:[2,140],175:[2,140],176:[2,140],177:[2,140],178:[2,140],179:[2,140],180:[2,140],181:[2,140],182:[2,140],183:[2,140],184:[2,140],185:[2,140],186:[2,140]},{12:[2,141],15:[2,141],20:[2,141],26:[2,141],27:[2,141],28:[2,141],29:[2,141],35:[2,141],51:[2,141],53:[2,141],54:[2,141],56:[2,141],57:[2,141],58:[2,141],59:[2,141],64:[2,141],65:[2,141],66:[2,141],70:[2,141],71:[2,141],95:[2,141],99:[2,141],101:[2,141],104:[2,141],107:[2,141],108:[2,141],113:[2,141],117:[2,141],118:[2,141],121:[2,141],123:[2,141],125:[2,141],127:[2,141],136:[2,141],142:[2,141],144:[2,141],145:[2,141],146:[2,141],147:[2,141],148:[2,141],156:[2,141],157:[2,141],158:[2,141],159:[2,141],160:[2,141],161:[2,141],162:[2,141],163:[2,141],164:[2,141],165:[2,141],166:[2,141],167:[2,141],168:[2,141],169:[2,141],170:[2,141],171:[2,141],172:[2,141],173:[2,141],174:[2,141],175:[2,141],176:[2,141],177:[2,141],178:[2,141],179:[2,141],180:[2,141],181:[2,141],182:[2,141],183:[2,141],184:[2,141],185:[2,141],186:[2,141]},{1:[2,109],6:[2,109],14:[2,109],17:[2,109],18:[2,109],19:[2,109],37:[2,109],38:[2,109],68:[2,109],74:[2,109],76:[2,109],77:[2,109],89:[2,109],90:[2,109],91:[2,109],93:[2,109],95:[2,109],96:[2,109],100:[2,109],105:[2,109],110:[2,109],119:[2,109],121:[2,109],122:[2,109],123:[2,109],127:[2,109],135:[2,109],143:[2,109],145:[2,109],146:[2,109],147:[2,109],148:[2,109],149:[2,109],150:[2,109],151:[2,109],152:[2,109],153:[2,109],154:[2,109],155:[2,109]},{1:[2,128],6:[2,128],17:[2,128],18:[2,128],19:[2,128],37:[2,128],38:[2,128],68:[2,128],74:[2,128],76:[2,128],77:[2,128],89:[2,128],90:[2,128],91:[2,128],93:[2,128],95:[2,128],96:[2,128],105:[2,128],110:[2,128],119:[2,128],121:[2,128],122:[2,128],123:[2,128],127:[2,128],135:[2,128],143:[2,128],145:[2,128],146:[2,128],149:[2,128],150:[2,128],151:[2,128],152:[2,128],153:[2,128],154:[2,128]},{16:292,30:293,32:294,51:[1,111]},{15:[1,295]},{1:[2,14],6:[2,14],19:[2,14],121:[2,14],123:[2,14],127:[2,14],143:[2,14]},{1:[2,55],6:[2,55],17:[2,55],18:[2,55],19:[2,55],37:[2,55],38:[2,55],68:[2,55],74:[2,55],77:[2,55],95:[2,55],110:[2,55],119:[2,55],120:125,121:[2,55],122:[2,55],123:[2,55],126:126,127:[2,55],128:76,135:[2,55],143:[2,55],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{8:296,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:297,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,133],6:[2,133],17:[2,133],18:[2,133],19:[2,133],37:[2,133],38:[2,133],68:[2,133],74:[2,133],76:[2,133],77:[2,133],89:[2,133],90:[2,133],91:[2,133],93:[2,133],95:[2,133],96:[2,133],105:[2,133],110:[2,133],119:[2,133],121:[2,133],122:[2,133],123:[2,133],127:[2,133],135:[2,133],143:[2,133],145:[2,133],146:[2,133],149:[2,133],150:[2,133],151:[2,133],152:[2,133],153:[2,133],154:[2,133]},{6:[2,72],18:[2,72],31:298,38:[1,277],77:[2,72]},{6:[2,152],18:[2,152],19:[2,152],37:[2,152],38:[2,152],74:[1,299],77:[2,152],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{69:300,70:[1,67],71:[1,68]},{15:[1,77],22:153,32:154,35:[1,161],51:[1,111],63:155,72:301,73:151,75:152,78:[1,158],79:[1,159],80:156,81:157,108:[1,160],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{38:[2,78],68:[2,78],77:[2,78]},{8:302,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{38:[2,80],68:[2,80],77:[2,80]},{15:[1,77],22:153,32:154,35:[1,161],51:[1,111],63:155,72:303,73:151,75:152,78:[1,158],79:[1,159],80:156,81:157,108:[1,160],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,222],6:[2,222],17:[2,222],18:[2,222],19:[2,222],37:[2,222],38:[2,222],68:[2,222],74:[2,222],77:[2,222],95:[2,222],110:[2,222],119:[2,222],120:125,121:[2,222],122:[2,222],123:[2,222],126:126,127:[2,222],128:76,135:[2,222],143:[2,222],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{8:304,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,224],6:[2,224],17:[2,224],18:[2,224],19:[2,224],37:[2,224],38:[2,224],68:[2,224],74:[2,224],77:[2,224],95:[2,224],110:[2,224],119:[2,224],120:125,121:[2,224],122:[2,224],123:[2,224],126:126,127:[2,224],128:76,135:[2,224],143:[2,224],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,204],6:[2,204],17:[2,204],18:[2,204],19:[2,204],37:[2,204],38:[2,204],68:[2,204],74:[2,204],77:[2,204],95:[2,204],110:[2,204],119:[2,204],121:[2,204],122:[2,204],123:[2,204],127:[2,204],135:[2,204],143:[2,204],145:[2,204],146:[2,204],149:[2,204],150:[2,204],151:[2,204],152:[2,204],153:[2,204],154:[2,204]},{8:305,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,157],6:[2,157],17:[2,157],18:[2,157],19:[2,157],37:[2,157],38:[2,157],68:[2,157],74:[2,157],77:[2,157],95:[2,157],110:[2,157],115:[1,306],119:[2,157],121:[2,157],122:[2,157],123:[2,157],127:[2,157],135:[2,157],143:[2,157],145:[2,157],146:[2,157],149:[2,157],150:[2,157],151:[2,157],152:[2,157],153:[2,157],154:[2,157]},{5:307,18:[1,5]},{32:308,51:[1,111]},{137:309,139:267,140:[1,268]},{19:[1,310],138:[1,311],139:312,140:[1,268]},{19:[2,197],138:[2,197],140:[2,197]},{8:314,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],112:313,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,120],5:315,6:[2,120],17:[2,120],18:[1,5],19:[2,120],37:[2,120],38:[2,120],68:[2,120],74:[2,120],77:[2,120],95:[2,120],110:[2,120],119:[2,120],120:125,121:[1,72],122:[2,120],123:[1,73],126:126,127:[1,75],128:76,135:[2,120],143:[2,120],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,123],6:[2,123],17:[2,123],18:[2,123],19:[2,123],37:[2,123],38:[2,123],68:[2,123],74:[2,123],77:[2,123],95:[2,123],110:[2,123],119:[2,123],121:[2,123],122:[2,123],123:[2,123],127:[2,123],135:[2,123],143:[2,123],145:[2,123],146:[2,123],149:[2,123],150:[2,123],151:[2,123],152:[2,123],153:[2,123],154:[2,123]},{8:316,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,162],6:[2,162],17:[2,162],18:[2,162],19:[2,162],37:[2,162],38:[2,162],68:[2,162],74:[2,162],76:[2,162],77:[2,162],89:[2,162],90:[2,162],91:[2,162],93:[2,162],95:[2,162],96:[2,162],105:[2,162],110:[2,162],119:[2,162],121:[2,162],122:[2,162],123:[2,162],127:[2,162],135:[2,162],143:[2,162],145:[2,162],146:[2,162],149:[2,162],150:[2,162],151:[2,162],152:[2,162],153:[2,162],154:[2,162]},{19:[1,317],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{8:318,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{6:[2,89],12:[2,141],15:[2,141],18:[2,89],20:[2,141],26:[2,141],27:[2,141],28:[2,141],29:[2,141],35:[2,141],37:[2,89],38:[2,89],51:[2,141],53:[2,141],54:[2,141],56:[2,141],57:[2,141],58:[2,141],59:[2,141],64:[2,141],65:[2,141],66:[2,141],70:[2,141],71:[2,141],99:[2,141],101:[2,141],104:[2,141],107:[2,141],108:[2,141],113:[2,141],117:[2,141],118:[2,141],121:[2,141],123:[2,141],125:[2,141],127:[2,141],136:[2,141],142:[2,141],144:[2,141],145:[2,141],146:[2,141],147:[2,141],148:[2,141],156:[2,141],157:[2,141],158:[2,141],159:[2,141],160:[2,141],161:[2,141],162:[2,141],163:[2,141],164:[2,141],165:[2,141],166:[2,141],167:[2,141],168:[2,141],169:[2,141],170:[2,141],171:[2,141],172:[2,141],173:[2,141],174:[2,141],175:[2,141],176:[2,141],177:[2,141],178:[2,141],179:[2,141],180:[2,141],181:[2,141],182:[2,141],183:[2,141],184:[2,141],185:[2,141],186:[2,141]},{6:[1,320],18:[1,321],37:[1,319]},{6:[2,73],8:250,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[2,73],19:[2,73],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],37:[2,73],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],77:[2,73],80:55,81:56,82:194,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],111:322,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{6:[2,72],18:[2,72],19:[2,72],31:323,38:[1,277]},{1:[2,201],6:[2,201],17:[2,201],18:[2,201],19:[2,201],37:[2,201],38:[2,201],68:[2,201],74:[2,201],77:[2,201],95:[2,201],110:[2,201],119:[2,201],121:[2,201],122:[2,201],123:[2,201],127:[2,201],135:[2,201],138:[2,201],143:[2,201],145:[2,201],146:[2,201],149:[2,201],150:[2,201],151:[2,201],152:[2,201],153:[2,201],154:[2,201]},{8:324,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:325,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{133:[2,180],134:[2,180]},{15:[1,77],32:206,35:[1,161],51:[1,111],80:207,81:208,132:326},{1:[2,186],6:[2,186],17:[2,186],18:[2,186],19:[2,186],37:[2,186],38:[2,186],68:[2,186],74:[2,186],77:[2,186],95:[2,186],110:[2,186],119:[2,186],120:125,121:[2,186],122:[1,327],123:[2,186],126:126,127:[2,186],128:76,135:[1,328],143:[2,186],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,187],6:[2,187],17:[2,187],18:[2,187],19:[2,187],37:[2,187],38:[2,187],68:[2,187],74:[2,187],77:[2,187],95:[2,187],110:[2,187],119:[2,187],120:125,121:[2,187],122:[1,329],123:[2,187],126:126,127:[2,187],128:76,135:[2,187],143:[2,187],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{6:[1,331],17:[1,330],18:[1,332]},{6:[2,73],11:215,17:[2,73],18:[2,73],19:[2,73],32:216,51:[1,111],52:217,53:[1,78],54:[1,79],61:333,62:214,63:218,65:[1,50],108:[1,160]},{8:334,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,335],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,108],6:[2,108],14:[2,108],17:[2,108],18:[2,108],19:[2,108],37:[2,108],38:[2,108],68:[2,108],74:[2,108],76:[2,108],77:[2,108],89:[2,108],90:[2,108],91:[2,108],93:[2,108],95:[2,108],96:[2,108],100:[2,108],105:[2,108],110:[2,108],119:[2,108],121:[2,108],122:[2,108],123:[2,108],127:[2,108],135:[2,108],143:[2,108],145:[2,108],146:[2,108],147:[2,108],148:[2,108],149:[2,108],150:[2,108],151:[2,108],152:[2,108],153:[2,108],154:[2,108],155:[2,108]},{8:336,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,95:[2,144],99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{95:[2,145],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{6:[2,72],17:[1,337],31:338,38:[1,339]},{6:[2,22],17:[2,22],38:[2,22]},{33:[1,340]},{16:341,30:293,32:294,51:[1,111]},{1:[2,56],6:[2,56],17:[2,56],18:[2,56],19:[2,56],37:[2,56],38:[2,56],68:[2,56],74:[2,56],77:[2,56],95:[2,56],110:[2,56],119:[2,56],120:125,121:[2,56],122:[2,56],123:[2,56],126:126,127:[2,56],128:76,135:[2,56],143:[2,56],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{19:[1,342],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{6:[1,320],18:[1,321],77:[1,343]},{6:[2,89],18:[2,89],19:[2,89],37:[2,89],38:[2,89],77:[2,89]},{5:344,18:[1,5]},{38:[2,76],68:[2,76],77:[2,76]},{38:[2,79],68:[2,79],77:[2,79],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{38:[1,346],77:[1,345]},{19:[1,347],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{5:348,18:[1,5],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{5:349,18:[1,5]},{1:[2,158],6:[2,158],17:[2,158],18:[2,158],19:[2,158],37:[2,158],38:[2,158],68:[2,158],74:[2,158],77:[2,158],95:[2,158],110:[2,158],119:[2,158],121:[2,158],122:[2,158],123:[2,158],127:[2,158],135:[2,158],143:[2,158],145:[2,158],146:[2,158],149:[2,158],150:[2,158],151:[2,158],152:[2,158],153:[2,158],154:[2,158]},{5:350,18:[1,5]},{19:[1,351],138:[1,352],139:312,140:[1,268]},{1:[2,195],6:[2,195],17:[2,195],18:[2,195],19:[2,195],37:[2,195],38:[2,195],68:[2,195],74:[2,195],77:[2,195],95:[2,195],110:[2,195],119:[2,195],121:[2,195],122:[2,195],123:[2,195],127:[2,195],135:[2,195],143:[2,195],145:[2,195],146:[2,195],149:[2,195],150:[2,195],151:[2,195],152:[2,195],153:[2,195],154:[2,195]},{5:353,18:[1,5]},{19:[2,198],138:[2,198],140:[2,198]},{5:354,18:[1,5],38:[1,355]},{18:[2,154],38:[2,154],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,121],6:[2,121],17:[2,121],18:[2,121],19:[2,121],37:[2,121],38:[2,121],68:[2,121],74:[2,121],77:[2,121],95:[2,121],110:[2,121],119:[2,121],121:[2,121],122:[2,121],123:[2,121],127:[2,121],135:[2,121],143:[2,121],145:[2,121],146:[2,121],149:[2,121],150:[2,121],151:[2,121],152:[2,121],153:[2,121],154:[2,121]},{1:[2,124],5:356,6:[2,124],17:[2,124],18:[1,5],19:[2,124],37:[2,124],38:[2,124],68:[2,124],74:[2,124],77:[2,124],95:[2,124],110:[2,124],119:[2,124],120:125,121:[1,72],122:[2,124],123:[1,73],126:126,127:[1,75],128:76,135:[2,124],143:[2,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{119:[1,357]},{37:[1,358],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,139],6:[2,139],14:[2,139],17:[2,139],18:[2,139],19:[2,139],37:[2,139],38:[2,139],68:[2,139],74:[2,139],76:[2,139],77:[2,139],89:[2,139],90:[2,139],91:[2,139],93:[2,139],95:[2,139],96:[2,139],105:[2,139],110:[2,139],119:[2,139],121:[2,139],122:[2,139],123:[2,139],127:[2,139],133:[2,139],134:[2,139],135:[2,139],143:[2,139],145:[2,139],146:[2,139],149:[2,139],150:[2,139],151:[2,139],152:[2,139],153:[2,139],154:[2,139]},{8:250,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,82:194,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],111:359,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:250,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],18:[1,193],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,82:194,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],106:360,107:[1,65],108:[1,66],111:192,113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{6:[2,148],18:[2,148],19:[2,148],37:[2,148],38:[2,148],77:[2,148]},{6:[1,320],18:[1,321],19:[1,361]},{1:[2,165],6:[2,165],17:[2,165],18:[2,165],19:[2,165],37:[2,165],38:[2,165],68:[2,165],74:[2,165],77:[2,165],95:[2,165],110:[2,165],119:[2,165],120:125,121:[1,72],122:[2,165],123:[1,73],126:126,127:[1,75],128:76,135:[2,165],143:[2,165],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,167],6:[2,167],17:[2,167],18:[2,167],19:[2,167],37:[2,167],38:[2,167],68:[2,167],74:[2,167],77:[2,167],95:[2,167],110:[2,167],119:[2,167],120:125,121:[1,72],122:[2,167],123:[1,73],126:126,127:[1,75],128:76,135:[2,167],143:[2,167],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{133:[2,185],134:[2,185]},{8:362,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:363,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:364,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,112],6:[2,112],14:[2,112],17:[2,112],18:[2,112],19:[2,112],37:[2,112],38:[2,112],68:[2,112],74:[2,112],76:[2,112],77:[2,112],89:[2,112],90:[2,112],91:[2,112],93:[2,112],95:[2,112],96:[2,112],105:[2,112],110:[2,112],119:[2,112],121:[2,112],122:[2,112],123:[2,112],127:[2,112],133:[2,112],134:[2,112],135:[2,112],143:[2,112],145:[2,112],146:[2,112],149:[2,112],150:[2,112],151:[2,112],152:[2,112],153:[2,112],154:[2,112]},{11:215,32:216,51:[1,111],52:217,53:[1,78],54:[1,79],61:365,62:214,63:218,65:[1,50],108:[1,160]},{6:[2,113],11:215,18:[2,113],19:[2,113],32:216,38:[2,113],51:[1,111],52:217,53:[1,78],54:[1,79],61:213,62:214,63:218,65:[1,50],98:366,108:[1,160]},{6:[2,115],17:[2,115],18:[2,115],19:[2,115],38:[2,115]},{6:[2,59],17:[2,59],18:[2,59],19:[2,59],38:[2,59],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{8:367,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{95:[2,143],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,12],6:[2,12],19:[2,12],121:[2,12],123:[2,12],127:[2,12],143:[2,12]},{6:[1,368]},{6:[2,73]},{18:[1,371],32:372,34:369,35:[1,370],51:[1,111]},{6:[2,72],17:[1,373],31:338,38:[1,339]},{1:[2,57],6:[2,57],17:[2,57],18:[2,57],19:[2,57],37:[2,57],38:[2,57],68:[2,57],74:[2,57],77:[2,57],95:[2,57],110:[2,57],119:[2,57],121:[2,57],122:[2,57],123:[2,57],127:[2,57],135:[2,57],143:[2,57],145:[2,57],146:[2,57],149:[2,57],150:[2,57],151:[2,57],152:[2,57],153:[2,57],154:[2,57]},{1:[2,134],6:[2,134],17:[2,134],18:[2,134],19:[2,134],37:[2,134],38:[2,134],68:[2,134],74:[2,134],76:[2,134],77:[2,134],89:[2,134],90:[2,134],91:[2,134],93:[2,134],95:[2,134],96:[2,134],105:[2,134],110:[2,134],119:[2,134],121:[2,134],122:[2,134],123:[2,134],127:[2,134],135:[2,134],143:[2,134],145:[2,134],146:[2,134],149:[2,134],150:[2,134],151:[2,134],152:[2,134],153:[2,134],154:[2,134]},{1:[2,68],6:[2,68],17:[2,68],18:[2,68],19:[2,68],37:[2,68],38:[2,68],68:[2,68],74:[2,68],77:[2,68],95:[2,68],110:[2,68],119:[2,68],121:[2,68],122:[2,68],123:[2,68],127:[2,68],135:[2,68],143:[2,68],145:[2,68],146:[2,68],149:[2,68],150:[2,68],151:[2,68],152:[2,68],153:[2,68],154:[2,68]},{38:[2,81],68:[2,81],77:[2,81]},{15:[1,77],22:153,32:154,35:[1,161],38:[2,74],51:[1,111],63:155,67:374,72:150,73:151,75:152,77:[2,74],78:[1,158],79:[1,159],80:156,81:157,108:[1,160],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,223],6:[2,223],17:[2,223],18:[2,223],19:[2,223],37:[2,223],38:[2,223],68:[2,223],74:[2,223],77:[2,223],95:[2,223],110:[2,223],119:[2,223],121:[2,223],122:[2,223],123:[2,223],127:[2,223],135:[2,223],143:[2,223],145:[2,223],146:[2,223],149:[2,223],150:[2,223],151:[2,223],152:[2,223],153:[2,223],154:[2,223]},{1:[2,202],6:[2,202],17:[2,202],18:[2,202],19:[2,202],37:[2,202],38:[2,202],68:[2,202],74:[2,202],77:[2,202],95:[2,202],110:[2,202],119:[2,202],121:[2,202],122:[2,202],123:[2,202],127:[2,202],135:[2,202],138:[2,202],143:[2,202],145:[2,202],146:[2,202],149:[2,202],150:[2,202],151:[2,202],152:[2,202],153:[2,202],154:[2,202]},{1:[2,159],6:[2,159],17:[2,159],18:[2,159],19:[2,159],37:[2,159],38:[2,159],68:[2,159],74:[2,159],77:[2,159],95:[2,159],110:[2,159],119:[2,159],121:[2,159],122:[2,159],123:[2,159],127:[2,159],135:[2,159],143:[2,159],145:[2,159],146:[2,159],149:[2,159],150:[2,159],151:[2,159],152:[2,159],153:[2,159],154:[2,159]},{1:[2,160],6:[2,160],17:[2,160],18:[2,160],19:[2,160],37:[2,160],38:[2,160],68:[2,160],74:[2,160],77:[2,160],95:[2,160],110:[2,160],115:[2,160],119:[2,160],121:[2,160],122:[2,160],123:[2,160],127:[2,160],135:[2,160],143:[2,160],145:[2,160],146:[2,160],149:[2,160],150:[2,160],151:[2,160],152:[2,160],153:[2,160],154:[2,160]},{1:[2,193],6:[2,193],17:[2,193],18:[2,193],19:[2,193],37:[2,193],38:[2,193],68:[2,193],74:[2,193],77:[2,193],95:[2,193],110:[2,193],119:[2,193],121:[2,193],122:[2,193],123:[2,193],127:[2,193],135:[2,193],143:[2,193],145:[2,193],146:[2,193],149:[2,193],150:[2,193],151:[2,193],152:[2,193],153:[2,193],154:[2,193]},{5:375,18:[1,5]},{19:[1,376]},{6:[1,377],19:[2,199],138:[2,199],140:[2,199]},{8:378,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{1:[2,125],6:[2,125],17:[2,125],18:[2,125],19:[2,125],37:[2,125],38:[2,125],68:[2,125],74:[2,125],77:[2,125],95:[2,125],110:[2,125],119:[2,125],121:[2,125],122:[2,125],123:[2,125],127:[2,125],135:[2,125],143:[2,125],145:[2,125],146:[2,125],149:[2,125],150:[2,125],151:[2,125],152:[2,125],153:[2,125],154:[2,125]},{1:[2,163],6:[2,163],17:[2,163],18:[2,163],19:[2,163],37:[2,163],38:[2,163],68:[2,163],74:[2,163],76:[2,163],77:[2,163],89:[2,163],90:[2,163],91:[2,163],93:[2,163],95:[2,163],96:[2,163],105:[2,163],110:[2,163],119:[2,163],121:[2,163],122:[2,163],123:[2,163],127:[2,163],135:[2,163],143:[2,163],145:[2,163],146:[2,163],149:[2,163],150:[2,163],151:[2,163],152:[2,163],153:[2,163],154:[2,163]},{1:[2,142],6:[2,142],17:[2,142],18:[2,142],19:[2,142],37:[2,142],38:[2,142],68:[2,142],74:[2,142],76:[2,142],77:[2,142],89:[2,142],90:[2,142],91:[2,142],93:[2,142],95:[2,142],96:[2,142],105:[2,142],110:[2,142],119:[2,142],121:[2,142],122:[2,142],123:[2,142],127:[2,142],135:[2,142],143:[2,142],145:[2,142],146:[2,142],149:[2,142],150:[2,142],151:[2,142],152:[2,142],153:[2,142],154:[2,142]},{6:[2,149],18:[2,149],19:[2,149],37:[2,149],38:[2,149],77:[2,149]},{6:[2,72],18:[2,72],19:[2,72],31:379,38:[1,277]},{6:[2,150],18:[2,150],19:[2,150],37:[2,150],38:[2,150],77:[2,150]},{1:[2,188],6:[2,188],17:[2,188],18:[2,188],19:[2,188],37:[2,188],38:[2,188],68:[2,188],74:[2,188],77:[2,188],95:[2,188],110:[2,188],119:[2,188],120:125,121:[2,188],122:[2,188],123:[2,188],126:126,127:[2,188],128:76,135:[1,380],143:[2,188],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,190],6:[2,190],17:[2,190],18:[2,190],19:[2,190],37:[2,190],38:[2,190],68:[2,190],74:[2,190],77:[2,190],95:[2,190],110:[2,190],119:[2,190],120:125,121:[2,190],122:[1,381],123:[2,190],126:126,127:[2,190],128:76,135:[2,190],143:[2,190],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,189],6:[2,189],17:[2,189],18:[2,189],19:[2,189],37:[2,189],38:[2,189],68:[2,189],74:[2,189],77:[2,189],95:[2,189],110:[2,189],119:[2,189],120:125,121:[2,189],122:[2,189],123:[2,189],126:126,127:[2,189],128:76,135:[2,189],143:[2,189],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{6:[2,116],17:[2,116],18:[2,116],19:[2,116],38:[2,116]},{6:[2,72],18:[2,72],19:[2,72],31:382,38:[1,287]},{19:[1,383],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{30:384,32:294,51:[1,111]},{6:[2,24],17:[2,24],38:[2,24]},{18:[1,386],32:372,34:387,36:385,51:[1,111]},{32:372,34:387,36:388,51:[1,111]},{6:[2,28],17:[2,28],19:[2,28],37:[2,28],38:[2,28]},{19:[1,389]},{38:[1,252],77:[1,390]},{19:[1,391]},{1:[2,196],6:[2,196],17:[2,196],18:[2,196],19:[2,196],37:[2,196],38:[2,196],68:[2,196],74:[2,196],77:[2,196],95:[2,196],110:[2,196],119:[2,196],121:[2,196],122:[2,196],123:[2,196],127:[2,196],135:[2,196],143:[2,196],145:[2,196],146:[2,196],149:[2,196],150:[2,196],151:[2,196],152:[2,196],153:[2,196],154:[2,196]},{19:[2,200],138:[2,200],140:[2,200]},{18:[2,155],38:[2,155],120:125,121:[1,72],123:[1,73],126:126,127:[1,75],128:76,143:[1,124],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{6:[1,320],18:[1,321],19:[1,392]},{8:393,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{8:394,9:164,10:20,11:21,12:[1,22],13:23,15:[1,77],20:[1,24],22:64,26:[1,51],27:[1,52],28:[1,53],29:[1,54],32:69,35:[1,63],39:8,40:9,41:10,42:11,43:12,44:13,45:14,46:15,47:16,48:17,49:18,50:19,51:[1,111],52:57,53:[1,78],54:[1,79],55:26,56:[1,58],57:[1,59],58:[1,60],59:[1,61],60:25,63:70,64:[1,49],65:[1,50],66:[1,33],69:34,70:[1,67],71:[1,68],80:55,81:56,83:40,85:27,86:28,87:29,88:30,99:[1,47],101:[1,31],104:[1,32],107:[1,65],108:[1,66],113:[1,42],117:[1,48],118:[1,62],120:43,121:[1,72],123:[1,73],124:44,125:[1,74],126:45,127:[1,75],128:76,136:[1,46],141:41,142:[1,71],144:[1,35],145:[1,36],146:[1,37],147:[1,38],148:[1,39],156:[1,80],157:[1,81],158:[1,82],159:[1,83],160:[1,84],161:[1,85],162:[1,86],163:[1,87],164:[1,88],165:[1,89],166:[1,90],167:[1,91],168:[1,92],169:[1,93],170:[1,94],171:[1,95],172:[1,96],173:[1,97],174:[1,98],175:[1,99],176:[1,100],177:[1,101],178:[1,102],179:[1,103],180:[1,104],181:[1,105],182:[1,106],183:[1,107],184:[1,108],185:[1,109],186:[1,110]},{6:[1,331],18:[1,332],19:[1,395]},{6:[2,60],17:[2,60],18:[2,60],19:[2,60],38:[2,60]},{6:[2,23],17:[2,23],38:[2,23]},{6:[1,398],37:[1,396],38:[1,397]},{32:372,34:387,36:399,51:[1,111]},{6:[2,29],19:[2,29],37:[2,29],38:[2,29]},{6:[1,398],19:[1,400],38:[1,397]},{1:[2,13],6:[2,13],19:[2,13],121:[2,13],123:[2,13],127:[2,13],143:[2,13]},{38:[2,82],68:[2,82],77:[2,82]},{1:[2,194],6:[2,194],17:[2,194],18:[2,194],19:[2,194],37:[2,194],38:[2,194],68:[2,194],74:[2,194],77:[2,194],95:[2,194],110:[2,194],119:[2,194],121:[2,194],122:[2,194],123:[2,194],127:[2,194],135:[2,194],143:[2,194],145:[2,194],146:[2,194],149:[2,194],150:[2,194],151:[2,194],152:[2,194],153:[2,194],154:[2,194]},{6:[2,151],18:[2,151],19:[2,151],37:[2,151],38:[2,151],77:[2,151]},{1:[2,191],6:[2,191],17:[2,191],18:[2,191],19:[2,191],37:[2,191],38:[2,191],68:[2,191],74:[2,191],77:[2,191],95:[2,191],110:[2,191],119:[2,191],120:125,121:[2,191],122:[2,191],123:[2,191],126:126,127:[2,191],128:76,135:[2,191],143:[2,191],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{1:[2,192],6:[2,192],17:[2,192],18:[2,192],19:[2,192],37:[2,192],38:[2,192],68:[2,192],74:[2,192],77:[2,192],95:[2,192],110:[2,192],119:[2,192],120:125,121:[2,192],122:[2,192],123:[2,192],126:126,127:[2,192],128:76,135:[2,192],143:[2,192],145:[1,118],146:[1,117],149:[1,116],150:[1,119],151:[1,120],152:[1,121],153:[1,122],154:[1,123]},{6:[2,117],17:[2,117],18:[2,117],19:[2,117],38:[2,117]},{6:[2,25],17:[2,25],38:[2,25]},{6:[1,402],32:372,34:401,51:[1,111]},{32:372,34:403,51:[1,111]},{6:[1,398],19:[1,404],38:[1,397]},{6:[2,26],17:[2,26],38:[2,26]},{6:[2,30],19:[2,30],37:[2,30],38:[2,30]},{32:372,34:405,51:[1,111]},{6:[2,31],19:[2,31],37:[2,31],38:[2,31]},{37:[1,406]},{6:[2,32],19:[2,32],37:[2,32],38:[2,32]},{6:[2,27],17:[2,27],38:[2,27]}],
defaultActions: {51:[2,18],52:[2,19],53:[2,20],54:[2,21],67:[2,70],68:[2,71],113:[2,3],132:[2,132],236:[2,111],339:[2,73]},
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
        if (!(callObject || prev && (prev.call || (_ref3 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref3) >= 0)) && (__indexOf.call(IMPLICIT_CALL, tag) >= 0 || !(token.spaced || token.newLine) && __indexOf.call(IMPLICIT_UNSPACED_CALL, tag) >= 0))) {
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

  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS', 'FLOAT', 'INT', 'BOOL', 'MAT2', 'MAT3', 'MAT4', 'MAT2X2', 'MAT2X3', 'MAT2X4', 'MAT3X2', 'MAT3X3', 'MAT3X4', 'MAT4X2', 'MAT4X3', 'MAT4X4', 'VEC2', 'VEC3', 'VEC4', 'IVEC2', 'IVEC3', 'IVEC4', 'BVEC2', 'BVEC3', 'BVEC4', 'SAMPLER2D', 'SAMPLERCUBE'];

  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOLEAN_VALUE', 'UNARY', 'SUPER', '@', '->', '=>', '[', '(', '{', '--', '++', 'FLOAT', 'INT', 'BOOL', 'MAT2', 'MAT3', 'MAT4', 'MAT2X2', 'MAT2X3', 'MAT2X4', 'MAT3X2', 'MAT3X3', 'MAT3X4', 'MAT4X2', 'MAT4X3', 'MAT4X4', 'VEC2', 'VEC3', 'VEC4', 'IVEC2', 'IVEC3', 'IVEC4', 'BVEC2', 'BVEC3', 'BVEC4', 'SAMPLER2D', 'SAMPLERCUBE'];

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
      var _ref;
      this.name = name != null ? name : "root";
      this.parent = parent != null ? parent : null;
      this.subscopes = {};
      this.definitions = {};
      this.warn_NaN = (((_ref = this.parent) != null ? _ref.warn_NaN : void 0) === true ? true : false);
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

    Scope.prototype["import"] = function(variable) {
      this.delegate(function() {
        return this.definitions[variable.name] = variable;
      });
      return variable;
    };

    Scope.prototype.define_within = function(name, options) {
      var def;
      if (options == null) options = {};
      options.name || (options.name = name);
      if (def = this.lookup(name, {
        silent: true
      })) {
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

    Scope.prototype.lookup = function(name, options) {
      if (options == null) options = {};
      if (typeof options !== 'object') throw new Error(typeof options);
      if (options.warn_NaN !== true) options.warn_NaN = this.warn_NaN;
      return this.delegate(function() {
        var result, target, v, warn, _i, _len, _ref, _ref2;
        target = this;
        while (target) {
          if (result = target.find(name)) {
            if (options.warn_NaN) {
              warn = false;
              if ((_ref = result.value) != null ? _ref.length : void 0) {
                _ref2 = result.value;
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  v = _ref2[_i];
                  if (isNaN(v) || v === void 0) warn = true;
                }
              } else if (isNaN(result.value) || result.value === void 0) {
                warn = true;
              }
              if (warn) {
                console.log("Warning: variable `" + result.name + "` has NaN or undefined values");
              }
            }
            return result;
          }
          target = target.parent;
        }
        if (this.locked) {
          return new Definition({
            name: name
          });
        }
        if (options.silent) {
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
  var Glsl, Preprocessor, Program, Simulator;

  Glsl = require('shader-script/glsl');

  Program = require('shader-script/glsl/program').Program;

  Preprocessor = require('shader-script/glsl/preprocessor').Preprocessor;

  exports.Simulator = Simulator = (function() {
    var assign_builtin_variables, compile_program, convert_attributes;

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

    compile_program = function(type, state, source_code, preprocessor_state) {
      var program;
      program = new Program(state);
      assign_builtin_variables('common', program);
      assign_builtin_variables(type, program);
      program = Glsl.compile(new Preprocessor(source_code, preprocessor_state).toString(), program);
      return program;
    };

    convert_attributes = function(sim, program) {
      var name, variable, _ref, _results;
      _ref = sim.state.variables;
      _results = [];
      for (name in _ref) {
        variable = _ref[name];
        if (variable.storage_qualifier === 'attribute') {
          if (variable.value.length) {
            switch (variable.type()) {
              case 'vec4':
                if (variable.value.length % 4 !== 0) {
                  _results.push(variable.value = [variable.value[0], variable.value[1], variable.value[2], 1]);
                } else {
                  _results.push(variable.value = [variable.value[0], variable.value[1], variable.value[2], variable.value[3]]);
                }
                break;
              case 'vec3':
                _results.push(variable.value = [variable.value[0], variable.value[1], variable.value[2]]);
                break;
              case 'vec2':
                _results.push(variable.value = [variable.value[0], variable.value[1]]);
                break;
              case 'float':
                _results.push(variable.value = variable.value[0]);
                break;
              default:
                _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    function Simulator(glsl, variables) {
      var name, value;
      if (variables == null) variables = {};
      if (typeof glsl === 'string') {
        glsl = {
          vertex: glsl
        };
      }
      this.state = {
        preprocessor: (glsl != null ? glsl.preprocessor : void 0) || {}
      };
      if (glsl.vertex) {
        this.vertex = compile_program('vertex', this.state, glsl.vertex, this.state.preprocessor);
      }
      if (glsl.fragment) {
        this.fragment = compile_program('fragment', this.state, glsl.fragment, this.state.preprocessor);
      }
      for (name in variables) {
        value = variables[name];
        if (this.state.variables[name]) {
          this.state.variables[name].value = value;
        } else {
          throw new Error("Could not set variable `" + name + "` to `" + (JSON.stringify(value)) + "`: variable does not exist");
        }
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
        convert_attributes(this, program);
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
