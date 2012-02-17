shader "red"

uniform vec3 light_direction
uniform mat4 mvp

attribute vec3 position
attribute vec2 texuv

func1 = ->
  # function available to both mains
  # but only generated for the main(s) that use it
  # argument types are inferred from usage
  # return type is inferred from usage

vertex ->
  # creates a 'vertex' main
  # return type is always void
  gl_FragCoord = mvp * position

fragment ->
  # creates a 'fragment' main
  # return type is always void
  gl_FragColor = [1, 0, 0, 1] # auto converted to vecN
