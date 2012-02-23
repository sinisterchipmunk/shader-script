class exports.Literal extends require('shader-script/nodes/base').Base
  name: "_literal"
  
  type: ->
    if @children[0].match /^-?[0-9]+\.[0-9]+$/ then return 'float'
    if @children[0].match /^-?[0-9]+$/ then return 'int'
    if @children[0].match /^(true|false)$/ then return 'bool'
    
    throw new Error "Value type is not recognized: #{@children[0]}"
  
  compile: (program) ->
    value = @children[0]
    execute: -> eval value
    toSource: -> value
    