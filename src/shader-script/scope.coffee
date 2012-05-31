{NameRegistry} = require 'shader-script/name_registry'

exports.Definition = Definition = require('shader-script/definition').Definition

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
  constructor: (@name = "root", @parent = null) ->
    @subscopes = {}
    @definitions = {}
    @warn_NaN = (if @parent?.warn_NaN is true then true else false)
    @registry = new NameRegistry()
    
  # Causes calls to #define to create a variable instance, but
  # not save it to this scope; and causes calls to #lookup which
  # reference variables that are not defined to return new instances
  # of Definition representing the missing variable, but does not save
  # those instances to this scope.
  lock: -> @delegate -> @locked = true

  # Reverts the #lock method, so that errors are once again raised
  # by #lookup and variables are once again saved by #define.
  unlock: -> @delegate -> @locked = false

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
      sub = subscope.all_definitions()
      for qualifier, array of sub
        result[qualifier] = array
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
    if def = @lookup(name, silent: true)
      def.assign options
      return def
    else
      options.qualified_name = @qualifier() + "." + name
      def = new Definition options
    
    return def if @locked
    @definitions[name] = def
    
  # Returns the current scope instance. Equivalent to `scope.delegate -> this`
  current: -> @delegate -> this
        
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
    
  lookup: (name, options = {}) ->
    throw new Error(typeof options) unless typeof options is 'object'
    options.warn_NaN = @warn_NaN unless options.warn_NaN is true
    @delegate ->
      target = this
      while target
        if result = target.find name
          if options.warn_NaN
            warn = false
            if result.value?.length then ((warn = true if isNaN(v) or v is undefined) for v in result.value)
            else if isNaN(result.value) or result.value is undefined then warn = true
            if warn
              console.log "Warning: variable `#{result.name}` has NaN or undefined values"
          
          return result
        target = target.parent

      return new Definition name: name if @locked
      if options.silent then null
      else throw new Error "Variable '#{name}' is not defined in this scope"
      
  # Calls the callback in the context of the current subscope.
  # Meant for internal use only.
  delegate: (callback) ->
    callback.call @current_subscope || this
