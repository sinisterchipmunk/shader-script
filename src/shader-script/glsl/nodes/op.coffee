class exports.Op extends require('shader-script/nodes/base').Base
  name: "_op"
  children: -> ['op', 'left', 'right']
  
  compile: (program) ->
    left = @left.compile program
    op = @op
    right = @right.compile program
    
    execute: ->
      [le, re] = [left.execute(), right.execute()]
      # is there a more reliable / concise way to do this?
      # really missing ruby's `send` right now...
      switch op
        when '+' then le + re
        when '-' then le - re
        when '*' then le * re
        when '/' then le / re
        else throw new Error "Unsupported operation: #{op}"
    
    toSource: ->
      "#{left.toSource()} #{op} #{right.toSource()}"