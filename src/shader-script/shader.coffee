{Scope} = require 'shader-script/scope'

class exports.Shader
  constructor: (state) ->
    @scope = state.scope or= new Scope()

  