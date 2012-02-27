class exports.Assign extends require('shader-script/nodes/base').Base
  name: "_assign"
  
  children: -> ['left', 'right']
  
  compile: (program) ->
    left = @left.toVariableName()
    right = @right.compile program
    variable = program.state.scope.lookup(left)
    
    execute:  () -> variable.value = right.execute()
    toSource: () -> "#{left} = #{right.toSource()}"
    