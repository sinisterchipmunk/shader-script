require 'spec_helper'

describe 'shader', ->
  it "should produce glsl code the simulator can understand", ->
    sim = simulate glsl 'vertex = -> x = 1'
    expect(sim.state.variables.x.value).toEqual 1

