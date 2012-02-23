class exports.Assign extends require('shader-script/nodes/base').Base
  name: "_assign"
  
  children: -> ['left', 'right']
  
  compile: (program) ->
    left  = @left.compile program
    right = @right.compile program
    
    execute: () -> 
      program.state.variables[left.execute()].value = right.execute()
    toSource: () -> "#{left.toSource()} = #{right.toSource()}"
    