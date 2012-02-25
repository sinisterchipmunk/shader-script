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
      