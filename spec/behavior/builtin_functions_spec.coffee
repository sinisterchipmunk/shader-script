require 'spec_helper'

# The comments in this spec are taken from the GLSL spec:
# http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

describe "built-in functions", ->
  # define some helpers for my fingers' sake
  [float, vec2, vec3, vec4] = ['float', 'vec2', 'vec3', 'vec4']
  
  exec = (operation) -> simulate glsl "vertex = -> x = #{operation}"
  
  assert = (operation, expected_type, expected_value) ->
    if expected_type is undefined then throw new Error "Expected type is undefined"
    if expected_value is undefined then throw new Error "Expected value is undefined"
    
    sim = exec operation
    expect(sim.state.variables.x.type()).toEqual expected_type
    expect(sim.state.variables.x.value).toEqualish expected_value
    
  it "should set type on return value", ->
    sim = simulate glsl "vertex = -> f = dot([0,1,0], [1,0,0]) * 1"
    # float f = dot(vec3(0,1,0), vec3(1,0,0)) * 1;
    sim.start()
    expect(sim.state.variables.f.value).toEqual 0
    
    
  describe 'angle and trigonometry functions, p65', ->
    # Function parameters specified as angle are assumed to be in units of radians.  In no case will any of these
    # functions result in a divide by zero error.  If the divisor of a ratio is 0, then results will be undefined.
    # These all operate component-wise.  The description is per component.
    
    it 'radians', ->
      assert 'radians 180', float, Math.PI
      assert 'radians [180, 360]', vec2, [ Math.PI, Math.PI*2 ]

    it 'degrees', ->
      assert "degrees #{Math.PI}", float, 180
      assert "degrees [#{Math.PI}, #{Math.PI*2}]", vec2, [180, 360]
        
    it 'sin', ->
      assert "sin #{Math.PI} / 2", float, Math.sin(Math.PI/2)
      assert "sin 0", float, 0.0
      assert "sin [0, #{Math.PI} / 2]", vec2, [0.0, Math.sin(Math.PI/2)]
    
    it "cos", ->
      assert "cos #{Math.PI} / 2", float, Math.cos(Math.PI/2)
      assert "cos 0", float, 1.0
      assert "cos [0, #{Math.PI} / 2]", vec2, [1.0, Math.cos(Math.PI/2)]
    
    it "tan", ->
      assert "tan #{Math.PI} / 2", float, Math.tan(Math.PI/2)
      assert "tan [0, #{Math.PI} / 2]", vec2, [Math.tan(0), Math.tan(Math.PI/2)]
    
    it "asin", ->
      assert "asin #{Math.sin Math.PI/2}", float, Math.asin Math.sin Math.PI/2
      assert "asin [0, #{Math.sin Math.PI/2}]", vec2, [Math.asin(0.0), Math.asin(Math.sin Math.PI/2)]
    
    it "acos", ->
      assert "acos #{Math.sin Math.PI/2}", float, Math.acos Math.sin Math.PI/2
      assert "acos [0, #{Math.sin Math.PI/2}]", vec2, [Math.acos(0.0), Math.acos(Math.sin Math.PI/2)]
    
    it "atan(y, x)", ->
      assert "atan 1, 2", float, Math.atan2 1, 2
      assert "atan [1, 2], [3, 4]", vec2, [Math.atan2(1, 3), Math.atan2 2, 4]
      
    it "atan(y_over_x)", ->
      assert "atan 0.5", float, Math.atan 0.5
      assert "atan [0.5, 0.75]", vec2, [Math.atan(0.5), Math.atan(0.75)]
      
  describe 'exponential functions, p65', ->
    # These all operate component-wise.  The description is per component.
    
    it 'pow', ->
      assert 'pow 2, 2', float, Math.pow(2, 2)
      assert 'pow [2, 3], [4, 5]', vec2, [Math.pow(2, 4), Math.pow(3, 5)]
      
    it 'exp', ->
      assert 'exp 4', float, Math.exp(4)
      assert 'exp [5, 6]', vec2, [Math.exp(5), Math.exp(6)]
      
    it 'log', ->
      assert 'log 4', float, Math.log 4
      assert 'log [5, 6]', vec2, [Math.log(5), Math.log(6)]
      
    it 'exp2', ->
      assert 'exp2 4', float, Math.pow 2, 4
      assert 'exp2 [5, 6]', vec2, [Math.pow(2, 5), Math.pow(2, 6)]
      
    it 'log2', ->
      assert 'log2 16', float, 4
      assert 'log2 [4, 16]', vec2, [2, 4]
      
    it 'sqrt', ->
      assert 'sqrt 4', float, 2
      assert 'sqrt [16, 25]', vec2, [4, 5]
      
    it 'inversesqrt', ->
      assert 'inversesqrt 4', float, 1 / Math.sqrt 4
      assert 'inversesqrt [16, 25]', vec2, [1 / 4, 1 / 5]
      
    
  describe 'common functions, pp66-67', ->
    # These all operate component-wise.  The description is per component.
    
    it 'abs', ->
      assert 'abs  0', float, 0
      assert 'abs -1', float, 1
      assert 'abs  2', float, 2
      assert 'abs [0, -1, 2]', vec3, [0, 1, 2]
      
    it 'sign', ->
      assert 'sign 0', float, 0
      assert 'sign 5', float, 1
      assert 'sign -5', float, -1
      assert 'sign [0, 5, -5]', vec3, [0, 1, -1]
      
    it 'floor', ->
      assert 'floor 0', float, 0
      assert 'floor 2.4', float, 2
      assert 'floor 3.75', float, 3
      assert 'floor [0, 2.4, 3.75]', 'vec3', [0, 2, 3]
      
    it 'ceil', ->
      assert 'ceil 0', float, 0
      assert 'ceil 2.4', float, 3
      assert 'ceil 3.75', float, 4
      assert 'ceil [0, 2.4, 3.75]', 'vec3', [0, 3, 4]
      
    it 'fract', ->
      assert 'fract 0', float, 0
      assert 'fract 2.4', float, 2.4 - Math.floor(2.4)
      assert 'fract 3.75', float, 3.75 - Math.floor(3.75)
      assert 'fract [0, 2.4, 3.75]', 'vec3', [0, 2.4 - Math.floor(2.4), 3.75 - Math.floor(3.75)]

    it 'mod', ->
      assert 'mod 2, 4', float, 2
      assert 'mod 4, 2', float, 0
      assert 'mod 3, 2', float, 1
      assert 'mod [2, 4, 3], [4, 2, 2]', vec3, [2, 0, 1]
      
    it 'min', ->
      assert 'min 2, 4', float, 2
      assert 'min 4, 2', float, 2
      assert 'min 1, 3', float, 1
      assert 'min [2, 4, 1], [4, 2, 3]', vec3, [2,2,1]
      
    it 'max', ->
      assert 'max 2, 4', float, 4
      assert 'max 4, 2', float, 4
      assert 'max 1, 3', float, 3
      assert 'max [2, 4, 1], [4, 2, 3]', vec3, [4, 4, 3]
      
    it 'clamp', ->
      assert 'clamp 3, 0, 5', float, 3
      assert 'clamp 0, 1, 5', float, 1
      assert 'clamp 5, 0, 4', float, 4
      assert 'clamp [3, 0, 5], [0, 1, 0], [5, 5, 4]', vec3, [3, 1, 4]
      
    it 'mix', ->
      assert 'mix 0, 2, 0',   float,  0
      assert 'mix 0, 2, 1',   float,  2
      assert 'mix 0, 2, -1',  float, -2
      assert 'mix 0, 2, 2',   float,  4
      assert 'mix 0, 2, 0.5', float,  1
      assert 'mix [0, 0, 0], [2, 2, 2], 0.5', vec3, [1, 1, 1]
      
    it 'step', ->
      assert 'step 1, 0', float, 0
      assert 'step 0, 0.2', float, 1
      assert 'step 0, 0', float, 1
      assert 'step [1, 0, 0], [0, 0.2, 0]', vec3, [0, 1, 1]
      
    it 'smoothstep', ->
      assert 'smoothstep 1, 3, 0', float, 0
      assert 'smoothstep 1, 3, 1', float, 0
      assert 'smoothstep 1, 3, 1.25', float, 0.04296875
      assert 'smoothstep 1, 3, 3', float, 1
      assert 'smoothstep 1, 3, 4', float, 1
      assert 'smoothstep [1, 1, 1], [3, 3, 3], [0, 1.25, 4]', vec3, [0, 0.04296875, 1]

  describe 'geometric functions, pp68-69', ->
    # These operate on vectors as vectors, not component-wise.
    
    it 'length', ->
      assert 'length [5, 5]', float, 7.0710678118654755
    
    it 'distance', ->
      assert 'distance [5, 5], [3, 3]', float, 2.8284271247461903
    
    it 'dot', ->
      assert 'dot [1, 0], [0, 1]', float, 0
      assert 'dot [0, 1], [0, 1]', float, 1
    
    it 'cross', ->
      # cross only works with vec3
      expect(-> exec "cross [1, 1], [1, 1]").toThrow()
      expect(-> exec "cross [1,1,1,1], [1,1,1,1]").toThrow()
      assert 'cross [1,0,0], [0,1,0]', 'vec3', [0,0,1]
      
    it 'normalize', ->
      assert 'normalize [0, 4]', 'vec2', [0, 1]
      assert 'normalize [0, 4, 0]', 'vec3', [0, 1, 0]
      assert 'normalize [0, 4, 0, 0]', 'vec4', [0, 1, 0, 0]
      
    it 'faceforward', ->
      assert 'faceforward [1,0], [-1,0], [ 1, 1]', 'vec2', [1, 0]
      assert 'faceforward [1,0], [-1,0], [-1, 1]', 'vec2', [-1, 0]
      
    it 'reflect', ->
      assert 'reflect [0,-1,0], [0,1,0]', 'vec3', [0,1,0]
    
    it 'refract', ->
      assert 'refract [0.707107, -0.707107], [0, 1], 0.9', 'vec2', [0.6363963, -0.7713625935017137]

  describe 'matrix functions, p69', ->
    it 'matrixCompMult', ->
      # since it works component-wise, it doesn't really matter
      # what we give it as long as the args are arrays
      assert 'matrixCompMult mat2(1,2,3,4), mat2(3,2,1,0)', 'mat2', [3, 4, 3, 0]
      
  describe "texture lookup functions, pp71-72", ->
    # These are only implemented to prevent error conditions, they
    # only actually return white.
    
    it 'texture2D', ->
      assert 'texture2D sampler2D(1), [1,1]', 'vec4', [1, 1, 1, 1]
      
    it 'texture2DProj', ->
      assert 'texture2DProj sampler2D(1), [1,1,1]', 'vec4', [1, 1, 1, 1]
      
    it 'texture2DLod', ->
      assert 'texture2DLod sampler2D(1), [1,1], 1', 'vec4', [1, 1, 1, 1]
      
    it 'texture2DProjLod', ->
      assert 'texture2DProjLod sampler2D(1), [1,1,1], 1', 'vec4', [1, 1, 1, 1]
      
    it 'textureCube', ->
      assert 'textureCube sampler2D(1), [1,1,1]', 'vec4', [1, 1, 1, 1]
      
    it 'textureCubeLod', ->
      assert 'textureCubeLod sampler2D(1), [1,1,1], 1', 'vec4', [1, 1, 1, 1]
  