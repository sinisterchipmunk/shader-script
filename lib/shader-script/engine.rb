require 'rails'
require 'rails/engine'
require 'sprockets/railtie'
require 'active_support/railtie'

module ShaderScript
  class Engine < Rails::Engine
    initializer "shader-script:assets:engines" do |app|
      app.assets.register_engine '.shader', ShaderScript::Template
    end
  end
end
