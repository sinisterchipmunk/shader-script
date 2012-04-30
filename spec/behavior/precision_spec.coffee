require 'spec_helper'

describe 'precision', ->
  it "should be assignable", ->
    code = glsl 'precision highp float\nvertex = ->'
    expect(code.vertex).toMatch /precision highp float;/
