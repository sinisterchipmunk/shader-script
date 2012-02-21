class exports.Call extends require('shader-script/nodes/base').Base
  name: '_call'
  
  children: -> [ 'name', 'params' ]
  
  compile: (program) ->
    compiled_name = @name.compile program
    compiled_params = (param.compile program for param in @params)
    
    execute: () ->
      name = compiled_name.execute()
      if program.functions[name]
        program.functions[name].invoke compiled_params...
      else
        throw new Error("function '#{name}' is not defined")
        
    toSource: () ->
      joined_params = (param.toSource() for param in compiled_params).join ', '
      "#{compiled_name.toSource()}(#{joined_params})"
      