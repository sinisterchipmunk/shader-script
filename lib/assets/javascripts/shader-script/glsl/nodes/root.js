(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Root = (function(_super) {

    __extends(Root, _super);

    function Root() {
      Root.__super__.constructor.apply(this, arguments);
    }

    Root.prototype.name = "root";

    Root.prototype.children = function() {
      return ['block'];
    };

    Root.prototype.compile = function(program) {
      return this.block.compile(program);
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);
