(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Access = (function(_super) {

    __extends(Access, _super);

    function Access() {
      Access.__super__.constructor.apply(this, arguments);
    }

    Access.prototype.name = "_access";

    Access.prototype.children = function() {
      return ['accessor', 'source'];
    };

    Access.prototype.accessor_name = function() {
      return this.accessor.toVariableName();
    };

    Access.prototype.toVariableName = function() {
      return this.source.toVariableName();
    };

    Access.prototype.is_access = function() {
      return true;
    };

    Access.prototype.cast = function(type, program) {};

    Access.prototype.type = function(program) {
      var length, vector_type;
      if ((length = this.vector_length()) === 1) {
        return this.base_type(program);
      } else {
        vector_type = this.vector_type(program);
        return vector_type && ("" + vector_type + length);
      }
    };

    Access.prototype.base_type = function(program) {
      var vector_type;
      switch (vector_type = this.vector_type(program)) {
        case 'ivec':
          return 'int';
        case 'vec':
          return 'float';
        case 'bvec':
          return 'bool';
        default:
          throw new Error("Unexpected vector type: " + vector_type);
      }
    };

    Access.prototype.vector_type = function(program) {
      var name, vector_type;
      vector_type = this.source.type(program);
      name = this.accessor_name();
      if (!vector_type) return null;
      switch (vector_type) {
        case 'int':
        case 'ivec2':
        case 'ivec3':
        case 'ivec4':
          return "ivec";
        case 'float':
        case 'vec2':
        case 'vec3':
        case 'vec4':
          return "vec";
        case 'bool':
        case 'bvec2':
        case 'bvec3':
        case 'bvec4':
          return "bvec";
        default:
          throw new Error("Cannot use component accessors for type " + vector_type);
      }
    };

    Access.prototype.vector_length = function() {
      return this.accessor_name().length;
    };

    Access.prototype.compile = function(program) {
      var accessor, length, source, variable;
      accessor = this.accessor_name();
      source = this.source.compile(program);
      variable = this.definition({
        type: this.type(program)
      });
      length = this.vector_length();
      return {
        component_index: function(component) {
          var index;
          return index = (function() {
            switch (component) {
              case 'x':
              case 'r':
              case 's':
                return 0;
              case 'y':
              case 'g':
              case 't':
                return 1;
              case 'z':
              case 'b':
              case 'p':
                return 2;
              case 'w':
              case 'a':
              case 'q':
                return 3;
              default:
                throw new Error("Unrecognized vector component: " + i);
            }
          })();
        },
        iterate_components: function(max_length, assignment, callback) {
          var already_iterated, i, index, _i, _len, _results;
          already_iterated = [];
          _results = [];
          for (_i = 0, _len = accessor.length; _i < _len; _i++) {
            i = accessor[_i];
            index = this.component_index(i);
            if (assignment && already_iterated.indexOf(index) !== -1) {
              throw new Error("Can't specify the same component twice in the same assignment");
            }
            already_iterated.push(index);
            if (index <= max_length) {
              _results.push(callback(index));
            } else {
              throw new Error("Component " + i + " equates to vector index " + index + ", which exceeds vector length " + max_length);
            }
          }
          return _results;
        },
        filter_assignment: function(value) {
          var result, source_value;
          source_value = source.execute().value;
          result = source_value.slice(0);
          this.iterate_components(source_value.length, true, function(index) {
            return result[index] = value[index];
          });
          return result;
        },
        toSource: function() {
          return "" + (source.toSource()) + "." + accessor;
        },
        assign: function(value) {
          return source.execute().value = value;
        },
        execute: function() {
          var source_value;
          source_value = source.execute().value;
          if (length === 1) {
            variable.value = source_value[this.component_index(accessor)];
          } else {
            variable.value = [];
            this.iterate_components(source_value.length, false, function(index) {
              return variable.value.push(source_value[index]);
            });
          }
          return variable;
        }
      };
    };

    return Access;

  })(require('shader-script/nodes/base').Base);

}).call(this);
