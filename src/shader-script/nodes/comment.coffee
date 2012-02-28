class exports.Comment extends require('shader-script/glsl/nodes/comment').Comment
  name: 'comment'
  compile: (shader) ->
    @glsl 'Comment', @comment
