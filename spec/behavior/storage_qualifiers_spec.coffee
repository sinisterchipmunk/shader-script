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
      