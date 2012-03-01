# Base class for all nodes
exports.Base = class Base
  glsl_nodes = null
  required_methods = [ 'name', 'compile' ]
  
  glsl: (node_name, args...) ->
    glsl_nodes or= require('shader-script/glsl/nodes')
    new glsl_nodes[node_name] args...
    
  constructor: (children...) ->
    for method_name in required_methods
      throw new Error("Method '#{method_name}' is not defined in #{this}") unless this[method_name]
    
    @name = @name

    child_names = @children() if @children
    for child in children
      break if !child_names || child_names.length == 0
      name = child_names.shift()
      this[name] = child

    @children = children
    