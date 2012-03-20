(function() {
  var component_wise,
    __slice = Array.prototype.slice;

  component_wise = function() {
    var again, arg, args, argset, callback, i, resultset, size;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    for (i in args) {
      if (args[i] && args[i].splice) args[i] = args[i].splice(0);
    }
    callback = args.pop();
    resultset = [];
    again = true;
    while (again) {
      size = null;
      again = false;
      argset = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = args.length; _i < _len; _i++) {
          arg = args[_i];
          if (arg && arg.length) {
            if (arg.length > 1) again = true;
            if (size && arg.length !== size) {
              throw new Error("All vectors must be the same size");
            }
            size = arg.length;
          }
          if (arg && arg.shift) {
            _results.push(arg.shift());
          } else {
            _results.push(arg);
          }
        }
        return _results;
      })();
      resultset.push(callback.apply(null, argset));
    }
    if (resultset.length === 1) {
      return resultset[0];
    } else {
      return resultset;
    }
  };

  exports.float = function(le, op, re) {};

}).call(this);
