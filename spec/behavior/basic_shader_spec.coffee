require 'spec_helper'

describe 'shader', ->
  it "should be able to call functions", ->
    code = glsl "x = 0\ncalcX = -> x = 1\nvertex = -> calcX()"
    # single out the vertex code because there's no fragment main
    sim = simulate(vertex: code.vertex).start()
    expect(sim.state.variables.x.value).toEqual 1
  
  it "should produce glsl code the simulator can understand", ->
    code = glsl 'vertex = -> x = 1'
    sim = simulate(code).start()
    expect(sim.state.variables.x.value).toEqual 1
