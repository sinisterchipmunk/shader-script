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
      var default_value, i, name, names, variable,
        _this = this;
      names = (function() {
        var _i, _len, _ref, _results;
        _ref = this.names;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          if (typeof name !== 'string') name = name.toVariableName();
          default_value = (function() {
            var _results2, _results3, _results4, _results5, _results6, _results7;
            switch (this.type) {
              case 'ivec2':
              case 'bvec2':
              case 'vec2':
                return [Number.NaN, Number.NaN];
              case 'ivec3':
              case 'bvec3':
              case 'vec3':
                return [Number.NaN, Number.NaN, Number.NaN];
              case 'ivec4':
              case 'bvec4':
              case 'vec4':
                return [Number.NaN, Number.NaN, Number.NaN, Number.NaN];
              case 'mat2':
              case 'mat2x2':
                _results2 = [];
                for (i = 0; i < 4; i++) {
                  _results2.push(Number.NaN);
                }
                return _results2;
              case 'mat3':
              case 'mat3x3':
                _results3 = [];
                for (i = 0; i < 9; i++) {
                  _results3.push(Number.NaN);
                }
                return _results3;
              case 'mat4':
              case 'mat4x4':
                _results4 = [];
                for (i = 0; i < 16; i++) {
                  _results4.push(Number.NaN);
                }
                return _results4;
              case 'mat2x3':
              case 'mat3x2':
                _results5 = [];
                for (i = 0; i < 6; i++) {
                  _results5.push(Number.NaN);
                }
                return _results5;
              case 'mat2x4':
              case 'mat4x2':
                _results6 = [];
                for (i = 0; i < 8; i++) {
                  _results6.push(Number.NaN);
                }
                return _results6;
              case 'mat3x4':
              case 'mat4x3':
                _results7 = [];
                for (i = 0; i < 12; i++) {
                  _results7.push(Number.NaN);
                }
                return _results7;
              default:
                return;
            }
          }).call(this);
          variable = program.state.scope.define(name, {
            type: this.type,
            builtin: true,
            value: default_value
          });
          program.state.variables[name] = variable;
          _results.push(name);
        }
        return _results;
      }).call(this);
      return {
        toSource: function() {
          return "" + _this.qualifier + " " + _this.type + " " + (names.join(', '));
        },
        execute: function() {}
      };
    };

    return StorageQualifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);
