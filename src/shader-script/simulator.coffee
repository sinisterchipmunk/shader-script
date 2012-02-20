Glsl = require 'shader-script/glsl'
{Program} = require 'shader-script/glsl/program'

exports.Simulator = class Simulator
  # glsl is a json object laid out like:
  #     vertex: "string of glsl vertex shader code"
  #     fragment: "string of glsl fragment shader code "
  #
  constructor: (glsl) ->
    @vertex   = Glsl.compile glsl.vertex,   new Program this if glsl.vertex
    @fragment = Glsl.compile glsl.fragment, new Program this if glsl.fragment
    
    @state =
      variables: {}
  
  start: (which = 'both') ->
    switch which
      when 'both'
        throw new Error("No programs found!") unless @vertex || @fragment
        @start 'vertex'   if @vertex
        @start 'fragment' if @fragment
      else
        program = this[which]
        throw new Error("No #{which} program found!") unless program
        @run_program which, program
    
  run_program: (name, program) ->
    try
      program.invoke 'main'
    catch err
      err.message = "#{name}: #{err.message}"
      throw err
