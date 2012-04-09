require 'spec_helper'

# Tests the Rails and pure Ruby examples given in the readme file

describe "README" do
  include RSpec::Rails::RequestExampleGroup
  
  it "pure ruby examples" do
    code = ShaderScript.compile <<-end_code
      uniforms = mat4: mvp
      attributes = vec4: position
      vertex = -> gl_Position = mvp * position
      fragment = -> gl_FragColor = [1, 0, 0, 1]
    end_code
    
    code['vertex'].should =~ /gl_Position = mvp \* position;/
    code['fragment'].should =~ /gl_FragColor = vec4\(1\.0, 0\.0, 0\.0, 1\.0\);/
  end
  
  it "rails examples" do
    get '/assets/red.shader'
    code = JSON.parse response.body

    code['vertex'].should =~ /gl_Position = mvp \* position;/
    code['fragment'].should =~ /gl_FragColor = vec4\(1\.0, 0\.0, 0\.0, 1\.0\);/
  end
end
