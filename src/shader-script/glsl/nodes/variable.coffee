class exports.Variable extends require('shader-script/nodes/base').Base
  name: '_variable'
  
  children: -> ['type', 'name']
  
  compile: (program) ->
    name = @name.compile program
    
    program.state.scope[name] =
      type: @type
      name: name
      value: Number.NaN

    execute: -> program.state.scope[name].value
    toSource: -> "#{type} #{name}"
    