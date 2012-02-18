class exports.Assign extends require("./base").Base
  name: "assign"
  
  children: -> [ 'left', 'right' ]

  compile: (shader) ->
    node_type: 'assign'
    left:  @left.compile shader
    right: @right.compile shader
    