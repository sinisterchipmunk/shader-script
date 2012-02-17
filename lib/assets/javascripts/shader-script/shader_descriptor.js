(function() {

  exports.ShaderDescriptor = (function() {

    function ShaderDescriptor() {
      var _this = this;
      this.name = "shader";
      this.proxy = {
        shader: function(name) {
          return _this.name = name;
        }
      };
    }

    ShaderDescriptor.prototype.to_json = function() {
      return {
        name: this.name,
        body: this.body || []
      };
    };

    return ShaderDescriptor;

  })();

}).call(this);
