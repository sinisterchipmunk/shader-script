(function() {

  exports.Program = (function() {

    function Program(simulator) {
      this.simulator = simulator;
      this.uniforms = [];
      this.attributes = [];
      this.varyings = [];
      this.functions = {};
      this.current_scope = {};
    }

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
