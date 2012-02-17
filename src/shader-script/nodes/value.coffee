class exports.Value extends require("./base").Base
  name: "value"

  compile: (shader) ->
    @children[0].compile shader
