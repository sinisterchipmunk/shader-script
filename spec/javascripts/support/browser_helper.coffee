if typeof(window) != 'undefined'
  # dummy so specs will pass after they require('spec_helper')
  _requires = 
    spec_helper: {}
    fs: {}
  
  (->
    canvas = document.createElement 'canvas'
    canvas.width = canvas.height = 100
    gl = canvas.getContext('experimental-webgl') || canvas.getContext('webgl')
    program = gl.createProgram()
    program.vertex = gl.createShader gl.VERTEX_SHADER
    program.fragment = gl.createShader gl.FRAGMENT_SHADER
    gl.attachShader program, program.vertex
    gl.attachShader program, program.fragment
    
    fail = (which, src) ->
      throw new Error("#{which} shader failed to compile:\n\n#{gl.getShaderInfoLog program[which]}\n\n#{src}")

    compile = (shader, src, type) ->
      gl.shaderSource program.vertex, src
      gl.compileShader program.vertex
      unless gl.getShaderParameter shader, gl.COMPILE_STATUS
        fail type, src

    window.compileVertex = (src) -> compile program.vertex, src, 'vertex'
    window.compileFragment = (src) -> compile program.fragment, src, 'fragment'
    window.linkProgram = ->
      gl.linkProgram program
      unless gl.getProgramParameter program, gl.LINK_STATUS
        throw new Error("Program failed to link:\n\n#{gl.getProgramInfoLog program}")
  )()
    
    
  window.require = (path) ->
    return _requires[path] if _requires[path] isnt undefined
    xhr = new XMLHttpRequest
    # special cases
    # parsers generated by jison
    if path.indexOf('parser') != -1
      real_path = "lib/assets/javascripts/shader-script/src/#{path}.js"
    # util supplied by node, but mirrored by us for use in tests
    else if path == 'util' != -1
      real_path = "spec/javascripts/support/util.js"
    else
      real_path = "src/src/#{path}.js"
    xhr.open 'GET', real_path, false
    xhr.onreadystatechange = ->
      if xhr.readyState == 4 and xhr.status == 200
        _requires[path] = exports = {}
        global = window
        module =
          deprecate: ->
        eval xhr.responseText
    xhr.send null
    
    return _requires[path]
  window.global = window
  