class exports.TypeConstructor extends require('shader-script/nodes/base').Base
  name: "_type_constructor"
  
  children: -> [ 'cast_type', 'arguments' ]
  
  variable: ->
      
  cast: (type, shader) ->
    return if !type
    @cast_type = type
    
  type: (shader) ->
    if typeof(@cast_type) == 'string'
      @cast_type
    else @cast_type.type(shader)
  
  compile: (program) ->
    compiled_args = (arg.compile program for arg in @arguments)
    type = @type()
    
    execute: (state) =>
      args = (arg.execute().value for arg in compiled_args)
      switch type
        when 'vec2', 'ivec2', 'bvec2' then vector_length = 2
        when 'vec3', 'ivec3', 'bvec3' then vector_length = 3
        when 'vec4', 'ivec4', 'bvec4' then vector_length = 4
        else return args
        
      if args.length >= vector_length then args = args[0...vector_length]
      else args.push 0 while args.length < vector_length
      @definition type: type, value: args
      
    toSource: () => "#{@type()}(#{(arg.toSource() for arg in compiled_args).join ', '})"
    