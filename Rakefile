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

desc "build everything"
task :build => [:js]
