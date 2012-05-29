(function() {
  var Identifier,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Identifier = require("shader-script/glsl/nodes/identifier").Identifier;

  exports.Arr = (function(_super) {

    __extends(Arr, _super);

    function Arr() {
      Arr.__super__.constructor.apply(this, arguments);
    }

    Arr.prototype.name = "arr";

    Arr.prototype.children = function() {
      return ['elements'];
    };

    Arr.prototype.type = function(shader) {
      var ele, length, variable, _i, _len, _ref, _ref2;
      length = 0;
      _ref = this.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ele = _ref[_i];
        if (ele.name === 'value' && ((_ref2 = ele.children[0]) != null ? _ref2.name : void 0) === 'identifier') {
          variable = ele.variable(shader);
          length += (function() {
            switch (variable.type()) {
              case 'ivec2':
              case 'bvec2':
              case 'vec2':
                return 2;
              case 'ivec3':
              case 'bvec3':
              case 'vec3':
                return 3;
              case 'ivec4':
              case 'bvec4':
              case 'vec4':
                return 4;
              default:
                return 1;
            }
          })();
        } else {
          length += 1;
        }
      }
      return 'vec' + length.toString();
    };

    Arr.prototype.compile = function(shader) {
      var child;
      return this.glsl('TypeConstructor', this.type(shader), (function() {
        var _i, _len, _ref, _results;
        _ref = this.elements;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.compile(shader));
        }
        return _results;
      }).call(this));
    };

    return Arr;

  })(require("shader-script/nodes/base").Base);

}).call(this);
