# http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

try
  {Program} = require 'shader-script/glsl/program'
  Program.prototype.builtins = {}
  
  class Extension
    # If type is null, it will default to the type of the first argument passed into
    # the extension in the context of its call. Note that this result can vary depending
    # on context. For example, all of the following can be true within the same program:
    #
    #   ext(vec3) => vec3
    #   ext(float) => float
    #   ext(vec3, float) => vec3
    #
    return_type: -> @type
    
    constructor: (@name, @type, @callback) ->
      Program.prototype.builtins[@name] = this
      
    invoke: (params...) ->
      params = (param.execute() for param in params)
      @callback params...
      
    # Invokes the named extension from JS.
    @invoke: (name, args...) ->
      if Program.prototype.builtins[name]
        Program.prototype.builtins[name].callback(args...)
      else throw new Error "No built-in function named #{name}"
      
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
  e 'sign', 'float', (x) -> if x > 0 then 1 else (if x < 0 then -1 else 0)
  e 'floor', 'float', Math.floor
  e 'ceil', 'float', Math.ceil
  e 'fract', 'float', (x) -> x - Math.floor(x)
  e 'mod', 'float', (x,y) -> x - y * Math.floor(x/y)
  e 'min', 'float', Math.min
  e 'max', 'float', Math.max
  e 'clamp', 'float', (x, min, max) -> Math.min(Math.max(x, min), max)
  e 'mix', 'float', (min, max, a) -> min * (1 - a) + max * a
  e 'step', 'float', (edge, x) -> if x < edge then 0 else 1
  e 'smoothstep', 'float', (edge0, edge1, x) ->
    t = Extension.invoke('clamp', (x - edge0) / (edge1 - edge0), 0, 1)
    t * t * (3 - 2 * t)

  # Geometric functions, pp68-69
  e 'length', 'float', (vec) ->
    l = 0
    l += Math.pow(x, 2) for x in vec
    Math.sqrt(l)
  e 'distance', 'float', (v1, v2) ->
    v3 = (v1[i] - v2[i] for i of v1)
    Extension.invoke 'length', v3
  e 'dot', 'float', (v1, v2) ->
    dot = 0
    dot += v1[i] * v2[i] for i of v1
    dot
  e 'cross', 'vec3', (x, y) ->
    throw new Error 'Can only cross vec3 with vec3' if x.length != 3 or y.length != 3
    [ x[1]*y[2] - y[1]*x[2], x[2]*y[0] - y[2]*x[0], x[0]*y[1] - y[0]*x[1] ]
  e 'normalize', null, (vec) ->
    len = Extension.invoke('length', vec)
    (v / len for v in vec)
  e 'faceforward', null, (N, I, Nref) ->
    if Extension.invoke('dot', Nref, I) < 0 then N else I
  e 'reflect', null, (I, N) ->
    dot = Extension.invoke('dot', N, I)
    I[i] - 2 * dot * N[i] for i of I
  e 'refract', null, (I, N, eta) ->
    dotNI = Extension.invoke 'dot', N, I
    k = 1 - eta * eta * (1 - dotNI * dotNI)
    if k < 0 then (0 for x in I)
    else eta * I[i] - (eta * dotNI + Math.sqrt(k)) * N[i] for i of I
catch e
  console.log e
  console.log "WARNING: continuing without builtins..."
  