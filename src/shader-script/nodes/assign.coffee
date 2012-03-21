class exports.Assign extends require("shader-script/glsl/nodes/assign").Assign
  name: "assign"
  
  type: (shader) -> @right.type(shader)
  
  compile: (shader) ->
    {Function} = require('shader-script/nodes')
    
    # take care of function assignments
    if @right instanceof Function
      @right.func_name = @left
      @right.compile shader
    else
      left  = @left.compile shader
      if @left.is_access() and @left.type(shader) != @right.type(shader)
        right = @glsl('Access', @left.accessor, @right.compile shader)
      else
        right = @right.compile shader
      
      unless left.toVariableName
        throw new Error "Can't use #{JSON.stringify left} as lvalue"
        
      # Try to cast right to compatible type
      unless @left.is_access()
        dependent = @right.variable shader if @right.variable
        varname = left.toVariableName()
        
        existing = shader.scope.lookup varname, true
        if existing
          type = existing.type()
          if right.cast
            right.cast type, state: shader
          else if dependent
            dependent.set_type type
        else
          type = @right.type shader
        
        shader.scope.define left.toVariableName(), type: type, dependent: dependent

      @glsl 'Assign', left, right, @token
      