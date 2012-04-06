# Shader-Script

Write your WebGL shaders in [CoffeeScript](http://coffeescript.org)!

Shader-Script runs stand-alone within your web browser, directly from [Node.js](http://nodejs.org), hooked into the [Rails](http://rubyonrails.org) asset pipeline, or explicitly from pure [Ruby](http://ruby-lang.org). So choose your flavor and get started!

## Installation and Super-Basic Usage

Web:
    <script type="text/javascript"
            src="https://sinisterchipmunk.github.com/shader-script/shader-script.js">
    </script>

    <script id="red" type="x-shader/x-shaderscript">
      uniforms = mat4: mvp
      attributes = vec4: position

      vertex = ->
        gl_Position = mvp * position
        
      fragment = ->
        gl_FragColor = [1, 0, 0, 1]
    </script>
    
    <script type="text/javascript">
      var shaderFragmentSource = document.getElementById('red-fragment').text;
      var shaderVertexSource = document.getElementById('red-vertex').text;
      // ...
    </script>

Node:
    npm install shader-script

    > var ss = require('shader-script').ShaderScript;
    > ss.compile_to_glsl("\
    >   uniforms = mat4: mvp\n\
    >   attributes = vec4: position\n\
    >   vertex = -> gl_Position = mvp * position\n\
    >   fragment = -> gl_FragColor = [1, 0, 0, 1]\n\
    > ");
    {
      vertex: 'uniform mat4 mvp;\n\nattribute vec4 position;\n\nvoid main() {\n  gl_Position = mvp * position;\n};',
      fragment: 'uniform mat4 mvp;\n\nvoid main() {\n  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n};'
    }

Rails:
    gem 'shader-script'

    # in app/assets/shaders/red.shader
    uniforms = mat4: mvp
    attributes = vec4: position
    vertex = -> gl_Position = mvp * position
    fragment = -> gl_FragColor = [1, 0, 0, 1]

    # in your view, using jquery and coffee:
    $.get url: '/assets/red.fragment', success: (code) -> setupFragmentShader "red", code
    $.get url: '/assets/red.fragment', success: (code) -> setupVertexShader "red", code

Ruby:
    gem install shader-script
    
    > require 'shader-script'
    > code = ShaderScript.compile <<-end_code
    >   uniforms = mat4: mvp
    >   attributes = vec4: position
    >   vertex = -> gl_Position = mvp * position
    >   fragment = -> gl_FragColor = [1, 0, 0, 1]
    > end_code
     => {
       :vertex => "uniform mat4 mvp;\n\nattribute vec4 position;\n\nvoid main() {\n  gl_Position = mvp * position;\n};",
       :fragment => "uniform mat4 mvp;\n\nvoid main() {\n  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n};"
     }
    
## Details and Live Demos:

See the [documentation](http://sinisterchipmunk.github.com/shader-script).

## Improving Shader-Script

It's still early yet, and Shader-Script still has a lot of iterations ahead of it. If you discover any issues, please do report it so we can fix it. If it's something you feel confident enough to go ahead and resolve, fork this project and send me a pull request!

I only ask that you adhere to a few principles:

  * Don't change the version number. I'll do that when it's time.
  * Back up your code with tests. Unless it's a refactor -- then at least make sure all the tests are passing.
  * Test and test again. To be sure you've not broken anything, run `rake build` and then just `rake`.
