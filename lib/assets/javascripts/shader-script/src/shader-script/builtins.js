(function() {
  var Program, code, ss;

  code = "radians = (float degrees) -> return degrees * " + Math.PI + " / 180";

  try {
    ss = require('shader-script');
    exports.builtins = ss.compile(code);
    Program = require('shader-script/glsl/program').Program;
    Program.prototype.builtins = exports.builtins.vertex.functions;
  } catch (e) {
    console.log(e);
    console.log("WARNING: continuing without builtins...");
  }

}).call(this);
