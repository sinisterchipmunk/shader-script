require 'spec_helper'

describe 'variable definition', ->
  # all numbers are now inferred as floats. If you want ints, create them
  # with type constructors.
  xit "should infer int type from assignment", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /int x/
    simulate(code).start().state.variables.x.type.should == 'int'
    
  it "should add decimal to inferred floats", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /x = 1\.0;/

  it "should infer float type from assignment", ->
    code = glsl 'vertex = -> x = 1.0'
    expect(code.vertex).toMatch /float x/
    simulate(code).start().state.variables.x.type.should == 'float'
    
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
