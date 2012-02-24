class exports.Identifier extends require("shader-script/glsl/nodes/identifier").Identifier
  name: "identifier"
  
  variable: (shader) -> shader.scope.lookup @toVariableName()
  
  type: (shader) -> @variable(shader).type()
  
  compile: ->
    @glsl 'Identifier', @children...
