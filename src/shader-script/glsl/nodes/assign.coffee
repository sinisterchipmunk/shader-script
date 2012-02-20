class exports.Assign extends require('shader-script/nodes/assign').Assign
  name: "_assign"
  
  children: -> ['left', 'right']
  
  compile: (program) ->
    left  = @left.compile program
    right = @right.compile program
    
    execute: (sim) -> 
      sim.state.variables[left.execute sim] = right.execute sim
    toSource: () -> "#{left.toSource()} = #{right.toSource()}"
    