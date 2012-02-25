class exports.Op extends require('shader-script/nodes/base').Base
  name: "op"
  children: -> ['op', 'left', 'right']
  
  type: (shader) -> @left.type(shader) or @right.type(shader)
  
  compile: (shader) ->
    left = @left.compile shader
    op = @op
    right = @right.compile shader
    @glsl 'Op', op, left, right
    