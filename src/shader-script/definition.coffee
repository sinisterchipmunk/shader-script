# Originally meant to encapsulate variable definitions, `Definition` has
# evolved into a sort of general-purpose tracking state. Numerous classes
# use it internally. Its primary purpose is to defer identification of a
# variable or method's type as long as possible so that when its type is
# inferred from its context, the most accurate inference possible can be
# made by looking at all the other definitions depended upon by this one.
#
# It is now also used by the raw GLSL parser and through it, the simulator,
# in order to track variable values, intelligently call overloaded functions,
# and maintain a proper scope so that multiple variables with the same name
# can exist in separate scopes.
#
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
    

