class exports.StorageQualifier extends require('shader-script/nodes/base').Base
  name: 'storage_qualifier'
  children: -> [ 'qualifier', 'assigns' ]
  compile: (shader) ->
    return null if @qualifier == 'attributes' and shader.compile_target == 'fragment'

    # We are guaranteed that all children are Identifiers so we can
    # cheat a bit here.
    qualifier = @qualifier[0...-1] # strip the trailing 's' from 'uniforms', 'varyings', etc.
    lines = []
    for assign in @assigns
      type  = assign.type.children[0].toString()
      names = for name in assign.names
        name = name.children[0].toString()
        shader.scope.define name, type: type, builtin: yes
        name
      lines.push @glsl 'StorageQualifier', qualifier, type, names
      
    @glsl 'Block', lines, scope: no
