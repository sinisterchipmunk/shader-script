(function() {
  var Glsl, Preprocessor, Program, Simulator;

  Glsl = require('shader-script/glsl');

  Program = require('shader-script/glsl/program').Program;

  Preprocessor = require('shader-script/glsl/preprocessor').Preprocessor;

  exports.Simulator = Simulator = (function() {
    var assign_builtin_variables, compile_program, convert_attributes;

    assign_builtin_variables = function(name, program) {
      var builtins, definition, _results;
      builtins = program.builtins && program.builtins._variables[name];
      _results = [];
      for (name in builtins) {
        definition = builtins[name];
        _results.push(program.state.scope.define(name, definition.as_options()));
      }
      return _results;
    };

    compile_program = function(type, state, source_code, preprocessor_state) {
      var program;
      program = new Program(state);
      assign_builtin_variables('common', program);
      assign_builtin_variables(type, program);
      program = Glsl.compile(new Preprocessor(source_code, preprocessor_state).toString(), program);
      return program;
    };

    convert_attributes = function(sim, program) {
      var name, variable, _ref, _results;
      _ref = sim.state.variables;
      _results = [];
      for (name in _ref) {
        variable = _ref[name];
        if (variable.storage_qualifier === 'attribute') {
          if (variable.value.length) {
            switch (variable.type()) {
              case 'vec4':
                if (variable.value.length % 4 !== 0) {
                  _results.push(variable.value = [variable.value[0], variable.value[1], variable.value[2], 1]);
                } else {
                  _results.push(variable.value = [variable.value[0], variable.value[1], variable.value[2], variable.value[3]]);
                }
                break;
              case 'vec3':
                _results.push(variable.value = [variable.value[0], variable.value[1], variable.value[2]]);
                break;
              case 'vec2':
                _results.push(variable.value = [variable.value[0], variable.value[1]]);
                break;
              case 'float':
                _results.push(variable.value = variable.value[0]);
                break;
              default:
                _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    function Simulator(glsl, variables) {
      var name, value;
      if (variables == null) variables = {};
      if (typeof glsl === 'string') {
        glsl = {
          vertex: glsl
        };
      }
      this.state = {
        preprocessor: (glsl != null ? glsl.preprocessor : void 0) || {}
      };
      if (glsl.vertex) {
        this.vertex = compile_program('vertex', this.state, glsl.vertex, this.state.preprocessor);
      }
      if (glsl.fragment) {
        this.fragment = compile_program('fragment', this.state, glsl.fragment, this.state.preprocessor);
      }
      for (name in variables) {
        value = variables[name];
        if (this.state.variables[name]) {
          this.state.variables[name].value = value;
        } else {
          throw new Error("Could not set variable `" + name + "` to `" + (JSON.stringify(value)) + "`: variable does not exist");
        }
      }
      if (!(this.vertex || this.fragment)) throw new Error("No programs found!");
    }

    Simulator.prototype.start = function(which) {
      var program;
      if (which == null) which = 'both';
      switch (which) {
        case 'both':
          if (this.vertex) this.start('vertex');
          if (this.fragment) this.start('fragment');
          break;
        default:
          program = this[which];
          if (!program) throw new Error("No " + which + " program found!");
          this.run_program(which, program);
      }
      return this;
    };

    Simulator.prototype.run_program = function(name, program) {
      try {
        convert_attributes(this, program);
        return program.invoke('main');
      } catch (err) {
        err.message = "" + name + ": " + err.message;
        throw err;
      }
    };

    return Simulator;

  })();

}).call(this);
