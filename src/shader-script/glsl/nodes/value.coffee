class exports.Value extends require('shader-script/nodes/base').Base
  name: "_value"
  
  constructor: ->
    super arguments...
    if @children[0].toVariableName
      @toVariableName = -> @children[0].toVariableName()
  
  is_access: -> @children[0].is_access()

  type: (program) -> @children[0].type(program)

  compile: (shader) ->
    @children[0].compile shader

  cast: (type, program) -> @children[0].cast(type, program)