require 'spec_helper'

describe "Rails README examples" do
  include RSpec::Rails::RequestExampleGroup
  
  it "should preprocess shader files" do
    get '/assets/red.shader'
    code = JSON.parse response.body

    code['vertex'].should =~ /gl_Position = mvp \* position;/
    code['fragment'].should =~ /gl_FragColor = vec4\(1\.0, 0\.0, 0\.0, 1\.0\);/
  end
  
  it "should provide the shader-script JS" do
    get '/assets/shader-script.js'
    response.status.should == 200
    response.body.should_not =~ /\Athrow /
  end
end
