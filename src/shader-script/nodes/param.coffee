{Definition} = require 'shader-script/scope'

class exports.Param extends require('shader-script/nodes/base').Base
  name: 'param'
  children: -> ['name', 'default_value']
  
  toVariableName: -> @name.toVariableName()
  
  variable: -> @_variable or= new Definition
  
  set_type: (type) -> @variable().set_type(type)
  
  type: () -> @variable().type()
    
  compile: (shader) ->
    varn = @toVariableName()
    variable = shader.scope.define(varn, dependent: @variable())
    result = @glsl 'Variable', variable
    # functions use this for mapping inferred types
    result.variable = variable
    result
