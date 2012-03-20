class exports.Op extends require('shader-script/nodes/base').Base
  name: "_op"
  children: -> ['op', 'left', 'right']
  
  cast: (type, program) ->
    # FIXME not sure how to address this. It happens in such ops as:
    #    gl_Position = mvp * position
    # where @left is mvp and @right is position
    # mvp * position results in incompatible types, even though it is
    # valid GLSL. It should do matrix multiplication against the vector
    # and return the vector.
  
  compile: (program) ->
    left = @left.compile program
    op = @op
    right = @right && @right.compile program
    
    execute: =>
      [le, re] = [left.execute(), right && right.execute()]

      switch op
        when '+' then @component_wise(le, re, (l,r) -> if r then l + r else  l)
        when '-' then @component_wise(le, re, (l,r) -> if r then l - r else -l)
        when '*' then @component_wise(le, re, (l,r) -> l * r)
        when '/' then @component_wise(le, re, (l,r) -> l / r)
        else throw new Error "Unsupported operation: #{op}"
    
    toSource: ->
      if right
        "#{left.toSource()} #{op} #{right.toSource()}"
      else
        "#{op}#{left.toSource()}"
      