require 'spec_helper'

describe "storage qualifiers", ->
  describe "uniforms", ->
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
