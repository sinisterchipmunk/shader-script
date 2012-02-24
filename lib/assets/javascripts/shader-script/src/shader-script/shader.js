(function() {
  var Scope;

  Scope = require('shader-script/scope').Scope;

  exports.Shader = (function() {

    function Shader(state) {
      this.scope = state.scope || (state.scope = new Scope());
      this.functions = {};
      this.fn_types = {};
    }

    Shader.prototype.define_function = function(name, callback) {
      var types, _i, _len, _ref, _results;
      this.functions[name] = callback;
      if (this.fn_types[name]) {
        _ref = this.fn_types[name];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          types = _ref[_i];
          _results.push(callback(types));
        }
        return _results;
      }
    };

    Shader.prototype.mark_function = function(name, types, dependent_variable) {
      var _base;
      if (dependent_variable == null) dependent_variable = null;
      if (this.functions[name]) {
        return this.functions[name](types);
      } else {
        (_base = this.fn_types)[name] || (_base[name] = []);
        return this.fn_types[name].push(types);
      }
    };

    return Shader;

  })();

}).call(this);
