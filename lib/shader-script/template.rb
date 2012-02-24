class ShaderScript::Template < Tilt::Template
  include ShaderScript::Compiler
    
  attr_reader :context

  def self.default_mime_type
    "text/tml"
  end

  def prepare
    
  end

  def evaluate(scope, locals, &block)
    @context = scope
    depend_on_shaderscript
    compile data
  end
  
  def depend_on_ambrosia
    depend_on_env ShaderScript::Compiler::Source.shader_build_env
  end
  
  def depend_on_env(env)
    env.each_file { |path| @context.depend_on path }
  end
end
