require 'spec_helper'

describe 'precision', ->
  it "should be assignable", ->
    code = glsl 'precision highp float\nvertex = ->'
    expect(code.vertex).toMatch /precision highp float;/

  it "should be accepted by simulator", ->
    sim = simulate vertex: glsl('precision highp float\nvertex = ->').vertex
    sim.start()
    