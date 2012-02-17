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

    Block.prototype.compile = function(shader) {
      var child, line, result, _i, _j, _len, _len2, _ref, _result;
      result = [];
      _ref = this.children;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child instanceof Array) {
          for (_j = 0, _len2 = child.length; _j < _len2; _j++) {
            line = child[_j];
            _result = line.compile(shader);
            if (_result) result << _result;
          }
        } else {
          _result = child.compile(shader);
          if (_result) result << _result;
        }
      }
      return result;
    };

    Block.wrap = function(lines) {
      return new exports.Block(lines);
    };

    return Block;

  })(require('./base').Base);

}).call(this);
