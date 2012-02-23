class exports.Identifier extends require("shader-script/glsl/nodes/identifier").Identifier
  name: "identifier"
  
  compile: ->
    @glsl 'Identifier', @children...
