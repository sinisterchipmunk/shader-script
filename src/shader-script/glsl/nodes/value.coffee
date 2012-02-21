class exports.Value extends require('shader-script/nodes/value').Value
  name: "_value"
  
  constructor: ->
    super arguments...
    if @children[0].toVariableName
      @toVariableName = -> @children[0].toVariableName()
  
  compile: (shader) ->
    @children[0].compile shader
    