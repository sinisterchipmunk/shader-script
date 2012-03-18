# Shader-Script

Write your WebGL shaders in CoffeeScript!

## Installation

Ruby:
    gem install shader-script

Node:
    npm install shader-script
  
Web:
    <script type="text/javascript"
            src="https://github.com/sinisterchipmunk/shader-script/tree/master/doc/shader-script.js">
    </script>
    
## Brief Usage Example:

    # definition for a flat red shader
    uniforms = mat4: [mv, p]
    attributes = vec4: position

    vertex = -> gl_Position = p * mv * position
    fragment = -> gl_FragColor = [1, 0, 0, 1]

## Details and Live Demos:

See the [documentation](http://sinisterchipmunk.github.com/shader-script).
