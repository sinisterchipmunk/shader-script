class exports.Value extends require("./base").Base
  name: "value"

  type: -> @children[0].type()
  
  compile: (shader) ->
    @glsl 'Value', @children[0].compile shader
