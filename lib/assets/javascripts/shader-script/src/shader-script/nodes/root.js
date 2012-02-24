(function() {
  var Shader,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Shader = require('shader-script/shader').Shader;

  exports.Root = (function(_super) {

    __extends(Root, _super);

    Root.prototype.name = "root";

    function Root(block) {
      this.block = block;
      Root.__super__.constructor.call(this, this.block);
    }

    Root.prototype.compile = function(state) {
      var program, root_node, shader;
      if (state == null) state = {};
      shader = new Shader(state);
      root_node = this.glsl('Root', this.block.compile(shader));
      program = root_node.compile(state);
      return {
        vertex: program.toVertexProgram(),
        fragment: program.toFragmentProgram()
      };
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);
