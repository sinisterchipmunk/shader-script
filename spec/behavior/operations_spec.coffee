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
      
    it "int equality (true)", ->
      sim = simulate glsl 'vertex = -> x = int(2) == int(2)'
      expect(sim.state.variables.x.value).toEqual 1
      
    it "int equality (false)", ->
      sim = simulate glsl 'vertex = -> x = int(2) == int(3)'
      expect(sim.state.variables.x.value).toEqual 0
      
    it "int inequality (true)", ->
      sim = simulate glsl 'vertex = -> x = int(2) != int(3)'
      expect(sim.state.variables.x.value).toEqual 1
      
    it "int inequality (false)", ->
      sim = simulate glsl 'vertex = -> x = int(2) != int(2)'
      expect(sim.state.variables.x.value).toEqual 0

      
  describe "complex", ->
    it "mat4 multiply vec4", ->
      sim = simulate (vertex: glsl('uniforms = mat4: mv\nvertex = -> x = mv * [1,2,3,4]').vertex),
                     mv: [1,0,0,0, 0,-1,0,0, 0,0,-1,0, 0,0,0,1] # rotation PI rads about X axis
      expect(sim.state.variables.x.value).toEqual [1, -2, -3, 4]

    it "assign function calling mat3 multiply vec3", ->
      code = glsl """
      uniforms =
        mat3: vnMatrix
        vec3: LIGHT_DIRECTION
      vertex = -> nLDir = normalize vnMatrix * -normalize LIGHT_DIRECTION
      """
      expect(code.vertex).toMatch /vec3 nLDir/