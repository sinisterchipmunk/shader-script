require 'spec_helper'
{Simulator} = require 'shader-script'

describe "operations", ->
  describe "negation", ->
    it "should handle typed arrays", ->
      fcode = """
      uniform vec3 EyeSpaceLightDirection;
      void main(void) { vec3 L = -EyeSpaceLightDirection; }
      """
      sim = new Simulator fragment: fcode
      sim.state.variables.EyeSpaceLightDirection.value = new Float32Array [0, 0, -1]
      sim.start()
      expect(sim.state.variables.L.value).toEqualish [0, 0, 1]

  describe 'boolean', ->
    it 'negation', ->
      sim = simulate glsl 'vertex = -> x = !true'
      expect(sim.state.variables.x.value).toBeFalse()
  
  describe "simple", ->
    it 'vec2 plus', ->
      sim = simulate glsl 'vertex = -> x = vec2(1, 2) + 0.5'
      expect(sim.state.variables.x.value).toEqualish [1.5, 2.5]
    
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
      
    it "float greater than (true)", ->
      sim = simulate glsl 'vertex = -> x = float(2) > float(1)'
      expect(sim.state.variables.x.value).toEqual 1

    it "float greater than (false)", ->
      sim = simulate glsl 'vertex = -> x = float(2) > float(2)'
      expect(sim.state.variables.x.value).toEqual 0

      
  describe "complex", ->
    it "mat4 multiply vec4", ->
      sim = simulate (vertex: glsl('uniforms = mat4: mv\nvertex = -> x = mv * [1,2,3,4]').vertex),
                     mv: [1,0,0,0, 0,-1,0,0, 0,0,-1,0, 0,0,0,1] # rotation PI rads about X axis
      expect(sim.state.variables.x.value).toEqual [1, -2, -3, 4]
      
    it "mat3 multiply vec3", ->
      sim = simulate (vertex: glsl('uniforms = mat3: normal\nvertex = -> x = normal * [1,2,3]').vertex),
                     normal: [1,0,0, 0,-1,0, 0,0,-1] # rotation PI rads about X axis
      expect(sim.state.variables.x.value).toEqual [1, -2, -3]
      
    it "should handle parens accessors", ->
      sim = simulate (vertex: glsl('uniforms = mat4: mv\nvertex = -> x = (mv * [1,2,3,4]).xyz').vertex),
                     mv: [1,0,0,0, 0,-1,0,0, 0,0,-1,0, 0,0,0,1] # rotation PI rads about X axis
      expect(sim.state.variables.x.value).toEqual [1, -2, -3]
      
    it "should not taint variables when given Float32Array", ->
      fcode = """
      uniform vec3 EyeSpaceLightDirection;
      varying vec3 vEyeSpaceSurfaceNormal;

      void main(void) {
        vec3 R;
        vec3 N = normalize(vEyeSpaceSurfaceNormal);
        vec3 L = EyeSpaceLightDirection;
        R = reflect(L, N);
      }
      """
      sim = new Simulator fragment: fcode
      sim.state.variables.EyeSpaceLightDirection.value = new Float32Array [0, 0, -1]
      sim.state.variables.vEyeSpaceSurfaceNormal.value = [0, 0, -1]
      sim.start()
      expect(sim.state.variables.R.value).toEqualish [0,0,1]
      

    it "assign function calling mat3 multiply vec3", ->
      code = glsl """
      uniforms =
        mat3: vnMatrix
        vec3: LIGHT_DIRECTION
      vertex = -> nLDir = normalize vnMatrix * -normalize LIGHT_DIRECTION
      """
      expect(code.vertex).toMatch /vec3 nLDir/