(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.If = (function(_super) {

    __extends(If, _super);

    function If() {
      If.__super__.constructor.apply(this, arguments);
    }

    If.prototype.name = "if";

    If.prototype.children = function() {
      return ['expression', 'block', 'options'];
    };

    If.prototype.addElse = function(else_block) {
      this.else_block = else_block;
      return this;
    };

    If.prototype.compile = function(program) {
      var else_block, expression, if_block;
      expression = this.expression.compile(program);
      if_block = this.block.compile(program);
      else_block = this.else_block && this.else_block.compile(program);
      return {
        toSource: function() {
          var condition_source, else_block_source, if_block_source;
          if_block_source = if_block.toSource();
          condition_source = "if (" + (expression.toSource()) + ") {\n" + if_block_source + "}";
          if (else_block) {
            else_block_source = else_block.toSource();
            condition_source += " else {\n" + else_block_source + "}";
          }
          return condition_source;
        },
        compile: function() {
          return null;
        },
        execute: function() {
          if (expression.execute().value) {
            return if_block.execute();
          } else {
            if (else_block) return else_block.execute();
          }
        }
      };
    };

    return If;

  })(require('shader-script/nodes/base').Base);

}).call(this);
