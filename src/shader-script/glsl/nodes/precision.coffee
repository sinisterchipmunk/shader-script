class exports.Precision extends require('shader-script/nodes/base').Base
  name: "_precision"
  children: -> ['precision', 'type']
  
  compile: (program) ->
    precision = @precision.toLowerCase()
    type = @type.toLowerCase()
    
    execute: =>
      # no op in simulation
    
    toSource: ->
      "precision #{precision} #{type}"
      