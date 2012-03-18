(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Parens = (function(_super) {

    __extends(Parens, _super);

    function Parens() {
      Parens.__super__.constructor.apply(this, arguments);
    }

    Parens.prototype.name = "_parens";

    Parens.prototype.children = function() {
      return ['body'];
    };

    Parens.prototype.type = function(program) {
      return this.body.type(program);
    };

    Parens.prototype.cast = function(type, program) {
      return this.body.cast(type);
    };

    Parens.prototype.compile = function(program) {
      var compiled_body;
      compiled_body = this.body.compile(program);
      return {
        toSource: function() {
          return "(" + (compiled_body.toSource()) + ")";
        },
        execute: function() {
          return compiled_body.execute();
        }
      };
    };

    return Parens;

  })(require('shader-script/nodes/base').Base);

}).call(this);
