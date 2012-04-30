fs = require 'fs'
Shader   = require 'shader-script'
{Lexer}  = require 'shader-script/lexer'

global.fixture = (filename, ext = 'shader') ->
  filename = __dirname + "/fixtures/"+ filename + "." + ext
  fs.readFileSync(filename, "utf-8").trim()

global.parse_tree = (code) ->
  (new Lexer).tokenize code

global.compile = (code) ->
  Shader.compile_to_dom(code).trim()

global.build = (script) -> Shader.parse script

global.json = (script) -> Shader.compile_to_json script

global.glsl = (script, validate = true) ->
  glsl = Shader.compile script
  if validate and typeof(window) != 'undefined'
    compileVertex glsl.vertex if glsl.vertex
    compileFragment glsl.fragment if glsl.fragment
    linkProgram if glsl.vertex and glsl.fragment
  glsl

global.simulate = (glsl, variables) ->
  new Shader.Simulator(glsl, variables).start()

global.parse_glsl_tree = (code) ->
  (new (require('shader-script/glsl/lexer').Lexer)).tokenize code, rewrite: off
  