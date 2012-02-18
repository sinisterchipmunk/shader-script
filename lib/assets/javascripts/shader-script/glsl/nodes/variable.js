(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Variable = (function(_super) {

    __extends(Variable, _super);

    function Variable() {
      Variable.__super__.constructor.apply(this, arguments);
    }

    Variable.prototype.name = 'variable';

    Variable.prototype.children = function() {
      return ['type', 'name'];
    };

    Variable.prototype.compile = function(program) {
      return program.current_scope[this.name.compile(program)] = {
        type: this.type.compile(program),
        value: Number.NaN
      };
    };

    return Variable;

  })(require('shader-script/nodes/base').Base);

}).call(this);
