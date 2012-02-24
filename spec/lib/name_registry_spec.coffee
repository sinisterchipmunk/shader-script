require 'spec_helper'

{NameRegistry} = require 'shader-script/name_registry'

describe "name registry", ->
  reg = null
  beforeEach -> reg = new NameRegistry()
  
  it "should not define the same name twice", ->
    first = reg.define 'name'
    second = reg.define 'name'
    expect(first).not.toEqual second
    
  it "should not clash with differring names", ->
    first = reg.define 'name1'
    second = reg.define 'name2'
    expect(first).not.toEqual second
    