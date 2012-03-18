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
      right = @right.compile shader
      
      unless left.toVariableName
        throw new Error "Can't use #{JSON.stringify left} as lvalue"
        
      dependent = @right.variable(shader) if @right.variable
      varname = left.toVariableName()
      
      # Try to cast right to compatible type
      existing = shader.scope.lookup varname, true
      if existing
        type = existing.type()
        right.cast(type, state: shader)
      else
        type = @right.type(shader)
        
      shader.scope.define left.toVariableName(), type: type, dependent: dependent

      @glsl 'Assign', left, right
      