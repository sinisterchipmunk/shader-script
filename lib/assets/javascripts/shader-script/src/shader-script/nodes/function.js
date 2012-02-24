(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Code = exports.Function = (function(_super) {

    __extends(Function, _super);

    function Function() {
      Function.__super__.constructor.apply(this, arguments);
    }

    Function.prototype.name = 'function';

    Function.prototype.children = function() {
      return ['params', 'body'];
    };

    Function.prototype.compile = function(shader) {
      var compiled_body, compiled_func_name, compiled_params, param, return_type, str_func_name;
      if (!this.func_name) {
        throw new Error("GLSL doesn't support anonymous functions");
      }
      return_type = 'void';
      compiled_func_name = this.func_name.compile(shader);
      str_func_name = this.func_name.toVariableName();
      shader.scope.push(str_func_name);
      compiled_params = (function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.compile(shader));
        }
        return _results;
      }).call(this);
      compiled_body = this.body.compile(shader);
      shader.define_function(str_func_name, function(types) {
        var i, type, variable, _ref, _results;
        if (types.length !== compiled_params.length) {
          throw new Error("Function " + str_func_name + " called with incorrect argument count (" + types.length + " for " + compiled_params.length + ")");
        }
        _results = [];
        for (i = 0, _ref = types.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          type = types[i];
          variable = compiled_params[i].variable;
          _results.push(variable.set_type(type));
        }
        return _results;
      });
      shader.scope.pop();
      return this.glsl('Function', return_type, compiled_func_name, compiled_params, compiled_body);
    };

    return Function;

  })(require('shader-script/nodes/base').Base);

}).call(this);
