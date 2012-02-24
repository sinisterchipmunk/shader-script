require 'rails'
require 'rails/engine'
require 'sprockets/railtie'
require 'active_support/railtie'

# we add shader-script paths to Rails::Engine so that everything that inherits from it
# (including the app itself) can produce tml. Otherwise we'd have to hack in to the
# application in an un-pretty way.
module Rails
  class Engine < Rails::Railtie
    initializer "shader-script:paths" do |app|
      paths.add 'shader-script/views', :with => 'app/assets/tml/views'
      paths['shader-script/views'] << 'lib/assets/tml/views'
      paths['shader-script/views'] << 'vendor/assets/tml/views'
    end
  end
end

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
