require 'spec_helper'

describe 'variable definition', ->
  # all numbers are now inferred as floats. If you want ints, create them
  # with type constructors.
  xit "should infer int type from assignment", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /int x/
    simulate(code).state.variables.x.type.should == 'int'
    
  it "should allow use of the same variable name in different functions", ->
    code = glsl """
      one = -> x = 1; return x
      two = -> x = 2; return x
      
      vertex = -> x = 0; y = one(); z = two()
    """
    # console.log code.vertex
    sim = simulate vertex: code.vertex
    # console.log sim.state.scope.all_definitions()
    # console.log sim.state.variables
    expect(sim.state.variables.x.value).toEqual 0
    expect(sim.state.variables.y.value).toEqual 1
    expect(sim.state.variables.z.value).toEqual 2
    
  it "should add decimal to inferred floats", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /x = 1\.0;/

  it "should infer float type from assignment", ->
    code = glsl 'vertex = -> x = 1.0'
    expect(code.vertex).toMatch /float x/
    expect(simulate(code).state.variables.x.type()).toEqual 'float'
    
  it "should not lose floating point values", ->
    code = glsl 'vertex = -> x = 1.0'
    expect(code.vertex).toMatch /x = 1.0/

  it "should complain about mismatched variable types", ->
    expect(try
      glsl 'vertex = -> x = true; x = 1.0'
    catch e
      e.toString()
    ).toMatch(/redefined with conflicting type: bool redefined as float/)
    
  it "should infer proper local variable type", ->
    code = glsl """
      f = (a) ->
        b = a

      vertex = ->
        f(1.0)
    """
    expect(code.vertex).toMatch /float b/
