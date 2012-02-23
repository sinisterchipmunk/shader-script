exports.Block = class Block extends require('shader-script/glsl/nodes/block').Block
  name: "block"
  
  compile: (shader) ->
    # GLSL is statically typed, but Coffee/JS isn't. We're going to inference
    # variable names and types. But, they have to be declared before they can
    # be used in GLSL. So we will go ahead and compile @lines, then insert
    # the compiled variable declarations before finally returning the complete
    # GLSL block.
    
    shader.scope.push('block')
    
    compiled_lines = (line.compile shader for line in @lines)
    for name, options of (shader.scope.delegate -> @definitions)
      compiled_lines.unshift @glsl 'Variable', options.type, @glsl 'Identifier', options.name
      
    shader.scope.pop()
    
    @glsl 'Block', compiled_lines
    
  @wrap: (lines) ->
    return lines[0] if lines.length is 1 and lines[0] instanceof Block
    new exports.Block lines
    