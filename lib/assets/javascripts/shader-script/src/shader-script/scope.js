(function() {
  var Definition, NameRegistry, Scope;

  NameRegistry = require('shader-script/name_registry').NameRegistry;

  exports.Definition = Definition = require('shader-script/definition').Definition;

  exports.Scope = Scope = (function() {

    function Scope(name, parent) {
      var _ref;
      this.name = name != null ? name : "root";
      this.parent = parent != null ? parent : null;
      this.subscopes = {};
      this.definitions = {};
      this.warn_NaN = (((_ref = this.parent) != null ? _ref.warn_NaN : void 0) === true ? true : false);
      this.registry = new NameRegistry();
    }

    Scope.prototype.lock = function() {
      return this.delegate(function() {
        return this.locked = true;
      });
    };

    Scope.prototype.unlock = function() {
      return this.delegate(function() {
        return this.locked = false;
      });
    };

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
      var arr, array, def, id, name, qualifier, result, sub, subscope, _ref, _ref2;
      result = {};
      arr = result[this.qualifier(false)] = [];
      _ref = this.definitions;
      for (name in _ref) {
        def = _ref[name];
        arr.push(def.qualified_name);
      }
      _ref2 = this.subscopes;
      for (id in _ref2) {
        subscope = _ref2[id];
        sub = subscope.all_definitions();
        for (qualifier in sub) {
          array = sub[qualifier];
          result[qualifier] = array;
        }
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

    Scope.prototype.pop = function() {
      if (this.current_subscope) {
        return this.current_subscope.pop();
      } else if (this.parent) {
        return this.parent.assume(this.parent);
      } else {
        return this;
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
        return this.define_within(name, options);
      });
    };

    Scope.prototype["import"] = function(variable) {
      this.delegate(function() {
        return this.definitions[variable.name] = variable;
      });
      return variable;
    };

    Scope.prototype.define_within = function(name, options) {
      var def;
      if (options == null) options = {};
      options.name || (options.name = name);
      if (def = this.lookup(name, {
        silent: true
      })) {
        def.assign(options);
        return def;
      } else {
        options.qualified_name = this.qualifier() + "." + name;
        def = new Definition(options);
      }
      if (this.locked) return def;
      return this.definitions[name] = def;
    };

    Scope.prototype.current = function() {
      return this.delegate(function() {
        return this;
      });
    };

    Scope.prototype.find = function(name) {
      var qualifiers, scope_name, subscope;
      if (name instanceof Array) {
        qualifiers = name;
      } else {
        qualifiers = name.split(/\./);
      }
      if (qualifiers.length === 1) {
        return this.definitions[qualifiers[0]] || this.find_subscope(qualifiers[0]);
      } else {
        scope_name = qualifiers.shift();
        if (subscope = this.find_subscope(scope_name)) {
          return subscope.find(qualifiers);
        } else {
          if (scope_name === ("" + this.name)) return this.find(qualifiers);
        }
      }
      return null;
    };

    Scope.prototype.find_subscope = function(scope_name) {
      var id, subscope, _ref;
      _ref = this.subscopes;
      for (id in _ref) {
        subscope = _ref[id];
        if (subscope.name === scope_name) return subscope;
      }
    };

    Scope.prototype.lookup = function(name, options) {
      if (options == null) options = {};
      if (typeof options !== 'object') throw new Error(typeof options);
      if (options.warn_NaN !== true) options.warn_NaN = this.warn_NaN;
      return this.delegate(function() {
        var result, target, v, warn, _i, _len, _ref, _ref2;
        target = this;
        while (target) {
          if (result = target.find(name)) {
            if (options.warn_NaN) {
              warn = false;
              if ((_ref = result.value) != null ? _ref.length : void 0) {
                _ref2 = result.value;
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  v = _ref2[_i];
                  if (isNaN(v) || v === void 0) warn = true;
                }
              } else if (isNaN(result.value) || result.value === void 0) {
                warn = true;
              }
              if (warn) {
                console.log("Warning: variable `" + result.name + "` has NaN or undefined values");
              }
            }
            return result;
          }
          target = target.parent;
        }
        if (this.locked) {
          return new Definition({
            name: name
          });
        }
        if (options.silent) {
          return null;
        } else {
          throw new Error("Variable '" + name + "' is not defined in this scope");
        }
      });
    };

    Scope.prototype.delegate = function(callback) {
      return callback.call(this.current_subscope || this);
    };

    return Scope;

  })();

}).call(this);
