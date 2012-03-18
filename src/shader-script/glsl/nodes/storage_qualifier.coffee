{TypeConstructor} = require('shader-script/glsl/nodes/type_constructor')
{Value} = require('shader-script/glsl/nodes/value')

class exports.StorageQualifier extends require('shader-script/nodes/base').Base
  name: "_storage_qualifier"
  children: -> ['qualifier', 'type', 'names']
  compile: (program) ->
    for name in @names
      program.state.scope.define name, type: @type, builtin: yes
    
    toSource: => "#{@qualifier} #{@type} #{@names.join(', ')}"
    execute: => ##
