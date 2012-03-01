class exports.Literal extends require('shader-script/nodes/base').Base
  name: "_literal"
  
  cast: (type) ->
    return @explicit_type = type if type == null or type is undefined
    current_type = @type()
    return if current_type == type
    
    # FIXME this is a mess. can it be made prettier?
    if current_type == 'float'
      if type == 'int'
        if /\.[^0]+$/.test @children[0]
          throw new Error "Cannot cast non-integer float to integer type"
      else if current_type != type
        throw new Error "Cannot cast #{current_type} to #{type}"
    else if current_type != type
      throw new Error "Cannot cast #{current_type} to #{type}"

    @explicit_type = type

  # all numbers are inferred as floats. If you want ints, create them explicitly
  # using a type constructor.
  type: ->
    return @explicit_type if @explicit_type
    if @children[0].match /^-?[0-9]+\.[0-9]+$/ then return 'float'
    if @children[0].match /^-?[0-9]+$/ then return 'float'
    if @children[0].match /^(true|false)$/ then return 'bool'
    
    throw new Error "Value type is not recognized: #{@children[0]}"
  
  compile: (program) ->
    value = @children[0]
    
    # represent inferred floats (which were input as ints) properly
    if @type() == 'float' and value.indexOf('.') == -1
      value += ".0"
      
    execute: -> eval value
    toSource: -> value
    