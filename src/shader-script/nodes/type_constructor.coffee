class exports.TypeConstructor extends require('shader-script/glsl/nodes/type_constructor').TypeConstructor
  name: 'type_constructor'
  compile: (shader) ->
    compiled_arguments = (arg.compile(shader) for arg in @arguments)
    @glsl 'TypeConstructor', @type(), compiled_arguments
    