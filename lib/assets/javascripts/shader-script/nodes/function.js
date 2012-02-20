(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Code = exports.Function = (function(_super) {

    __extends(Function, _super);

    function Function() {
      Function.__super__.constructor.apply(this, arguments);
    }

    Function.prototype.name = 'function';

    Function.prototype.children = function() {
      return ['params', 'body'];
    };

    Function.prototype.compile = function(shader) {
      var compiled_body, compiled_func_name, compiled_params, param, return_type;
      if (!this.func_name) {
        throw new Error("GLSL doesn't support anonymous functions");
      }
      return_type = 'void';
      compiled_func_name = this.func_name.compile(shader);
      compiled_params = (function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.compile(shader));
        }
        return _results;
      }).call(this);
      compiled_body = this.body.compile(shader);
      return this.glsl('Function', return_type, compiled_func_name, compiled_params, compiled_body);
    };

    return Function;

  })(require('shader-script/nodes/base').Base);

}).call(this);
