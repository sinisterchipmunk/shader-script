require 'spec_helper'

describe 'line counting', ->
  it "should match the error in glsl", ->
    try
      simulate vertex: "\n\n\nvec4 asdf highp;"
    catch e
      expect(e.message).toMatch /line 4/
