class exports.Identifier extends require('shader-script/nodes/base').Base
  name: "_identifier"
  
  toVariableName: ->
    @children[0]
    
  compile:  ->
    execute: => @children[0]
    toSource: => @children[0]
    