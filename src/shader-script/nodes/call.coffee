{Definition} = require 'shader-script/scope'

class exports.Call extends require("shader-script/nodes/base").Base
  name: "call"
  
  children: -> ['method_name', 'params']
  
  variable: (shader) ->
    @_variable or= new Definition
  
  type: (shader) ->
    @variable(shader).type()
  
  compile: (shader) ->
    method_name = @method_name.compile shader
    compiled_params = []
    args = []
    for param in @params
      arg = param.compile shader
      compiled_params.push arg
      
      variable = param.variable shader
      if variable
        args.push variable
      else
        args.push param.type()
      
    shader.mark_function @method_name.toVariableName(), args, @variable(shader)
      
    @glsl 'Call', method_name, compiled_params
