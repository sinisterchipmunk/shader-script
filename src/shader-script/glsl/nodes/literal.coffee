class exports.Literal extends require('shader-script/nodes/literal').Literal
  name: "_literal"
  
  compile: (program) ->
    value = eval @children[0]
    execute: -> value
    toSource: -> value.toString()
    