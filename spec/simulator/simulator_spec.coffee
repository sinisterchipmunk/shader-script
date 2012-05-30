require 'spec_helper'

describe "simulator", ->
  it "should process an empty shader", ->
    sim = simulate
      vertex: "void main() { }"
      fragment: "void main() { }"
    sim.start()
    
    # what is there to verify?
   
  it "should execute a string parameter as a vertex program", -> 
    expect(-> simulate "void main(void) { }").not.toThrow()
   
  describe "with a variable defined but no main", ->
    it "should validate main exists", -> 
      expect(-> simulate vertex: 'float x;').toThrow("vertex: no main function found!")
    
  it "should process a basic assignment", ->
    # console.log parse_glsl_tree("float value; void main() { value = 1; }")
    sim = simulate vertex: "float value; void main() { value = 1.0; }"
    expect(sim.state.variables.value.value).toEqual 1.0
    
  it "should process function calls", ->
    sim = simulate vertex: "float value; void set() { value = 1.0; } void main() { set(); }"
    expect(sim.state.variables.value.value).toEqual 1.0
    
  it "should process a vec4 assignment", ->
    sim = simulate vertex: "vec4 gl_FragCoord; void main() { gl_FragCoord = vec4(1,1,1,1); }"
    expect(sim.state.variables.gl_FragCoord.value).toEqual([1, 1, 1, 1]);
    
  it "should execut both shaders if available", ->
    sim = simulate
      vertex: "vec4 gl_FragCoord; void main() { gl_FragCoord = vec4(1,1,1,1); }"
      fragment: "vec4 gl_FragColor; void main() { gl_FragColor = vec4(1,0,0,1); }"
    expect(sim.state.variables.gl_FragCoord.value).toEqual([1, 1, 1, 1]);
    expect(sim.state.variables.gl_FragColor.value).toEqual([1, 0, 0, 1]);

  it "should populate uniforms", ->
    mv = mv: [1,0,0,0, 0,-1,0,0, 0,0,0,-1, 0,0,0,1] # rotation PI rads about X axis
    sim = simulate (vertex: glsl('uniforms = mat4: mv\nvertex = -> ').vertex), mv: mv
    expect(sim.state.variables.mv.value).toEqual mv
  