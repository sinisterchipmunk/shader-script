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
  run cb, 'coffee', '-c', '-o', 'lib/assets/javascripts', 'src'

task 'build:parser', 'rebuild the Jison parser', build_parser = (cb) ->
  extend global, require('util')
  require 'jison'
  parser = require('./src/shader-script/grammar').parser
  fs.writeFile 'lib/assets/javascripts/shader-script/parser.js', parser.generate()
  cb() if typeof cb is 'function'

task 'test', 'run the tests', test = ->
  build -> run null, 'script/test'

task 'all', 'rebuild the parser, then rebuild the language and run the tests', ->
  build_parser -> test()
  