class exports.Shader
  constructor: ->
    @name = "shader"
    @proxy = 
      shader: (name) => @name = name
    
  to_json: () ->
    name: @name
    body: @body || []
