exports.Block = class Block extends require('shader-script/glsl/nodes/block').Block
  name: "block"
  
  compile: (shader) ->
    @glsl 'Block', (line.compile shader for line in @lines)
    
  @wrap: (lines) ->
    return lines[0] if lines.length is 1 and lines[0] instanceof Block
    new exports.Block lines
    