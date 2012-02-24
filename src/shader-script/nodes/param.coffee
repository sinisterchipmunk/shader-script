class exports.Param extends require('shader-script/nodes/base').Base
  name: 'param'
  children: -> ['name', 'default_value']
  
  toVariableName: -> @name.toVariableName()
    
  compile: (shader) ->
    varn = @toVariableName()
    variable = shader.scope.define(varn)
    result = @glsl 'Variable', null, @name.compile(shader), variable.qualified_name
    # functions use this for mapping inferred types
    result.variable = variable
    result
