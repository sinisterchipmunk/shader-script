Glsl = require 'shader-script/glsl'

exports.Simulator = class Simulator
  # glsl is a json object laid out like:
  #     vertex: "string of glsl vertex shader code"
  #     fragment: "string of glsl fragment shader code "
  #
  constructor: (glsl) ->
    @state = variables: {}

    @vertex   = Glsl.compile glsl.vertex,   @state if glsl.vertex
    @fragment = Glsl.compile glsl.fragment, @state if glsl.fragment
  
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
    this
    
  run_program: (name, program) ->
    try
      program.invoke 'main'
    catch err
      err.message = "#{name}: #{err.message}"
      throw err
