class exports.Variable extends require('shader-script/nodes/base').Base
  name: '_variable'
  
  constructor: (type, name, @qualified_name) ->
    super type, name
  
  children: -> ['type', 'name']
  
  compile: (program) ->
    name = @name.toVariableName()
    if @qualified_name
      variable = program.state.scope.lookup(@qualified_name)
    else
      variable = program.state.scope.define(name, type: @type)

    variable.value = Number.NaN
    program.state.variables or= {}
    program.state.variables[name] = variable

    execute: => variable.value
    toSource: => "#{variable.type()} #{variable.name}"
    variable: variable
    