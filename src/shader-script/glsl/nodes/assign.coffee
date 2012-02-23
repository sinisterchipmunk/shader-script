class exports.Assign extends require('shader-script/nodes/base').Base
  name: "_assign"
  
  children: -> ['left', 'right']
  
  compile: (program) ->
    left  = @left.compile program
    right = @right.compile program
    
    execute: () -> 
      _left = left.execute()
      if program.state.variables[_left] == undefined
        throw new Error "undeclared variable #{_left}"
      program.state.variables[_left].value = right.execute()
    toSource: () -> "#{left.toSource()} = #{right.toSource()}"
    