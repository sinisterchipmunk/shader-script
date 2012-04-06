require 'spec_helper'

describe "type inference", ->
  it "should infer type of lvalue from operation with vec4/float types", ->
    code = glsl """
      vertex = -> diffuse = [1,1,1,1] * 1.0
    """
    expect(code.vertex).toMatch /vec4 diffuse/
  
  it "for function params from function param values", ->
    code = glsl """
      m = (a) -> 1
      fpos = (angle) -> m(angle)
      vertex = -> fpos(1)
    """
    expect(code.vertex).toMatch /float a\)/
  
  it "for functions from function return value", ->
    code = glsl """
      m = -> return 1.0
    """
    expect(code.vertex).toMatch(/float m\(/)

  it "for variable from function return value", ->
    code = glsl "m = -> return 1.0\nvertex = -> x = m()"
    expect(code.vertex).toMatch /float x;/

  it "should add decimal to inferred floats", ->
    code = glsl 'vertex = -> x = 1'
    expect(code.vertex).toMatch /x = 1\.0;/

  it "should infer float type from assignment", ->
    code = glsl 'vertex = -> x = 1.0'
    expect(code.vertex).toMatch /float x/
    expect(simulate(code).state.variables.x.type()).toEqual 'float'

  it "should infer proper local variable type", ->
    code = glsl """
      f = (a) ->
        b = a

      vertex = ->
        f(1.0)
    """
    expect(code.vertex).toMatch /float b/
