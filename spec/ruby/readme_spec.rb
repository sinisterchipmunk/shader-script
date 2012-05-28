require 'spec_helper'

describe "Ruby README examples" do
  include RSpec::Rails::RequestExampleGroup
  
  it "should compile shader-script code" do
    code = ShaderScript.compile <<-end_code
      uniforms = mat4: mvp
      attributes = vec4: position
      vertex = -> gl_Position = mvp * position
      fragment = -> gl_FragColor = [1, 0, 0, 1]
    end_code
    
    code['vertex'].should =~ /gl_Position = mvp \* position;/
    code['fragment'].should =~ /gl_FragColor = vec4\(1\.0, 0\.0, 0\.0, 1\.0\);/
  end
end
