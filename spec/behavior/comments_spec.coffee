require 'spec_helper'

describe "comments", ->
  code = null
  
  it "line comments should not fail to compile", ->
    expect(-> glsl "# ...this would otherwise be invalid").not.toThrow()

  it "block comments should not fail to compile", ->
    expect(-> glsl '###\nthis is a block comment\n###').not.toThrow()

  describe "line comments", ->
    beforeEach -> code = glsl '# comment\nvertex = -> a = 1'
    
    it "should not preserve the comment", ->
      expect(code.vertex).not.toMatch "comment"
    
    it "should simulate successfully", ->
      expect(simulate(code).state.variables.a.value).toEqual 1
      
    it "should handle them from raw glsl", ->
      expect(simulate(vertex: "// comment\nvoid main() { float x; x = 1.0; }").state.variables.x.value).toEqual 1
      
  describe "block comments", ->
    beforeEach -> code = glsl '###\ncomment 1\ncomment 2\n###\nvertex = -> a = 1'

    it "should preserve the comment", ->
      expect(code.vertex).toMatch /\/\*\n  comment 1\n  comment 2\n\*\/\n/

    it "should simulate successfully", ->
      expect(simulate(vertex: code.vertex).state.variables.a.value).toEqual 1
