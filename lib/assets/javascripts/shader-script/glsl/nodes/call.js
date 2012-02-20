(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Call = (function(_super) {

    __extends(Call, _super);

    function Call() {
      Call.__super__.constructor.apply(this, arguments);
    }

    Call.prototype.name = '_call';

    Call.prototype.children = function() {
      return ['name', 'params'];
    };

    Call.prototype.compile = function(program) {
      var name, param, params;
      name = this.name.compile(program);
      params = (function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.compile(program));
        }
        return _results;
      }).call(this);
      return {
        execute: function(sim) {
          var _ref;
          if (program.functions[name]) {
            return (_ref = program.functions[name]).invoke.apply(_ref, [sim].concat(__slice.call(params)));
          } else {
            throw new Error("function '" + name + "' is not defined");
          }
        },
        toSource: function() {
          var joined_params, param;
          joined_params = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = params.length; _i < _len; _i++) {
              param = params[_i];
              _results.push(param.toSource());
            }
            return _results;
          })()).join(', ');
          return "" + (name.toSource()) + "(" + joined_params + ")";
        }
      };
    };

    return Call;

  })(require('shader-script/nodes/base').Base);

}).call(this);
