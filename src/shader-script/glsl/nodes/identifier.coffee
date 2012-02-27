{Definition} = require 'shader-script/scope'

class exports.Identifier extends require('shader-script/nodes/base').Base
  name: "_identifier"
  
  toVariableName: ->
    if @children[0] instanceof Definition
      @children[0].name
    else
      @children[0]
    
  compile: (program) ->
    if @children[0] instanceof Definition
      variable = @children[0]
    else
      # console.log @children[0], program.state.scope.all_definitions()
      variable = program.state.scope.lookup(@toVariableName())
    
    execute:  => variable.value
    toSource: => variable.name
    