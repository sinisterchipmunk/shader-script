(function() {
  var TypeConstructor, Value,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  TypeConstructor = require('shader-script/glsl/nodes/type_constructor').TypeConstructor;

  Value = require('shader-script/glsl/nodes/value').Value;

  exports.StorageQualifier = (function(_super) {

    __extends(StorageQualifier, _super);

    function StorageQualifier() {
      StorageQualifier.__super__.constructor.apply(this, arguments);
    }

    StorageQualifier.prototype.name = "_storage_qualifier";

    StorageQualifier.prototype.children = function() {
      return ['qualifier', 'type', 'names'];
    };

    StorageQualifier.prototype.compile = function(program) {
      var name, _i, _len, _ref,
        _this = this;
      _ref = this.names;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        program.state.scope.define(name, {
          type: this.type,
          builtin: true
        });
      }
      return {
        toSource: function() {
          if (program.compile_target === 'vertex') {
            return "" + _this.qualifier + " " + _this.type + " " + (_this.names.join(', '));
          } else {
            return "";
          }
        },
        execute: function() {}
      };
    };

    return StorageQualifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);
