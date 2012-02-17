{ShaderDescriptor} = require 'shader-script/shader_descriptor'

class exports.Root extends require('./base').Base
  name: "root"

  constructor: (@block) ->
    super @block
  
  compile: () ->
    shader = new ShaderDescriptor()
    shader.body = @block.compile shader
    
    shader.to_json()
