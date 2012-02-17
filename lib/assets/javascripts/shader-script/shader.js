(function() {

  exports.Shader = (function() {

    function Shader() {
      var _this = this;
      this.name = "shader";
      this.proxy = {
        shader: function(name) {
          return _this.name = name;
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
