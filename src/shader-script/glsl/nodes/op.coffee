class exports.Op extends require('shader-script/nodes/base').Base
  name: "_op"
  children: -> ['op', 'left', 'right']
  
  compile: (program) ->
    left = @left.compile program
    op = @op
    right = @right && @right.compile program
    
    execute: ->
      [le, re] = [left.execute(), right && right.execute()]
      # is there a more reliable / concise way to do this?
      # really missing ruby's `send` right now...
      switch op
        when '+' then (if re then le + re else le)
        when '-' then (if re then le - re else -le)
        when '*' then le * re
        when '/' then le / re
        else throw new Error "Unsupported operation: #{op}"
    
    toSource: ->
      if right
        "#{left.toSource()} #{op} #{right.toSource()}"
      else
        "#{op}#{left.toSource()}"
      