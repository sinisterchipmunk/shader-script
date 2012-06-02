{TypeConstructor} = require('shader-script/glsl/nodes/type_constructor')
{Value} = require('shader-script/glsl/nodes/value')

class exports.StorageQualifier extends require('shader-script/nodes/base').Base
  name: "_storage_qualifier"
  children: -> ['qualifier', 'type', 'names']
  compile: (program) ->
    names = for name in @names
      if typeof(name) != 'string'
        name = name.toVariableName()
      default_value = switch @type
        when 'ivec2', 'bvec2', 'vec2'  then [Number.NaN, Number.NaN]
        when 'ivec3', 'bvec3', 'vec3'  then [Number.NaN, Number.NaN, Number.NaN]
        when 'ivec4', 'bvec4', 'vec4'  then [Number.NaN, Number.NaN, Number.NaN, Number.NaN]
        when 'mat2', 'mat2x2'          then (Number.NaN for i in [0...4])
        when 'mat3', 'mat3x3'          then (Number.NaN for i in [0...9])
        when 'mat4', 'mat4x4'          then (Number.NaN for i in [0...16])
        when 'mat2x3', 'mat3x2'        then (Number.NaN for i in [0...6])
        when 'mat2x4', 'mat4x2'        then (Number.NaN for i in [0...8])
        when 'mat3x4', 'mat4x3'        then (Number.NaN for i in [0...12])
        else undefined
      if program.state.variables[name] then variable = program.state.scope.import program.state.variables[name]
      else
        variable = program.state.scope.define name, type: @type, builtin: yes, value: default_value
        program.state.variables[name] = variable
      name
    
    toSource: => "#{@qualifier} #{@type} #{names.join(', ')}"
    execute: => ##
