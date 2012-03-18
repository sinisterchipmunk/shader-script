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
      var arg, compiled_args,
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
      return {
        execute: function(state) {
          var arg, args;
          args = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
              arg = compiled_args[_i];
              _results.push(arg.execute());
            }
            return _results;
          })();
          switch (_this.type()) {
            case 'vec2':
            case 'ivec2':
            case 'bvec2':
              if (args.length >= 2) {
                return args.slice(0, 2);
              } else {
                return args;
              }
            case 'vec3':
            case 'ivec3':
            case 'bvec3':
              if (args.length >= 3) {
                return args.slice(0, 3);
              } else {
                return args;
              }
            case 'vec4':
            case 'ivec4':
            case 'bvec4':
              if (args.length >= 4) {
                return args.slice(0, 4);
              } else {
                return args;
              }
            default:
              return args;
          }
        },
        toSource: function() {
          var arg;
          return "" + (_this.type()) + "(" + (((function() {
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
