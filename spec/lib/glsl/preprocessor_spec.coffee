require 'spec_helper'

{Preprocessor} = require 'shader-script/glsl/preprocessor'

describe "Preprocessor", ->
  proc = null

  describe "directives", ->
    describe 'define', ->
      beforeEach -> proc = new Preprocessor '#define ONE 1\n#define TWO "two"'
      
      it "should define ONE", -> expect(proc.env.ONE).toEqual '1'
      it "should define TWO", -> expect(proc.env.TWO).toEqual '"two"'
      
    describe "multiline define", ->
      beforeEach ->
        proc = new Preprocessor '#define CODE void main() {\\\n  gl_FragColor = vec4(1)\\ \n}'
      
      it "should define all 3 lines", ->
        # separate tests so we're not subject to breaking on white space
        expect(proc.env.CODE).toMatch /void main\(\) \{/
        expect(proc.env.CODE).toMatch /gl_FragColor = vec4\(1\)/
        expect(proc.env.CODE).toMatch /\}/
  
  describe "ifdef false", ->
    beforeEach -> proc = new Preprocessor '#ifdef NOTHING\none\n#endif'
    it "should not produce 'one'", -> expect(proc.toString()).not.toMatch /one/
  
  describe "ifdef false else", ->
    beforeEach -> proc = new Preprocessor '#ifdef NOTHING\none\n#else\ntwo\n#endif'
    it "should not produce 'one'", -> expect(proc.toString()).not.toMatch /one/
    it "should produce 'two'", -> expect(proc.toString()).toMatch /two/

  describe "ifdef true else", ->
    beforeEach -> proc = new Preprocessor '#ifdef NOTHING\none\n#else\ntwo\n#endif', {NOTHING:1}
    it "should produce 'one'", -> expect(proc.toString()).toMatch /one/
    it "should not produce 'two'", -> expect(proc.toString()).not.toMatch /two/

  describe "ifndef false", ->
    beforeEach -> proc = new Preprocessor '#ifndef NOTHING\none\n#endif', {NOTHING:1}
    it "should not produce 'one'", -> expect(proc.toString()).not.toMatch /one/

  describe "ifndef false else", ->
    beforeEach -> proc = new Preprocessor '#ifndef NOTHING\none\n#else\ntwo\n#endif', {NOTHING:1}
    it "should not produce 'one'", -> expect(proc.toString()).not.toMatch /one/
    it "should produce 'two'", -> expect(proc.toString()).toMatch /two/

  describe "ifndef true else", ->
    beforeEach -> proc = new Preprocessor '#ifndef NOTHING\none\n#else\ntwo\n#endif'
    it "should produce 'one'", -> expect(proc.toString()).toMatch /one/
    it "should not produce 'two'", -> expect(proc.toString()).not.toMatch /two/

  describe "ifdef false endif code", ->
    beforeEach -> proc = new Preprocessor '#ifdef ONE\n#define TWO 2\n#endif\nvoid main(void) { }'
    it "should not define TWO", -> expect(proc.env.TWO).toBeUndefined()
    it "should not omit main", -> expect(proc.toString()).toMatch /void main/

  describe "nested ifdef", ->
    code = '''
    #ifdef ONE
      #define ONE1 1
      #ifdef TWO
        #define TWO2 2
      #else
        #define TWO2 3
      #endif
    #else
      #define ONE1 2
      #ifdef TWO
        #define TWO2 4
      #else
        #define TWO2 5
      #endif
    #endif
    '''
    
    describe "true, true", ->
      beforeEach -> proc = new Preprocessor code, ONE: 1, TWO: 2
      it "should set ONE1 to 1 (a)", -> expect(proc.env.ONE1).toEqual '1'
      it "should set TWO2 to 2",     -> expect(proc.env.TWO2).toEqual '2'

    describe "true, false", ->
      beforeEach -> proc = new Preprocessor code, ONE: 1
      it "should set ONE1 to 1 (b)", -> expect(proc.env.ONE1).toEqual '1'
      it "should set TWO2 to 3",     -> expect(proc.env.TWO2).toEqual '3'

    describe "false, true", ->
      beforeEach -> proc = new Preprocessor code, TWO: 2
      it "should set ONE1 to 2 (a)", -> expect(proc.env.ONE1).toEqual '2'
      it "should set TWO2 to 4",     -> expect(proc.env.TWO2).toEqual '4'

    describe "false, false", ->
      beforeEach -> proc = new Preprocessor code, {}
      it "should set ONE1 to 2 (b)", -> expect(proc.env.ONE1).toEqual '2'
      it "should set TWO2 to 5",     -> expect(proc.env.TWO2).toEqual '5'
      