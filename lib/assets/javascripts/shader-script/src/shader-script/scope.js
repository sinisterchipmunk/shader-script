(function() {
  var NameRegistry, Scope;

  NameRegistry = require('shader-script/name_registry').NameRegistry;

  exports.Scope = Scope = (function() {

    function Scope(name, parent) {
      this.name = name != null ? name : null;
      this.parent = parent != null ? parent : null;
      this.subscopes = {};
      this.definitions = {};
      this.registry = new NameRegistry();
    }

    Scope.prototype.qualifier = function(delegate_to_subscope) {
      var prefix;
      if (delegate_to_subscope == null) delegate_to_subscope = true;
      if (this.current_subscope && delegate_to_subscope) {
        return this.current_subscope.qualifier();
      } else {
        prefix = this.parent ? this.parent.qualifier(false) + "." : "";
        return prefix + this.name;
      }
    };

    Scope.prototype.push = function(name) {
      if (this.current_subscope) {
        return this.assume(this.current_subscope.push(name));
      } else {
        return this.assume(this.subscopes[this.registry.define(name)] = new Scope(name, this));
      }
    };

    Scope.prototype.assume = function(subscope) {
      if (subscope === this) {
        this.current_subscope = null;
      } else {
        this.current_subscope = subscope;
      }
      if (this.parent) this.parent.assume(subscope);
      return this.current_subscope || this;
    };

    Scope.prototype.define = function(name, options) {
      if (options == null) options = {};
      return this.delegate(function() {
        var def;
        options.name || (options.name = name);
        def = this.lookup(name, true);
        if (def) {
          options.type || (options.type = def.type);
          if (def.type && options.type !== def.type) {
            throw new Error("Variable '" + name + "' redefined with conflicting type: " + def.type + " redefined as " + options.type);
          }
          options.scope = def.scope;
          return options.scope.definitions[name] = options;
        } else {
          options.qualified_name = this.qualifier() + "." + name;
          options.scope = this;
          return this.definitions[name] = options;
        }
      });
    };

    Scope.prototype.lookup = function(name, silent) {
      if (silent == null) silent = false;
      return this.delegate(function() {
        var target;
        target = this;
        while (target) {
          if (target.definitions[name]) return target.definitions[name];
          target = target.parent;
        }
        if (silent) {
          return null;
        } else {
          throw new Error("Variable '" + name + "' is not defined in this scope");
        }
      });
    };

    Scope.prototype.delegate = function(callback) {
      return callback.call(this.current_subscope || this);
    };

    Scope.prototype.pop = function() {
      if (this.current_subscope) {
        return this.current_subscope.pop();
      } else if (this.parent) {
        return this.parent.assume(this.parent);
      } else {
        return this;
      }
    };

    return Scope;

  })();

}).call(this);
