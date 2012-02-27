class exports.Identifier extends require('shader-script/nodes/base').Base
  name: "_identifier"
  
  toVariableName: ->
    @children[0]
    
  compile: (program) ->
    execute: =>
      name = @children[0]
      if program.state.variables[name]
        program.state.variables[name].value
      else
        program.state.variables[name] = program.state.scope.lookup(name).as_options()
        program.state.variables[name].value = Number.NaN if program.state.variables[name].value is undefined
        program.state.variables[name].value
    toSource: => @children[0]
    