require 'rails'
require 'rails/engine'
require 'sprockets/railtie'
require 'active_support/railtie'

module ShaderScript
  class Engine < Rails::Engine

    initializer "shader-script:mimes" do |app|
      Mime::Type.register 'text/tml', :tml
    end
    
    initializer "shader-script:assets:engines" do |app|
      app.assets.register_engine '.shader', ShaderScript::Template
    end
  end
end
