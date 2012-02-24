{Scope} = require 'shader-script/scope'

class exports.Program
  createClone = (program, entry_point, omit) ->
    clone = new exports.Program program.state
    clone.uniforms.push   uniform   for uniform   in program.uniforms
    clone.attributes.push attribute for attribute in program.attributes
    clone.varyings.push   varying   for varying   in program.varyings
    clone.variables.push  variable  for variable  in program.variables
    
    for name, func of program.functions
      if name == omit then continue
      else if name == entry_point then name = 'main'
      clone.functions[name] = func
      
    clone
  
  constructor: (@state = {}) ->
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
    uniforms   = ("uniform   #{unif.type} #{unif.name};" for unif in @uniforms).join("\n")
    attributes = ("attribute #{attr.type} #{attr.name};" for attr in @attributes).join("\n")
    varyings   = ("varying   #{vary.type} #{vary.name};" for vary in @varyings).join("\n")
    variables  = ("#{vari.type} #{vari.name};"           for vari in @variables).join("\n")
  
    functions  = []
    for name, fn of @functions
      functions.push fn.toSource name
    
    [ uniforms, attributes, varyings, variables, functions.join("\n\n") ].join("\n\n").trim()
    
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
    