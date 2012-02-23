{NameRegistry} = require 'shader-script/name_registry'

# Basically, just push scopes together / pop them apart, and then define()
# and lookup() variables within them.
#
#   scope = new Scope()
#   scope.push 'main'                         # global -> main
#   scope.define 'x', type: 'float'           # global -> main
#   scope.lookup 'x'                          # returns {name: 'x', type: 'float', qualified_name: 'main.x'}
#   scope.push 'iter'                         # global -> main -> iter
#   scope.define 'i', type: 'int'             # global -> main -> iter
#   scope.lookup 'i'                          # returns {name: 'i', type: 'int', qualified_name: 'main.iter.i'}
#   scope.pop()                               # global -> main
#   scope.lookup 'i'                          # error! 'i' is now out of scope
# 
# Scope's `push` and `pop` methods can be chained together for ease of use.
#
# Chaining Examples:
#
#    scope = new Scope('a')
#      scope.push('b')
#        scope.push('c').pop()
#        scope.push('d').pop()
#      scope.pop()
#      scope.push('e')
#        scope.push('f').pop()
#        scope.push('g').pop()
#      scope.pop()
#    scope.pop() # at root level this actually does nothing
#
exports.Scope = class Scope
  constructor: (@name = null, @parent = null) ->
    @subscopes = {}
    @definitions = {}
    @registry = new NameRegistry()
    
  qualifier: (delegate_to_subscope = true) ->
    if @current_subscope and delegate_to_subscope
      @current_subscope.qualifier()
    else
      prefix = if @parent then @parent.qualifier(false) + "." else ""
      return prefix + @name
  
  push: (name) ->
    if @current_subscope
      @assume @current_subscope.push(name)
    else
      @assume @subscopes[@registry.define(name)] = new Scope name, this
      
  # Assumes the given subscope, and then tells its parent to do the same.
  # Returns the subscope itself for chaining.
  assume: (subscope) ->
    if subscope is this
      @current_subscope = null
    else
      @current_subscope = subscope
    @parent.assume subscope if @parent
    @current_subscope || this
    
  define: (name, options = {}) ->
    @delegate ->
      options.name or= name
      def = @lookup name, true
      if def
        options.type or= def.type
        if def.type and options.type != def.type
          throw new Error "Variable '#{name}' redefined with conflicting type: #{def.type} redefined as #{options.type}"

        options.scope = def.scope
        options.scope.definitions[name] = options
      else
        options.qualified_name = @qualifier() + "." + name
        options.scope = this
        @definitions[name] = options
      
  lookup: (name, silent = false) ->
    @delegate ->
      target = this
      while target
        if target.definitions[name] then return target.definitions[name]
        target = target.parent
      if silent then null
      else throw new Error "Variable '#{name}' is not defined in this scope"
      
  # Calls the callback in the context of the current subscope.
  # Meant for internal use only.
  delegate: (callback) ->
    callback.call @current_subscope || this
  
  pop: ->
    if @current_subscope
      @current_subscope.pop()
    else if @parent
      @parent.assume @parent
    else
      this
