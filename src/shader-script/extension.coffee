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
    
  invoke: (params...) ->
    params = (param.execute() for param in params)
    @callback params...
    
  component_wise: (args...) ->
    # make a shallow copy of arg arrays so that they aren't modified in place
    (args[i] = args[i].splice(0) if args[i] and args[i].splice) for i of args
    callback = args.pop()
    
    resultset = []
    again = true
    while again
      size = null
      again = false
      argset = for arg in args
        if arg and arg.length
          if arg.length > 1 then again = true
          if size and arg.length != size then throw new Error "All vectors must be the same size"
          size = arg.length
        if arg and arg.shift then arg.shift()
        else arg
      resultset.push callback argset...
    
    if resultset.length == 1
      resultset[0]
    else resultset
    
  # Invokes the named extension from JS.
  @invoke: (name, args...) ->
    if Program.prototype.builtins[name]
      Program.prototype.builtins[name].callback(args...)
    else throw new Error "No built-in function named #{name}"
    
  toSource: -> "#{@return_type()} #{@name}(/* variable args */) { /* native code */ }"
