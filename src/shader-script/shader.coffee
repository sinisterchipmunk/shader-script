{Scope} = require 'shader-script/scope'

class exports.Shader
  constructor: (state) ->
    @scope = state.scope or= new Scope()
    @functions = {}
    @fn_types = {}
    
  # Invoked whenever a function is compiled. Receives the name
  # of the function and a callback method. If any types
  # have been noted for the function, they will be passed into
  # the callback.
  define_function: (name, callback) ->
    @functions[name] = callback
    if @fn_types[name]
      for types in @fn_types[name]
        callback types
    
  # Invoked whenever a function call is discovered. Receives the
  # function name, the argument types, and output variable (if any).
  # If the function has already been compiled, its types are verified
  # and updated where necessary. If not, the types are logged, and
  # sent to the function when it is compiled.
  mark_function: (name, types, dependent_variable = null) ->
    if @functions[name]
      @functions[name] types
    else
      @fn_types[name] or= []
      @fn_types[name].push types
