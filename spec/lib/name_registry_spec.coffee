require 'spec_helper'

{NameRegistry} = require 'shader-script/name_registry'

describe "name registry", ->
  reg = null
  beforeEach -> reg = new NameRegistry()
  
  it "should not define the same name twice", ->
    first = reg.define 'name'
    second = reg.define 'name'
    expect(first).not.toEqual second
    