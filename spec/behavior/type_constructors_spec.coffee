require 'spec_helper'

describe 'type constructors', ->
  describe "vec4", ->
    code = null
    beforeEach -> code = glsl "vertex = -> v = [1,2,3,4]"
    
    it "should get value properly", ->
      sim = simulate vertex: code.vertex
      expect(sim.state.variables.v.value).toEqual [1,2,3,4]

    it "should set type properly", ->
      expect(code.vertex).toMatch /vec4 v/
      sim = simulate vertex: code.vertex
      expect(sim.state.variables.v.type()).toEqual 'vec4'
      