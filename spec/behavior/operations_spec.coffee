require 'spec_helper'

describe "operations", ->
  describe "simple", ->
    it "addition", ->
      sim = simulate glsl 'vertex = -> x = 1 + 1'
      expect(sim.state.variables.x.value).toEqual 2
      
    it "subtraction", ->
      sim = simulate glsl 'vertex = -> x = 1 - 1'
      expect(sim.state.variables.x.value).toEqual 0

    it "divide", ->
      sim = simulate glsl 'vertex = -> x = 1 / 2'
      expect(sim.state.variables.x.value).toEqual 0.5

    it "multiply", ->
      sim = simulate glsl 'vertex = -> x = 2 * 2'
      expect(sim.state.variables.x.value).toEqual 4
      
  describe "complex", ->
    it "mat4 multiply vec4", ->
      sim = simulate (vertex: glsl('uniforms = mat4: mv\nvertex = -> x = mv * [1,2,3,4]').vertex),
                     mv: [1,0,0,0, 0,-1,0,0, 0,0,-1,0, 0,0,0,1] # rotation PI rads about X axis
      expect(sim.state.variables.x.value).toEqual [1, -2, -3, 4]
