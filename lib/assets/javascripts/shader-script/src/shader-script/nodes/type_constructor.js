(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.TypeConstructor = (function(_super) {

    __extends(TypeConstructor, _super);

    function TypeConstructor() {
      TypeConstructor.__super__.constructor.apply(this, arguments);
    }

    TypeConstructor.prototype.name = 'type_constructor';

    TypeConstructor.prototype.compile = function(shader) {
      var arg, compiled_arguments;
      compiled_arguments = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arg = _ref[_i];
          _results.push(arg.compile(shader));
        }
        return _results;
      }).call(this);
      return this.glsl('TypeConstructor', this.type(), compiled_arguments);
    };

    return TypeConstructor;

  })(require('shader-script/glsl/nodes/type_constructor').TypeConstructor);

}).call(this);
