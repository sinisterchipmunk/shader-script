{Program} = require('shader-script/glsl/program')

class exports.Root extends require('shader-script/nodes/base').Base
  name: "_root"
  
  children: -> ['block']
  
  # Accepts an optional object representing program state. If omitted,
  # a new state will be created. The state is shared between the vertex
  # and fragment programs, where applicable. The state can also be an 
  # instance of Program.
  compile: (state = {}) ->
    # the compiled result will be internally linked to the following
    # Program. This makes it safe to call compile more than once, as it
    # will simply recompile against brand-new programs.
    if state instanceof Program
      [program, state] = [state, state.state]
    else
      program = new Program state
    
    # build the root block node
    @block.options.indent = no
    block_node = @block.compile program
    
    program.root_node = block_node
    
    # now we need to execute the root block. The only code that this
    # actually executes is meta-code, like variable declarations and
    # function definitions. It's an important step, or else `main`
    # won't get created.
    block_node.execute()
  
    # we've been careful not to maintain a reference to the root node
    # itself, because it's important not to execute the root node twice.
    # Function nodes don't have this restriction.
    program
    