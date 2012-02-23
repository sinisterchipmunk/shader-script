class exports.Assign extends require("shader-script/glsl/nodes/assign").Assign
  name: "assign"
  
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
      
      shader.scope.define left.toVariableName(), type: @right.type()
      @glsl 'Assign', left, right
      