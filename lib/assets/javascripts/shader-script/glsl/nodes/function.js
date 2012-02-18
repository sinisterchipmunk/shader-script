(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Function = (function(_super) {

    __extends(Function, _super);

    function Function() {
      Function.__super__.constructor.apply(this, arguments);
    }

    Function.prototype.name = 'function';

    Function.prototype.children = function() {
      return ['return_type', 'name', 'arguments', 'block'];
    };

    Function.prototype.compile = function(program) {
      var argument, compiled_arguments, compiled_block;
      compiled_arguments = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          argument = _ref[_i];
          _results.push(argument.compile(program));
        }
        return _results;
      }).call(this);
      compiled_block = this.block.compile(program);
      return program.functions[this.name.compile(program)] = {
        return_type: this.return_type.compile(program),
        arguments: compiled_arguments,
        invoke: function(sim) {
          var line, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = compiled_block.length; _i < _len; _i++) {
            line = compiled_block[_i];
            _results.push(line.execute(sim));
          }
          return _results;
        }
      };
    };

    return Function;

  })(require('shader-script/nodes/base').Base);

}).call(this);
