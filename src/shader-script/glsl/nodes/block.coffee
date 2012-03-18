class exports.Block extends require('shader-script/nodes/base').Base
  name: -> 'block'
  
  constructor: (lines = [], @options = scope: yes) -> super lines
  
  cast: (type, program) ->
    @lines[@lines.length-1].cast type, program
  
  compile: (program) ->
    throw new Error("too many children") if @children.length > 1
    
    program.state.scope.push('block') if @options.scope
    lines = []
    qual = program.state.scope.qualifier()
    if @lines
      for child in @lines
        _result = child.compile program
        if _result != null
          lines.push _result
    program.state.scope.pop() if @options.scope
        
    lines: lines
    is_block: true
    execute: () ->
      result = (line.execute() for line in lines)
      result[result.length-1]
    toSource: () => 
      indent = if @options and @options.scope then "  " else ""
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
