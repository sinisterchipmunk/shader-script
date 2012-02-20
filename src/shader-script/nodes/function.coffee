exports.Code = class exports.Function extends require('shader-script/nodes/base').Base
  name: 'function'
  children: -> ['params', 'body']
  compile: (shader) ->
    throw new Error("GLSL doesn't support anonymous functions") unless @func_name
    
    return_type = 'void'
    compiled_func_name = @func_name.compile(shader)
    compiled_params    = (param.compile shader for param in @params)
    compiled_body      = @body.compile shader
    
    @glsl 'Function', return_type, compiled_func_name, compiled_params, compiled_body
    