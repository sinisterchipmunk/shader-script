class exports.Variable extends require('shader-script/nodes/base').Base
  name: 'variable'
  
  children: -> ['type', 'name']
  
  compile: (program) ->
    program.current_scope[@name.compile program] =
      type: @type.compile program
      value: Number.NaN
