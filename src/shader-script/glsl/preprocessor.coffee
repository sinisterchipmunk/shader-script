class exports.Preprocessor
  DIRECTIVE_NOT_ALLOWED       = 1
  DIRECTIVE_ALLOWED           = 2
  DIRECTIVE_NAME_ACCUMULATING = 4
  DIRECTIVE_EXPR_ACCUMULATING = 8
  
  constructor: (@source, @env = {}) ->
    @conditions = []
    @process()
    
  processDirective: (name, directive, state) ->
    switch name.toLowerCase()
      when 'define'
        return false unless @conditionIsTrue()
        variableName = directive[0...directive.indexOf(' ')]
        expression   = directive[directive.indexOf(' ')+1...directive.length]
        @env[variableName] = expression
      when 'ifdef'
        @conditions.push @conditionIsTrue() && @env[directive] isnt undefined
      when 'ifndef'
        @conditions.push @conditionIsTrue() && @env[directive] is undefined
      when 'else'
        @flipCondition()
      when 'endif'
        @conditions.pop()
      else throw new Error "Unhandled directive in state #{state}: ##{name} #{directive}"
    @conditionIsTrue()

  conditionIsTrue: ->
    @conditions.length == 0 or @conditions[@conditions.length-1]
    
  flipCondition: ->
    switch @conditions.length
      when 0 then return
      when 1 then @conditions[0] = !@conditions[0]
      else
        if @conditions[@conditions.length-2]
          @conditions[@conditions.length-1] = !@conditions[@conditions.length-1]
  
  process: ->
    @result = ""
    lastNonWhiteByte = ""
    directiveName = ""
    directiveExpr = ""
    state = DIRECTIVE_ALLOWED
    
    # returns true if the byte should be accumulated, false if it should
    # be ignored
    check = (byte) =>
      if byte is '#' and state is DIRECTIVE_ALLOWED
        state = DIRECTIVE_NAME_ACCUMULATING
        false
      else if byte is '\n' and (state is DIRECTIVE_EXPR_ACCUMULATING or state is DIRECTIVE_NAME_ACCUMULATING)
        if lastNonWhiteByte isnt "\\" # account for continuation
          @processDirective directiveName, directiveExpr, state
          state = DIRECTIVE_ALLOWED
          [directiveName, directiveExpr] = ["", ""]
        true
      else if byte is ' ' and state is DIRECTIVE_NAME_ACCUMULATING
        state = DIRECTIVE_EXPR_ACCUMULATING
        false
      else
        lastNonWhiteByte = byte unless byte is "\n" or byte is "\t" or byte is " "
        true
        
    for byte in @source
      continue unless check byte
      switch state
        when DIRECTIVE_NAME_ACCUMULATING then directiveName += byte
        when DIRECTIVE_EXPR_ACCUMULATING then directiveExpr += byte
        else
          @result += byte if @conditionIsTrue()
    check "\n"
    
  toString: -> @result
