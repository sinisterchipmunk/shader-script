class exports.If extends require('shader-script/nodes/base').Base
  name: "if"
  children: -> ['expression', 'block', 'options']
  
  addElse: (@else_block) -> this
  
  compile: (program) ->
    expression = @expression.compile program
    if_block = @block.compile program
    else_block = @else_block && @else_block.compile program
    
    toSource: ->
      if_block_source = if_block.toSource()
      condition_source = "if (#{expression.toSource()}) {\n#{if_block_source}}"
      
      if else_block
        else_block_source = else_block.toSource()
        condition_source += " else {\n#{else_block_source}}"
      
      condition_source
      
    compile: ->
      null
      
    execute: ->
      if expression.execute().value
        if_block.execute()
      else
        else_block.execute() if else_block
