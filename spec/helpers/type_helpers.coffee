beforeEach ->
  @addMatchers
    toBeInstanceOf: (expected) ->
      @actual instanceof expected

    toInclude: (expected) ->
      @actual.indexOf(expected) != -1

    # Like toHaveBeenCalledWith, but matches against a regexp.
    toHaveBeenCalledMatching: (expected) ->
      expectedArgs = jasmine.util.argsToArray(arguments)[0]
      throw new Error "Expected a spy, but got #{jasmine.pp @actual}." unless jasmine.isSpy @actual

      @message = ->
        if @actual.callCount == 0
          return [
            "Expected spy #{@actual.identity} to have been called with #{jasmine.pp expectedArgs} but it was never called.",
            "Expected spy #{@actual.identity} not to have been called with #{jasmine.pp expectedArgs} but it was."
          ]
        else
          return [
            "Expected spy #{@actual.identity} to have been called with #{jasmine.pp expectedArgs} but was called with #{jasmine.pp @actual.argsForCall}",
            "Expected spy #{@actual.identity} not to have been called with #{jasmine.pp expectedArgs} but was called with #{jasmine.pp @actual.argsForCall}"
          ]

      for arg in @actual.argsForCall
        if arg =~ expectedArgs
          return true

      false
