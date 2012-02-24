(function() {
  var Scope;

  Scope = require('shader-script/scope').Scope;

  exports.Shader = (function() {

    function Shader(state) {
      this.scope = state.scope || (state.scope = new Scope());
    }

    return Shader;

  })();

}).call(this);
