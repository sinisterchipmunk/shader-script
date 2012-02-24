require 'spec_helper'

describe "functions", ->
  it "should be able to call functions", ->
    code = glsl "x = 0\ncalcX = -> x = 1\nvertex = -> calcX()"
    # single out the vertex code because there's no fragment main
    sim = simulate(vertex: code.vertex).start()
    expect(sim.state.variables.x.value).toEqual 1
  
  it "should handle empty mains", ->
    glsl 'vertex = ->'
    expect(-> glsl 'vertex = ->').not.toThrow()

  it "should be able to call a function with an argument", ->
    code = glsl "b = 0\nf = (a) -> b = a\nvertex = -> f 1"
    sim = simulate(vertex: code.vertex).start()
    expect(sim.state.variables.b.value).toEqual 1
