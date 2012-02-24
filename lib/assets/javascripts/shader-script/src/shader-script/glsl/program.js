(function() {
  var Scope,
    __slice = Array.prototype.slice;

  Scope = require('shader-script/scope').Scope;

  exports.Program = (function() {
    var createClone;

    createClone = function(program, entry_point, omit) {
      var attribute, clone, func, name, uniform, variable, varying, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5;
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
      _ref5 = program.functions;
      for (name in _ref5) {
        func = _ref5[name];
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
      this.uniforms = [];
      this.attributes = [];
      this.varyings = [];
      this.variables = [];
      this.functions = {};
      (_base = this.state).variables || (_base.variables = {});
      (_base2 = this.state).scope || (_base2.scope = new Scope());
    }

    Program.prototype.toSource = function() {
      var attr, attributes, fn, functions, name, unif, uniforms, vari, variables, vary, varyings, _ref;
      uniforms = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.uniforms;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          unif = _ref[_i];
          _results.push("uniform   " + unif.type + " " + unif.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      attributes = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.attributes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attr = _ref[_i];
          _results.push("attribute " + attr.type + " " + attr.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      varyings = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.varyings;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          vary = _ref[_i];
          _results.push("varying   " + vary.type + " " + vary.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      variables = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.variables;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          vari = _ref[_i];
          _results.push("" + vari.type + " " + vari.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      functions = [];
      _ref = this.functions;
      for (name in _ref) {
        fn = _ref[name];
        functions.push(fn.toSource(name));
      }
      return [uniforms, attributes, varyings, variables, functions.join("\n\n")].join("\n\n").trim();
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
