exports.Block = class Block extends require('./base').Base
  name: "block"
  
  children: -> [ 'lines' ]
  
  compile: (shader) ->
    @glsl 'Block', (line.compile shader for line in @lines)
    
  push: (line) ->
    @lines.push line
    this

  @wrap: (lines) ->
    return lines[0] if lines.length is 1 and lines[0] instanceof Block
    new exports.Block lines
    