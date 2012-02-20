(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.TypeConstructor = (function(_super) {

    __extends(TypeConstructor, _super);

    TypeConstructor.prototype.name = "type_constructor";

    function TypeConstructor(type, _arguments) {
      this.type = type;
      this.arguments = _arguments;
      TypeConstructor.__super__.constructor.call(this);
    }

    TypeConstructor.prototype.compile = function(program) {
      var arg, compiled_args, validate_length,
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
      validate_length = function(len) {
        if (compiled_args.length !== len) {
          return new Error("Incorrect argument count for " + _this.type + " constructor");
        }
      };
      switch (this.type) {
        case 'void':
          throw new Error("Can't cast to void");
          break;
        case 'bool':
        case 'int':
        case 'float':
          validate_length(1);
          compiled_args = compiled_args[0];
          break;
        case 'vec2':
        case 'ivec2':
        case 'bvec2':
          validate_length(2);
          break;
        case 'vec3':
        case 'ivec3':
        case 'bvec3':
          validate_length(3);
          break;
        case 'vec4':
        case 'ivec4':
        case 'bvec4':
          validate_length(4);
          break;
        default:
          throw new Error("Unexpected type constructor: " + this.type);
      }
      return {
        execute: function(sim) {
          var arg, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
            arg = compiled_args[_i];
            _results.push(arg.execute(sim));
          }
          return _results;
        }
      };
    };

    return TypeConstructor;

  })(require('shader-script/nodes/base').Base);

}).call(this);
