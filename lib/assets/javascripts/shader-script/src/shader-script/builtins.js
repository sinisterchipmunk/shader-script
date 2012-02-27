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
  } catch (e) {
    console.log(e);
    console.log("WARNING: continuing without builtins...");
  }

}).call(this);
