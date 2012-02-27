{NameRegistry} = require 'shader-script/name_registry'

exports.Definition = class Definition
  constructor: (options = {}) ->
    @dependents = []
    @assign options
  
  type: -> @explicit_type or @inferred_type()
  
  as_options: ->
    type: @type()
    name: @name
    qualified_name: @qualified_name
    builtin: @builtin
    dependents: @dependents
    value: @value
  
  inferred_type: ->
    for dep in @dependents
      type = dep.type()
      return type if type
    undefined
    
  set_type: (type) ->
    if type
      current_type = @type()
      if current_type and type != current_type
        throw new Error(
          "Variable '#{@qualified_name}' redefined with conflicting type: #{@type()} redefined as #{type}"
        )
      @explicit_type = type if type
    
  add_dependent: (dep) ->
    @dependents.push dep
  
  assign: (options) ->
    @name = options.name if options.name
    @qualified_name = options.qualified_name if options.qualified_name
    @builtin = options.builtin if options.builtin
    @value = options.value
    
    if options.type
      @set_type options.type
    if options.dependents
      @add_dependent dependent for dependent in options.dependents
    if options.dependent
      @add_dependent options.dependent
    

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
    
  all_qualifiers: ->
    result = [@qualifier(false)]
    for id, subscope of @subscopes
      result = result.concat subscope.all_qualifiers()
    result
    
  all_definitions: ->
    result = {}
    arr = result[this.qualifier(false)] = []
    arr.push def.qualified_name for name, def of @definitions
    for id, subscope of @subscopes
      arr = arr.concat subscope.all_definitions()
    result
    
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
      
  pop: ->
    if @current_subscope
      @current_subscope.pop()
    else if @parent
      @parent.assume @parent
    else
      this
      
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
    @delegate -> @define_within name, options
    
  define_within: (name, options = {}) ->
    options.name or= name
    def = @lookup name, true
    if def
      def.assign options
    else
      options.qualified_name = @qualifier() + "." + name
      def = new Definition options

    @definitions[name] = def
        
  # searches for the name within only this scope and its subscopes.
  # The name must be fully qualified beginning with this scope,
  # or defined directly within this scope (not its subscopes).
  # If not found, null is returned.
  # 
  # If the name matches a subscope, but not a definition, that subscope
  # will be returned instead.
  find: (name) ->
    if name instanceof Array then qualifiers = name
    else qualifiers = name.split(/\./)
    
    if qualifiers.length == 1
      return @definitions[qualifiers[0]] || @find_subscope(qualifiers[0])
    else
      scope_name = qualifiers.shift()
      if subscope = @find_subscope(scope_name)
        return subscope.find qualifiers
      else
        if scope_name == "#{@name}"
          return @find qualifiers # search again without this scope's name
      
    null
  
  # Returns the named scope directly under this scope.
  find_subscope: (scope_name) ->
    for id, subscope of @subscopes
      if subscope.name == scope_name then return subscope
    
  lookup: (name, silent = false) ->
    @delegate ->
      target = this
      while target
        if result = target.find name
          return result
        target = target.parent

      if silent then null
      else throw new Error "Variable '#{name}' is not defined in this scope"
      
  # Calls the callback in the context of the current subscope.
  # Meant for internal use only.
  delegate: (callback) ->
    callback.call @current_subscope || this
