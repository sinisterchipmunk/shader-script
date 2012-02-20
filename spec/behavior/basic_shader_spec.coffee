require 'spec_helper'

describe 'shader', ->
  # let's replace this with being able to _call_ functions from main,
  # so that we can test it with the simulator.
  xit "should be able to construct functions", ->
    console.log(glsl 'calcX = -> ')
  
  it "should produce glsl code the simulator can understand", ->
    console.log(glsl 'vertex = -> x = 1')
