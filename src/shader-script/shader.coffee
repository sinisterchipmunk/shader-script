{Scope} = require 'shader-script/scope'
{Program} = require 'shader-script/glsl/program'

class exports.Shader
  constructor: (state) ->
    @scope = state.scope or= new Scope()
    @functions = {}
    @fn_args = {}
    
    # define built-in variables
    for name, builtins of Program.prototype.builtins._variables
      for varname, definition of builtins
        @scope.define_within varname, definition.as_options()
  
  # Invoked whenever a function is compiled. Receives the name
  # of the function and a callback method. If any args
  # have been noted for the function, they will be passed into
  # the callback. Also makes a note of the return variable so
  # that callers can hook into it in order to infer type within the
  # calling context.
  define_function: (name, return_variable, callback) ->
    @functions[name] =
      return_variable: return_variable
      callback: callback
      
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
      @functions[name].callback args
      if dependent_variable
        dependent_variable.add_dependent @functions[name].return_variable
    else if builtin = Program.prototype.builtins[name]
      # builtin the functions have explicit types, so we don't need
      # to worry about the callback. We only need to deal with the
      # return variable.
      if dependent_variable
        if builtin.return_type()
          dependent_variable.set_type builtin.return_type()
        else
          # if the extension has no type, its type defaults to the type of
          # its first parameter.
          if args.length
            if typeof(args[0]) == 'string'
              dependent_variable.set_type args[0]
            else
              dependent_variable.add_dependent args[0]
    else
      @fn_args[name] or= []
      @fn_args[name].push args
