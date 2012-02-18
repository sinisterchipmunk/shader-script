(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Block = (function(_super) {

    __extends(Block, _super);

    function Block() {
      Block.__super__.constructor.apply(this, arguments);
    }

    Block.prototype.name = 'block';

    return Block;

  })(require('shader-script/nodes/block').Block);

}).call(this);
