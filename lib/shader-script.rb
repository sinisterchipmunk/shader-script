require 'shader-script/engine'
require 'shader-script/template_handler'

module ShaderScript
  autoload :Compiler,     'shader-script/compiler'
  autoload :TestCase,     'shader-script/test_case'
  autoload :Template,     'shader-script/template'
  autoload :Version,      'shader-script/version'
  autoload :VERSION,      'shader-script/version'
  
  extend ShaderScript::Compiler
  
  def self.build_source_to(dest)
    File.open(dest, 'w') { |f| f.print ShaderScript::Template::Source.content }
  end
end
