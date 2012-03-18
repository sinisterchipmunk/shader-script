class exports.TypeConstructor extends require('shader-script/nodes/base').Base
  name: "_type_constructor"
  
  children: -> [ 'cast_type', 'arguments' ]
  
  cast: (type, shader) ->
    return if !type
    @cast_type = type
    
  type: (shader) ->
    if typeof(@cast_type) == 'string'
      @cast_type
    else @cast_type.type(shader)
  
  compile: (program) ->
    compiled_args = (arg.compile program for arg in @arguments)
    execute: (state) =>
      args = (arg.execute() for arg in compiled_args)
      switch @type()
        when 'vec2', 'ivec2', 'bvec2' then (if args.length >= 2 then args[0..1] else args)
        when 'vec3', 'ivec3', 'bvec3' then (if args.length >= 3 then args[0..2] else args)
        when 'vec4', 'ivec4', 'bvec4' then (if args.length >= 4 then args[0..3] else args)
        else args
    toSource: () => "#{@type()}(#{(arg.toSource() for arg in compiled_args).join ', '})"
    