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
      var fragment_root_node, shader, vertex_root_node;
      if (state == null) state = {};
      shader = new Shader(state);
      shader.compile_target = 'vertex';
      vertex_root_node = this.glsl('Root', this.block.compile(shader));
      shader.compile_target = 'fragment';
      fragment_root_node = this.glsl('Root', this.block.compile(shader));
      return {
        vertex: vertex_root_node.compile(state),
        fragment: fragment_root_node.compile(state)
      };
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);
