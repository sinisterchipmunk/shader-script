class exports.Root extends require('shader-script/nodes/base').Base
  name: "root"
  
  children: -> ['block']
  
  compile: (program) -> @block.compile(program)
  