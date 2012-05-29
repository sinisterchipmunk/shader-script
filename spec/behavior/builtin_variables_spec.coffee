require 'spec_helper'
sys = require 'util'

describe 'built-in variables', ->
  shader = null
  
  assert_not_declared = (name, assignment) ->
    code = glsl "#{shader} = -> #{name} = #{sys.inspect assignment}"
    expect(code[shader]).toMatch("#{name} =")
    expect(code[shader]).not.toMatch("#{name};")
    
  assert_readable = (name) ->
    expect(-> glsl "#{shader} = -> x = #{name}").not.toThrow()
    
  assert_equal = (name, value) ->
    sim = simulate glsl "#{shader} = -> x = #{name}"
    expect(sim.state.variables.x.value).toEqual value
    
  describe "assigned in simulator", ->
    sim = null
    beforeEach -> sim = simulate fragment: "void main(void) { gl_FragColor = vec4(1,1,1,1); }"
    
    it "should be added to sim.state.variables", ->
      sim.start()
      expect(sim.state.variables.gl_FragColor.value).toEqual [1,1,1,1]
    
  describe "vertex", ->
    beforeEach -> shader = 'vertex'
    
    it "should not be declared in source code", ->
      assert_not_declared 'gl_Position', [1,1,1,1]
      assert_not_declared 'gl_PointSize', 1
      
    it "should make builtins readable", ->
      assert_readable "gl_Position"
      assert_readable "gl_PointSize"
      assert_readable "gl_MaxVertexAttribs"
      assert_readable "gl_MaxVertexUniformVectors"
      assert_readable "gl_MaxVaryingVectors"
      assert_readable "gl_MaxVertexTextureImageUnits"
      assert_readable "gl_MaxCombinedTextureImageUnits"
      assert_readable "gl_MaxTextureImageUnits"
      assert_readable "gl_MaxFragmentUniformVectors"
      assert_readable "gl_MaxDrawBuffers"
      
    it "should be able to simulate reading variables", ->
      assert_equal 'gl_MaxVertexAttribs', 8
      
  describe "fragment", ->
    beforeEach -> shader = 'fragment'
    
    it "should not be declared in source code", ->
      assert_not_declared 'gl_FragCoord', [1,1,1,1]
      assert_not_declared 'gl_FrontFacing', true
      assert_not_declared 'gl_FragColor', [1,1,1,1]
      assert_not_declared 'gl_PointCoord', [1,1]
      
    it "should make builtins readable", ->
      assert_readable "gl_FragCoord"
      assert_readable "gl_FrontFacing"
      assert_readable "gl_FragColor"
      assert_readable "gl_PointCoord"
      assert_readable "gl_MaxVertexAttribs"
      assert_readable "gl_MaxVertexUniformVectors"
      assert_readable "gl_MaxVaryingVectors"
      assert_readable "gl_MaxVertexTextureImageUnits"
      assert_readable "gl_MaxCombinedTextureImageUnits"
      assert_readable "gl_MaxTextureImageUnits"
      assert_readable "gl_MaxFragmentUniformVectors"
      assert_readable "gl_MaxDrawBuffers"

