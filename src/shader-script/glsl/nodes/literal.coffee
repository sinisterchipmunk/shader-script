class exports.Literal extends require('shader-script/nodes/literal').Literal
  compile: (program) ->
    value = super program
    { execute: -> value }
    