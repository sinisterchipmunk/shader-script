{Definition} = require 'shader-script/definition'

class exports.Access extends require('shader-script/glsl/nodes/access').Access
  name: "access"
  children: -> ['accessor']

  variable: (shader) ->
    @_variable or= new Definition type: @type shader

  compile: (shader) ->
    throw new Error "Accessor has no source" unless @source
    @glsl 'Access', @glsl('Identifier', @accessor_name()), @source.compile shader
