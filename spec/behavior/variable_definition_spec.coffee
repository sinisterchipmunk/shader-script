require 'spec_helper'
{Simulator} = require 'shader-script'

describe 'variable definition', ->
  # all numbers are now inferred as floats. If you want ints, create them
  # with type constructors.
  xit "should infer int type from assignment", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /int x/
    simulate(code).state.variables.x.type.should == 'int'
  
  describe "glsl parser", ->
    it "should handle declaration and assignment in same statement", ->
      sim = simulate vertex: "void main() { vec4 a = vec4(0, 1, 2, 3); }"
      sim.start()
      expect(sim.state.variables.a.value).toEqualish [0,1,2,3]
      
    it "should handle definition of multiple variables at the same time", ->
      sim = simulate vertex: 'void main() { vec4 a, b = vec4(0, 1, 2, 3), c; }'
      sim.start()
      expect(sim.state.variables.a).not.toBeUndefined()
      expect(sim.state.variables.b.value).toEqualish [0, 1, 2, 3]
      expect(sim.state.variables.c).not.toBeUndefined()
      
    it "should handle definition of a single variable at a time", ->
      fcode = 'bool a = false; void main(void) { }'
      sim = new Simulator fragment: fcode
      expect(sim.state.variables.a.value).toBe false
    
  it "should allow use of the same variable name in different functions", ->
    code = glsl """
      one = -> x = 1; return x
      two = -> x = 2; return x
      
      vertex = -> x = 0; y = one(); z = two()
    """
    sim = simulate vertex: code.vertex
    expect(sim.state.variables.x.value).toEqual 0
    expect(sim.state.variables.y.value).toEqual 1
    expect(sim.state.variables.z.value).toEqual 2
    
  it "should not lose floating point values", ->
    code = glsl 'vertex = -> x = 1.0'
    expect(code.vertex).toMatch /x = 1.0/

  it "should complain about mismatched variable types", ->
    expect(-> glsl 'vertex = -> x = true; x = 1.0').toThrow()
    