(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Arr = (function(_super) {

    __extends(Arr, _super);

    Arr.prototype.name = "arr";

    function Arr() {
      Arr.__super__.constructor.apply(this, arguments);
      this.validate();
    }

    Arr.prototype.children = function() {
      return ['elements'];
    };

    Arr.prototype.type = function() {
      return 'vec' + this.elements.length.toString();
    };

    Arr.prototype.compile = function(shader) {
      var child;
      return this.glsl('TypeConstructor', this.type(), (function() {
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

    Arr.prototype.validate = function() {};

    return Arr;

  })(require("shader-script/nodes/base").Base);

}).call(this);
