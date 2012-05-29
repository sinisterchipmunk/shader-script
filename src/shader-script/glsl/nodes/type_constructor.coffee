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
      args = []
      for arg in compiled_args
        arg_value = arg.execute().value
        if arg_value.length
          args.push v for v in arg_value
        else args.push arg_value
      
      switch type
        when 'vec2', 'ivec2', 'bvec2' then vector_length = 2
        when 'vec3', 'ivec3', 'bvec3' then vector_length = 3
        when 'vec4', 'ivec4', 'bvec4' then vector_length = 4
        else
          if args.length == 1 then return @definition type: type, value: args[0]
          else return @definition type: type, value: args
        
      if args.length >= vector_length then args = args[0...vector_length]
      else args.push 0 while args.length < vector_length
      @definition type: type, value: args
      
    toSource: () =>
      "#{@type program}(#{(arg.toSource() for arg in compiled_args).join ', '})"
    