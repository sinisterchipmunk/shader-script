$:.unshift File.expand_path('../lib', File.dirname(__FILE__))
require 'shader-script'
require 'rspec/rails'

RSpec.configure do |config|
  config.include ShaderScript::TestCase
  
  config.before do
    cleanup
    
    draw_routes
    create_file "app/assets/shaders/red.shader" do |f|
      f.puts <<-end_code
        uniforms = mat4: mvp
        attributes = vec4: position
        vertex = -> gl_Position = mvp * position
        fragment = -> gl_FragColor = [1, 0, 0, 1]
      end_code
    end
    
    setup
  end
end
