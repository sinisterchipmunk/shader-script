{Scope} = require 'shader-script/scope'

class exports.Program
  constructor: (@state = {}) ->
    # @nodes = []
    @functions  = {}
    @state.variables or= {}
    @state.scope or= new Scope()
    
  # Produces a string representation of the GLSL code which produced this
  # program.
  toSource: () ->
    @root_node.toSource().trim()
    
  invoke: (function_name, params...) ->
    if @functions[function_name]
      @functions[function_name].invoke params...
    else
      throw new Error "no #{function_name} function found!"
    