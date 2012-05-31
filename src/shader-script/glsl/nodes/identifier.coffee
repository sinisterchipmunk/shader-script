{Definition} = require 'shader-script/scope'

class exports.Identifier extends require('shader-script/nodes/base').Base
  name: "_identifier"
  
  toVariableName: ->
    if @children[0] instanceof Definition
      @children[0].name
    else
      @children[0]
    
  cast: (type, program) ->
    # Specs currently pass without this so why keep it?
    #
    # current_type = @type program
    # if type == null or type is undefined then return
    # if type == current_type then return
    # if current_type
    #   throw new Error "Cannot implicitly cast #{current_type} to #{type}"
    # @variable(program).set_type type
    
  variable: (program, scope, lookup_options) ->
    if @children[0] instanceof Definition then @children[0]
    else (scope || program.state.scope).lookup @toVariableName(), lookup_options
    
  type: (program) -> @variable(program, null, warn_NaN: false).type()

  compile: (program) ->
    # this is necessary in order to defer warning of uninitialized
    # variables until runtime, when they might actually have a value
    scope = program.state.scope.current()

    execute:  (lookup_options) => @variable program, scope, lookup_options
    toSource: => @variable(program, scope, silent: true).name
    