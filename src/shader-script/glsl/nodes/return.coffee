class exports.Return extends require('shader-script/nodes/base').Base
  name: '_return'
  
  children: -> ['expression']
  
  compile: (program) ->
    if @expression
      compiled_expression = @expression.compile program
      
      execute: -> throw is_return: true, result: compiled_expression.execute() 
      toSource: -> "return #{compiled_expression.toSource()}"
    else
      execute: -> throw is_return: true, result: undefined 
      toSource: -> "return"
