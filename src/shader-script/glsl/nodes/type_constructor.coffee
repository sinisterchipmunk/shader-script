class exports.TypeConstructor extends require('shader-script/nodes/base').Base
  name: "_type_constructor"
  
  children: -> [ 'cast_type', 'arguments' ]
  
  cast: (type, shader) ->
    return if !type
    
  type: (shader) ->
    if typeof(@cast_type) == 'string'
      @cast_type
    else @cast_type.type(shader)
  
  compile: (program) ->
    compiled_args = (arg.compile program for arg in @arguments)
    execute: (state) -> arg.execute() for arg in compiled_args
    toSource: () => "#{@type()}(#{(arg.toSource() for arg in compiled_args).join ', '})"
    