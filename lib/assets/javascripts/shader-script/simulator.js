(function() {
  var Glsl, Simulator;

  Glsl = require('shader-script/glsl');

  exports.Simulator = Simulator = (function() {

    function Simulator(glsl) {
      this.state = {
        variables: {}
      };
      if (glsl.vertex) this.vertex = Glsl.compile(glsl.vertex, this.state);
      if (glsl.fragment) this.fragment = Glsl.compile(glsl.fragment, this.state);
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
        return program.invoke('main');
      } catch (err) {
        err.message = "" + name + ": " + err.message;
        throw err;
      }
    };

    return Simulator;

  })();

}).call(this);
