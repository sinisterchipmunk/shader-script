class exports.Literal extends require("./base").Base
  name: "literal"
  
  compile: ->
    eval @children[0]
