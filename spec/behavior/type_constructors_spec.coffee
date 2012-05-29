require 'spec_helper'

describe 'type constructors', ->
  it "should be usable in math", ->
    code = glsl "vertex = -> v = vec4(1, 2, 3, 4) - [0, 1, 2, 3]"
    sim = simulate code
    expect(sim.state.variables.v.value).toEqual [1, 1, 1, 1]
  
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
      
  describe "vec4 built from vec3 and float", ->
    sim = code = null
    beforeEach ->
      code = glsl "vertex = -> a = [1,2,3]; b = [a, 4]"
      sim = simulate vertex: code.vertex
    
    it "should define b as a vec4", ->
      expect(code.vertex).toMatch /vec4 b/
    
    it "should assign b as a vec4", ->
      expect(code.vertex).toMatch /b = vec4\(/
      
    it "should execute properly in simulator", ->
      sim.start()
      expect(sim.state.variables.b.value).toEqual [1,2,3,4]
      
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
      