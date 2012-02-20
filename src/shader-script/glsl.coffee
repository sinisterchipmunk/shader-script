{Lexer}     = require "shader-script/glsl/lexer"

if process.env['TEST']
  {parser}    = require "shader-script/glsl/grammar"
else
  {parser}    = require "shader-script/glsl/parser"

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
    
parser.yy = require 'shader-script/glsl/nodes'

exports.parse = parse = (code) ->
  parser.parse(lexer.tokenize code, rewrite: off)

exports.compile = (code) -> parse(code)#.compile()
