require 'spec_helper'

describe 'shader', ->
  it "should produce glsl code the simulator can understand", ->
    code = glsl 'vertex = -> x = 1'
    sim = simulate(code).start()
    expect(sim.state.variables.x.value).toEqual 1

