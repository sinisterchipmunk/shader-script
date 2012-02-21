require 'spec_helper'

describe "simulator", ->
  it "should process an empty shader", ->
    sim = simulate
      vertex: "void main() { }"
      fragment: "void main() { }"
    sim.start()
    
    # what is there to verify?
   
  describe "with a variable defined but no main", ->
    it "should validate main exists", -> 
      sim = simulate vertex: "float x;"
      expect(-> sim.start()).toThrow("vertex: no main function found!")
    
  it "should process a basic assignment", ->
    # console.log parse_glsl_tree("float value; void main() { value = 1; }")
    sim = simulate vertex: "float value; void main() { value = 1.0; }"
    sim.start()
    expect(sim.state.variables.value.value).toEqual 1.0
    
  it "should process function calls", ->
    sim = simulate vertex: "float value; void set() { value = 1.0; } void main() { set(); }"
    sim.start()
    expect(sim.state.variables.value.value).toEqual 1.0
    
  it "should process a vec4 assignment", ->
    sim = simulate vertex: "vec4 gl_FragCoord; void main() { gl_FragCoord = vec4(1,1,1,1); }"
    sim.start()
    expect(sim.state.variables.gl_FragCoord.value).toEqual([1, 1, 1, 1]);
    
  it "should execut both shaders if available", ->
    sim = simulate
      vertex: "vec4 gl_FragCoord; void main() { gl_FragCoord = vec4(1,1,1,1); }"
      fragment: "vec4 gl_FragColor; void main() { gl_FragColor = vec4(1,0,0,1); }"
    sim.start()
    expect(sim.state.variables.gl_FragCoord.value).toEqual([1, 1, 1, 1]);
    expect(sim.state.variables.gl_FragColor.value).toEqual([1, 0, 0, 1]);
