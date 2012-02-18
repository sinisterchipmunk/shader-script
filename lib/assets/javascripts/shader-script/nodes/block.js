(function() {
  var Block,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Block = Block = (function(_super) {

    __extends(Block, _super);

    function Block() {
      Block.__super__.constructor.apply(this, arguments);
    }

    Block.prototype.name = "block";

    Block.prototype.children = function() {
      return ['lines'];
    };

    Block.prototype.compile = function(shader) {
      var child, lines, _i, _len, _ref, _result;
      if (!this.lines) return [];
      if (this.children.length > 1) throw new Error("too many children");
      lines = [];
      _ref = this.lines;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        _result = child.compile(shader);
        if (_result) lines.push(_result);
      }
      return lines;
    };

    Block.prototype.push = function(line) {
      return this.lines.push(line);
    };

    Block.wrap = function(lines) {
      if (lines.length === 1 && lines[0] instanceof Block) return lines[0];
      return new exports.Block(lines);
    };

    return Block;

  })(require('./base').Base);

}).call(this);
