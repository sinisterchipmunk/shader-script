{Scope} = require 'shader-script/scope'

class exports.Shader
  constructor: (state) ->
    @scope = state.scope or= new Scope()
    @functions = {}
    @fn_args = {}
    
  # Invoked whenever a function is compiled. Receives the name
  # of the function and a callback method. If any args
  # have been noted for the function, they will be passed into
  # the callback.
  define_function: (name, callback) ->
    @functions[name] = callback
    if @fn_args[name]
      for args in @fn_args[name]
        callback args
    
  # Invoked whenever a function call is discovered. Receives the
  # function name, the argument args, and output variable (if any).
  # If the function has already been compiled, its args are verified
  # and updated where necessary. If not, the args are logged, and
  # sent to the function when it is compiled.
  mark_function: (name, args, dependent_variable = null) ->
    if @functions[name]
      @functions[name] args
    else
      @fn_args[name] or= []
      @fn_args[name].push args
