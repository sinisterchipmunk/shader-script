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
