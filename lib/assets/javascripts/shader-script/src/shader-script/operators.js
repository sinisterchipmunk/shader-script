(function() {
  var component_wise, cw_add, cw_divide, cw_mult, cw_subt,
    __slice = Array.prototype.slice;

  exports.component_wise = component_wise = function() {
    var again, arg, args, argset, callback, i, result, resultset, size;
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
      result = callback.apply(null, argset);
      resultset.push(result);
    }
    if (resultset.length === 1) {
      return resultset[0];
    } else {
      return resultset;
    }
  };

  cw_subt = function(le, re) {
    return component_wise(le.value, re && re.value, function(l, r) {
      if (r === void 0) {
        return -l;
      } else {
        return l - r;
      }
    });
  };

  cw_add = function(le, re) {
    return component_wise(le.value, re && re.value, function(l, r) {
      if (r === void 0) {
        return +l;
      } else {
        return l + r;
      }
    });
  };

  cw_mult = function(le, re) {
    return component_wise(le.value, re.value, function(l, r) {
      return l * r;
    });
  };

  cw_divide = function(le, re) {
    return component_wise(le.value, re.value, function(l, r) {
      return l / r;
    });
  };

  exports.signatures = {
    vec3: {
      '==': {
        vec3: 'vec3'
      },
      '-': {
        vec3: 'vec3'
      },
      '+': {
        vec3: 'vec3'
      },
      '/': {
        vec3: 'vec3'
      },
      '*': {
        vec3: 'vec3',
        mat3: 'vec3',
        mat4: 'vec3',
        float: 'vec3'
      }
    },
    vec4: {
      '==': {
        vec4: 'vec4'
      },
      '-': {
        vec4: 'vec4'
      },
      '+': {
        vec4: 'vec4'
      },
      '/': {
        vec4: 'vec4'
      },
      '*': {
        vec4: 'vec4',
        mat3: 'vec4',
        mat4: 'vec4',
        float: 'vec4'
      }
    },
    mat3: {
      '==': {
        mat3: 'mat3'
      },
      '-': {
        mat3: 'mat3'
      },
      '+': {
        mat3: 'mat3'
      },
      '/': {
        mat3: 'mat3'
      },
      '*': {
        vec3: 'vec3',
        vec4: 'vec4',
        mat3: 'mat3',
        float: 'mat3'
      }
    },
    mat4: {
      '==': {
        mat4: 'mat4'
      },
      '-': {
        mat4: 'mat4'
      },
      '+': {
        mat4: 'mat4'
      },
      '/': {
        mat4: 'mat4'
      },
      '*': {
        vec3: 'vec3',
        vec4: 'vec4',
        mat4: 'mat4',
        float: 'mat4'
      }
    }
  };

  exports.mat4 = {
    '==': function(le, re) {
      return le.value === re.value;
    },
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide,
    '*': function(le, re) {
      var dest, mat, vec, w, x, y, z, _ref;
      switch (re.type()) {
        case 'vec4':
          dest = [];
          mat = le.value;
          vec = re.value;
          _ref = [vec[0], vec[1], vec[2], vec[3]], x = _ref[0], y = _ref[1], z = _ref[2], w = _ref[3];
          dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
          dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
          dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
          dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
          return dest;
        default:
          return cw_mult(le, re);
      }
    }
  };

  exports.vec4 = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.vec3 = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.float = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

  exports.int = {
    '==': function(le, re) {
      if (le.value === re.value) {
        return 1;
      } else {
        return 0;
      }
    },
    '*': cw_mult,
    '-': cw_subt,
    '+': cw_add,
    '/': cw_divide
  };

}).call(this);
