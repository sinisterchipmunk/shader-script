class exports.Value extends require('shader-script/nodes/value').Value
  name: "_value"
  
  compile: (shader) ->
    @children[0].compile shader
    