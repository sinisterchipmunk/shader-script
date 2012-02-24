(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "_identifier";

    Identifier.prototype.toVariableName = function() {
      return this.children[0];
    };

    Identifier.prototype.compile = function() {
      var _this = this;
      return {
        execute: function() {
          return _this.children[0];
        },
        toSource: function() {
          return _this.children[0];
        }
      };
    };

    return Identifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);
