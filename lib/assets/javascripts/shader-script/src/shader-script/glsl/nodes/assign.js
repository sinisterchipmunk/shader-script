(function() {
  var Program,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  Program = require("shader-script/glsl/program").Program;

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    Assign.prototype.name = "_assign";

    function Assign() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      Assign.__super__.constructor.apply(this, args);
      if (!this.token) throw new Error("Expected a token");
    }

    Assign.prototype.children = function() {
      return ['left', 'right', 'token'];
    };

    Assign.prototype.compile = function(program) {
      var left, match, right, token;
      token = this.token;
      if (match = /^(.)=$/.exec(token)) {
        right = this.glsl('Op', match[1], this.left, this.right).compile(program);
      } else {
        right = this.right.compile(program);
      }
      left = this.left.compile(program);
      return {
        execute: function() {
          var builtin_variables, lvalue, rvalue, variable;
          lvalue = left.execute();
          rvalue = right.execute().value;
          if (left.filter_assignment) rvalue = left.filter_assignment(rvalue);
          builtin_variables = Program.prototype.builtins._variables;
          if (lvalue.name && (variable = builtin_variables.vertex[lvalue.name] || builtin_variables.fragment[lvalue.name])) {
            program.state.variables[lvalue.name] = lvalue;
          }
          if (left.assign) {
            left.assign(rvalue);
          } else {
            lvalue.value = rvalue;
          }
          return lvalue;
        },
        toSource: function() {
          return "" + (left.toSource()) + " = " + (right.toSource());
        }
      };
    };

    return Assign;

  })(require('shader-script/nodes/base').Base);

}).call(this);
