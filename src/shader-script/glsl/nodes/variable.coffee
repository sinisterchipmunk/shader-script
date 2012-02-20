class exports.Variable extends require('shader-script/nodes/base').Base
  name: 'variable'
  
  children: -> ['type', 'name']
  
  compile: (program) ->
    name = @name.compile program
    
    program.current_scope[name] =
      type: @type
      name: name
      value: Number.NaN

    execute: => program.current_scope[name].value
    