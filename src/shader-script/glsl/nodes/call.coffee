class exports.Call extends require('shader-script/nodes/base').Base
  name: 'call'
  
  children: -> [ 'name', 'params' ]
  
  compile: (program) ->
    name = @name.compile program
    params = (param.compile program for param in @params)
    
    execute: (sim) ->
      if program.functions[name]
        program.functions[name].invoke sim, params...
      else
        throw new Error("function '#{name}' is not defined")
