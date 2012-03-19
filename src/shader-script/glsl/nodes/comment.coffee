class exports.Comment extends require('shader-script/nodes/base').Base
  name: '_comment'
  children: -> ['comment']
  
  compile: (program) ->
    execute: ->
    is_comment: true
    no_terminator: true
    toSource: =>
      if @comment.indexOf("\n") != -1
        "/*\n  #{@comment.trim().replace /\n/g, '\n  '}\n*/"
      else
        "// #{@comment}"
