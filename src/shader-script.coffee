fs   = require 'fs'
{Lexer}     = require "shader-script/lexer"
{Simulator} = require "shader-script/simulator"
{parser}    = require "shader-script/parser"
{Program} = require 'shader-script/glsl/program'

# require "extensions"

lexer = new Lexer

# The real Lexer produces a generic stream of tokens. This object provides a
# thin wrapper around it, compatible with the Jison API. We can then pass it
# directly as a "Jison lexer".
parser.lexer =
  lex: ->
    [tag, @yytext, @yylineno] = @tokens[@pos++] or ['']
    tag
  setInput: (@tokens) ->
    @pos = 0
  upcomingInput: ->
    ""
    
parser.yy = require 'shader-script/nodes'

exports.Simulator = Simulator

exports.parse = (code) -> parser.parse(lexer.tokenize code)

# Compiles the shaderscript code into {vertex: v_source, fragment: f_source}
# where v_source and f_source are strings containing vertex and fragment shader
# GLSL code, respectively.
exports.compile_to_glsl = (code) ->
  program = exports.compile code
  vertex: program.vertex.toSource()
  fragment: program.fragment.toSource()

# Compiles the shaderscript code into an object representation of GLSL code
# to be executed. See also #compile_to_glsl(code)
exports.compile = (code) ->
  unless code instanceof Object and code.compile
    code = exports.parse code
  code.compile new Program
