require 'spec_helper'

{Scope} = require 'shader-script/scope'

describe "scope", ->
  scope = null
  beforeEach -> scope = new Scope('a')
  
  describe "looking up objects", ->
    it "should be looked up from a deeper scope", ->
      scope.define 'name'
      scope.push()
      expect(scope.lookup 'name').toBeTruthy()
    
    it "should conflict when redefined in a deeper scope", ->
      scope.define 'name', type: 'int'
      scope.push()
      expect(-> scope.define 'name', type: "float").toThrow()
      
    it "should find the higher level variable when redefined in a deeper scope", ->
      scope.define 'name'
      scope.push()
      scope.define 'name', type: 'float'
      scope.pop()
      expect(scope.lookup('name').type()).toEqual 'float'
      
    it "should lookup from root scope by fully qualified name", ->
      scope.push('b').define('name').qualified_name
      scope.pop()
      expect(-> scope.lookup('a.b.name')).not.toThrow()
      
    it "should lookup from subscope by fully qualified name", ->
      scope.push('block').push('vertex')
      variable = scope.define('n')
      scope.push('smth')
      expect(scope.lookup('block.vertex.n')).toBe variable
  
  describe "defining objects", ->
    it "should allow type to be undefined", ->
      expect(scope.define('name').type()).toBeUndefined()
    
    it "should allow redefinition with null type", ->
      scope.define('name')
      expect(-> scope.define('name')).not.toThrow()
      
    it "should allow type to be redefined with null type, inheriting original", ->
      scope.define 'name', type: 'int'
      expect(scope.define('name').type()).toEqual 'int'
    
    it "should allow type to be set when original is undefined", ->
      scope.define 'name'
      expect(scope.define('name', type: 'int').type()).toEqual 'int'
      
    it "should allow redefinition with identical type", ->
      scope.define 'name', type: 'int'
      expect(-> scope.define('name', type: 'int')).not.toThrow()
      
    it "should raise error when conflicting types specified", ->
      scope.define 'name', type: 'int'
      expect(-> scope.define('name', type: 'float')).toThrow(
        "Variable 'a.name' redefined with conflicting type: int redefined as float"
      )
      
    it "should delegate unknown types into dependents", ->
      scope.define 'name', dependent: scope.define('other', type: 'int')
      expect(scope.lookup('name').type()).toEqual 'int'
      
    it "should bring new dependents into pre-defined variables", ->
      scope.define 'name', type: null
      scope.define 'name', dependent: scope.define('other', type: 'int')
      expect(scope.lookup('name').type()).toEqual 'int'
      
  it "should not pop back past itself", ->
    b = scope.push('b')
    scope.pop()
    expect(b.qualifier()).toEqual 'a.b'
  
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
    expect(scope.lookup('x').type()).toEqual 'float'
    expect(scope.lookup('x').qualified_name).toEqual 'a.main.x'
    
    scope.push 'iter'                         # global -> main -> iter
    scope.define 'i', type: 'int'             # global -> main -> iter
    expect(scope.lookup('i').name).toEqual 'i'
    expect(scope.lookup('i').type()).toEqual 'int'
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
    