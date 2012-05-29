require 'spec_helper'

describe "functions", ->
  describe "glsl parser", ->
    it "should handle explicit use of `void` in function params", ->
      sim = simulate vertex: "void main(void) { }"
      sim.start()
  
  it "should not produce trailing terminators", ->
    code = glsl "m = () ->"
    expect(code.vertex).not.toMatch /\};/
  
  it "should allow param types to be explicitly specified", ->
    script = "m = (float x) -> "
    code = glsl script
    expect(code.vertex).toMatch /float x\)/
    
  it "should handle in, out, and inout params", ->
    script = "m = (vec3 invec, inout vec3 inoutvec, out vec3 outvec) ->"
    code = glsl script
    expect(code.vertex).toMatch /vec3 invec, inout vec3 inoutvec, out vec3 outvec\)/
  
  it "should be able to call functions", ->
    code = glsl "x = 0\ncalcX = -> x = 1\nvertex = -> calcX()"
    # single out the vertex code because there's no fragment main
    sim = simulate vertex: code.vertex
    expect(sim.state.variables.x.value).toEqual 1
  
  it "should handle empty mains", ->
    glsl 'vertex = ->'
    expect(-> glsl 'vertex = ->').not.toThrow()

  it "should be able to call a function with an argument", ->
    code = glsl "b = 0\nf = (a) -> b = a\nvertex = -> f 1"
    sim = simulate vertex: code.vertex
    expect(sim.state.variables.b.value).toEqual 1

  it "should return void from main", ->
    code = glsl "vertex = ->"
    expect(code.vertex).toMatch /void main\(/
  