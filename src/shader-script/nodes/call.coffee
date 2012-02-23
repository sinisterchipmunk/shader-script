class exports.Call extends require("shader-script/nodes/base").Base
  name: "call"
  
  children: -> ['method_name', 'params']
  
  compile: (shader) ->
    method_name = @method_name.compile shader
    compiled_params = (param.compile shader for param in @params)
    @glsl 'Call', method_name, compiled_params
