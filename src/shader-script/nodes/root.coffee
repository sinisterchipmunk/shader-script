{Shader} = require 'shader-script/shader'

class exports.Root extends require('./base').Base
  name: "root"

  constructor: (@block) ->
    super @block
  
  compile: () ->
    shader = new Shader()
    shader.body = @block.compile shader
    
    shader.to_json()
