(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal() {
      Literal.__super__.constructor.apply(this, arguments);
    }

    Literal.prototype.compile = function(program) {
      var value;
      value = Literal.__super__.compile.call(this, program);
      return {
        execute: function() {
          return value;
        }
      };
    };

    return Literal;

  })(require('shader-script/nodes/literal').Literal);

}).call(this);
