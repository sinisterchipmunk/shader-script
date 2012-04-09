require 'rack/coffee_compiler'
require 'shader-script'

module Jasmine
  class Config
    alias_method :old_js_files, :js_files

    def js_files(spec_filter = nil)
      # ShaderScript.build_source_to 'doc/shader-script.js'
      
      # Convert all .coffee files into .js files before putting them in a script tag
      old_js_files(spec_filter).map do |filename|
        filename.sub(/\.coffee/, '.js')
      end
    end
    
    def start_server(port=8888)
      # We can't access the RAILS_ROOT constant from here
      root = File.expand_path(File.join(File.dirname(__FILE__), '../../..'))

      config = self

      app = Rack::Builder.new do
        # Compiler for your specs
        use Rack::CoffeeCompiler,
            :source_dir => File.join(root, 'spec'),
            :url => config.spec_path
            
        use Rack::CoffeeCompiler,
            :source_dir => config.src_dir,
            :url => '/src'

        run Jasmine.app(config)
      end

      server = Rack::Server.new(:Port => port, :AccessLog => [])
      # workaround for Rack bug, when Rack > 1.2.1 is released Rack::Server.start(:app => Jasmine.app(self)) will work
      server.instance_variable_set(:@app, app)
      server.start
    end
  end
end


# Note - this is necessary for rspec2, which has removed the backtrace
module Jasmine
  class SpecBuilder
    def declare_spec(parent, spec)
      me = self
      example_name = spec["name"]
      @spec_ids << spec["id"]
      backtrace = @example_locations[parent.description + " " + example_name]
      parent.it example_name, {} do
        me.report_spec(spec["id"])
      end
    end
  end
end
