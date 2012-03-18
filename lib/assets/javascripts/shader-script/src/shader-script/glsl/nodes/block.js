(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Block = (function(_super) {

    __extends(Block, _super);

    Block.prototype.name = function() {
      return 'block';
    };

    function Block(lines, options) {
      if (lines == null) lines = [];
      this.options = options != null ? options : {
        scope: true
      };
      Block.__super__.constructor.call(this, lines);
    }

    Block.prototype.compile = function(program) {
      var child, lines, qual, _i, _len, _ref, _result,
        _this = this;
      if (this.children.length > 1) throw new Error("too many children");
      if (this.options.scope) program.state.scope.push('block');
      lines = [];
      qual = program.state.scope.qualifier();
      if (this.lines) {
        _ref = this.lines;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _result = child.compile(program);
          if (_result !== null) lines.push(_result);
        }
      }
      if (this.options.scope) program.state.scope.pop();
      return {
        lines: lines,
        is_block: true,
        execute: function() {
          var line, _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
            line = lines[_j];
            _results.push(line.execute());
          }
          return _results;
        },
        toSource: function() {
          var indent, line, result;
          indent = _this.options && _this.options.scope ? "  " : "";
          result = ((function() {
            var _j, _len2, _results;
            _results = [];
            for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
              line = lines[_j];
              _results.push(line.toSource());
            }
            return _results;
          })()).join(";\n").trim();
          if (result[result.length - 1] !== ";") result += ";";
          return indent + result.split("\n").join("\n" + indent) + "\n";
        }
      };
    };

    Block.prototype.children = function() {
      return ['lines'];
    };

    Block.prototype.push = function(line) {
      this.lines.push(line);
      return this;
    };

    Block.wrap = function(lines, options) {
      if (lines.length === 1 && lines[0] instanceof Block) return lines[0];
      return new exports.Block(lines, options);
    };

    return Block;

  })(require('shader-script/nodes/base').Base);

}).call(this);
