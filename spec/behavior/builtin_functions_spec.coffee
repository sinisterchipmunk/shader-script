require 'spec_helper'

# The comments in this spec are taken from the GLSL spec:
# http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

describe "built-in functions", ->
  assert = (operation, expected_type, expected_value) ->
    if expected_type is undefined then throw new Error "Expected type is undefined"
    if expected_value is undefined then throw new Error "Expected value is undefined"
    
    sim = simulate glsl "vertex = -> x = #{operation}"
    expect(sim.state.variables.x.type()).toEqual expected_type
    expect(sim.state.variables.x.value).toEqual expected_value
  
  describe 'angle and trigonometry functions', ->
    # Function parameters specified as angle are assumed to be in units of radians.  In no case will any of these
    # functions result in a divide by zero error.  If the divisor of a ratio is 0, then results will be undefined.
    # These all operate component-wise.  The description is per component.
    
    it 'radians', ->
      assert 'radians 180', 'float', Math.PI

    it 'degrees', ->
      assert "degrees #{Math.PI}", 'float', 180
        
    it 'sin', ->
      assert "sin #{Math.PI} / 2", 'float', Math.sin(Math.PI/2)
      assert "sin 0", 'float', 0.0
    
    it "cos", ->
      assert "cos #{Math.PI} / 2", 'float', Math.cos(Math.PI/2)
      assert "cos 0", 'float', 1.0
        