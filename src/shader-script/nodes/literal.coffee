class exports.Literal extends require("./base").Base
  name: "literal"
  
  type: ->
    if @children[0].match /^-?[0-9]+\.[0-9]+$/ then return 'float'
    if @children[0].match /^-?[0-9]+$/ then return 'int'
    if @children[0].match /^(true|false)$/ then return 'bool'
    
    throw new Error "Value type is not recognized: #{@children[0]}"
  
  compile: ->
    @glsl 'Literal', @children...
  