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
      