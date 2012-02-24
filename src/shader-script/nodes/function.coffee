exports.Code = class exports.Function extends require('shader-script/nodes/base').Base
  name: 'function'
  children: -> ['params', 'body']
  
  variable: (shader) ->
    # This is the wrong approach. We need to extract Definition (or whatever) 
    # out of Scope and use it directly, because in this case we aren't actually
    # trying to use Scope at all -- we just want a variable to track return types.
    #
    # We need to mix this variable in with the callbacks we already invoke in Shader
    # so that it doesn't matter what order the variable is discovered in.
    # 
    # return @_variable if @_variable
    # name = @func_name.toVariableName()
    # 
    # root_scope = shader.scope.find("null.block")
    # # root_scope.push(name)
    # @_variable = root_scope.define "__return__"
    # # root_scope.pop()
    # @_variable
    _type: 'void'
    type: -> @_type
    set_type: (t) -> @_type = t
    
  
  type: (shader) -> @variable(shader).type()
  
  compile: (shader) ->
    throw new Error("GLSL doesn't support anonymous functions") unless @func_name
    return_variable = @variable shader
    
    compiled_func_name = @func_name.compile shader
    str_func_name = @func_name.toVariableName()

    shader.current_function =
      name: str_func_name
      return_variable: return_variable
      
    function_scope = shader.scope.push str_func_name
    
    compiled_params    = (param.compile shader for param in @params)
    compiled_body      = @body.compile shader
    
    shader.define_function str_func_name, (args) ->
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