(function() {
  var Extension, Program, e,
    __slice = Array.prototype.slice;

  try {
    Program = require('shader-script/glsl/program').Program;
    Program.prototype.builtins = {};
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
  } catch (e) {
    console.log(e);
    console.log("WARNING: continuing without builtins...");
  }

}).call(this);
