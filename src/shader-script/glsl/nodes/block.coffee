class exports.Block extends require('shader-script/nodes/block').Block
  name: -> '_block'
  
  constructor: (lines, @options = indent: yes) -> super lines
  
  compile: (program) ->
    throw new Error("too many children") if @children.length > 1
    
    lines = []
    if @lines
      for child in @lines
        _result = child.compile program
        lines.push _result if _result
      
    execute: () -> (line.execute() for line in lines)
    toSource: () => 
      indent = if @options and @options.indent then "  " else ""
      indent + ((line.toSource() for line in lines).join(";\n") + ";").split("\n").join("\n#{indent}") + "\n"
    
  @wrap: (lines, options) ->
    return lines[0] if lines.length is 1 and lines[0] instanceof Block
    new exports.Block lines, options
