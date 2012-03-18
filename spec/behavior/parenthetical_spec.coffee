require 'spec_helper'

describe 'parenthetical', ->
  it "should not alter order of operation", ->
    code = glsl 'vertex = -> x = (2 + 3) * (4 + 5)'
    sim = simulate code
    expect(sim.state.variables.x.value).toEqual (2 + 3) * (4 + 5) # = 5 * 9 = 45

  it "should implicitly cast vectors into smaller vectors", ->
    sim = simulate glsl 'vertex = -> x = vec2(); x = ([1, 2, 3])'
    expect(sim.state.variables.x.value).toEqual [1, 2]
    