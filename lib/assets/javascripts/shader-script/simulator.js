(function() {
  var Glsl, Program, Simulator;

  Glsl = require('shader-script/glsl');

  Program = require('shader-script/glsl/program').Program;

  exports.Simulator = Simulator = (function() {

    function Simulator(glsl) {
      if (glsl.vertex) this.vertex = Glsl.compile(glsl.vertex);
      if (glsl.fragment) this.fragment = Glsl.compile(glsl.fragment);
      this.state = {
        variables: {}
      };
    }

    Simulator.prototype.start = function() {
      if (!(this.vertex || this.fragment)) throw new Error("No programs found!");
      this.try_run('vertex', this.vertex);
      return this.try_run('fragment', this.fragment);
    };

    Simulator.prototype.try_run = function(name, source_code) {
      var program;
      if (!source_code) return;
      try {
        program = new Program(this);
        source_code.compile(program);
        return program.invoke('main');
      } catch (err) {
        err.message = "" + name + ": " + err.message;
        throw err;
      }
    };

    return Simulator;

  })();

}).call(this);
