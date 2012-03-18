(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Obj = (function(_super) {

    __extends(Obj, _super);

    function Obj() {
      Obj.__super__.constructor.apply(this, arguments);
    }

    Obj.prototype.name = 'obj';

    Obj.prototype.children = function() {
      return ['assigns'];
    };

    Obj.prototype.type = function() {
      return null;
    };

    Obj.prototype.compile = function(shader) {
      var assign, assigns, compiled_node, qualifier;
      shader.scope.lock();
      qualifier = (function() {
        switch (this.qualifier) {
          case 'uniforms':
            return 'uniform';
          case 'varyings':
            return 'varying';
          case 'consts':
            return 'const';
          case 'attributes':
            return 'attribute';
        }
      }).call(this);
      assigns = (function() {
        var _i, _len, _ref, _results;
        _ref = this.assigns;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          assign = _ref[_i];
          _results.push(this.glsl('StorageQualifier', qualifier, assign.compile(shader)));
        }
        return _results;
      }).call(this);
      compiled_node = this.glsl('Block', assigns, {
        scope: false
      });
      shader.scope.unlock();
      console.log(0);
      return compiled_node;
    };

    return Obj;

  })(require('shader-script/nodes/base').Base);

}).call(this);
