class exports.Function extends require('shader-script/nodes/base').Base
  name: '_function'
  
  children: -> ['return_type', 'name', 'arguments', 'block']
  
  type: ->
    if @return_type and @return_type.type
      @return_type.type()
    else @return_type
    
  cast: (type) ->
    if @return_type and @return_type.type
      @return_type.set_type type
  
  compile: (program) ->
    compiled_name = @name.toVariableName()

    program.state.scope.push compiled_name

    compiled_arguments = (argument.compile program for argument in @arguments)
    compiled_block = @block.compile program
    originator = this
    
    program.state.scope.pop()
    
    execute: () ->
      name = compiled_name
      args = (arg.variable for arg in compiled_arguments)
      
      program.functions[name] =
        return_type: -> originator.type()
        arguments: args
        is_function: true
        invoke: (params...) ->
          try
            if args.length != params.length
              throw new Error "Incorrect argument count (#{params.length} for #{args.length})"
            for i in [0...params.length]
              args[i].value = params[i].execute()
            compiled_block.execute()
          catch e
            if e.is_return
              return e.result
            else throw e
        toSource: (overriding_fn_name) => @toSource overriding_fn_name
      
    is_function: true
    
    name: compiled_name
    
    # overriding_fn_name allows us to rename functions as needed. This is mostly
    # so that fns like 'vertex' and 'fragment' can be easily renamed to 'main'
    # during compilation.
    toSource: (fn_name) =>
      fn_name or= compiled_name
      arg_list = (arg.toSource() for arg in compiled_arguments).join ', '
      "#{@type() || 'void'} #{fn_name}(#{arg_list}) {\n" +
      compiled_block.toSource() + 
      "}"
      