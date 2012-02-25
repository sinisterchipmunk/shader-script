require 'spec_helper'

describe "operations", ->
  describe "simple", ->
    it "addition", ->
      sim = simulate glsl 'vertex = -> x = 1 + 1'
      expect(sim.state.variables.x.value).toEqual 2