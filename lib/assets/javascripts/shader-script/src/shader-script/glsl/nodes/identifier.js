(function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/scope').Definition;

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "_identifier";

    Identifier.prototype.toVariableName = function() {
      if (this.children[0] instanceof Definition) {
        return this.children[0].name;
      } else {
        return this.children[0];
      }
    };

    Identifier.prototype.cast = function(type, program) {
      var current_type;
      current_type = this.type(program);
      if (type === null || type === void 0) return;
      if (type === current_type) return;
      if (current_type) {
        throw new Error("Cannot implicitly cast " + current_type + " to " + type);
      }
      return this.variable(program).set_type(type);
    };

    Identifier.prototype.variable = function(program) {
      if (this.children[0] instanceof Definition) {
        return this.children[0];
      } else {
        return program.state.scope.lookup(this.toVariableName());
      }
    };

    Identifier.prototype.type = function(program) {
      return this.variable(program).type();
    };

    Identifier.prototype.compile = function(program) {
      var variable,
        _this = this;
      variable = this.variable(program);
      return {
        execute: function() {
          return variable;
        },
        toSource: function() {
          return variable.name;
        }
      };
    };

    return Identifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);
