(function() {
  var Extension, Program, code, ss,
    __slice = Array.prototype.slice;

  code = "radians = (float d) -> return d * " + Math.PI + " / 180\ndegrees = (float r) -> return r / " + Math.PI + " * 180";

  try {
    ss = require('shader-script');
    exports.builtins = ss.compile(code);
    Program = require('shader-script/glsl/program').Program;
    Program.prototype.builtins = exports.builtins.vertex.functions;
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
    new Extension('sin', 'float', function(f) {
      return Math.sin(f);
    });
    new Extension('cos', 'float', function(f) {
      return Math.cos(f);
    });
  } catch (e) {
    console.log(e);
    console.log("WARNING: continuing without builtins...");
  }

}).call(this);
