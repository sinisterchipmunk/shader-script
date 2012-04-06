(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.If = (function(_super) {

    __extends(If, _super);

    function If() {
      If.__super__.constructor.apply(this, arguments);
    }

    If.prototype.name = "if";

    If.prototype.compile = function(shader) {
      var _if;
      _if = this.glsl('If', this.expression.compile(shader), this.block.compile(shader), this.options);
      if (this.else_block) _if.addElse(this.else_block.compile(shader));
      return _if;
    };

    return If;

  })(require('shader-script/glsl/nodes/if').If);

}).call(this);
