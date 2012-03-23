(function() {
  var Definition, signatures,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  signatures = require('shader-script/operators').signatures;

  Definition = require('shader-script/definition').Definition;

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
      var ltype, rtype, sig;
      if (!this.right) return this.left.type(shader);
      ltype = this.left.type(shader);
      rtype = this.right.type(shader);
      if (sig = signatures[ltype]) if (sig = sig[this.op]) return sig[rtype];
      return ltype || rtype;
    };

    Op.prototype.variable = function(shader) {
      this._variable || (this._variable = new Definition);
      this._variable.set_type(this.type(shader));
      return this._variable;
    };

    Op.prototype.compile = function(shader) {
      var left, op, right;
      left = this.left.compile(shader);
      op = this.op;
      right = this.right && this.right.compile(shader);
      return this.glsl('Op', op, left, right);
    };

    return Op;

  })(require('shader-script/nodes/base').Base);

}).call(this);
