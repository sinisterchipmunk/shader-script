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
        builtin = program.builtins[name]
        value = builtin.invoke compiled_params...
        @definition value: value, type: builtin.autodetect_type(value)
      else
        throw new Error("function '#{name}' is not defined")
        
    toSource: () ->
      # discard is a special case because although we treat it as a function, it's
      # actually a keyword.
      if name is 'discard'
        name
      else
        joined_params = (param.toSource() for param in compiled_params).join ', '
        "#{name}(#{joined_params})"
      