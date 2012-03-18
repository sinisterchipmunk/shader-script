require "bundler/gem_tasks"

namespace :build do
  desc "build shader-script"
  task :main do
    exit 1 unless system("cake build")
  end

  desc "build shader-script parser"
  task :parser do
    exit 1 unless system("cake build:parser")
  end

  desc "build shader-script browser-ready component"
  task :browser do
    require 'shader-script'
    ShaderScript.build_source_to 'doc/shader-script.js'
  end

  desc "build all javascripts"
  task :js => [ 'build:parser', 'build:main', 'build:browser' ]
end

namespace :test do
  desc "run js tests"
  task :js do
    exit 1 unless system("cake test")
  end
end

desc "build everything"
task :build => ['build:js']

desc "build all js files and then run all tests"
task :default => [ 'build:js', 'test:js' ]
