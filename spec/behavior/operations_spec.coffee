require 'spec_helper'

describe "operations", ->
  describe "simple", ->
    it "addition", ->
      code = glsl 'vertex = -> x = 1 + 1'
      sim = simulate(code).start()
      expect(sim.state.variables.x.value).toEqual 2