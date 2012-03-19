(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.name = "_assign";

    Assign.prototype.children = function() {
      return ['left', 'right'];
    };

    Assign.prototype.compile = function(program) {
      var compiled_left, right, variable, variable_name,
        _this = this;
      variable_name = this.left.toVariableName();
      right = this.right.compile(program);
      variable = program.state.scope.lookup(variable_name);
      if (this.left.is_access()) compiled_left = this.left.compile(program);
      return {
        execute: function() {
          var value;
          value = right.execute();
          if (compiled_left) value = compiled_left.filter_assignment(value);
          return variable.value = value;
        },
        toSource: function() {
          if (compiled_left) {
            return "" + (compiled_left.toSource()) + " = " + (right.toSource());
          } else {
            return "" + variable_name + " = " + (right.toSource());
          }
        }
      };
    };

    return Assign;

  })(require('shader-script/nodes/base').Base);

}).call(this);
