(function() {
  var ShaderDescriptor,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  ShaderDescriptor = require('shader-script/shader_descriptor').ShaderDescriptor;

  exports.Root = (function(_super) {

    __extends(Root, _super);

    Root.prototype.name = "root";

    function Root(block) {
      this.block = block;
      Root.__super__.constructor.call(this, this.block);
    }

    Root.prototype.compile = function() {
      var shader;
      shader = new ShaderDescriptor();
      shader.body = this.block.compile(shader);
      return shader.to_json();
    };

    return Root;

  })(require('./base').Base);

}).call(this);
