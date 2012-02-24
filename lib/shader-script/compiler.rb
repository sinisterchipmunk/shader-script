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
        # FIXME it would be better to memoize this but we can't right now because
        # views are compiled as part of the original source. We have to pull
        # views outside of the compile phase before we can memoize the context.
        @context = ExecJS.compile(content)
      end

      def render(path, base_path = @base_path || File.expand_path("../assets/javascripts", File.dirname(__FILE__)))
        av = ActionView::Base.new(base_path)
        av.extend self
        av.render :template => path, :handlers => [:erb], :formats => [:js]
      end

      def shader_build_env
        @shader_env ||= begin
          env = Sprockets::Environment.new
          env.append_path File.expand_path("../assets/javascripts/shader-script/src", File.dirname(__FILE__))
          env.append_path File.expand_path("../../vendor/assets/javascripts", File.dirname(__FILE__))
          env
        end
      end
    end
    
    delegate :shader_build_env, :to => '::ShaderScript::Compiler::Source'
  end
  
  def compile(script)
    Source.context.call "ShaderScript.compile_to_string", script
  end
end