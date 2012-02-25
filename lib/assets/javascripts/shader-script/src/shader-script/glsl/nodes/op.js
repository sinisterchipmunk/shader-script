(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Op = (function(_super) {

    __extends(Op, _super);

    function Op() {
      Op.__super__.constructor.apply(this, arguments);
    }

    Op.prototype.name = "_op";

    Op.prototype.children = function() {
      return ['op', 'left', 'right'];
    };

    Op.prototype.compile = function(program) {
      var left, op, right;
      left = this.left.compile(program);
      op = this.op;
      right = this.right.compile(program);
      return {
        execute: function() {
          var le, re, _ref;
          _ref = [left.execute(), right.execute()], le = _ref[0], re = _ref[1];
          switch (op) {
            case '+':
              return le + re;
            case '-':
              return le - re;
            case '*':
              return le * re;
            case '/':
              return le / re;
            default:
              throw new Error("Unsupported operation: " + op);
          }
        },
        toSource: function() {
          return "" + (left.toSource()) + " " + op + " " + (right.toSource());
        }
      };
    };

    return Op;

  })(require('shader-script/nodes/base').Base);

}).call(this);
