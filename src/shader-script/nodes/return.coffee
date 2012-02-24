class exports.Return extends require('shader-script/nodes/base').Base
  name: 'return'
  
  children: -> ['expression']
  
  type: (shader) ->
    if @expression then @expression.type(shader)
    else "void"
    
  compile: (shader) ->
    throw "Can't return outside of any function" unless shader.current_function
    
    shader.current_function.return_variable.set_type @type(shader)
    @glsl 'Return', @expression.compile shader
    