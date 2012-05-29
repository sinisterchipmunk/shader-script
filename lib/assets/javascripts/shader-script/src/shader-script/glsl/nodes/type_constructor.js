(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.TypeConstructor = (function(_super) {

    __extends(TypeConstructor, _super);

    function TypeConstructor() {
      TypeConstructor.__super__.constructor.apply(this, arguments);
    }

    TypeConstructor.prototype.name = "_type_constructor";

    TypeConstructor.prototype.children = function() {
      return ['cast_type', 'arguments'];
    };

    TypeConstructor.prototype.variable = function() {};

    TypeConstructor.prototype.cast = function(type, shader) {
      if (!type) return;
      return this.cast_type = type;
    };

    TypeConstructor.prototype.type = function(shader) {
      if (typeof this.cast_type === 'string') {
        return this.cast_type;
      } else {
        return this.cast_type.type(shader);
      }
    };

    TypeConstructor.prototype.compile = function(program) {
      var arg, compiled_args, type,
        _this = this;
      compiled_args = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arg = _ref[_i];
          _results.push(arg.compile(program));
        }
        return _results;
      }).call(this);
      type = this.type();
      return {
        execute: function(state) {
          var arg, arg_value, args, v, vector_length, _i, _j, _len, _len2;
          args = [];
          for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
            arg = compiled_args[_i];
            arg_value = arg.execute().value;
            if (arg_value.length) {
              for (_j = 0, _len2 = arg_value.length; _j < _len2; _j++) {
                v = arg_value[_j];
                args.push(v);
              }
            } else {
              args.push(arg_value);
            }
          }
          switch (type) {
            case 'vec2':
            case 'ivec2':
            case 'bvec2':
              vector_length = 2;
              break;
            case 'vec3':
            case 'ivec3':
            case 'bvec3':
              vector_length = 3;
              break;
            case 'vec4':
            case 'ivec4':
            case 'bvec4':
              vector_length = 4;
              break;
            default:
              if (args.length === 1) {
                return _this.definition({
                  type: type,
                  value: args[0]
                });
              } else {
                return _this.definition({
                  type: type,
                  value: args
                });
              }
          }
          if (args.length >= vector_length) {
            args = args.slice(0, vector_length);
          } else {
            while (args.length < vector_length) {
              args.push(0);
            }
          }
          return _this.definition({
            type: type,
            value: args
          });
        },
        toSource: function() {
          var arg;
          return "" + (_this.type(program)) + "(" + (((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
              arg = compiled_args[_i];
              _results.push(arg.toSource());
            }
            return _results;
          })()).join(', ')) + ")";
        }
      };
    };

    return TypeConstructor;

  })(require('shader-script/nodes/base').Base);

}).call(this);
