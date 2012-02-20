class exports.Assign extends require('shader-script/nodes/assign').Assign
  children: -> ['left', 'right']
  
  compile: (program) ->
    left  = @left.compile program
    right = @right.compile program
    
    return execute: (sim) ->
      sim.state.variables[left] = right.execute(sim)
    