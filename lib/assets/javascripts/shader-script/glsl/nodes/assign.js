(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.children = function() {
      return ['left', 'right'];
    };

    Assign.prototype.compile = function(program) {
      var left, right;
      left = this.left.compile(program);
      right = this.right.compile(program);
      return {
        execute: function(sim) {
          return sim.state.variables[left] = right.execute(sim);
        }
      };
    };

    return Assign;

  })(require('shader-script/nodes/assign').Assign);

}).call(this);
