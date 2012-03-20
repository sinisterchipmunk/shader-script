class exports.Call extends require('shader-script/nodes/base').Base
  name: '_call'
  
  children: -> [ 'name', 'params' ]
  
  compile: (program) ->
    name = @name.toVariableName()
    compiled_params = (param.compile program for param in @params)
    
    execute: () =>
      if program.functions[name]
        program.functions[name].invoke compiled_params...
      else if program.builtins[name]
        @definition value: program.builtins[name].invoke compiled_params...
      else
        throw new Error("function '#{name}' is not defined")
        
    toSource: () ->
      joined_params = (param.toSource() for param in compiled_params).join ', '
      "#{name}(#{joined_params})"
      