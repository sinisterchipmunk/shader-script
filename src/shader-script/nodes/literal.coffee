class exports.Literal extends require("./base").Base
  name: "literal"
  
  compile: ->
    @glsl 'Literal', @children...
  