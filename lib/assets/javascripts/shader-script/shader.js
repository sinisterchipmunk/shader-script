(function() {

  exports.Shader = (function() {

    function Shader(scope) {
      var _this = this;
      this.scope = scope != null ? scope : {};
      this.name = "shader";
      this.proxy = {
        shader: function(name) {
          _this.name = name;
          return null;
        }
      };
    }

    Shader.prototype.to_json = function() {
      return {
        name: this.name,
        body: this.body || []
      };
    };

    return Shader;

  })();

}).call(this);
