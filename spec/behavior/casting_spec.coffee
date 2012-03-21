# TODO Most casting specs are currently interspersed across all the other spec files.
# Those specs should be moved here for clarity.

require 'spec_helper'

describe 'casting', ->
  describe "when lvalue is a smaller vector type", ->
    it "should add accessors as needed", ->
      code = glsl 'varyings = vec3: vRGB\nvertex = -> color = [1, 2, 3, 4]; vRGB.rgb = color'
      sim = simulate vertex: code.vertex
      
      expect(code.vertex).toMatch /vRGB.rgb = color.[xrs][ygt][zbp];/
      expect(sim.state.variables.vRGB.value).toEqual [1, 2, 3]
      
  it "implicitly when lvalue is a vec4 and rvalue is a (mat4 * vec4) operation", ->
    code = glsl('uniforms = mat4: mv\nvertex = -> x = mv * [1,2,3,4]; gl_Position = x').vertex
    # console.log code
    sim = simulate (vertex: code), mv: [1,0,0,0, 0,-1,0,0, 0,0,-1,0, 0,0,0,1] # rotation PI rads about X axis
    expect(sim.state.variables.x.value).toEqual [1, -2, -3, 4]
    