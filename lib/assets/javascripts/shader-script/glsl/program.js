(function() {

  exports.Program = (function() {
    var createClone;

    createClone = function(program, entry_point, omit) {
      var attribute, clone, func, name, uniform, varying, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
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
      _ref4 = program.functions;
      for (name in _ref4) {
        func = _ref4[name];
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
      var _base;
      this.state = state != null ? state : {};
      this.uniforms = [];
      this.attributes = [];
      this.varyings = [];
      this.functions = {};
      (_base = this.state).scope || (_base.scope = {});
    }

    Program.prototype.toSource = function() {
      var attr, attributes, fn, functions, name, unif, uniforms, vary, varyings, _ref;
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
      functions = [];
      _ref = this.functions;
      for (name in _ref) {
        fn = _ref[name];
        functions.push(fn.toSource(name));
      }
      return [uniforms, attributes, varyings, functions.join("\n\n")].join("\n\n").trim();
    };

    Program.prototype.toVertexProgram = function() {
      return createClone(this, 'vertex', 'fragment');
    };

    Program.prototype.toFragmentProgram = function() {
      return createClone(this, 'fragment', 'vertex');
    };

    Program.prototype.invoke = function(function_name) {
      if (this.functions[function_name]) {
        return this.functions[function_name].invoke(this.simulator);
      } else {
        throw new Error("no " + function_name + " function found!");
      }
    };

    return Program;

  })();

}).call(this);
