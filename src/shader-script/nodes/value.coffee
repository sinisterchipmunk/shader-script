class exports.Value extends require("shader-script/glsl/nodes/value").Value
  name: "value"

  compile: (shader) ->
    @glsl 'Value', @children[0].compile shader
