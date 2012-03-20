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
          _results.push(param.execute());
        }
        return _results;
      })();
      return this.callback.apply(this, params);
    };

    Extension.prototype.component_wise = function() {
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
