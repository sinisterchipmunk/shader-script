require 'spec_helper'

describe 'variable definition', ->
  it "should infer int type from assignment", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /int x/
    simulate(code).start().state.variables.x.type.should == 'int'

  it "should infer float type from assignment", ->
    code = glsl 'vertex = -> x = 1.0'
    expect(code.vertex).toMatch /float x/
    simulate(code).start().state.variables.x.type.should == 'float'
    
  it "should not lose floating point values", ->
    code = glsl 'vertex = -> x = 1.0'
    expect(code.vertex).toMatch /x = 1.0/

  it "should complain about mismatched variable types", ->
    expect(-> console.log(glsl 'vertex = -> x = 1; x = 1.0')).toThrow(
      "Variable 'x' redefined with conflicting type: int redefined as float"
    )
    