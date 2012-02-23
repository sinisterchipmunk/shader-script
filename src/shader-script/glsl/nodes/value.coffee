class exports.Value extends require('shader-script/nodes/base').Base
  name: "_value"
  
  constructor: ->
    super arguments...
    if @children[0].toVariableName
      @toVariableName = -> @children[0].toVariableName()
  
  type: -> @children[0].type()

  compile: (shader) ->
    @children[0].compile shader
    