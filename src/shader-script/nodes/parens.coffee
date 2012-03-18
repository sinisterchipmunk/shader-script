class exports.Parens extends require('shader-script/nodes/base').Base
  name: "parens"
  children: -> ['body']
  type: (shader) -> @body.type shader
  compile: (shader) -> @glsl 'Parens', @body.compile shader
  