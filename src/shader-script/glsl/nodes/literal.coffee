class exports.Literal extends require('shader-script/nodes/base').Base
  name: "_literal"
  
  # all numbers are inferred as floats. If you want ints, create them explicitly
  # using a type constructor.
  type: ->
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
    