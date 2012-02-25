fs = require 'fs'
Shader   = require 'shader-script'
{Lexer}  = require 'shader-script/lexer'

global.fixture = (filename, ext = 'shader') ->
  filename = __dirname + "/fixtures/"+ filename + "." + ext
  fs.readFileSync(filename, "utf-8").trim()

global.parse_tree = (code) ->
  (new Lexer).tokenize code

global.compile = (code) ->
  Shader.compile(code).trim()

global.build = (script) -> Shader.parse script

global.json = (script) -> Shader.compile_to_json script

global.glsl = (script) -> Shader.compile_to_glsl script

global.simulate = (glsl) ->
  new Shader.Simulator(glsl).start()

global.parse_glsl_tree = (code) ->
  (new (require('shader-script/glsl/lexer').Lexer)).tokenize code, rewrite: off
  