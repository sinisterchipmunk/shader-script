(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal() {
      Literal.__super__.constructor.apply(this, arguments);
    }

    Literal.prototype.name = "_literal";

    Literal.prototype.cast = function(type) {
      var current_type;
      if (type === null || type === void 0) return this.explicit_type = type;
      current_type = this.type();
      if (current_type === type) return;
      if (current_type === 'float') {
        if (type === 'int') {
          if (/\.[^0]+$/.test(this.children[0])) {
            throw new Error("Cannot cast non-integer float to integer type");
          }
        } else if (current_type !== type) {
          throw new Error("Cannot cast " + current_type + " to " + type);
        }
      } else if (current_type !== type) {
        throw new Error("Cannot cast " + current_type + " to " + type);
      }
      return this.explicit_type = type;
    };

    Literal.prototype.type = function() {
      if (this.explicit_type) return this.explicit_type;
      if (this.children[0].match(/^-?[0-9]+\.[0-9]+$/)) return 'float';
      if (this.children[0].match(/^-?[0-9]+$/)) return 'float';
      if (this.children[0].match(/^(true|false)$/)) return 'bool';
      throw new Error("Value type is not recognized: " + this.children[0]);
    };

    Literal.prototype.compile = function(program) {
      var value;
      value = this.children[0];
      if (this.type() === 'float' && value.indexOf('.') === -1) value += ".0";
      return {
        execute: function() {
          return eval(value);
        },
        toSource: function() {
          return value;
        }
      };
    };

    return Literal;

  })(require('shader-script/nodes/base').Base);

}).call(this);
