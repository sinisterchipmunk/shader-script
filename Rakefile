require "bundler/gem_tasks"
Bundler.setup

require 'shader-script/version'

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
  
  desc "build the package.json file for releasing to npm"
  task :npm do
    spec = Gem::Specification.find_all_by_name('shader-script')
    raise "Expected to find exactly 1 gemspec matching 'shader-script', found #{spec.length}" if spec.length != 1
    spec = spec.shift
    manifest = {
      :name => spec.name,
      :version => ShaderScript::VERSION,
      :description => spec.description,
      :homepage => [ spec.homepage ],
      :repository => { :type => 'git', :url => 'https://github.com/sinisterchipmunk/shader-script' },
      :keywords => [],
      :author => "#{spec.authors.first} <#{spec.email.first}>",
      :contributors => spec.authors.collect { |author| "#{author} <#{spec.email[spec.authors.index(author)]}>" },
      :licenses => ["MIT"],
      :dependencies => {},
      :bin => spec.executables,
      :main => 'doc/shader-script'
    }
    
    require 'json'
    File.open(File.expand_path('../package.json', __FILE__), 'w') { |f| f.puts JSON.pretty_generate(manifest) }
  end

  desc "build all javascripts"
  task :js => [ 'build:parser', 'build:main', 'build:browser' ]
end

namespace :test do
  desc "run js tests"
  task :js do
    exit 1 unless system("cake test")
  end

  require 'rspec/core/rake_task'
  desc "Run specs"
  RSpec::Core::RakeTask.new :rb
end

desc "build everything"
task :build => ['build:js', 'build:npm']

desc "build all js files and then run all tests"
task :default => [ 'build:js', 'test:js', 'test:rb', 'jasmine:ci' ]

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end
