# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "shader-script/version"

Gem::Specification.new do |s|
  s.name        = "shader-script"
  s.version     = ShaderScript::VERSION
  s.authors     = ["Colin MacKenzie IV"]
  s.email       = ["sinisterchipmunk@gmail.com"]
  s.homepage    = ""
  s.summary     = %q{Write your WebGL shaders in CoffeeScript!}
  s.description = %q{Write your WebGL shaders in CoffeeScript!}

  s.rubyforge_project = "shader-script"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_dependency 'rails', ">= 3.2"
  s.add_dependency 'sprockets'
  s.add_dependency 'execjs'
  s.add_dependency 'nokogiri'

  s.add_development_dependency 'RedCloth', '4.2.8'
  s.add_development_dependency 'rack-asset-compiler'
  s.add_development_dependency 'jasmine'
  s.add_development_dependency 'rspec-rails', ">= 2"
  s.add_development_dependency 'coffee-script'
end
