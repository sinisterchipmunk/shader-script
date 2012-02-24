module ShaderScript
  module Version
    MAJOR, MINOR, TINY = 0, 6, 0
    
    STRING = [MAJOR, MINOR, TINY].join('.')
  end
  
  VERSION = Version::STRING
end
