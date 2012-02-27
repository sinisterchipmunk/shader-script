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
    console.log("WARNING: continuing without builtins...");
  }

}).call(this);
