class exports.If extends require('shader-script/glsl/nodes/if').If
  name: "if"

  compile: (shader) ->
    _if = @glsl('If', @expression.compile(shader), @block.compile(shader), @options)
    _if.addElse @else_block.compile(shader) if @else_block
    _if
    