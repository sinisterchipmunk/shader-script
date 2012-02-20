(function() {
  var Glsl, Program, Simulator;

  Glsl = require('shader-script/glsl');

  Program = require('shader-script/glsl/program').Program;

  exports.Simulator = Simulator = (function() {

    function Simulator(glsl) {
      if (glsl.vertex) this.vertex = Glsl.compile(glsl.vertex, new Program(this));
      if (glsl.fragment) {
        this.fragment = Glsl.compile(glsl.fragment, new Program(this));
      }
      this.state = {
        variables: {}
      };
    }

    Simulator.prototype.start = function(which) {
      var program;
      if (which == null) which = 'both';
      switch (which) {
        case 'both':
          if (!(this.vertex || this.fragment)) {
            throw new Error("No programs found!");
          }
          if (this.vertex) this.start('vertex');
          if (this.fragment) return this.start('fragment');
          break;
        default:
          program = this[which];
          if (!program) throw new Error("No " + which + " program found!");
          return this.run_program(which, program);
      }
    };

    Simulator.prototype.run_program = function(name, program) {
      try {
        return program.invoke('main');
      } catch (err) {
        err.message = "" + name + ": " + err.message;
        throw err;
      }
    };

    return Simulator;

  })();

}).call(this);
