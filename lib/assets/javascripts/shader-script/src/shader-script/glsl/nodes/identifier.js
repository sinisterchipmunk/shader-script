(function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/scope').Definition;

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "_identifier";

    Identifier.prototype.toVariableName = function() {
      if (this.children[0] instanceof Definition) {
        return this.children[0].name;
      } else {
        return this.children[0];
      }
    };

    Identifier.prototype.cast = function(type, program) {};

    Identifier.prototype.variable = function(program, scope, lookup_options) {
      if (this.children[0] instanceof Definition) {
        return this.children[0];
      } else {
        return (scope || program.state.scope).lookup(this.toVariableName(), lookup_options);
      }
    };

    Identifier.prototype.type = function(program) {
      return this.variable(program, null, {
        warn_NaN: false
      }).type();
    };

    Identifier.prototype.compile = function(program) {
      var scope,
        _this = this;
      scope = program.state.scope.current();
      return {
        execute: function(lookup_options) {
          return _this.variable(program, scope, lookup_options);
        },
        toSource: function() {
          return _this.variable(program, scope, {
            silent: true
          }).name;
        }
      };
    };

    return Identifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);
