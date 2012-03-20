class exports.Assign extends require('shader-script/nodes/base').Base
  name: "_assign"
  
  constructor: (args...) ->
    super args...
    throw new Error "Expected a token" unless @token
  
  children: -> ['left', 'right', 'token']
  
  compile: (program) ->
    token = @token
    if match = /^(.)=$/.exec token
      right = @glsl('Op', match[1], @left, @right).compile program
    else
      right = @right.compile program
      
    left = @left.compile program
    
    execute:  () ->
      lvalue = left.execute()
      rvalue = right.execute().value
      rvalue = left.filter_assignment rvalue if left.filter_assignment
      if left.assign then left.assign rvalue
      else lvalue.value = rvalue
      lvalue
      
    toSource: () ->
      "#{left.toSource()} = #{right.toSource()}"
