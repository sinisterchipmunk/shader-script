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
  constructor: (type, name, @qualified_name) ->
    if @qualified_name then throw new Error "don't use qualified name, it's left over from an earlier build"
    if arguments.length == 1
      @variable = arguments[0]
      super()
    else
      super type, name
  
  children: -> ['type', 'name']
  
  compile: (program) ->
    program.state.variables or= {}
    name = if @variable then @variable.name else @name.toVariableName()
  
    variable = program.state.scope.define(name, type: if @variable then @variable.type() else @type)
    variable.add_dependent @variable if @variable
    variable.value = Number.NaN if variable.value is undefined

    qualifier = program.state.scope.qualifier()
    if qualifier == 'root.block' or qualifier == 'root.block.main.block'
      # provides convenient access to "important" variables
      program.state.variables[name] = variable

    execute: => variable.value
    toSource: =>
      "#{variable.type()} #{variable.name}"
        
    variable: variable
    