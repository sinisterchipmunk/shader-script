class exports.Call extends require("shader-script/nodes/base").Base
  name: "call"
  
  children: -> ['method_name', 'params']
  
  compile: (shader) ->
    method_name = @method_name.compile shader
    compiled_params = []
    types = []
    for param in @params
      compiled_params.push param.compile shader
      types.push param.type()
      
    shader.mark_function @method_name.toVariableName(), types
      
    @glsl 'Call', method_name, compiled_params
