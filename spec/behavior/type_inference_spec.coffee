require 'spec_helper'

describe "type inference", ->
  it "should infer single-component accessors from type constructor as the base type instead of a vec1 of base type", ->
    code = glsl 'vertex = -> x = vec4(1).x'
    expect(code.vertex).toMatch /float x/
    
    sim = simulate code
    sim.start()
    expect(sim.state.variables.x.value).toEqual 1
  
  it "should infer single-component accessors from [] as the base type instead of a vec1 of base type", ->
    code = glsl 'vertex = -> x = [1,1,1,1].x'
    expect(code.vertex).toMatch /float x/

    sim = simulate code
    sim.start()
    expect(sim.state.variables.x.value).toEqual 1

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
