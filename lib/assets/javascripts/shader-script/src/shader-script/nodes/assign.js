(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.name = "assign";

    Assign.prototype.type = function(shader) {
      return this.right.type(shader);
    };

    Assign.prototype.compile = function(shader) {
      var Function, dependent, existing, left, right, type, varname;
      Function = require('shader-script/nodes').Function;
      if (this.right instanceof Function) {
        this.right.func_name = this.left;
        return this.right.compile(shader);
      } else {
        left = this.left.compile(shader);
        if (this.left.is_access() && this.left.type(shader) !== this.right.type(shader)) {
          right = this.glsl('Access', this.left.accessor, this.right.compile(shader));
        } else {
          right = this.right.compile(shader);
        }
        if (!left.toVariableName) {
          throw new Error("Can't use " + (JSON.stringify(left)) + " as lvalue");
        }
        if (!this.left.is_access()) {
          if (this.right.variable) dependent = this.right.variable(shader);
          varname = left.toVariableName();
          existing = shader.scope.lookup(varname, {
            silent: true
          });
          if (existing) {
            type = existing.type();
            if (right.cast) {
              right.cast(type, {
                state: shader
              });
            } else if (dependent) {
              dependent.set_type(type);
            }
          } else {
            type = this.right.type(shader);
          }
          shader.scope.define(left.toVariableName(), {
            type: type,
            dependent: dependent
          });
        }
        return this.glsl('Assign', left, right, this.token);
      }
    };

    return Assign;

  })(require("shader-script/glsl/nodes/assign").Assign);

}).call(this);
