(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.StorageQualifier = (function(_super) {

    __extends(StorageQualifier, _super);

    function StorageQualifier() {
      StorageQualifier.__super__.constructor.apply(this, arguments);
    }

    StorageQualifier.prototype.name = 'storage_qualifier';

    StorageQualifier.prototype.children = function() {
      return ['qualifier', 'assigns'];
    };

    StorageQualifier.prototype.compile = function(shader) {
      var assign, lines, name, names, qualifier, type, _i, _len, _ref;
      if (this.qualifier === 'attributes' && shader.compile_target === 'fragment') {
        return null;
      }
      qualifier = this.qualifier.slice(0, -1);
      lines = [];
      _ref = this.assigns;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        assign = _ref[_i];
        type = assign.type.children[0].toString();
        names = (function() {
          var _j, _len2, _ref2, _results;
          _ref2 = assign.names;
          _results = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            name = _ref2[_j];
            name = name.children[0].toString();
            shader.scope.define(name, {
              type: type,
              builtin: true
            });
            _results.push(name);
          }
          return _results;
        })();
        lines.push(this.glsl('StorageQualifier', qualifier, type, names));
      }
      return this.glsl('Block', lines, {
        scope: false
      });
    };

    return StorageQualifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);
