require 'spec_helper'

{Scope} = require 'shader-script/scope'

describe "scope", ->
  scope = null
  beforeEach -> scope = new Scope('a')
  
  it "should qualify itself", ->
    expect(scope.qualifier()).toEqual 'a'
    
  it "should push a scope", ->
    expect(scope.push('b')).not.toBe(scope)
    
  it "should push a qualified scope", ->
    expect(scope.push('b').qualifier()).toEqual "a.b"
    
  it "should qualify its current subscope", ->
    scope.push('b')
    expect(scope.qualifier()).toEqual 'a.b'
    
  it "should pop back to itself", ->
    scope.push('b')
    expect(scope.pop()).toBe(scope)
    
  it "should pop the qualifier back", ->
    scope.push('b').pop().push('c')
    expect(scope.qualifier()).toEqual 'a.c'
    
  it "should only pop one level back", ->
    scope.push('b').push('c')
    expect(scope.qualifier()).toEqual 'a.b.c' # sanity check
    expect(scope.pop().qualifier()).toEqual 'a.b'
    expect(scope.qualifier()).toEqual 'a.b'
    
  it "should function as advertised", ->
    scope.push 'main'                         # global -> main
    scope.define 'x', type: 'float'           # global -> main
    expect(scope.lookup('x').name).toEqual 'x'
    expect(scope.lookup('x').type).toEqual 'float'
    expect(scope.lookup('x').qualified_name).toEqual 'a.main.x'
    
    scope.push 'iter'                         # global -> main -> iter
    scope.define 'i', type: 'int'             # global -> main -> iter
    expect(scope.lookup('i').name).toEqual 'i'
    expect(scope.lookup('i').type).toEqual 'int'
    expect(scope.lookup('i').qualified_name).toEqual 'a.main.iter.i'
    scope.pop()                               # global -> main
    expect(-> scope.lookup('i')).toThrow()
    
  it "should chain as advertised", ->
    scope.push('b')
    expect(scope.qualifier()).toEqual 'a.b'
    
    scope.push('c')
    expect(scope.qualifier()).toEqual 'a.b.c'
    scope.pop()
  
    scope.push('d')
    expect(scope.qualifier()).toEqual 'a.b.d'
    scope.pop()
    
    scope.pop()
    scope.push('e')
    expect(scope.qualifier()).toEqual 'a.e'
    
    scope.push('f')
    expect(scope.qualifier()).toEqual 'a.e.f'
    scope.pop()
    
    scope.push('g')
    expect(scope.qualifier()).toEqual 'a.e.g'
    scope.pop()
    
    expect(scope.qualifier()).toEqual 'a.e'
    scope.pop()
    expect(scope.qualifier()).toEqual 'a'

    scope.pop() # at root level this actually does nothing
    expect(scope.qualifier()).toEqual 'a'
    