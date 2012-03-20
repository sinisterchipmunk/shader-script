(function() {
  var Base,
    __slice = Array.prototype.slice;

  exports.Base = Base = (function() {
    var glsl_nodes, required_methods;

    glsl_nodes = null;

    required_methods = ['name', 'compile'];

    Base.prototype.is_access = function() {
      return false;
    };

    Base.prototype.glsl = function() {
      var args, node_name;
      node_name = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      glsl_nodes || (glsl_nodes = require('shader-script/glsl/nodes'));
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return typeof result === "object" ? result : child;
      })(glsl_nodes[node_name], args, function() {});
    };

    function Base() {
      var child, child_names, children, method_name, name, _i, _j, _len, _len2;
      children = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = required_methods.length; _i < _len; _i++) {
        method_name = required_methods[_i];
        if (!this[method_name]) {
          throw new Error("Method '" + method_name + "' is not defined in " + this);
        }
      }
      this.name = this.name;
      if (this.children) child_names = this.children();
      for (_j = 0, _len2 = children.length; _j < _len2; _j++) {
        child = children[_j];
        if (!child_names || child_names.length === 0) break;
        name = child_names.shift();
        this[name] = child;
      }
      this.children = children;
    }

    return Base;

  })();

  exports.Base.prototype.component_wise = require('shader-script/extension').Extension.prototype.component_wise;

}).call(this);
