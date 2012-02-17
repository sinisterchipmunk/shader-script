exports.Block = class Block extends require('./base').Base
  name: "block"
  
  compile: (shader) ->
    result = []
    
    for child in @children
      if child instanceof Array
        for line in child
          _result = line.compile shader
          result << _result if _result
      else
        _result = child.compile shader
        result << _result if _result
    
    result

  @wrap: (lines) ->
    new exports.Block lines
    