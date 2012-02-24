(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Variable = (function(_super) {

    __extends(Variable, _super);

    function Variable() {
      Variable.__super__.constructor.apply(this, arguments);
    }

    Variable.prototype.name = '_variable';

    Variable.prototype.children = function() {
      return ['type', 'name'];
    };

    Variable.prototype.compile = function(program) {
      var name, type, _base,
        _this = this;
      name = this.name.compile(program);
      type = this.type;
      (_base = program.state).variables || (_base.variables = {});
      program.state.variables[name.execute()] = {
        type: type,
        name: name.execute(),
        value: Number.NaN
      };
      return {
        execute: function() {
          return program.state.variables[name.execute()].value;
        },
        toSource: function() {
          return "" + type + " " + (name.toSource());
        }
      };
    };

    return Variable;

  })(require('shader-script/nodes/base').Base);

}).call(this);
