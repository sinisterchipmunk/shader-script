(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Call = (function(_super) {

    __extends(Call, _super);

    function Call() {
      Call.__super__.constructor.apply(this, arguments);
    }

    Call.prototype.name = "call";

    Call.prototype.children = function() {
      return ['method_name', 'params'];
    };

    Call.prototype.compile = function(shader) {
      var compiled_params, method_name, param;
      method_name = this.method_name.compile(shader);
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
      if (typeof shader.proxy[method_name] === 'function') {
        shader.proxy[method_name].apply(method_name, compiled_params);
        return null;
      } else {
        return {
          call: method_name,
          params: compiled_params
        };
      }
    };

    return Call;

  })(require("./base").Base);

}).call(this);
