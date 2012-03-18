class exports.Parens extends require('shader-script/nodes/base').Base
  name: "_parens"
  children: -> ['body']
  type: (program) -> @body.type program
  cast: (type, program) -> @body.cast type
  compile: (program) ->
    compiled_body = @body.compile program
    toSource: -> "(#{compiled_body.toSource()})"
    execute: -> compiled_body.execute()

