class exports.Block extends require('shader-script/nodes/block').Block
  name: -> '_block'
  
  compile: (program) ->
    throw new Error("too many children") if @children.length > 1

    lines = []
    if @lines
      for child in @lines
        _result = child.compile program
        lines.push _result if _result
      
    execute: (sim) -> (line.execute sim for line in lines)
    toSource: (sim) -> (line.toSource() for line in lines).join(";\n") + ";\n"
    
  @wrap: (lines) ->
    return lines[0] if lines.length is 1 and lines[0] instanceof Block
    new exports.Block lines
