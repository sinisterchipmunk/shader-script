(function() {
  var Definition,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Definition = require('shader-script/scope').Definition;

  exports.Param = (function(_super) {

    __extends(Param, _super);

    Param.prototype.name = 'param';

    Param.prototype.children = function() {
      return ['name', 'default_value'];
    };

    function Param(name, default_value, param_qualifier) {
      this.param_qualifier = param_qualifier != null ? param_qualifier : 'in';
      Param.__super__.constructor.call(this, name, default_value);
    }

    Param.prototype.toVariableName = function() {
      return this.name.toVariableName();
    };

    Param.prototype.variable = function() {
      return this._variable || (this._variable = new Definition);
    };

    Param.prototype.set_type = function(type) {
      return this.variable().set_type(type);
    };

    Param.prototype.type = function() {
      return this.variable().type();
    };

    Param.prototype.compile = function(shader) {
      var variable, varn;
      varn = this.toVariableName();
      variable = shader.scope.define(varn, {
        dependent: this.variable(),
        param_qualifier: this.param_qualifier
      });
      return this.glsl('Variable', variable);
    };

    return Param;

  })(require('shader-script/nodes/base').Base);

}).call(this);
