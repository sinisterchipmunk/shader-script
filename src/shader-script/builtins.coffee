try
  {Program} = require 'shader-script/glsl/program'
  Program.prototype.builtins = {}
  
  # now add the builtins we have to hook directly into JS for
  class Extension
    return_type: -> @type
    
    constructor: (@name, @type, @callback) ->
      Program.prototype.builtins[@name] = this
      
    invoke: (params...) ->
      params = (param.execute() for param in params)
      @callback params...
      
    toSource: -> "#{@return_type()} #{@name}(/* variable args */) { /* native code */ }"
  
  # Trigonometric functions
  new Extension 'radians', 'float', (d) -> d * Math.PI / 180
  new Extension 'degrees', 'float', (r) -> r / Math.PI * 180
  new Extension 'sin', 'float', Math.sin
  new Extension 'cos', 'float', Math.cos
  new Extension 'tan', 'float', Math.tan
  new Extension 'asin', 'float', Math.asin
  new Extension 'acos', 'float', Math.acos
  new Extension 'atan', 'float', (y, x) -> if x is undefined then Math.atan y else Math.atan2 y, x
catch e
  console.log e
  console.log "WARNING: continuing without builtins..."
  