class exports.Literal extends require("shader-script/glsl/nodes/literal").Literal
  name: "literal"

  compile: ->
    @glsl 'Literal', @children...
  