(function() {
  var Program,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Program = require('shader-script/glsl/program').Program;

  exports.Root = (function(_super) {

    __extends(Root, _super);

    function Root() {
      Root.__super__.constructor.apply(this, arguments);
    }

    Root.prototype.name = "_root";

    Root.prototype.children = function() {
      return ['block'];
    };

    Root.prototype.compile = function(state) {
      var block_node, name, options, program, subscope, _ref;
      if (state == null) state = {};
      program = new Program(state);
      block_node = this.block.compile(program);
      block_node.execute();
      if (subscope = state.scope.subscopes['block']) {
        _ref = subscope.definitions;
        for (name in _ref) {
          options = _ref[name];
          program.variables.push({
            name: name,
            type: options.type(),
            value: options.value
          });
        }
      }
      return program;
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);