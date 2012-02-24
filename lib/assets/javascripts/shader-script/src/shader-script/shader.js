(function() {
  var Scope;

  Scope = require('shader-script/scope').Scope;

  exports.Shader = (function() {

    function Shader(state) {
      this.scope = state.scope || (state.scope = new Scope());
      this.functions = {};
      this.fn_args = {};
    }

    Shader.prototype.define_function = function(name, callback) {
      var args, _i, _len, _ref, _results;
      this.functions[name] = callback;
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
      var _base;
      if (dependent_variable == null) dependent_variable = null;
      if (this.functions[name]) {
        return this.functions[name](args);
      } else {
        (_base = this.fn_args)[name] || (_base[name] = []);
        return this.fn_args[name].push(args);
      }
    };

    return Shader;

  })();

}).call(this);
