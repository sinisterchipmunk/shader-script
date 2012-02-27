require 'spec_helper'

# The comments in this spec are taken from the GLSL spec:
# http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

describe "built-in functions", ->
  # define some helpers for my fingers' sake
  float = 'float'
  
  assert = (operation, expected_type, expected_value) ->
    if expected_type is undefined then throw new Error "Expected type is undefined"
    if expected_value is undefined then throw new Error "Expected value is undefined"
    
    sim = simulate glsl "vertex = -> x = #{operation}"
    expect(sim.state.variables.x.type()).toEqual expected_type
    expect(sim.state.variables.x.value).toEqual expected_value
  
  # Trigonometric functions, p65
  describe 'angle and trigonometry functions', ->
    # Function parameters specified as angle are assumed to be in units of radians.  In no case will any of these
    # functions result in a divide by zero error.  If the divisor of a ratio is 0, then results will be undefined.
    # These all operate component-wise.  The description is per component.
    
    it 'radians', ->
      assert 'radians 180', float, Math.PI

    it 'degrees', ->
      assert "degrees #{Math.PI}", float, 180
        
    it 'sin', ->
      assert "sin #{Math.PI} / 2", float, Math.sin(Math.PI/2)
      assert "sin 0", float, 0.0
    
    it "cos", ->
      assert "cos #{Math.PI} / 2", float, Math.cos(Math.PI/2)
      assert "cos 0", float, 1.0
    
    it "tan", ->
      assert "tan #{Math.PI} / 2", float, Math.tan(Math.PI/2)
    
    it "asin", ->
      assert "asin #{Math.sin Math.PI/2}", float, Math.asin Math.sin Math.PI/2
    
    it "acos", ->
      assert "acos #{Math.sin Math.PI/2}", float, Math.acos Math.sin Math.PI/2
    
    it "atan(y, x)", ->
      assert "atan 1, 2", float, Math.atan2 1, 2
      
    it "atan(y_over_x)", ->
      assert "atan 0.5", float, Math.atan 0.5
      
  # Exponential functions, p65
  describe 'exponential functions', ->
    # These all operate component-wise.  The description is per component.
    
    it 'pow', ->
      assert 'pow 2, 2', float, Math.pow(2, 2)
      
    it 'exp', ->
      assert 'exp 4', float, Math.exp(4)
      
    it 'log', ->
      assert 'log 4', float, Math.log 4
      
    it 'exp2', ->
      assert 'exp2 4', float, Math.pow 2, 4
      
    it 'log2', ->
      assert 'log2 16', float, 4
      
    it 'sqrt', ->
      assert 'sqrt 4', float, 2
      
    it 'inversesqrt', ->
      assert 'inversesqrt 4', float, 1 / Math.sqrt 4
      
    
  # Common functions, pp66-67
  describe 'common functions', ->
    # These all operate component-wise.  The description is per component.
    
    it 'abs', ->
      assert 'abs  0', float, 0
      assert 'abs -1', float, 1
      assert 'abs  2', float, 2
      
    it 'sign', ->
      assert 'sign 0', float, 0
      assert 'sign 5', float, 1
      assert 'sign -5', float, -1
      
    it 'floor', ->
      assert 'floor 0', float, 0
      assert 'floor 2.4', float, 2
      assert 'floor 3.75', float, 3
      
    it 'ceil', ->
      assert 'ceil 0', float, 0
      assert 'ceil 2.4', float, 3
      assert 'ceil 3.75', float, 4
      
    it 'fract', ->
      assert 'fract 0', float, 0
      assert 'fract 2.4', float, 2.4 - Math.floor(2.4)
      assert 'fract 3.75', float, 3.75 - Math.floor(3.75)

    it 'mod', ->
      assert 'mod 2, 4', float, 2
      assert 'mod 4, 2', float, 0
      assert 'mod 3, 2', float, 1
      
    it 'min', ->
      assert 'min 2, 4', float, 2
      assert 'min 4, 2', float, 2
      assert 'min 1, 3', float, 1
      
    it 'max', ->
      assert 'max 2, 4', float, 4
      assert 'max 4, 2', float, 4
      assert 'max 1, 3', float, 3
      
    it 'clamp', ->
      assert 'clamp 3, 0, 5', float, 3
      assert 'clamp 0, 1, 5', float, 1
      assert 'clamp 5, 0, 4', float, 4
      
    it 'mix', ->
      assert 'mix 0, 2, 0', float, 0
      assert 'mix 0, 2, 1', float, 2
      assert 'mix 0, 2, -1', float, -2
      assert 'mix 0, 2, 2', float, 4
      assert 'mix 0, 2, 0.5', float, 1
      
    it 'step', ->
      assert 'step 1, 0', float, 0
      assert 'step 0, 0.2', float, 1
      assert 'step 0, 0', float, 1
      
    it 'smoothstep', ->
      assert 'smoothstep 1, 3, 0', float, 0
      assert 'smoothstep 1, 3, 1', float, 0
      assert 'smoothstep 1, 3, 1.25', float, 0.04296875
      assert 'smoothstep 1, 3, 3', float, 1
      assert 'smoothstep 1, 3, 4', float, 1
