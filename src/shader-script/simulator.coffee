Glsl = require 'shader-script/glsl'

exports.Simulator = class Simulator
  assign_builtin_variables = (name, program) ->
    builtins = program.builtins._variables[name]
    for name, definition of builtins
      program.state.scope.define name, definition.as_options()

  compile_program = (type, state, source_code) ->
    program = Glsl.compile source_code, state
    assign_builtin_variables 'common', program
    assign_builtin_variables type, program
    program
  
  # glsl is a json object laid out like:
  #     vertex: "string of glsl vertex shader code"
  #     fragment: "string of glsl fragment shader code"
  #
  constructor: (glsl) ->
    @state = {}
    @vertex   = compile_program 'vertex', @state, glsl.vertex if glsl.vertex
    @fragment = compile_program 'fragment', @state, glsl.fragment if glsl.fragment
    throw new Error("No programs found!") unless @vertex || @fragment
  
  start: (which = 'both') ->
    switch which
      when 'both'
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
      