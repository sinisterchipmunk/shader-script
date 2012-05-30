require 'spec_helper'

describe 'discard', ->
  it "should throw 'fragment discarded'", ->
    expect(-> simulate glsl 'fragment = -> discard').toThrow "fragment: discarded"
