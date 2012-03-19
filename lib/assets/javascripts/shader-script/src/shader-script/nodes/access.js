(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Access = (function(_super) {

    __extends(Access, _super);

    function Access() {
      Access.__super__.constructor.apply(this, arguments);
    }

    Access.prototype.name = "access";

    Access.prototype.children = function() {
      return ['accessor'];
    };

    Access.prototype.compile = function(shader) {
      if (!this.source) throw new Error("Accessor has no source");
      return this.glsl('Access', this.glsl('Identifier', this.accessor_name()), this.source.compile(shader));
    };

    return Access;

  })(require('shader-script/glsl/nodes/access').Access);

}).call(this);
