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

    Root.prototype.compile = function(program) {
      var compiled_node, root_node, shader;
      shader = new Shader();
      root_node = this.block.compile(shader);
      compiled_node = root_node.compile(program);
      return {
        vertex: compiled_node,
        fragment: compiled_node
      };
    };

    return Root;

  })(require('./base').Base);

}).call(this);
