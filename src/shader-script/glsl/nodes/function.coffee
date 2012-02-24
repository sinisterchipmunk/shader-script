class exports.Function extends require('shader-script/nodes/base').Base
  name: '_function'
  
  children: -> ['return_type', 'name', 'arguments', 'block']
  
  type: -> @return_type
  
  compile: (program) ->
    compiled_arguments = (argument.compile program for argument in @arguments)
    compiled_block = @block.compile program
    compiled_name = @name.toVariableName()
    
    execute: () ->
      name = compiled_name
      args = (arg.variable for arg in compiled_arguments)
      
      program.functions[name] =
        # return_type: @type()
        arguments: args
        invoke: (params...) ->
          if args.length != params.length
            throw new Error "Incorrect argument count (#{params.length} for #{args.length})"
          for i in [0...params.length]
            args[i].value = params[i].execute()
          compiled_block.execute()
        toSource: (overriding_fn_name) => @toSource overriding_fn_name
      
    # overriding_fn_name allows us to rename functions as needed. This is mostly
    # so that fns like 'vertex' and 'fragment' can be easily renamed to 'main'
    # during compilation.
    toSource: (fn_name) =>
      fn_name or= compiled_name
      arg_list = (arg.toSource() for arg in compiled_arguments).join ', '
      "#{@type()} #{fn_name}(#{arg_list}) {\n" +
      compiled_block.toSource() + 
      "}"
      