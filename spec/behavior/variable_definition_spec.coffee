require 'spec_helper'

describe 'variable definition', ->
  it "should infer variable types from context", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /int x/
    
    sim = simulate(code).start()
    sim.state.variables.x.type.should == 'int'
