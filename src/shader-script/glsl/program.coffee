{Scope} = require 'shader-script/scope'

class exports.Program
  createClone = (program, entry_point, omit) ->
    clone = new exports.Program program.state
    clone.uniforms.push   uniform   for uniform   in program.uniforms
    clone.attributes.push attribute for attribute in program.attributes
    clone.varyings.push   varying   for varying   in program.varyings
    clone.variables.push  variable  for variable  in program.variables
    
    clone.entry_point = entry_point
    for node in program.nodes
      if node.is_function
        continue if node.name == omit
      clone.nodes.push node
    
    for name, func of program.functions
      if name == omit then continue
      else if name == entry_point then name = 'main'
      clone.functions[name] = func
      
    clone
  
  constructor: (@state = {}) ->
    @nodes = []
    @uniforms   = []
    @attributes = []
    @varyings   = []
    @variables  = []
    @functions  = {}
    @state.variables or= {}
    @state.scope or= new Scope()
    
  # Produces a string representation of the GLSL code which produced this
  # program.
  toSource: () ->
    # FIXME we should just be able to:
    # (node.toSource() for node in @nodes).join("\n")
    str = []
    for node in @nodes
      if node.is_function
        if node.name == @entry_point
          str.push node.toSource('main')
        else
          str.push node.toSource()
      else if node.is_comment or node.is_block
        str.push node.toSource()
      else
        str.push node.toSource() + ";"
    str.join("\n")
    
  # Creates a clone of this program, and then renames any 'vertex' function
  # to 'main' and removes any 'fragment' function. The `state` of the cloned
  # program is shared with this program and any other clones this program has
  # created.
  toVertexProgram: () -> createClone this, 'vertex', 'fragment'
    
  # Creates a clone of this program, and then renames any 'fragment' function
  # to 'main' and removes any 'vertex' function.
  toFragmentProgram: () -> createClone this, 'fragment', 'vertex'

  invoke: (function_name, params...) ->
    if @functions[function_name]
      @functions[function_name].invoke params...
    else
      throw new Error "no #{function_name} function found!"
    