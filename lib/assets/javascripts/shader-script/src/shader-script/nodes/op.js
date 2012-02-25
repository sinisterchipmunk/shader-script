(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Op = (function(_super) {

    __extends(Op, _super);

    function Op() {
      Op.__super__.constructor.apply(this, arguments);
    }

    Op.prototype.name = "op";

    Op.prototype.children = function() {
      return ['op', 'left', 'right'];
    };

    Op.prototype.type = function(shader) {
      return this.left.type(shader) || this.right.type(shader);
    };

    Op.prototype.compile = function(shader) {
      var left, op, right;
      left = this.left.compile(shader);
      op = this.op;
      right = this.right.compile(shader);
      return this.glsl('Op', op, left, right);
    };

    return Op;

  })(require('shader-script/nodes/base').Base);

}).call(this);
