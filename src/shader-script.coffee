fs   = require 'fs'
{Lexer}     = require "shader-script/lexer"
{Simulator} = require "shader-script/simulator"
{parser}    = require "shader-script/parser"
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

exports.compile_to_glsl = (code) ->
  throw new Error("Not yet implemented")

exports.compile_to_json = (code) ->
  if code instanceof Object and code.compile
    code.compile()
  else
    exports.parse(code).compile()
  
exports.compile = (code) ->
  exports.compile_to_json code
  