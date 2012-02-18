class exports.Program
  constructor: (@simulator) ->
    @uniforms = []
    @attributes = []
    @varyings = []
    @functions = {}
    @current_scope = {}
    
  invoke: (function_name) ->
    if @functions[function_name]
      @functions[function_name].invoke @simulator
    else
      throw new Error "no #{function_name} function found!"
    