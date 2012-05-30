{Program} = require 'shader-script/glsl/program'

exports.Extension = class Extension
  # If type is null, it will default to the type of the first argument passed into
  # the extension in the context of its call. Note that this result can vary depending
  # on context. For example, all of the following can be true within the same program:
  #
  #   ext(vec3) => vec3
  #   ext(float) => float
  #   ext(vec3, float) => vec3
  #
  return_type: -> @type
  
  # @name is the name of the extension, by which it can be invoked from shaderscript.
  #
  # @type is the GLSL return type of the extension, or `null` if the parameter type should
  # be used instead.
  #
  # @callback is a function to call when the extension is invoked.
  #
  # If `register` is true, the extension will be registered with all Program objects.
  # Otherwise, the extension effectively can't be invoked from shaderscript.
  constructor: (@name, @type, @callback, register = true) ->
    Program.prototype.builtins[@name] = this if register
    
  autodetect_type: (value) ->
    if typeof value is 'number' then 'float'
    else if value is true or value is false then 'bool'
    else if value.length
      base = @autodetect_type value[0]
      switch base
        when 'float' then "vec#{value.length}"
        when 'int'   then "ivec#{value.length}"
        when 'bool'  then "bvec#{value.length}"
        else throw new Error "Could not autodetect type of #{JSON.stringify value} used as #{base}"
    else throw new Error "Could not autodetect type of #{JSON.stringify value}"
    
  invoke: (params...) ->
    params = (param.execute().value for param in params)
    @callback params...
    
  component_wise: (args...) -> require('shader-script/operators').component_wise(args...)
    
  # Invokes the named extension from JS.
  @invoke: (name, args...) ->
    if Program.prototype.builtins[name]
      Program.prototype.builtins[name].callback(args...)
    else throw new Error "No built-in function named #{name}"
    
  toSource: -> "#{@return_type()} #{@name}(/* variable args */) { /* native code */ }"
