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
      var left, right, variable;
      left = this.left.toVariableName();
      right = this.right.compile(program);
      variable = program.state.scope.lookup(left);
      return {
        execute: function() {
          return variable.value = right.execute();
        },
        toSource: function() {
          return "" + left + " = " + (right.toSource());
        }
      };
    };

    return Assign;

  })(require('shader-script/nodes/base').Base);

}).call(this);
