(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Variable = (function(_super) {

    __extends(Variable, _super);

    Variable.prototype.name = '_variable';

    function Variable(type, name, value, param_qualifier) {
      this.value = value;
      this.param_qualifier = param_qualifier != null ? param_qualifier : null;
      if (arguments.length === 1) {
        this.variable = arguments[0];
        Variable.__super__.constructor.call(this);
      } else {
        Variable.__super__.constructor.call(this, type, name);
      }
    }

    Variable.prototype.children = function() {
      return ['type', 'name'];
    };

    Variable.prototype.compile = function(program) {
      var compiled_value, name, qualifier, variable, _base, _ref,
        _this = this;
      (_base = program.state).variables || (_base.variables = {});
      name = this.variable ? this.variable.name : this.name.toVariableName();
      variable = program.state.scope.define(name, this.variable ? this.variable.as_options() : {
        type: this.type
      });
      variable.param_qualifier || (variable.param_qualifier = this.param_qualifier);
      if (this.variable) variable.add_dependent(this.variable);
      compiled_value = (_ref = this.value) != null ? _ref.compile(program) : void 0;
      if (variable.value === void 0) variable.value = Number.NaN;
      qualifier = program.state.scope.qualifier();
      if (qualifier === 'root.block' || qualifier === 'root.block.main.block') {
        program.state.variables[name] = variable;
      }
      return {
        execute: function() {
          if (compiled_value) variable.value = compiled_value.execute().value;
          return variable;
        },
        toSource: function() {
          if (compiled_value) {
            return "" + (variable.toSource()) + " = " + (compiled_value.toSource());
          } else {
            return variable.toSource();
          }
        },
        variable: variable
      };
    };

    return Variable;

  })(require('shader-script/nodes/base').Base);

}).call(this);
