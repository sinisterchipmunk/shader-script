require 'spec_helper'

describe "Preprocessor", ->
  it "should not append terminators", ->
    nodes = parse_glsl_tree "a\nb\n"
    # console.log nodes
    expect(nodes[nodes.length-1][0]).not.toEqual 'TERMINATOR'

  it "should not lose curly brace pairs when encountering a single-line comment", ->
    nodes = parse_glsl_tree """
    void main0(void) {
      // 
    }
    """
    # console.log nodes
    