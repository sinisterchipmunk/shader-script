(function() {
  var Scope,
    __slice = Array.prototype.slice;

  Scope = require('shader-script/scope').Scope;

  exports.Program = (function() {
    var createClone;

    createClone = function(program, entry_point, omit) {
      var attribute, clone, func, name, node, uniform, variable, varying, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      clone = new exports.Program(program.state);
      _ref = program.uniforms;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        uniform = _ref[_i];
        clone.uniforms.push(uniform);
      }
      _ref2 = program.attributes;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        attribute = _ref2[_j];
        clone.attributes.push(attribute);
      }
      _ref3 = program.varyings;
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        varying = _ref3[_k];
        clone.varyings.push(varying);
      }
      _ref4 = program.variables;
      for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
        variable = _ref4[_l];
        clone.variables.push(variable);
      }
      clone.entry_point = entry_point;
      _ref5 = program.nodes;
      for (_m = 0, _len5 = _ref5.length; _m < _len5; _m++) {
        node = _ref5[_m];
        if (node.is_function) if (node.name === omit) continue;
        clone.nodes.push(node);
      }
      _ref6 = program.functions;
      for (name in _ref6) {
        func = _ref6[name];
        if (name === omit) {
          continue;
        } else if (name === entry_point) {
          name = 'main';
        }
        clone.functions[name] = func;
      }
      return clone;
    };

    function Program(state) {
      var _base, _base2;
      this.state = state != null ? state : {};
      this.nodes = [];
      this.uniforms = [];
      this.attributes = [];
      this.varyings = [];
      this.variables = [];
      this.functions = {};
      (_base = this.state).variables || (_base.variables = {});
      (_base2 = this.state).scope || (_base2.scope = new Scope());
    }

    Program.prototype.toSource = function() {
      var node, str, _i, _len, _ref;
      str = [];
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.is_function) {
          if (node.name === this.entry_point) {
            str.push(node.toSource('main'));
          } else {
            str.push(node.toSource());
          }
        } else if (node.is_comment || node.is_block) {
          str.push(node.toSource());
        } else {
          str.push(node.toSource() + ";");
        }
      }
      return str.join("\n");
    };

    Program.prototype.toVertexProgram = function() {
      return createClone(this, 'vertex', 'fragment');
    };

    Program.prototype.toFragmentProgram = function() {
      return createClone(this, 'fragment', 'vertex');
    };

    Program.prototype.invoke = function() {
      var function_name, params, _ref;
      function_name = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this.functions[function_name]) {
        return (_ref = this.functions[function_name]).invoke.apply(_ref, params);
      } else {
        throw new Error("no " + function_name + " function found!");
      }
    };

    return Program;

  })();

}).call(this);
