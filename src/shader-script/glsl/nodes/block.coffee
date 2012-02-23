class exports.Block extends require('shader-script/nodes/base').Base
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
      result = (line.toSource() for line in lines).join(";\n").trim()
      if result[result.length-1] != ";"
        result += ";"
      indent + result.split("\n").join("\n#{indent}") + "\n"

  children: -> [ 'lines' ]

  push: (line) ->
    @lines.push line
    this

  @wrap: (lines, options) ->
    return lines[0] if lines.length is 1 and lines[0] instanceof Block
    new exports.Block lines, options
