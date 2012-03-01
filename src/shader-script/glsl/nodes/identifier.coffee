{Definition} = require 'shader-script/scope'

class exports.Identifier extends require('shader-script/nodes/base').Base
  name: "_identifier"
  
  toVariableName: ->
    if @children[0] instanceof Definition
      @children[0].name
    else
      @children[0]
    
  cast: (type, program) ->
    current_type = @type program
    if type == null or type is undefined then return
    if type == current_type then return
    if current_type
      throw new Error "Cannot implicitly cast #{current_type} to #{type}"
    @variable(program).set_type type
    
  variable: (program) ->
    if @children[0] instanceof Definition then @children[0]
    else program.state.scope.lookup @toVariableName()
    
  type: (program) -> @variable(program).type()

  compile: (program) ->
    variable = @variable program
    execute:  => variable.value
    toSource: => variable.name
    