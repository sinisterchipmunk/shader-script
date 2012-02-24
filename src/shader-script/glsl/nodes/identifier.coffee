class exports.Identifier extends require('shader-script/nodes/base').Base
  name: "_identifier"
  
  toVariableName: ->
    @children[0]
    
  compile: (program) ->
    execute: =>
      if program.state.variables[@children[0]]
        program.state.variables[@children[0]].value
      else
        throw new Error "Undefined variable: #{@children[0]}"
    toSource: => @children[0]
    