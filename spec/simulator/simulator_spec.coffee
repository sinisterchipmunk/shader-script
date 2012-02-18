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
    sim = simulate vertex: "float value; void main() { value = 1; }"
    sim.start()
    expect(sim.state.variables.value).toEqual 1
    
  xit "shuold process a vec4 assignment", ->
    sim = simulate vertex: "void main() { gl_FragCoord = vec4(1,1,1,1); }"
    sim.start()
    expect(sim.state.variables.gl_FragCoord).toEqual([1, 1, 1, 1]);
    expect(sim.state.variables.gl_FragColor).toEqual([1, 0, 0, 1]);
    