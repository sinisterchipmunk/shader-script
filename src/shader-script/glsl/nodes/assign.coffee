class exports.Assign extends require('shader-script/nodes/base').Base
  name: "_assign"
  
  children: -> ['left', 'right']
  
  compile: (program) ->
    left = @left.toVariableName()
    right = @right.compile program
    
    execute: () -> 
      if program.state.variables[left] == undefined
        throw new Error "undeclared variable #{left}"
      program.state.variables[left].value = right.execute()
    toSource: () -> "#{left} = #{right.toSource()}"
    