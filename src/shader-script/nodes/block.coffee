exports.Block = class Block extends require('./base').Base
  name: "block"
  
  children: -> [ 'lines' ]
  
  compile: (shader) ->
    return [] unless @lines
    throw new Error("too many children") if @children.length > 1

    lines = []
    for child in @lines
      _result = child.compile shader
      lines.push _result if _result
    lines
    
  push: (line) ->
    @lines.push line

  @wrap: (lines) ->
    return lines[0] if lines.length is 1 and lines[0] instanceof Block
    new exports.Block lines
    