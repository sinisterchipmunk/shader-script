{Shader} = require 'shader-script/shader'

class exports.Root extends require('./base').Base
  name: "root"

  constructor: (@block) ->
    super @block
  
  # Accepts a program (shader-script/glsl/program) to compile against.
  compile: (program) ->
    shader = new Shader()
    # shader.body = @block.compile shader
    # shader.to_json

    # First pass - convert shaderscript into GLSL source nodes and 
    # then extract vertex and fragment mains
    root_node = @block.compile shader
    # vertex_nodes = (if node instanceof GlslFunction and node.name )
    # fragment_nodes = 
    
    # Second pass - compile GLSL source nodes into executable nodes
    # (The return value of executable nodes contains two public API
    #  methods: `execute` which takes a Simulator instance, and
    #  `toSource` which takes no arguments and produces raw GLSL.)
    # glsl_nodes =
    #   vertex:   (node.compile program for node in vertex_nodes)
    #   fragment: (node.compile program for node in fragment_nodes)
    compiled_node = root_node.compile program
    vertex: compiled_node
    fragment: compiled_node
    