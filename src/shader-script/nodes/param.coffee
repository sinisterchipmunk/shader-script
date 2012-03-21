{Definition} = require 'shader-script/scope'

class exports.Param extends require('shader-script/nodes/base').Base
  name: 'param'
  children: -> ['name', 'default_value']
  
  constructor: (name, default_value, @param_qualifier = 'in') -> super name, default_value
  
  toVariableName: -> @name.toVariableName()
  
  variable: -> @_variable or= new Definition
  
  set_type: (type) -> @variable().set_type(type)
  
  type: () -> @variable().type()
    
  compile: (shader) ->
    varn = @toVariableName()
    variable = shader.scope.define varn, dependent: @variable(), param_qualifier: @param_qualifier
    @glsl 'Variable', variable
