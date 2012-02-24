(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Variable = (function(_super) {

    __extends(Variable, _super);

    Variable.prototype.name = '_variable';

    function Variable(type, name, qualified_name) {
      this.qualified_name = qualified_name;
      Variable.__super__.constructor.call(this, type, name);
    }

    Variable.prototype.children = function() {
      return ['type', 'name'];
    };

    Variable.prototype.compile = function(program) {
      var name, variable, _base,
        _this = this;
      name = this.name.toVariableName();
      if (this.qualified_name) {
        variable = program.state.scope.lookup(this.qualified_name);
      } else {
        variable = program.state.scope.define(name, {
          type: this.type
        });
      }
      variable.value = Number.NaN;
      (_base = program.state).variables || (_base.variables = {});
      program.state.variables[name] = variable;
      return {
        execute: function() {
          return variable.value;
        },
        toSource: function() {
          return "" + (variable.type()) + " " + variable.name;
        },
        variable: variable
      };
    };

    return Variable;

  })(require('shader-script/nodes/base').Base);

}).call(this);
