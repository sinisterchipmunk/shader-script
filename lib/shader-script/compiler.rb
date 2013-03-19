require 'execjs'
require 'sprockets'

module ShaderScript::Compiler
  EngineError      = ExecJS::RuntimeError
  CompilationError = ExecJS::ProgramError

  module Source
    class << self
      def content
        render 'shader-script'
      end
      
      def context
        @context ||= ExecJS.compile(content)
      end
      
      def render(path, base_path = @base_path || File.expand_path("../../build", File.dirname(__FILE__)))
        av = ActionView::Base.new(base_path)
        av.extend self
        av.render :template => path, :handlers => [:erb], :formats => [:js]
      end
      
      def shader_build_env
        @shader_env ||= begin
          env = Sprockets::Environment.new
          env.append_path File.expand_path("../../build/src", File.dirname(__FILE__))
          env.append_path File.expand_path("../../build/vendor", File.dirname(__FILE__))
          env
        end
      end
    end
    
    delegate :shader_build_env, :to => '::ShaderScript::Compiler::Source'
  end
  
  def compile(script)
    Source.context.call "ShaderScript.compile", script
  end
end
