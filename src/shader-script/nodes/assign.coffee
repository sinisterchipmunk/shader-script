class exports.Assign extends require("./base").Base
  name: "assign"
  
  children: -> [ 'left', 'right' ]

  compile: (program) ->
    {Function} = require('shader-script/nodes')
    
    # take care of function assignments
    if @right instanceof Function
      @right.func_name = @left
      @right.compile program
    else
      left  = @left.compile program
      right = @right.compile program
      @glsl 'Assign', left, right
