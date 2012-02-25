code = """
  radians = (float degrees) -> return degrees * #{Math.PI} / 180
"""

try
  ss = require('shader-script')
  exports.builtins = ss.compile(code)

  # console.log exports.builtins.vertex.toSource()
  # console.log exports.builtins.fragment.toSource()

  {Program} = require 'shader-script/glsl/program'
  Program.prototype.builtins = exports.builtins.vertex.functions
catch e
  console.log e
  console.log "WARNING: continuing without builtins..."
  