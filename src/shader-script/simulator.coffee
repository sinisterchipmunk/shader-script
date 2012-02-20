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
  
  start: (which = 'both') ->
    switch which
      when 'both'
        throw new Error("No programs found!") unless @vertex || @fragment
        @start 'vertex'   if @vertex
        @start 'fragment' if @fragment
      else
        source_code = this[which]
        throw new Error("No #{which} program found!") unless source_code
        @try_run which, source_code
    
  try_run: (name, source_code) ->
    return unless source_code
    try
      program = new Program this
      source_code.compile program
      program.invoke 'main'
    catch err
      err.message = "#{name}: #{err.message}"
      throw err
