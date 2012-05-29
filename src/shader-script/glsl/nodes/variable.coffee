class exports.Variable extends require('shader-script/nodes/base').Base
  name: '_variable'
  
  # Two ways to build a Variable node. The primary way is the method used when
  # parsing a standard GLSL file:
  #   new Variable('float', 'name_of_var')
  #
  # Second option is used when constructing GLSL nodes from shaderscript which
  # will later be decompiled into GLSL source code:
  #   new Variable(scoped_variable_instance)
  # 
  # where scoped_variable_instance is an instance of `Definition` from
  # `shader-script/scope`.
  #
  constructor: (type, name, @value, @param_qualifier = null) ->
    if arguments.length == 1
      @variable = arguments[0]
      super()
    else
      super type, name
  
  children: -> ['type', 'name']
  
  compile: (program) ->
    program.state.variables or= {}
    name = if @variable then @variable.name else @name.toVariableName()
  
    variable = program.state.scope.define(name, if @variable then @variable.as_options() else type: @type)
    variable.param_qualifier or= @param_qualifier
    variable.add_dependent @variable if @variable
    compiled_value = @value?.compile program
    variable.value = Number.NaN if variable.value is undefined

    qualifier = program.state.scope.qualifier()
    if qualifier == 'root.block' or qualifier == 'root.block.main.block'
      # provides convenient access to "important" variables
      program.state.variables[name] = variable
      
    execute: =>
      variable.value = compiled_value.execute().value if compiled_value
      variable
    toSource: =>
      if compiled_value
        "#{variable.toSource()} = #{compiled_value.toSource()}"
      else
        variable.toSource()
    # functions use this for mapping inferred types
    variable: variable
    