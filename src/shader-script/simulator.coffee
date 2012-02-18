Glsl = require 'shader-script/glsl'
{Program} = require 'shader-script/glsl/program'

exports.Simulator = class Simulator
  # glsl is a json object laid out like:
  #     vertex: "string of glsl vertex shader code"
  #     fragment: "string of glsl fragment shader code "
  #
  constructor: (glsl) ->
    @vertex   = Glsl.compile glsl.vertex   if glsl.vertex
    @fragment = Glsl.compile glsl.fragment if glsl.fragment
    @state =
      variables: {}
  
  start: ->
    throw new Error("No programs found!") unless @vertex || @fragment
    @try_run 'vertex',   @vertex
    @try_run 'fragment', @fragment
    
  try_run: (name, source_code) ->
    return unless source_code
    try
      program = new Program this
      source_code.compile program
      program.invoke 'main'
    catch err
      err.message = "#{name}: #{err.message}"
      throw err
