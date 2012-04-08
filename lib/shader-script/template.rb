class ShaderScript::Template < Tilt::Template
  include ShaderScript::Compiler
    
  attr_reader :context

  def self.default_mime_type
    "application/json"
  end

  def prepare
  end

  def evaluate(scope, locals, &block)
    @context = scope
    depend_on_shaderscript
    compile(data).to_json
  end
  
  def depend_on_shaderscript
    depend_on_env ShaderScript::Compiler::Source.shader_build_env
  end
  
  def depend_on_env(env)
    env.each_file { |path| @context.depend_on path }
  end
end
