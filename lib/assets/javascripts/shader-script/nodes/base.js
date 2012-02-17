(function() {
  var Base,
    __slice = Array.prototype.slice;

  exports.Base = Base = (function() {
    var required_methods;

    required_methods = ['name', 'compile'];

    Base.prototype.root = function() {
      return this.parent && this.parent.root && this.parent.root() || this;
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

}).call(this);
