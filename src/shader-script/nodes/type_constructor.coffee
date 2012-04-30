class exports.TypeConstructor extends require('shader-script/glsl/nodes/type_constructor').TypeConstructor
  name: 'type_constructor'
  compile: (shader) ->
    @glsl 'TypeConstructor', @type(), (arg.compile(shader) for arg in @arguments)
    