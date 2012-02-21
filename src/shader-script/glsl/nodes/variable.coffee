class exports.Variable extends require('shader-script/nodes/base').Base
  name: '_variable'
  
  children: -> ['type', 'name']
  
  compile: (program) ->
    name = @name.compile program
    type = @type
    
    program.state.variables or= {}
    program.state.variables[name.execute()] =
      type: type
      name: name.execute()
      value: Number.NaN

    execute: => program.state.variables[name.execute()].value
    toSource: => "#{type} #{name.toSource()}"
    