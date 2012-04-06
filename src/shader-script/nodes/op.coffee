{signatures} = require 'shader-script/operators'
{Definition} = require 'shader-script/definition'

class exports.Op extends require('shader-script/nodes/base').Base
  name: "op"
  children: -> ['op', 'left', 'right']
  
  type: (shader) ->
    return @left.type shader unless @right
    ltype = @left.type shader
    rtype = @right.type shader
    if sig = signatures[ltype]
      if sig = sig[@op]
        return sig[rtype]
    ltype || rtype
  
  variable: (shader) ->
    @_variable or= new Definition
    @_variable.set_type @type shader
    @_variable
  
  compile: (shader) ->
    left = @left.compile shader
    op = @op
    right = @right && @right.compile shader
    
    @glsl 'Op', op, left, right
    