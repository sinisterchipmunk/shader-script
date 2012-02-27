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
