require 'spec_helper'

describe "If-conditions", ->
  describe "variants", ->
    it "post-if true", ->
      sim = simulate glsl "vertex = -> a = 1; a = 2 if a == 1"
      expect(sim.state.variables.a.value).toEqual 2
      
    it "post-if false", ->
      sim = simulate glsl "vertex = -> a = 1; a = 2 if a == 3"
      expect(sim.state.variables.a.value).toEqual 1
    
    it "pre-if then true", ->
      sim = simulate glsl "vertex = -> a = 1; if a == 1 then a = 2"
      expect(sim.state.variables.a.value).toEqual 2
      
    it "pre-if then false", ->
      sim = simulate glsl "vertex = -> a = 1; if a == 2 then a = 3"
      expect(sim.state.variables.a.value).toEqual 1
      
    it "pre-if then true else false", ->
      sim = simulate glsl "vertex = -> a = 1; if a == 1 then a = 2 else a = 3"
      expect(sim.state.variables.a.value).toEqual 2
      
    it "pre-if then false else true", ->
      sim = simulate glsl "vertex = -> a = 1; if a == 2 then a = 4 else a = 3"
      expect(sim.state.variables.a.value).toEqual 3
      
  it "should handle true if with no braces in simulator", ->
    code = fragment: "void main(void) { if (1) discard; }"
    expect(-> simulate code).toThrow "fragment: discarded"
      
  it "should handle false if with no braces in simulator", ->
    code = fragment: "void main(void) { if (0) discard; }"
    expect(-> simulate code).not.toThrow "fragment: discarded"

  it "should not redefine variables in condition block", ->
    code = glsl "a = 1; vertex = -> if a == 2 then a = 3"
    # console.log code.vertex
    expect(code.vertex.lastIndexOf('float a')).toBeLessThan(code.vertex.indexOf('{'))
    
  it "should handle an empty if", ->
    code = glsl "a = 1; vertex = -> if a == 1 then "
    # console.log code.vertex
    sim = simulate vertex: code.vertex
    sim.start()
  
  it "should handle an empty else", ->
    code = glsl "a = 1; vertex = -> if a == 0 then a = 2 else ; "
    # console.log code.vertex
    sim = simulate vertex: code.vertex
    sim.start()

  it "should handle a true condition", ->
    sim = simulate glsl "vertex = ->\n  a = 1\n  if a == 1\n    a = 2"
    expect(sim.state.variables.a.value).toEqual 2
  
  it "should handle a false condition", ->
    sim = simulate glsl "vertex = ->\n  a = 1\n  if a == 2\n    a = 3"
    expect(sim.state.variables.a.value).toEqual 1
    
  it "should not invoke else block when if condition is true", ->
    code = glsl "vertex = ->\n  a = 1\n  if a == 1\n    a = 2\n  else\n    a = 3"
    # console.log code.vertex
    sim = simulate code
    expect(sim.state.variables.a.value).toEqual 2

  it "should invoke else block when if condition is false", ->
    code = glsl "vertex = -> a = 1; if a == 0 then a = 2 else a = 3"
    # console.log parse_glsl_tree code.vertex
    sim = simulate code
    expect(sim.state.variables.a.value).toEqual 3
  