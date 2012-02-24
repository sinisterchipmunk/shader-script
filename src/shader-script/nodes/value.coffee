class exports.Value extends require("shader-script/glsl/nodes/value").Value
  name: "value"

  compile: (shader) ->
    @glsl 'Value', @children[0].compile shader

  toVariableName: () -> @children[0].toVariableName()
  
  variable: (shader) ->
    @children[0].variable && @children[0].variable(shader)
    