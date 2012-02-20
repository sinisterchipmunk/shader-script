class exports.Shader
  constructor: ->
    @name = "shader"
    @proxy = 
      shader: (name)   => @name = name; null
      # vertex: (body)   => vertex_main: body
      # fragment: (body) => fragment_main: body
    
  to_json: () ->
    name: @name
    body: @body || []
