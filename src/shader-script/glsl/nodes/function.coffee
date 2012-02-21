class exports.Function extends require('shader-script/nodes/base').Base
  name: '_function'
  
  children: -> ['return_type', 'name', 'arguments', 'block']
  
  compile: (program) ->
    compiled_arguments = (argument.compile program for argument in @arguments)
    compiled_block = @block.compile program
    compiled_name = @name.compile program
    return_type = @return_type
    
    execute: () ->
      name = compiled_name.execute()
      args = (arg.execute() for arg in compiled_arguments)
      
      program.functions[name] =
        return_type: return_type
        arguments: args
        invoke: () -> compiled_block.execute()
        toSource: (overriding_fn_name) => @toSource overriding_fn_name
      
    # overriding_fn_name allows us to rename functions as needed. This is mostly
    # so that fns like 'vertex' and 'fragment' can be easily renamed to 'main'
    # during compilation.
    toSource: (fn_name) ->
      fn_name or= compiled_name.toSource()
      arg_list = (arg.toSource() for arg in compiled_arguments).join ', '
      "#{return_type} #{fn_name}(#{arg_list}) {\n" +
      compiled_block.toSource() + 
      "}"
      