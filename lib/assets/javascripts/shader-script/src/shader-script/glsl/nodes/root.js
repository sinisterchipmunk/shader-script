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
      var block_node, line, name, options, program, subscope, _i, _len, _ref, _ref2, _ref3;
      if (state == null) state = {};
      if (state instanceof Program) {
        _ref = [state, state.state], program = _ref[0], state = _ref[1];
      } else {
        program = new Program(state);
      }
      block_node = this.block.compile(program);
      _ref2 = block_node.lines;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        line = _ref2[_i];
        program.nodes.push(line);
      }
      block_node.execute();
      if (subscope = state.scope.subscopes['block']) {
        _ref3 = subscope.definitions;
        for (name in _ref3) {
          options = _ref3[name];
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
