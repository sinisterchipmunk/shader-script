require 'spec_helper'

describe "functions", ->
  it "should allow param types to be explicitly specified", ->
    script = "m = (float x) -> "
    code = glsl script
    expect(code.vertex).toMatch /\(float x\)/
  
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

  it "should infer params types from other params", ->
    code = glsl """
      m = (a) -> 1
      fpos = (angle) -> m(angle)
      vertex = -> fpos(1)
    """
    expect(code.vertex).toMatch /\(float a\)/
    
  it "should set function type by return value", ->
    code = glsl """
      m = -> return 1.0
    """
    expect(code.vertex).toMatch(/float m\(/)

  it "should infer types from function return value", ->
    code = glsl "m = -> return 1.0\nvertex = -> x = m()"
    expect(code.vertex).toMatch /float x;/
  
  it "should return void from main", ->
    code = glsl "vertex = ->"
    expect(code.vertex).toMatch /void main\(/
  