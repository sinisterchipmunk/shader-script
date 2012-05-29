require 'spec_helper'

describe "Preprocessor", ->
  it "should not append terminators", ->
    nodes = parse_glsl_tree "a\nb\n"
    # console.log nodes
    expect(nodes[nodes.length-1][0]).not.toEqual 'TERMINATOR'
