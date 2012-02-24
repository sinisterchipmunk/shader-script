exports.Code = class exports.Function extends require('shader-script/nodes/base').Base
  name: 'function'
  children: -> ['params', 'body']
  
  compile: (shader) ->
    throw new Error("GLSL doesn't support anonymous functions") unless @func_name
    
    return_type = 'void'
    compiled_func_name = @func_name.compile shader
    str_func_name = @func_name.toVariableName()

    shader.scope.push str_func_name
    
    compiled_params    = (param.compile shader for param in @params)
    compiled_body      = @body.compile shader
    
    shader.define_function str_func_name, (types) ->
      if types.length != compiled_params.length
        throw new Error "Function #{str_func_name} called with incorrect argument count (#{types.length} for #{compiled_params.length})"
      
      for i in [0...types.length]
        type = types[i]
        variable = compiled_params[i].variable
        variable.set_type type
      
    shader.scope.pop()
    @glsl 'Function', return_type, compiled_func_name, compiled_params, compiled_body
    