require 'spec_helper'

describe 'shader', ->
  it "should produce an empty js shader", ->
    expect(json '').toEqual name: 'shader', body: []
  
  it "should produce an empty named js shader", ->
    expect(json 'shader "name"').toEqual name: 'name', body: []
  
  