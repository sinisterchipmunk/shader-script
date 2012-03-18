(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Parens = (function(_super) {

    __extends(Parens, _super);

    function Parens() {
      Parens.__super__.constructor.apply(this, arguments);
    }

    Parens.prototype.name = "parens";

    Parens.prototype.children = function() {
      return ['body'];
    };

    Parens.prototype.type = function(shader) {
      return this.body.type(shader);
    };

    Parens.prototype.compile = function(shader) {
      return this.glsl('Parens', this.body.compile(shader));
    };

    return Parens;

  })(require('shader-script/nodes/base').Base);

}).call(this);
