{Shader} = require 'shader-script/shader'

class exports.Root extends require('shader-script/nodes/base').Base
  name: "root"

  constructor: (@block) ->
    super @block
  
  # Accepts an optional object representing program state. If omitted,
  # a new state will be created. The state is shared between the vertex
  # and fragment programs, where applicable.
  compile: (state = {}) ->
    shader = new Shader state

    # First pass - convert shaderscript into GLSL source nodes and 
    # then extract vertex and fragment mains
    shader.compile_target = 'vertex'
    vertex_root_node = @glsl 'Root', @block.compile shader
    
    shader.compile_target = 'fragment'
    fragment_root_node = @glsl 'Root', @block.compile shader
    
    # Second pass - compile GLSL source nodes into executable nodes
    # The compilation phase here returns an instance of
    # Program (shader-script/glsl/program).
    vertex:   vertex_root_node.compile   state
    fragment: fragment_root_node.compile state
