class exports.Identifier extends require('shader-script/nodes/identifier').Identifier
  name: "_identifier"
  
  compile:  ->
    execute: => @children[0]
    toSource: => @children[0]
    