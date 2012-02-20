class exports.Identifier extends require("./base").Base
  name: "identifier"
  
  compile: ->
    @glsl 'Identifier', @children...
