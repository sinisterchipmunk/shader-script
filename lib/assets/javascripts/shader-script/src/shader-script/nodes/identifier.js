(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "identifier";

    Identifier.prototype.variable = function(shader) {
      return shader.scope.lookup(this.toVariableName());
    };

    Identifier.prototype.type = function(shader) {
      return this.variable(shader).type();
    };

    Identifier.prototype.compile = function(shader) {
      return this.glsl.apply(this, ['Identifier'].concat(__slice.call(this.children)));
    };

    return Identifier;

  })(require("shader-script/glsl/nodes/identifier").Identifier);

}).call(this);
