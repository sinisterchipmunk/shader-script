class exports.Op extends require('shader-script/nodes/base').Base
  name: "op"
  children: -> ['op', 'left', 'right']
  
  type: (shader) ->
    ltype = @left.type shader
    rtype = @right && @right.type shader
    return ltype unless rtype
    
    # if at least one type is a vector,
    # then both are vectors.
    if /vec/.test(ltype) || /mat/.test(ltype)
      ltype
    else if /vec/.test(rtype) || /mat/.test(rtype)
      rtype
    else
      ltype || rtype
  
  variable: (shader) -> @left.variable(shader) or @right && @right.variable(shader)
  
  compile: (shader) ->
    left = @left.compile shader
    op = @op
    right = @right && @right.compile shader
    
    @glsl 'Op', op, left, right
    