class exports.Assign extends require('shader-script/nodes/base').Base
  name: "_assign"
  
  children: -> ['left', 'right']
  
  compile: (program) ->
    variable_name = @left.toVariableName()
    right = @right.compile program
    variable = program.state.scope.lookup(variable_name)

    if @left.is_access()
      compiled_left = @left.compile program
    
    execute:  () =>
      value = right.execute()
      value = compiled_left.filter_assignment value if compiled_left
      variable.value = value
    toSource: () ->
      if compiled_left
        "#{compiled_left.toSource()} = #{right.toSource()}"
      else
        "#{variable_name} = #{right.toSource()}"
    