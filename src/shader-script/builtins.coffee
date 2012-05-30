# http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

try
  {Program} = require 'shader-script/glsl/program'
  {Definition} = require 'shader-script/scope'
  
  d = (type, default_val) -> new Definition type: type, builtin: true, value: default_val
  exports.builtins = Program.prototype.builtins =
    _variables:
      common:
        gl_MaxVertexAttribs: d 'int', 8
        gl_MaxVertexUniformVectors: d 'int', 128
        gl_MaxVaryingVectors: d 'int', 8
        gl_MaxVertexTextureImageUnits: d 'int', 0
        gl_MaxCombinedTextureImageUnits: d 'int', 8
        gl_MaxTextureImageUnits: d 'int', 8
        gl_MaxFragmentUniformVectors: d 'int', 16
        gl_MaxDrawBuffers: d 'int', 1
      vertex:
        gl_Position: d 'vec4'
        gl_PointSize: d 'float'
      fragment:
        gl_FragCoord: d 'vec4'
        gl_FrontFacing: d 'bool'
        gl_FragColor: d 'vec4'
        gl_PointCoord: d 'vec2'
  
  exports.Extension = Extension = require('shader-script/extension').Extension
  
  e = (args...) -> new Extension args...

  # Trigonometric functions, p65
  e 'radians', null, (x) -> @component_wise x, (y) -> y * Math.PI / 180
  e 'degrees', null, (x) -> @component_wise x, (y) -> y / Math.PI * 180
  e 'sin',     null, (x) -> @component_wise x, (y) -> Math.sin(y)
  e 'cos',     null, (x) -> @component_wise x, (y) -> Math.cos(y)
  e 'tan',     null, (x) -> @component_wise x, (y) -> Math.tan(y)
  e 'asin',    null, (x) -> @component_wise x, (y) -> Math.asin(y)
  e 'acos',    null, (x) -> @component_wise x, (y) -> Math.acos(y)
  e 'atan',    null, (y, x) -> @component_wise y, x, (_y, _x) ->
    if _x is undefined then Math.atan(_y) else Math.atan2(_y, _x)
  # 'float', (y, x) -> if x is undefined then Math.atan y else Math.atan2 y, x
  
  # Exponential functions, p65
  e 'pow',  null, (x, y) -> @component_wise x, y, (_x, _y) -> Math.pow(_x, _y)
  e 'exp',  null, (x)    -> @component_wise x, (y) -> Math.exp(y)
  e 'log',  null, (x)    -> @component_wise x, (y) -> Math.log(y)
  e 'exp2', null, (x)    -> @component_wise x, (y) -> Math.pow(2, y)
  e 'log2', null, (x)    -> @component_wise x, (y) -> Math.log(y) / Math.log 2
  e 'sqrt', null, (x)    -> @component_wise x, (y) -> Math.sqrt(y)
  e 'inversesqrt', null, (x) -> @component_wise x, (y) -> 1 / Math.sqrt(y)
  
  # Common functions, pp66-67
  e 'abs',   null, (x) -> @component_wise x, (y) -> Math.abs y
  e 'sign',  null, (x) -> @component_wise x, (y) -> if y > 0 then 1 else (if y < 0 then -1 else 0)
  e 'floor', null, (x) -> @component_wise x, (y) -> Math.floor(y)
  e 'ceil',  null, (x) -> @component_wise x, (y) -> Math.ceil(y)
  e 'fract', null, (x) -> @component_wise x, (y) -> y - Math.floor(y)
  e 'mod',   null, (x,y) -> @component_wise x,y, (_x,_y) -> _x - _y * Math.floor _x / _y
  e 'min',   null, (x,y) -> @component_wise x,y, (_x,_y) -> Math.min _x, _y
  e 'max',   null, (x,y) -> @component_wise x,y, (_x,_y) -> Math.max _x, _y
  e 'clamp', null, (x,min,max) -> @component_wise x,min,max, (_x,_min,_max) -> Math.min(Math.max(_x, _min), _max)
  e 'mix',   null, (min,max,a) -> @component_wise min,max,a, (_min,_max,_a) -> _min * (1 - _a) + _max * _a
  e 'step',  null, (edge, x) -> @component_wise edge, x, (_edge, _x) -> if _x < _edge then 0 else 1
  e 'smoothstep', null, (edge0, edge1, x) -> @component_wise edge0, edge1, x, (_edge0, _edge1, _x) ->
    t = Extension.invoke('clamp', (_x - _edge0) / (_edge1 - _edge0), 0, 1)
    t * t * (3 - 2 * t)
    
  e 'discard', null, -> throw new Error "discarded"

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
    
  # Matrix functions, p69
  e 'matrixCompMult', null, (x, y) -> @component_wise x,y, (_x,_y) -> _x * _y
    
  # Texture lookup functions, pp71-72
  # These are only implemented to prevent error conditions, they
  # only actually return white.
  e 'texture2D', 'vec4', -> [1, 1, 1, 1]
  e 'texture2DLod', 'vec4', -> [1, 1, 1, 1]
  e 'texture2DProj', 'vec4', -> [1, 1, 1, 1]
  e 'texture2DProjLod', 'vec4', -> [1, 1, 1, 1]
  e 'textureCube', 'vec4', -> [1, 1, 1, 1]
  e 'textureCubeLod', 'vec4', -> [1, 1, 1, 1]
catch e
  console.log e
  console.log e.stack
  console.log "WARNING: continuing without builtins..."
  