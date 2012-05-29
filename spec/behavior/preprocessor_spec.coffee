require 'spec_helper'

describe 'preprocessor', ->
  it '#define', ->
    sim = simulate vertex: '#define ONE 1\nvoid main(void) { }'
    sim.start()
    expect(sim.state.preprocessor.ONE).toEqual '1'

  it '#ifdef (true)', ->
    sim = simulate vertex: '#ifdef ONE\n#define TWO 2\n#endif\nvoid main(void) { }', preprocessor: { ONE: 1 }
    sim.start()
    expect(sim.state.preprocessor.TWO).toEqual '2'
    
  it '#ifdef (false)', ->
    sim = simulate vertex: '#ifdef ONE\n#define TWO 2\n#endif\nvoid main(void) { }'
    sim.start()
    expect(sim.state.preprocessor.TWO).toBeUndefined()

