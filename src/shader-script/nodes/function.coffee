{Definition} = require 'shader-script/scope'

exports.Code = class exports.Function extends require('shader-script/nodes/base').Base
  name: 'function'
  children: -> ['params', 'body']
  
  variable: (shader) ->
    @_variable or= new Definition
  
  type: (shader) -> @variable(shader).type() || 'void'
  
  compile: (shader) ->
    throw new Error("GLSL doesn't support anonymous functions") unless @func_name
    return_variable = @variable shader
    
    compiled_func_name = @func_name.compile shader
    str_func_name = @func_name.toVariableName()
    
    if str_func_name == 'vertex' or str_func_name == 'fragment'
      if str_func_name == shader.compile_target then compiled_func_name = @glsl 'Identifier', 'main'
      else return null

    shader.current_function =
      name: str_func_name
      return_variable: return_variable
      
    function_scope = shader.scope.push str_func_name
    
    compiled_params    = (param.compile shader for param in @params)
    compiled_body      = @body.compile shader
    return_variable    = @variable shader
    
    shader.define_function str_func_name, return_variable, (args) ->
      if args.length != compiled_params.length
        throw new Error "Function #{str_func_name} called with incorrect argument count (#{args.length} for #{compiled_params.length})"
      
      for i in [0...args.length]
        arg = args[i]
        variable = compiled_params[i].variable
        if arg.type
          variable.dependents.push arg
        else
          variable.set_type arg
      
    shader.scope.pop()
    
    delete shader.current_function
    
    glsl = @glsl 'Function', 'void', compiled_func_name, compiled_params, compiled_body
    glsl.type = => @type(shader)
    glsl
    