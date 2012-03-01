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
      
  describe "explicit assignment", ->
    it "should generate code properly", ->
      code = glsl "v = int 1"
      expect(code.vertex).toMatch /int v/
      expect(code.vertex).toMatch /v = int\(1(\.0)?\);/
      
    it "should not assign float values to known ints", ->
      code = glsl "v = int 1; v = 2"
      expect(code.vertex).toMatch /v = 2;/
      
    it "should simulate properly", ->
      sim = simulate vertex: glsl("v = int 1\nvertex = -> v = 2").vertex
      expect(sim.state.variables.v.value).toEqual 2
      expect(sim.state.variables.v.type()).toEqual 'int'
      