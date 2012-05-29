{Identifier} = require("shader-script/glsl/nodes/identifier")

# Array notation will implicitly create a vecN object consisting of all floats.
# If you need an int or bool vec, or a matrix of any kind, this is not for you.
# Use an explicit constructor for those other types instead.
class exports.Arr extends require("shader-script/nodes/base").Base
  name: "arr"
  
  children: -> ['elements']
  
  type: (shader) ->
    length = 0
    for ele in @elements
      if ele.name == 'value' and ele.children[0]?.name == 'identifier'
        variable = ele.variable shader
        length += switch variable.type()
          when 'ivec2', 'bvec2', 'vec2' then 2
          when 'ivec3', 'bvec3', 'vec3' then 3
          when 'ivec4', 'bvec4', 'vec4' then 4
          else 1
      else length += 1
    'vec' + length.toString()

  compile: (shader) ->
    @glsl 'TypeConstructor', @type(shader), (child.compile shader for child in @elements)
