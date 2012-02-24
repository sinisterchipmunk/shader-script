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

    Scope.prototype.all_qualifiers = function() {
      var id, result, subscope, _ref;
      result = [this.qualifier(false)];
      _ref = this.subscopes;
      for (id in _ref) {
        subscope = _ref[id];
        result = result.concat(subscope.all_qualifiers());
      }
      return result;
    };

    Scope.prototype.all_definitions = function() {
      var def, id, name, result, subscope, _ref, _ref2;
      result = [];
      _ref = this.definitions;
      for (name in _ref) {
        def = _ref[name];
        result.push(def.qualified_name);
      }
      _ref2 = this.subscopes;
      for (id in _ref2) {
        subscope = _ref2[id];
        result = result.concat(subscope.all_definitions());
      }
      return result;
    };

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
        var def, dep, deps, type, _i, _len, _ref;
        options.name || (options.name = name);
        def = this.lookup(name, true);
        if (def) {
          def.set_type(options.type);
          deps = def.dependents;
          if (options.dependents) {
            _ref = options.dependents;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              dep = _ref[_i];
              deps.push(dep);
            }
          }
          if (options.dependent) deps.push(options.dependent);
          options.dependents = deps;
          options.set_type = def.set_type;
          options.type = def.type;
          options.scope = def.scope;
          options.scope.definitions[name] = options;
        } else {
          options.qualified_name = this.qualifier() + "." + name;
          options.scope = this;
          deps = options.dependents || [];
          if (options.dependent) deps.push(options.dependent);
          options.dependents = deps;
          options.set_type = function(type) {
            if (type) {
              if (this.type && this.type() && type !== this.type()) {
                throw new Error("Variable '" + this.qualified_name + "' redefined with conflicting type: " + (this.type()) + " redefined as " + type);
              }
              return this.type = function() {
                return type;
              };
            } else {
              return this.type || (this.type = function() {
                var dep, _j, _len2, _ref2, _type;
                _ref2 = this.dependents;
                for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                  dep = _ref2[_j];
                  _type = dep.type();
                  if (_type) return _type;
                }
                return;
              });
            }
          };
          type = options.type;
          delete options.type;
          options.set_type(type);
        }
        return this.definitions[name] = options;
      });
    };

    Scope.prototype.find = function(name) {
      var id, qualifiers, scope_name, subscope, _ref;
      if (name instanceof Array) {
        qualifiers = name;
      } else {
        qualifiers = name.split(/\./);
      }
      if (qualifiers.length === 1) {
        return this.definitions[qualifiers[0]];
      } else {
        scope_name = qualifiers.shift();
        if (scope_name === ("" + this.name)) {
          return this.find(qualifiers);
        } else {
          _ref = this.subscopes;
          for (id in _ref) {
            subscope = _ref[id];
            if (subscope.name === scope_name) return subscope.find(qualifiers);
          }
        }
      }
      return null;
    };

    Scope.prototype.lookup = function(name, silent) {
      if (silent == null) silent = false;
      return this.delegate(function() {
        var result, target;
        target = this;
        while (target) {
          if (result = target.find(name)) return result;
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
