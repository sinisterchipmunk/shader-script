(function() {
  var operators,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  operators = require('shader-script/operators');

  exports.Op = (function(_super) {

    __extends(Op, _super);

    function Op() {
      Op.__super__.constructor.apply(this, arguments);
    }

    Op.prototype.name = "_op";

    Op.prototype.children = function() {
      return ['op', 'left', 'right'];
    };

    Op.prototype.cast = function(type, program) {};

    Op.prototype.type = function(program) {
      return operators.signatures[this.left.type(program)][this.op][this.right.type(program)];
    };

    Op.prototype.compile = function(program) {
      var left, op, right,
        _this = this;
      left = this.left.compile(program);
      op = this.op;
      right = this.right && this.right.compile(program);
      return {
        execute: function() {
          var le, re;
          if (right) {
            re = right.execute({
              warn_NaN: true
            });
          }
          le = left.execute({
            warn_NaN: true
          });
          return _this.definition({
            dependent: le,
            value: le.perform(op, re)
          });
        },
        toSource: function() {
          if (right) {
            return "" + (left.toSource()) + " " + op + " " + (right.toSource());
          } else {
            return "" + op + (left.toSource());
          }
        }
      };
    };

    return Op;

  })(require('shader-script/nodes/base').Base);

}).call(this);
