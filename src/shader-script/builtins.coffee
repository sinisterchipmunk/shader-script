code = """
  radians = (float d) -> return d * #{Math.PI} / 180
  degrees = (float r) -> return r / #{Math.PI} * 180
"""

try
  ss = require('shader-script')
  exports.builtins = ss.compile(code)

  # console.log exports.builtins.vertex.toSource()
  # console.log exports.builtins.fragment.toSource()

  {Program} = require 'shader-script/glsl/program'
  Program.prototype.builtins = exports.builtins.vertex.functions
  
  # now add the builtins we have to hook directly into JS for
  class Extension
    return_type: -> @type
    
    constructor: (@name, @type, @callback) ->
      Program.prototype.builtins[@name] = this
      
    invoke: (params...) ->
      params = (param.execute() for param in params)
      @callback params...
      
    toSource: -> "#{@return_type()} #{@name}(/* variable args */) { /* native code */ }"
  
  new Extension 'sin', 'float', (f) -> Math.sin(f)
  new Extension 'cos', 'float', (f) -> Math.cos(f)
catch e
  console.log e
  console.log "WARNING: continuing without builtins..."
  