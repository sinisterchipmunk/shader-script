class exports.Value extends require("./base").Base
  name: "value"

  compile: (shader) ->
    @glsl 'Value', @children[0].compile shader
