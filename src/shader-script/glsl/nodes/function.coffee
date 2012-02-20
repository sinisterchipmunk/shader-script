class exports.Function extends require('shader-script/nodes/base').Base
  name: '_function'
  
  children: -> ['return_type', 'name', 'arguments', 'block']
  
  compile: (program) ->
    compiled_arguments = (argument.compile program for argument in @arguments)
    compiled_block = @block.compile program
    compiled_name = @name.compile program
    return_type = @return_type
    
    execute: (sim) ->
      name = compiled_name.execute sim
      args = (arg.execute sim for arg in compiled_arguments)
      
      program.functions[name] =
        return_type: return_type
        arguments: args
        invoke: (sim) -> compiled_block.execute sim
      
    toSource: () ->
      arg_list = (arg.toSource() for arg in compiled_arguments).join ', '
      "#{return_type} #{compiled_name.toSource()}(#{arg_list}) {\n" +
      compiled_block.toSource() + 
      "}"
      