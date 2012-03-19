fs            = require 'fs'
path          = require 'path'
{extend}      = require './src/shader-script/helpers'
{spawn, exec} = require 'child_process'

run = (cb, cmd, args...) ->
  proc =         spawn cmd, args
  proc.stderr.on 'data', (buffer) -> process.stdout.write buffer.toString()
  proc.stdout.on 'data', (buffer) -> process.stdout.write buffer.toString()
  proc.on        'exit', (status) ->
    process.exit(1) if status != 0
    cb() if typeof cb is 'function'


task 'build', 'build the language from source', build = (cb) ->
  run cb, 'coffee', '-c', '-o', 'lib/assets/javascripts/shader-script/src', 'src'
  
task 'build:parser', 'rebuild the Jison parser', build_parser = (cb) ->
  extend global, require('util')
  require 'jison'
  shader_parser = require('./src/shader-script/grammar').parser
  glsl_parser = require('./src/shader-script/glsl/grammar').parser
  fs.writeFile 'lib/assets/javascripts/shader-script/src/shader-script/parser.js',      shader_parser.generate()
  fs.writeFile 'lib/assets/javascripts/shader-script/src/shader-script/glsl/parser.js', glsl_parser.generate()
  cb() if typeof cb is 'function'

task 'test', 'run the tests', test = ->
  process.env['TEST'] = true
  if process.env['SPEC']
    build -> run null, 'script/test', process.env['SPEC']
  else
    build -> run null, 'script/test'
    
task 'all', 'rebuild the parser, then rebuild the language and run the tests', ->
  build_parser -> test()
  