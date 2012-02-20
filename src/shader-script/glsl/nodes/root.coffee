class exports.Root extends require('shader-script/nodes/base').Base
  name: "_root"
  
  children: -> ['block']
  
  compile: (program) ->
    block_node = @block.compile(program)
    
    # now we need to execute the root block. The only code that this actually executes is meta-code,
    # like variable declarations and function definitions. It's an important step, or else `main`
    # won't get created.
    block_node.execute program
    
    # to keep the block node from being executed twice by mistake
    program
    