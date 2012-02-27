# http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

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
  
  e = (args...) -> new Extension args...

  # Trigonometric functions, p65
  e 'radians', 'float', (d) -> d * Math.PI / 180
  e 'degrees', 'float', (r) -> r / Math.PI * 180
  e 'sin', 'float', Math.sin
  e 'cos', 'float', Math.cos
  e 'tan', 'float', Math.tan
  e 'asin', 'float', Math.asin
  e 'acos', 'float', Math.acos
  e 'atan', 'float', (y, x) -> if x is undefined then Math.atan y else Math.atan2 y, x
  
  # Exponential functions, p65
  e 'pow', 'float', Math.pow
  e 'exp', 'float', Math.exp
  e 'log', 'float', Math.log
  e 'exp2', 'float', (x) -> Math.pow 2, x
  e 'log2', 'float', (x) -> Math.log(x) / Math.log 2
  e 'sqrt', 'float', Math.sqrt
  e 'inversesqrt', 'float', (x) -> 1 / Math.sqrt(x)
  
  # Common functions, pp66-67
  e 'abs', 'float', Math.abs
catch e
  console.log e
  console.log "WARNING: continuing without builtins..."
  