require 'spec_helper'

describe 'shader', ->
  # let's replace this with being able to _call_ functions from main,
  # so that we can test it with the simulator.
  it "should be able to construct functions", ->
    code = glsl "x = 0\ncalcX = -> x = 1\nvertex = -> calcX()"
    console.log code.vertex
    
    sim = simulate(code)
    console.log sim.state
  
  it "should produce glsl code the simulator can understand", ->
    code = glsl 'vertex = -> x = 1'
    sim = simulate(code).start()
    expect(sim.state.variables.x.value).toEqual 1
