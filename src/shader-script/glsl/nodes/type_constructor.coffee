class exports.TypeConstructor extends require('shader-script/nodes/base').Base
  name: "_type_constructor"
  
  constructor: (@type, @arguments) -> super()
  
  compile: (program) ->
    compiled_args = (arg.compile program for arg in @arguments)
    
    validate_length = (len) =>
      if compiled_args.length != len
        new Error("Incorrect argument count for #{@type} constructor")
    
    switch type = @type
      when 'void' then throw new Error("Can't cast to void")
      when 'bool', 'int', 'float'
        validate_length 1
        compiled_args = compiled_args[0]
      when 'vec2', 'ivec2', 'bvec2'
        validate_length 2
      when 'vec3', 'ivec3', 'bvec3'
        validate_length 3
      when 'vec4', 'ivec4', 'bvec4'
        validate_length 4
      else throw new Error "Unexpected type constructor: #{@type}"
      
    execute: (sim) -> arg.execute sim for arg in compiled_args
    toSource: () -> "#{type}(#{(arg.toSource() for arg in compiled_args).join ', '})"
    