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
