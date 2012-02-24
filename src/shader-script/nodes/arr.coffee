# Array notation will implicitly create a vecN object consisting of all floats.
# If you need an int or bool vec, or a matrix of any kind, this is not for you.
# Use an explicit constructor for those other types instead.
class exports.Arr extends require("shader-script/nodes/base").Base
  name: "arr"
  
  children: -> ['elements']
  
  type: -> 'vec' + @elements.length.toString()

  compile: (shader) ->
    @glsl 'TypeConstructor', @type(), (child.compile shader for child in @elements)
