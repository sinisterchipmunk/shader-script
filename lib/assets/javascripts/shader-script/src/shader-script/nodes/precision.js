(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Precision = (function(_super) {

    __extends(Precision, _super);

    function Precision() {
      Precision.__super__.constructor.apply(this, arguments);
    }

    Precision.prototype.name = "precision";

    Precision.prototype.children = function() {
      return ['precision', 'type'];
    };

    Precision.prototype.compile = function(shader) {
      return this.glsl('Precision', this.precision, this.type);
    };

    return Precision;

  })(require('shader-script/nodes/base').Base);

}).call(this);
