class exports.Assign extends require('shader-script/nodes/base').Base
  name: "_assign"
  
  constructor: (args...) ->
    super args...
    throw new Error "Expected a token" unless @token
  
  children: -> ['left', 'right', 'token']
  
  compile: (program) ->
    token = @token
    variable_name = @left.toVariableName()
    if match = /^(.)=$/.exec token
      right = @glsl('Op', match[1], @left, @right).compile program
    else
      right = @right.compile program
    variable = program.state.scope.lookup(variable_name)

    if @left.is_access()
      compiled_left = @left.compile program
    
    execute:  () ->
      value = right.execute()
      value = compiled_left.filter_assignment value if compiled_left
      variable.value = value
    toSource: () ->
      if compiled_left
        "#{compiled_left.toSource()} = #{right.toSource()}"
      else
        "#{variable_name} = #{right.toSource()}"
    