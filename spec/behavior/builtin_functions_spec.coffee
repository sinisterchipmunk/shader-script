require 'spec_helper'

# The comments in this spec are taken from the GLSL spec:
# http://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

describe "built-in functions", ->
  describe 'angle and trigonometry functions', ->
    # Function parameters specified as angle are assumed to be in units of radians.  In no case will any of these
    # functions result in a divide by zero error.  If the divisor of a ratio is 0, then results will be undefined.
    # These all operate component-wise.  The description is per component.
    
    # Converts degrees to radians, i.e. pi/180 * degrees
    describe 'radians', ->
      it "with float", ->
        sim = simulate glsl 'vertex = -> x = radians 180'
        expect(sim.state.variables.x.type()).toEqual 'float'
        expect(sim.state.variables.x.value).toEqual Math.PI
