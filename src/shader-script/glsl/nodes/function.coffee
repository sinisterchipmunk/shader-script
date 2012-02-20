class exports.Function extends require('shader-script/nodes/base').Base
  name: 'function'
  
  children: -> ['return_type', 'name', 'arguments', 'block']
  
  compile: (program) ->
    compiled_arguments = (argument.compile program for argument in @arguments)
    compiled_block = @block.compile program
    
    program.functions[@name.compile program] =
      return_type: @return_type
      arguments: compiled_arguments
      invoke: (sim) -> line.execute sim for line in compiled_block
    