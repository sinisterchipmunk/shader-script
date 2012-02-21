class exports.Assign extends require('shader-script/nodes/assign').Assign
  name: "_assign"
  
  children: -> ['left', 'right']
  
  compile: (program) ->
    left  = @left.compile program
    right = @right.compile program
    
    execute: () -> 
      program.state.variables[left.execute()] = right.execute()
    toSource: () -> "#{left.toSource()} = #{right.toSource()}"
    