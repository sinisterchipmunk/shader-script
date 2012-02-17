class exports.Identifier extends require("./base").Base
  name: "identifier"
  
  compile: ->
    @children[0]
