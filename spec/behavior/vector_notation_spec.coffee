require 'spec_helper'

describe 'vector notation', ->
  describe "rvalue", ->
    it "should work with xyzw", ->
      sim = simulate glsl 'vertex = -> x = [1,2,3,4].xyzw'
      expect(sim.state.variables.x.value).toEqual [1, 2, 3, 4]

    it "should work with rgba", ->
      sim = simulate glsl 'vertex = -> x = [1,2,3,4].rgba'
      expect(sim.state.variables.x.value).toEqual [1, 2, 3, 4]

    it "should work with stpq", ->
      sim = simulate glsl 'vertex = -> x = [1,2,3,4].stpq'
      expect(sim.state.variables.x.value).toEqual [1, 2, 3, 4]

    it "should work with doubles", ->
      sim = simulate glsl 'vertex = -> x = [1,2,3,4].xxyy'
      expect(sim.state.variables.x.value).toEqual [1, 1, 2, 2]
      
    it "should work with synonyms", ->
      sim = simulate glsl 'vertex = -> x = [1,2,3,4].xrs'
      expect(sim.state.variables.x.value).toEqual [1, 1, 1]
      
    it "should have type equal to number of components", ->
      sim = simulate glsl 'vertex = -> x = [1, 2, 3, 4].xx'
      expect(sim.state.variables.x.type()).toEqual 'vec2'
      
      
  describe "lvalue", ->
    it "should work with xyzw", ->
      sim = simulate glsl 'vertex = -> x = vec4(); x.xyzw = [1, 2, 3, 4]'
      expect(sim.state.variables.x.value).toEqual [1, 2, 3, 4]

    it "should work with rgba", ->
      sim = simulate glsl 'vertex = -> x = vec4(); x.rgba = [1, 2, 3, 4]'
      expect(sim.state.variables.x.value).toEqual [1, 2, 3, 4]

    it "should work with stpq", ->
      sim = simulate glsl 'vertex = -> x = vec4(); x.stpq = [1, 2, 3, 4]'
      expect(sim.state.variables.x.value).toEqual [1, 2, 3, 4]

    it "should grumble about doubles", ->
      expect(-> simulate glsl 'vertex = -> x = vec4(); x.xxyy = [1, 2, 3, 4]').toThrow()

    it "should grumble about synonyms", ->
      expect(-> simulate glsl 'vertex = -> x = vec4(); x.xrs = [1, 2, 3, 4]').toThrow()

    it "should allow lvalue unequal to vector size", ->
      sim = simulate glsl 'vertex = -> x = vec4 0; x.xyz = [1, 2, 3]'
      expect(sim.state.variables.x.value).toEqual [1, 2, 3, 0]
      
    