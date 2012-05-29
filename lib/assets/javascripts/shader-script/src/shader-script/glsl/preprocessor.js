(function() {

  exports.Preprocessor = (function() {
    var DIRECTIVE_ALLOWED, DIRECTIVE_EXPR_ACCUMULATING, DIRECTIVE_NAME_ACCUMULATING, DIRECTIVE_NOT_ALLOWED;

    DIRECTIVE_NOT_ALLOWED = 1;

    DIRECTIVE_ALLOWED = 2;

    DIRECTIVE_NAME_ACCUMULATING = 4;

    DIRECTIVE_EXPR_ACCUMULATING = 8;

    function Preprocessor(source, env) {
      this.source = source;
      this.env = env != null ? env : {};
      this.conditions = [];
      this.process();
    }

    Preprocessor.prototype.processDirective = function(name, directive, state) {
      var expression, variableName;
      switch (name.toLowerCase()) {
        case 'define':
          if (!this.conditionIsTrue()) return false;
          variableName = directive.slice(0, directive.indexOf(' '));
          expression = directive.slice(directive.indexOf(' ') + 1, directive.length);
          this.env[variableName] = expression;
          break;
        case 'ifdef':
          this.conditions.push(this.conditionIsTrue() && this.env[directive] !== void 0);
          break;
        case 'ifndef':
          this.conditions.push(this.conditionIsTrue() && this.env[directive] === void 0);
          break;
        case 'else':
          this.flipCondition();
          break;
        case 'endif':
          this.conditions.pop();
          break;
        default:
          throw new Error("Unhandled directive in state " + state + ": #" + name + " " + directive);
      }
      return this.conditionIsTrue();
    };

    Preprocessor.prototype.conditionIsTrue = function() {
      return this.conditions.length === 0 || this.conditions[this.conditions.length - 1];
    };

    Preprocessor.prototype.flipCondition = function() {
      switch (this.conditions.length) {
        case 0:
          break;
        case 1:
          return this.conditions[0] = !this.conditions[0];
        default:
          if (this.conditions[this.conditions.length - 2]) {
            return this.conditions[this.conditions.length - 1] = !this.conditions[this.conditions.length - 1];
          }
      }
    };

    Preprocessor.prototype.process = function() {
      var byte, check, directiveExpr, directiveName, lastNonWhiteByte, state, _i, _len, _ref,
        _this = this;
      this.result = "";
      lastNonWhiteByte = "";
      directiveName = "";
      directiveExpr = "";
      state = DIRECTIVE_ALLOWED;
      check = function(byte) {
        var _ref;
        if (byte === '#' && state === DIRECTIVE_ALLOWED) {
          state = DIRECTIVE_NAME_ACCUMULATING;
          return false;
        } else if (byte === '\n' && (state === DIRECTIVE_EXPR_ACCUMULATING || state === DIRECTIVE_NAME_ACCUMULATING)) {
          if (lastNonWhiteByte !== "\\") {
            _this.processDirective(directiveName, directiveExpr, state);
            state = DIRECTIVE_ALLOWED;
            _ref = ["", ""], directiveName = _ref[0], directiveExpr = _ref[1];
          }
          return true;
        } else if (byte === ' ' && state === DIRECTIVE_NAME_ACCUMULATING) {
          state = DIRECTIVE_EXPR_ACCUMULATING;
          return false;
        } else {
          if (!(byte === "\n" || byte === "\t" || byte === " ")) {
            lastNonWhiteByte = byte;
          }
          return true;
        }
      };
      _ref = this.source;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        byte = _ref[_i];
        if (!check(byte)) continue;
        if (byte === "\n") this.result += "\n";
        switch (state) {
          case DIRECTIVE_NAME_ACCUMULATING:
            directiveName += byte;
            break;
          case DIRECTIVE_EXPR_ACCUMULATING:
            directiveExpr += byte;
            break;
          default:
            if (byte !== "\n" ? this.conditionIsTrue() : void 0) {
              this.result += byte;
            }
        }
      }
      return check("\n");
    };

    Preprocessor.prototype.toString = function() {
      return this.result;
    };

    return Preprocessor;

  })();

}).call(this);
