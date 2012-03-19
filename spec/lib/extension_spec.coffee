require 'spec_helper'
{Extension} = require 'shader-script/builtins'
{Literal} = require 'shader-script/glsl/nodes/literal'

describe "Extension", ->
  e = null
  beforeEach ->
    e = new Extension '__test_ext', null, ((args...) -> @component_wise args..., (argset...) -> argset), false
  
  invoke = (args...) -> e.callback args...
    
  it "should handle a single scalar value", ->
    expect(invoke 1).toEqual [ 1 ]
    
  it "should handle multiple scalar values", ->
    expect(invoke 1, 2).toEqual [1, 2]
  
  it "should iterate uniformly given a single vec", ->
    expect(invoke [1, 2]).toEqual [ [1], [2] ]
    
  it "should iterate uniformly given multiple vecs", ->
    expect(invoke [1, 2], [3, 4]).toEqual [ [1, 3], [2, 4] ]
    
  it "should puke given vecs of differing sizes", ->
    expect(-> invoke [1, 2, 3], [4, 5]).toThrow()
  
  it "should puke given vecs of differing sizes mixed with scalars", ->
    expect(-> invoke [1, 2, 3], 6, [4, 5], 7).toThrow()

  it "should iterate given a mix of scalars and vecs", ->
    expect(invoke 1, [2, 3], 4).toEqual [ [1, 2, 4], [1, 3, 4] ]
    
  it "should iterate given a mix with undefined values", ->
    expect(invoke 1, undefined, [2, 3]).toEqual [ [1, undefined, 2], [1, undefined, 3] ]
    