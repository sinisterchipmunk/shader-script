# Base class for all nodes
exports.Base = class Base
  required_methods = [ 'name', 'compile' ]
  
  root: -> @parent && @parent.root && @parent.root() || this
  
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
    