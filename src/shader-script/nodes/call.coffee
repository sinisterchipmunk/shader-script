class exports.Call extends require("./base").Base
  name: "call"
  
  children: -> ['method_name', 'params']
  
  compile: (shader) ->
    method_name = @method_name.compile shader
    compiled_params = (param.compile shader for param in @params)
    
    if typeof shader.proxy[method_name] is 'function'
      shader.proxy[method_name].apply method_name, compiled_params
    else
      @glsl 'Call', method_name, compiled_params
