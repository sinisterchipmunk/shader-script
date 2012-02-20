(function() {

  exports.Shader = (function() {

    function Shader() {
      var _this = this;
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
