class exports.Precision extends require('shader-script/nodes/base').Base
  name: "precision"
  children: -> ['precision', 'type']
  
  compile: (shader) ->
    @glsl 'Precision', @precision, @type
