require 'spec_helper'
{Simulator} = require 'shader-script'

describe "storage qualifiers", ->
  describe "syntax", ->
    it "should allow definition of arrays", ->
      expect(glsl('uniforms = mat4: shadows[3]').vertex).toMatch /uniform mat4 shadows\[3\];/
    
    it "should allow definition of arrays within brackets", ->
      expect(glsl('uniforms = mat4: [ shadows[3] ]').vertex).toMatch /uniform mat4 shadows\[3\];/
      
    it "should allow definition of arrays spanning multiple lines without comma", ->
      expect(glsl('uniforms = mat4:\n  mv[3]\n  p[4]').vertex).toMatch /uniform mat4 mv\[3\], p\[4\];/
    
    it "should allow definition of arrays spanning multiple lines with comma", ->
      expect(glsl('uniforms = mat4:\n  mv[3],\n  p[4]').vertex).toMatch /uniform mat4 mv\[3\], p\[4\];/

    it "should allow brackets", ->
      expect(glsl('uniforms = mat4: [mv, p]').vertex).toMatch /uniform mat4 mv, p/

    it "should allow brackets spanning multiple lines", ->
      expect(glsl('uniforms = mat4: [\n  mv,\n  p\n]').vertex).toMatch /uniform mat4 mv, p/

    it "should allow omission of comma spanning multiple lines", ->
      expect(glsl('uniforms = mat4:\n  mv\n  p').vertex).toMatch /uniform mat4 mv, p/
      
    it "should allow presence of comma spanning multiple lines", ->
      expect(glsl('uniforms = mat4:\n  mv,\n  p').vertex).toMatch /uniform mat4 mv, p/
      
  describe "arrays in simulator", ->
    it "should handle them independently", ->
      code = "uniform vec3 v[2]; void main(void) { vec3 x = v[0] + v[1]; }"
      console.log parse_glsl_tree code
      sim = new Simulator fragment: code
      sim.state.variables.v[0].value = [0, 1, 0]
      sim.state.variables.v[1].value = [2, 4, 6]
      sim.start()
      expect(sim.state.variables.x.value).toEqualish [2, 5, 6]
  
  describe "uniforms", ->
    it "should not taint them between runs", ->
      sim = new Simulator fragment: "uniform vec3 v; void main(void) { -v; }"
      value = sim.state.variables.v.value = [0,1,0]
      sim.start()
      expect(sim.state.variables.v.value).toEqualish(value)

    it "should declare them", ->
      script = 'uniforms =\n  vec3: position\n  mat4: [mv, p]'
      # console.log parse_tree(script)
      code = glsl script
      # console.log code
      expect(code.vertex).toMatch /uniform vec3 position/
      expect(code.vertex).toMatch /uniform mat4 mv, p/
  
    it "should be able to use them", ->
      script = """
        uniforms = mat4: mvp
        attributes = vec4: [ position, color ]
        vertex = -> gl_Position = mvp * position
      """
      code = glsl script
      # console.log code.vertex
      expect(code.vertex).toMatch /gl_Position = mvp \* position;/
      
    it "should not declare them twice", ->
      code = glsl 'uniforms = mat4: mv'
      expect(code.vertex.indexOf('uniform mat4 mv')).toEqual code.vertex.lastIndexOf 'uniform mat4 mv'
    
    it "should not create empty lines with terminators", ->
      code = glsl 'uniforms = mat4: mv'
      expect(code.vertex.indexOf('\n;')).toEqual -1
      
  describe "attributes", ->
    it "should not be present in fragment shader", ->
      script = 'attributes =\n  vec3: position'
      code = glsl script
      expect(code.vertex).toMatch /attribute vec3 position/ # sanity check
      expect(code.fragment).not.toMatch /attribute vec3 position/
      
    it "should not raise reference errors in fragment shader when used in vertex shader", ->
      script = 'attributes =\n  vec3: position\nvertex = -> pos = position\nfragment = -> gl_FragColor = vec4 1'
      expect(-> glsl script).not.toThrow()

    it "should convert attributes from float arrays", ->
      attrs = new Float32Array [0, 1, 0,  -1, 0, 0,  1, 0, 0] # triangle
      code = glsl 'attributes = vec4: pos\nvertex = -> gl_Position = pos'
      sim = new Simulator vertex: code.vertex
      sim.state.variables.pos.value = attrs
      sim.start()
      expect(sim.state.variables.pos.value).toEqualish [0, 1, 0, 1]
      