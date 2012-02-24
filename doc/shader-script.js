(function(global) {
  var _require = {};
  var require = function(path) { return require[path] = require[path] || (_require[path] && _require[path]()); };
  
    _require["shader-script"] = function() {
      var exports = {};
      (function() {
  var Lexer, Program, Simulator, fs, lexer, parser;

  fs = require('fs');

  Lexer = require("shader-script/lexer").Lexer;

  Simulator = require("shader-script/simulator").Simulator;

  parser = require("shader-script/parser").parser;

  Program = require('shader-script/glsl/program').Program;

  lexer = new Lexer;

  parser.lexer = {
    lex: function() {
      var tag, _ref;
      _ref = this.tokens[this.pos++] || [''], tag = _ref[0], this.yytext = _ref[1], this.yylineno = _ref[2];
      return tag;
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };

  parser.yy = require('shader-script/nodes');

  exports.Simulator = Simulator;

  exports.parse = function(code) {
    return parser.parse(lexer.tokenize(code));
  };

  exports.compile_to_glsl = function(code) {
    var program;
    program = exports.compile(code);
    return {
      vertex: program.vertex.toSource(),
      fragment: program.fragment.toSource()
    };
  };

  exports.compile = function(code) {
    if (!(code instanceof Object && code.compile)) code = exports.parse(code);
    return code.compile();
  };

}).call(this);

      return exports;
    };
    _require["shader-script/glsl"] = function() {
      var exports = {};
      (function() {
  var Lexer, lexer, parse, parser;

  Lexer = require("shader-script/glsl/lexer").Lexer;

  if (typeof process !== 'undefined' && process.env['TEST']) {
    parser = require("shader-script/glsl/grammar").parser;
  } else {
    parser = require("shader-script/glsl/parser").parser;
  }

  lexer = new Lexer;

  parser.lexer = {
    lex: function() {
      var tag, _ref;
      _ref = this.tokens[this.pos++] || [''], tag = _ref[0], this.yytext = _ref[1], this.yylineno = _ref[2];
      return tag;
    },
    setInput: function(tokens) {
      this.tokens = tokens;
      return this.pos = 0;
    },
    upcomingInput: function() {
      return "";
    }
  };

  parser.yy = require('shader-script/glsl/nodes');

  exports.parse = parse = function(code) {
    return parser.parse(lexer.tokenize(code, {
      rewrite: false
    }));
  };

  exports.compile = function(code, program) {
    return parse(code).compile(program);
  };

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/grammar"] = function() {
      var exports = {};
      (function() {
  var Parser, alt, alternatives, grammar, name, o, operators, token, tokens, unwrap;

  Parser = require('jison').Parser;

  unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

  o = function(patternString, action, options) {
    var match;
    patternString = patternString.replace(/\s{2,}/g, ' ');
    if (!action) return [patternString, '$$ = $1;', options];
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    action = action.replace(/\bnew /g, '$&yy.');
    action = action.replace(/\b(?:Block\.wrap|extend)\b/g, 'yy.$&');
    return [patternString, "$$ = " + action + ";", options];
  };

  grammar = {
    Root: [
      o('', function() {
        return new Root(new Block([]));
      }), o('Body', function() {
        return new Root($1);
      }), o('Block TERMINATOR', function() {
        return new Root($1);
      })
    ],
    Body: [
      o('Line', function() {
        return Block.wrap([$1]);
      }), o('Body Line', function() {
        $1.push($2);
        return $1;
      })
    ],
    Line: [o('Expression TERMINATOR'), o('Statement')],
    Block: [
      o('{ }', function() {
        return new Block;
      }), o('{ Body }', function() {
        return $2;
      })
    ],
    Expression: [o('Identifier'), o('Assign'), o('Call'), o('Literal'), o('TypeConstructor'), o('FunctionCall')],
    Statement: [
      o('Return TERMINATOR'), o('Comment TERMINATOR'), o('FunctionDefinition'), o('FunctionDeclaration TERMINATOR'), o('VariableDeclaration TERMINATOR'), o('STATEMENT TERMINATOR', function() {
        return new Literal($1);
      }), o('TERMINATOR', function() {
        return {
          compile: function() {
            return null;
          }
        };
      })
    ],
    VariableDeclaration: [
      o('Type Identifier', function() {
        return new Variable($1, $2);
      })
    ],
    FunctionDefinition: [
      o('Type Identifier CALL_START ArgumentDefs ) Block', function() {
        return new Function($1, $2, $4, $6);
      }), o('Type Identifier CALL_START ) Block', function() {
        return new Function($1, $2, [], $5);
      })
    ],
    ArgumentDefs: [
      o('Type Identifier', function() {
        return [new Variable($1, $2)];
      }), o('ArgumentDefs , Type Identifier', function() {
        return $1.concat([new Variable($3, $4)]);
      })
    ],
    ArgumentList: [
      o('( Arguments )', function() {
        return $2;
      }), o('CALL_START Arguments )', function() {
        return $2;
      }), o('( )', function() {
        return [];
      }), o('CALL_START )', function() {
        return [];
      })
    ],
    Arguments: [
      o('Expression', function() {
        return [$1];
      }), o('Arguments , Expression', function() {
        return $1.concat([$3]);
      })
    ],
    FunctionCall: [
      o('Identifier ArgumentList', function() {
        return new Call($1, $2);
      })
    ],
    Assign: [
      o('Identifier = Expression', function() {
        return new Assign($1, $3);
      })
    ],
    Identifier: [
      o('IDENTIFIER', function() {
        return new Identifier($1);
      })
    ],
    Literal: [
      o('NUMBER', function() {
        return new Literal($1);
      })
    ],
    TypeConstructor: [
      o('Type ArgumentList', function() {
        return new TypeConstructor($1, $2);
      })
    ],
    Type: [o('VOID'), o('BOOL'), o('INT'), o('FLOAT'), o('VEC2'), o('VEC3'), o("VEC4"), o("BVEC2"), o("BVEC3"), o("BVEC4"), o('IVEC2'), o('IVEC3'), o('IVEC4'), o('MAT2'), o("MAT3"), o("MAT4"), o('MAT2X2'), o('MAT2X3'), o('MAT2X4'), o("MAT3X2"), o("MAT3X3"), o("MAT3X4"), o("MAT4X2"), o("MAT4X3"), o("MAT4X4"), o('SAMPLER1D'), o('SAMPLER2D'), o('SAMPLER3D'), o('SAMPLERCUBE'), o('SAMPLER1DSHADOW'), o('SAMPLER2DSHADOW')],
    Operation: [
      o('UNARY Expression', function() {
        return new Op($1, $2);
      }), o('-     Expression', (function() {
        return new Op('-', $2);
      }), {
        prec: 'UNARY'
      }), o('+     Expression', (function() {
        return new Op('+', $2);
      }), {
        prec: 'UNARY'
      }), o('-- SimpleAssignable', function() {
        return new Op('--', $2);
      }), o('++ SimpleAssignable', function() {
        return new Op('++', $2);
      }), o('SimpleAssignable --', function() {
        return new Op('--', $1, null, true);
      }), o('SimpleAssignable ++', function() {
        return new Op('++', $1, null, true);
      }), o('Expression ?', function() {
        return new Existence($1);
      }), o('Expression +  Expression', function() {
        return new Op('+', $1, $3);
      }), o('Expression -  Expression', function() {
        return new Op('-', $1, $3);
      }), o('Expression MATH     Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression SHIFT    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression COMPARE  Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression LOGIC    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression RELATION Expression', function() {
        if ($2.charAt(0) === '!') {
          return new Op($2.slice(1), $1, $3).invert();
        } else {
          return new Op($2, $1, $3);
        }
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       Expression', function() {
        return new Assign($1, $3, $2);
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       INDENT Expression OUTDENT', function() {
        return new Assign($1, $4, $2);
      }), o('SimpleAssignable EXTENDS Expression', function() {
        return new Extends($1, $3);
      })
    ]
  };

  operators = [['left', '.', '?.', '::'], ['left', 'CALL_START', 'CALL_END'], ['nonassoc', '++', '--'], ['left', '?'], ['right', 'UNARY'], ['left', 'MATH'], ['left', '+', '-'], ['left', 'SHIFT'], ['left', 'RELATION'], ['left', 'COMPARE'], ['left', 'LOGIC'], ['nonassoc', 'INDENT', 'OUTDENT'], ['right', '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS'], ['right', 'FORIN', 'FOROF', 'BY', 'WHEN'], ['right', 'IF', 'ELSE', 'FOR', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS'], ['right', 'POST_IF']];

  tokens = [];

  for (name in grammar) {
    alternatives = grammar[name];
    grammar[name] = (function() {
      var _i, _j, _len, _len2, _ref, _results;
      _results = [];
      for (_i = 0, _len = alternatives.length; _i < _len; _i++) {
        alt = alternatives[_i];
        _ref = alt[0].split(' ');
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          token = _ref[_j];
          if (!grammar[token]) tokens.push(token);
        }
        if (name === 'Root') alt[1] = "return " + alt[1];
        _results.push(alt);
      }
      return _results;
    })();
  }

  exports.parser = new Parser({
    tokens: tokens.join(' '),
    bnf: grammar,
    operators: operators.reverse(),
    startSymbol: 'Root'
  });

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/lexer"] = function() {
      var exports = {};
      (function() {
  var BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, STRICT_PROSCRIBED, TRAILING_SPACES, UNARY, WHITESPACE, compact, count, key, last, starts, _ref, _ref2,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('shader-script/rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

  _ref2 = require('shader-script/helpers'), count = _ref2.count, starts = _ref2.starts, compact = _ref2.compact, last = _ref2.last;

  exports.Lexer = Lexer = (function() {

    function Lexer() {}

    Lexer.prototype.tokenize = function(code, opts) {
      var i, tag;
      if (opts == null) opts = {};
      if (WHITESPACE.test(code)) code = "\n" + code;
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      this.code = code;
      this.line = opts.line || 0;
      this.indent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      i = 0;
      while (this.chunk = code.slice(i)) {
        i += this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.heredocToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
      }
      this.closeIndentation();
      if (tag = this.ends.pop()) this.error("missing " + tag);
      if (opts.rewrite === false) return this.tokens;
      return (new Rewriter).rewrite(this.tokens);
    };

    Lexer.prototype.identifierToken = function() {
      var colon, forcedIdentifier, id, input, match, prev, tag, _ref3, _ref4;
      if (!(match = IDENTIFIER.exec(this.chunk))) return 0;
      input = match[0], id = match[1], colon = match[2];
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref3 = prev[0]) === '.' || _ref3 === '?.' || _ref3 === '::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref4 = this.tag(), __indexOf.call(LINE_BREAK, _ref4) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("reserved word \"" + id + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) id = COFFEE_ALIAS_MAP[id];
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
            case 'null':
            case 'undefined':
              return 'BOOL';
            case 'break':
            case 'continue':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      this.token(tag, id);
      if (colon) this.token(':', ':');
      return input.length;
    };

    Lexer.prototype.numberToken = function() {
      var binaryLiteral, lexedLength, match, number, octalLiteral;
      if (!(match = NUMBER.exec(this.chunk))) return 0;
      number = match[0];
      if (/E/.test(number)) {
        this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
      } else if (/[BOX]/.test(number)) {
        this.error("radix prefixes must be lowercase '" + number + "'");
      } else if (/^0[89]/.test(number)) {
        this.error("decimal literals '" + number + "' must not be prefixed with '0'");
      } else if (/^0[0-7]/.test(number)) {
        this.error("octal literals '" + number + "' must be prefixed with '0o'");
      }
      lexedLength = number.length;
      if (octalLiteral = /0o([0-7]+)/.exec(number)) {
        number = (parseInt(octalLiteral[1], 8)).toString();
      }
      if (binaryLiteral = /0b([01]+)/.exec(number)) {
        number = (parseInt(binaryLiteral[1], 2)).toString();
      }
      this.token('NUMBER', number);
      return lexedLength;
    };

    Lexer.prototype.stringToken = function() {
      var match, octalEsc, string;
      switch (this.chunk.charAt(0)) {
        case "'":
          if (!(match = SIMPLESTR.exec(this.chunk))) return 0;
          this.token('STRING', (string = match[0]).replace(MULTILINER, '\\\n'));
          break;
        case '"':
          if (!(string = this.balancedString(this.chunk, '"'))) return 0;
          if (0 < string.indexOf('#{', 1)) {
            this.interpolateString(string.slice(1, -1));
          } else {
            this.token('STRING', this.escapeLines(string));
          }
          break;
        default:
          return 0;
      }
      if (octalEsc = /^(?:\\.|[^\\])*\\[0-7]/.test(string)) {
        this.error("octal escape sequences " + string + " are not allowed");
      }
      this.line += count(string, '\n');
      return string.length;
    };

    Lexer.prototype.heredocToken = function() {
      var doc, heredoc, match, quote;
      if (!(match = HEREDOC.exec(this.chunk))) return 0;
      heredoc = match[0];
      quote = heredoc.charAt(0);
      doc = this.sanitizeHeredoc(match[2], {
        quote: quote,
        indent: null
      });
      if (quote === '"' && 0 <= doc.indexOf('#{')) {
        this.interpolateString(doc, {
          heredoc: true
        });
      } else {
        this.token('STRING', this.makeString(doc, quote, true));
      }
      this.line += count(heredoc, '\n');
      return heredoc.length;
    };

    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) return 0;
      comment = match[0], here = match[1];
      if (here) {
        this.token('HERECOMMENT', this.sanitizeHeredoc(here, {
          herecomment: true,
          indent: Array(this.indent + 1).join(' ')
        }));
      }
      this.line += count(comment, '\n');
      return comment.length;
    };

    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1));
      return script.length;
    };

    Lexer.prototype.regexToken = function() {
      var flags, length, match, prev, regex, _ref3, _ref4;
      if (this.chunk.charAt(0) !== '/') return 0;
      if (match = HEREGEX.exec(this.chunk)) {
        length = this.heregexToken(match);
        this.line += count(match[0], '\n');
        return length;
      }
      prev = last(this.tokens);
      if (prev && (_ref3 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref3) >= 0)) {
        return 0;
      }
      if (!(match = REGEX.exec(this.chunk))) return 0;
      _ref4 = match, match = _ref4[0], regex = _ref4[1], flags = _ref4[2];
      if (regex.slice(0, 2) === '/*') {
        this.error('regular expressions cannot begin with `*`');
      }
      if (regex === '//') regex = '/(?:)/';
      this.token('REGEX', "" + regex + flags);
      return match.length;
    };

    Lexer.prototype.heregexToken = function(match) {
      var body, flags, heregex, re, tag, tokens, value, _i, _len, _ref3, _ref4, _ref5, _ref6;
      heregex = match[0], body = match[1], flags = match[2];
      if (0 > body.indexOf('#{')) {
        re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/');
        if (re.match(/^\*/)) {
          this.error('regular expressions cannot begin with `*`');
        }
        this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
        return heregex.length;
      }
      this.token('IDENTIFIER', 'RegExp');
      this.tokens.push(['CALL_START', '(']);
      tokens = [];
      _ref3 = this.interpolateString(body, {
        regex: true
      });
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], tag = _ref4[0], value = _ref4[1];
        if (tag === 'TOKENS') {
          tokens.push.apply(tokens, value);
        } else {
          if (!(value = value.replace(HEREGEX_OMIT, ''))) continue;
          value = value.replace(/\\/g, '\\\\');
          tokens.push(['STRING', this.makeString(value, '"', true)]);
        }
        tokens.push(['+', '+']);
      }
      tokens.pop();
      if (((_ref5 = tokens[0]) != null ? _ref5[0] : void 0) !== 'STRING') {
        this.tokens.push(['STRING', '""'], ['+', '+']);
      }
      (_ref6 = this.tokens).push.apply(_ref6, tokens);
      if (flags) this.tokens.push([',', ','], ['STRING', '"' + flags + '"']);
      this.token(')', ')');
      return heregex.length;
    };

    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, prev, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) return 0;
      indent = match[0];
      this.line += count(indent, ';');
      this.seenFor = false;
      prev = last(this.tokens, 1);
      size = indent.length - 1 - indent.lastIndexOf(';');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken();
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.outdebt = this.indebt = 0;
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines);
      }
      this.indent = size;
      return indent.length;
    };

    Lexer.prototype.outdentToken = function(moveOut, noNewlines) {
      var dent, len;
      while (moveOut > 0) {
        len = this.indents.length - 1;
        if (this.indents[len] === void 0) {
          moveOut = 0;
        } else if (this.indents[len] === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (this.indents[len] < this.outdebt) {
          this.outdebt -= this.indents[len];
          moveOut -= this.indents[len];
        } else {
          dent = this.indents.pop() - this.outdebt;
          moveOut -= dent;
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', dent);
        }
      }
      if (dent) this.outdebt -= moveOut;
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', ';');
      }
      return this;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === ';'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) prev[match ? 'spaced' : 'newLine'] = true;
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };

    Lexer.prototype.newlineToken = function() {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') this.token('TERMINATOR', ';');
      return this;
    };

    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') this.tokens.pop();
      return this;
    };

    Lexer.prototype.literalToken = function() {
      var match, prev, tag, value, _ref3, _ref4, _ref5, _ref6;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) this.tagParameters();
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref3 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref3) >= 0)) {
          this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref4 = prev[1]) === '||' || _ref4 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        this.seenFor = false;
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref5 = prev[0], __indexOf.call(CALLABLE, _ref5) >= 0)) {
          if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
          tag = 'CALL_START';
        } else if (value === '[' && (_ref6 = prev[0], __indexOf.call(INDEXABLE, _ref6) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push(INVERSES[value]);
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.token(tag, value);
      return value.length;
    };

    Lexer.prototype.sanitizeHeredoc = function(doc, options) {
      var attempt, herecomment, indent, match, _ref3;
      indent = options.indent, herecomment = options.herecomment;
      if (herecomment) {
        if (HEREDOC_ILLEGAL.test(doc)) {
          this.error("block comment cannot contain \"*/\", starting");
        }
        if (doc.indexOf('\n') <= 0) return doc;
      } else {
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref3 = attempt.length) && _ref3 < indent.length)) {
            indent = attempt;
          }
        }
      }
      if (indent) doc = doc.replace(RegExp("\\n" + indent, "g"), '\n');
      if (!herecomment) doc = doc.replace(/^\n/, '');
      return doc;
    };

    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') return this;
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };

    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };

    Lexer.prototype.balancedString = function(str, end) {
      var continueCount, i, letter, match, prev, stack, _ref3;
      continueCount = 0;
      stack = [end];
      for (i = 1, _ref3 = str.length; 1 <= _ref3 ? i < _ref3 : i > _ref3; 1 <= _ref3 ? i++ : i--) {
        if (continueCount) {
          --continueCount;
          continue;
        }
        switch (letter = str.charAt(i)) {
          case '\\':
            ++continueCount;
            continue;
          case end:
            stack.pop();
            if (!stack.length) return str.slice(0, i + 1 || 9e9);
            end = stack[stack.length - 1];
            continue;
        }
        if (end === '}' && (letter === '"' || letter === "'")) {
          stack.push(end = letter);
        } else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
          continueCount += match[0].length - 1;
        } else if (end === '}' && letter === '{') {
          stack.push(end = '}');
        } else if (end === '"' && prev === '#' && letter === '{') {
          stack.push(end = '}');
        }
        prev = letter;
      }
      return this.error("missing " + (stack.pop()) + ", starting");
    };

    Lexer.prototype.interpolateString = function(str, options) {
      var expr, heredoc, i, inner, interpolated, len, letter, nested, pi, regex, tag, tokens, value, _len, _ref3, _ref4, _ref5;
      if (options == null) options = {};
      heredoc = options.heredoc, regex = options.regex;
      tokens = [];
      pi = 0;
      i = -1;
      while (letter = str.charAt(i += 1)) {
        if (letter === '\\') {
          i += 1;
          continue;
        }
        if (!(letter === '#' && str.charAt(i + 1) === '{' && (expr = this.balancedString(str.slice(i + 1), '}')))) {
          continue;
        }
        if (pi < i) tokens.push(['NEOSTRING', str.slice(pi, i)]);
        inner = expr.slice(1, -1);
        if (inner.length) {
          nested = new Lexer().tokenize(inner, {
            line: this.line,
            rewrite: false
          });
          nested.pop();
          if (((_ref3 = nested[0]) != null ? _ref3[0] : void 0) === 'TERMINATOR') {
            nested.shift();
          }
          if (len = nested.length) {
            if (len > 1) {
              nested.unshift(['(', '(', this.line]);
              nested.push([')', ')', this.line]);
            }
            tokens.push(['TOKENS', nested]);
          }
        }
        i += expr.length;
        pi = i + 1;
      }
      if ((i > pi && pi < str.length)) tokens.push(['NEOSTRING', str.slice(pi)]);
      if (regex) return tokens;
      if (!tokens.length) return this.token('STRING', '""');
      if (tokens[0][0] !== 'NEOSTRING') tokens.unshift(['', '']);
      if (interpolated = tokens.length > 1) this.token('(', '(');
      for (i = 0, _len = tokens.length; i < _len; i++) {
        _ref4 = tokens[i], tag = _ref4[0], value = _ref4[1];
        if (i) this.token('+', '+');
        if (tag === 'TOKENS') {
          (_ref5 = this.tokens).push.apply(_ref5, value);
        } else {
          this.token('STRING', this.makeString(value, '"', heredoc));
        }
      }
      if (interpolated) this.token(')', ')');
      return tokens;
    };

    Lexer.prototype.pair = function(tag) {
      var size, wanted;
      if (tag !== (wanted = last(this.ends))) {
        if ('OUTDENT' !== wanted) this.error("unmatched " + tag);
        this.indent -= size = last(this.indents);
        this.outdentToken(size, true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };

    Lexer.prototype.token = function(tag, value) {
      return this.tokens.push([tag, value, this.line]);
    };

    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };

    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };

    Lexer.prototype.unfinished = function() {
      var _ref3;
      return LINE_CONTINUER.test(this.chunk) || ((_ref3 = this.tag()) === '\\' || _ref3 === '.' || _ref3 === '?.' || _ref3 === 'UNARY' || _ref3 === 'MATH' || _ref3 === '+' || _ref3 === '-' || _ref3 === 'SHIFT' || _ref3 === 'RELATION' || _ref3 === 'COMPARE' || _ref3 === 'LOGIC' || _ref3 === 'THROW' || _ref3 === 'EXTENDS');
    };

    Lexer.prototype.escapeLines = function(str, heredoc) {
      return str.replace(MULTILINER, heredoc ? '\\n' : '');
    };

    Lexer.prototype.makeString = function(body, quote, heredoc) {
      if (!body) return quote + quote;
      body = body.replace(/\\([\s\S])/g, function(match, contents) {
        if (contents === '\n' || contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      return quote + this.escapeLines(body, heredoc) + quote;
    };

    Lexer.prototype.error = function(message) {
      throw SyntaxError("" + message + " on line " + (this.line + 1));
    };

    return Lexer;

  })();

  JS_KEYWORDS = ['attribute', 'const', 'uniform', 'varying', 'centroid', 'break', 'continue', 'do', 'for', 'while', 'if', 'else', 'in', 'out', 'inout', 'float', 'int', 'void', 'bool', 'true', 'false', 'invariant', 'discard', 'return', 'mat2', 'mat3', 'mat4', 'mat2x2', 'mat2x3', 'mat2x4', 'mat3x2', 'mat3x3', 'mat3x4', 'mat4x2', 'mat4x3', 'mat4x4', 'vec2', 'vec3', 'vec4', 'ivec2', 'ivec3', 'ivec4', 'bvec2', 'bvec3', 'bvec4', 'sampler1D', 'sampler2D', 'sampler3D', 'samplerCube', 'sampler1DShadow', 'sampler2DShadow', 'struct', 'asm', 'class', 'union', 'enum', 'typedef', 'template', 'this', 'packed', 'goto', 'switch', 'default', 'inline', 'noinline', 'volatile', 'public', 'static', 'extern', 'external', 'interface', 'long', 'short', 'double', 'half', 'fixed', 'unsigned', 'lowp', 'mediump', 'highp', 'precision', 'input', 'output', 'hvec2', 'hvec3', 'hvec4', 'dvec2', 'dvec3', 'dvec4', 'fvec2', 'fvec3', 'fvec4', 'sampler2DRect', 'sampler3DRect', 'sampler2DRectShadow', 'sizeof', 'cast', 'namespace', 'using'];

  COFFEE_KEYWORDS = [];

  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };

  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();

  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

  RESERVED = [];

  STRICT_PROSCRIBED = ['arguments', 'eval'];

  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);

  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;

  IDENTIFIER = /^([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([^\n\S]*:(?!:))?/;

  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

  HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;

  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3})/;

  WHITESPACE = /^[^\n\S]+/;

  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/;

  CODE = /^[-=]>/;

  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

  SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;

  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

  REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;

  HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;

  HEREGEX_OMIT = /\s+(?:#.*)?/g;

  MULTILINER = /\n/g;

  HEREDOC_INDENT = /\n+([^\n\S]*)/g;

  HEREDOC_ILLEGAL = /\*\//;

  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

  TRAILING_SPACES = /\s+$/;

  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='];

  UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE', 'DO'];

  LOGIC = ['&&', '||', '&', '|', '^'];

  SHIFT = ['<<', '>>', '>>>'];

  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

  MATH = ['*', '/', '%'];

  RELATION = ['IN', 'OF', 'INSTANCEOF'];

  BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'];

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL');

  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes"] = function() {
      var exports = {};
      (function() {
  var node_file, node_name, nodes;

  nodes = {
    Block: 'block',
    Literal: 'literal',
    Value: 'value',
    Identifier: 'identifier',
    Call: 'call',
    Variable: 'variable',
    Assign: 'assign',
    Function: 'function',
    Root: 'root',
    TypeConstructor: 'type_constructor'
  };

  for (node_name in nodes) {
    node_file = nodes[node_name];
    exports[node_name] = require("shader-script/glsl/nodes/" + node_file)[node_name];
  }

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/assign"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.name = "_assign";

    Assign.prototype.children = function() {
      return ['left', 'right'];
    };

    Assign.prototype.compile = function(program) {
      var left, right;
      left = this.left.toVariableName();
      right = this.right.compile(program);
      return {
        execute: function() {
          if (program.state.variables[left] === void 0) {
            throw new Error("undeclared variable " + left);
          }
          return program.state.variables[left].value = right.execute();
        },
        toSource: function() {
          return "" + left + " = " + (right.toSource());
        }
      };
    };

    return Assign;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/block"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Block = (function(_super) {

    __extends(Block, _super);

    Block.prototype.name = function() {
      return 'block';
    };

    function Block(lines, options) {
      if (lines == null) lines = [];
      this.options = options != null ? options : {
        scope: true
      };
      Block.__super__.constructor.call(this, lines);
    }

    Block.prototype.compile = function(program) {
      var child, lines, _i, _len, _ref, _result,
        _this = this;
      if (this.children.length > 1) throw new Error("too many children");
      lines = [];
      if (this.lines) {
        _ref = this.lines;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _result = child.compile(program);
          if (_result) lines.push(_result);
        }
      }
      return {
        execute: function() {
          var line, _j, _len2, _results;
          _results = [];
          for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
            line = lines[_j];
            _results.push(line.execute());
          }
          return _results;
        },
        toSource: function() {
          var indent, line, result;
          indent = _this.options && _this.options.scope ? "  " : "";
          result = ((function() {
            var _j, _len2, _results;
            _results = [];
            for (_j = 0, _len2 = lines.length; _j < _len2; _j++) {
              line = lines[_j];
              _results.push(line.toSource());
            }
            return _results;
          })()).join(";\n").trim();
          if (result[result.length - 1] !== ";") result += ";";
          return indent + result.split("\n").join("\n" + indent) + "\n";
        }
      };
    };

    Block.prototype.children = function() {
      return ['lines'];
    };

    Block.prototype.push = function(line) {
      this.lines.push(line);
      return this;
    };

    Block.wrap = function(lines, options) {
      if (lines.length === 1 && lines[0] instanceof Block) return lines[0];
      return new exports.Block(lines, options);
    };

    return Block;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/call"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Call = (function(_super) {

    __extends(Call, _super);

    function Call() {
      Call.__super__.constructor.apply(this, arguments);
    }

    Call.prototype.name = '_call';

    Call.prototype.children = function() {
      return ['name', 'params'];
    };

    Call.prototype.compile = function(program) {
      var compiled_params, name, param;
      name = this.name.toVariableName();
      compiled_params = (function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.compile(program));
        }
        return _results;
      }).call(this);
      return {
        execute: function() {
          var _ref;
          if (program.functions[name]) {
            return (_ref = program.functions[name]).invoke.apply(_ref, compiled_params);
          } else {
            throw new Error("function '" + name + "' is not defined");
          }
        },
        toSource: function() {
          var joined_params, param;
          joined_params = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_params.length; _i < _len; _i++) {
              param = compiled_params[_i];
              _results.push(param.toSource());
            }
            return _results;
          })()).join(', ');
          return "" + name + "(" + joined_params + ")";
        }
      };
    };

    return Call;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/function"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Function = (function(_super) {

    __extends(Function, _super);

    function Function() {
      Function.__super__.constructor.apply(this, arguments);
    }

    Function.prototype.name = '_function';

    Function.prototype.children = function() {
      return ['return_type', 'name', 'arguments', 'block'];
    };

    Function.prototype.compile = function(program) {
      var argument, compiled_arguments, compiled_block, compiled_name, return_type;
      compiled_arguments = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          argument = _ref[_i];
          _results.push(argument.compile(program));
        }
        return _results;
      }).call(this);
      compiled_block = this.block.compile(program);
      compiled_name = this.name.toVariableName();
      return_type = this.return_type;
      return {
        execute: function() {
          var arg, args, name,
            _this = this;
          name = compiled_name;
          args = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_arguments.length; _i < _len; _i++) {
              arg = compiled_arguments[_i];
              _results.push(arg.variable);
            }
            return _results;
          })();
          return program.functions[name] = {
            return_type: return_type,
            arguments: args,
            invoke: function() {
              var i, params, _ref;
              params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
              if (args.length !== params.length) {
                throw new Error("Incorrect argument count (" + params.length + " for " + args.length + ")");
              }
              for (i = 0, _ref = params.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
                args[i].value = params[i].execute();
              }
              return compiled_block.execute();
            },
            toSource: function(overriding_fn_name) {
              return _this.toSource(overriding_fn_name);
            }
          };
        },
        toSource: function(fn_name) {
          var arg, arg_list;
          fn_name || (fn_name = compiled_name);
          arg_list = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_arguments.length; _i < _len; _i++) {
              arg = compiled_arguments[_i];
              _results.push(arg.toSource());
            }
            return _results;
          })()).join(', ');
          return ("" + return_type + " " + fn_name + "(" + arg_list + ") {\n") + compiled_block.toSource() + "}";
        }
      };
    };

    return Function;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/identifier"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "_identifier";

    Identifier.prototype.toVariableName = function() {
      return this.children[0];
    };

    Identifier.prototype.compile = function(program) {
      var _this = this;
      return {
        execute: function() {
          if (program.state.variables[_this.children[0]]) {
            return program.state.variables[_this.children[0]].value;
          } else {
            throw new Error("Undefined variable: " + _this.children[0]);
          }
        },
        toSource: function() {
          return _this.children[0];
        }
      };
    };

    return Identifier;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/literal"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal() {
      Literal.__super__.constructor.apply(this, arguments);
    }

    Literal.prototype.name = "_literal";

    Literal.prototype.type = function() {
      if (this.children[0].match(/^-?[0-9]+\.[0-9]+$/)) return 'float';
      if (this.children[0].match(/^-?[0-9]+$/)) return 'float';
      if (this.children[0].match(/^(true|false)$/)) return 'bool';
      throw new Error("Value type is not recognized: " + this.children[0]);
    };

    Literal.prototype.compile = function(program) {
      var value;
      value = this.children[0];
      if (this.type() === 'float' && value.indexOf('.') === -1) value += ".0";
      return {
        execute: function() {
          return eval(value);
        },
        toSource: function() {
          return value;
        }
      };
    };

    return Literal;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/root"] = function() {
      var exports = {};
      (function() {
  var Program,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Program = require('shader-script/glsl/program').Program;

  exports.Root = (function(_super) {

    __extends(Root, _super);

    function Root() {
      Root.__super__.constructor.apply(this, arguments);
    }

    Root.prototype.name = "_root";

    Root.prototype.children = function() {
      return ['block'];
    };

    Root.prototype.compile = function(state) {
      var block_node, name, options, program, subscope, _ref;
      if (state == null) state = {};
      program = new Program(state);
      block_node = this.block.compile(program);
      block_node.execute();
      if (subscope = state.scope.subscopes['block']) {
        _ref = subscope.definitions;
        for (name in _ref) {
          options = _ref[name];
          program.variables.push({
            name: name,
            type: options.type(),
            value: options.value
          });
        }
      }
      return program;
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/type_constructor"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.TypeConstructor = (function(_super) {

    __extends(TypeConstructor, _super);

    TypeConstructor.prototype.name = "_type_constructor";

    function TypeConstructor(type, _arguments) {
      this.type = type;
      this.arguments = _arguments;
      TypeConstructor.__super__.constructor.call(this);
    }

    TypeConstructor.prototype.compile = function(program) {
      var arg, compiled_args, type, validate_length,
        _this = this;
      compiled_args = (function() {
        var _i, _len, _ref, _results;
        _ref = this.arguments;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          arg = _ref[_i];
          _results.push(arg.compile(program));
        }
        return _results;
      }).call(this);
      validate_length = function(len) {
        if (compiled_args.length !== len) {
          return new Error("Incorrect argument count for " + _this.type + " constructor");
        }
      };
      switch (type = this.type) {
        case 'void':
          throw new Error("Can't cast to void");
          break;
        case 'bool':
        case 'int':
        case 'float':
          validate_length(1);
          compiled_args = compiled_args[0];
          break;
        case 'vec2':
        case 'ivec2':
        case 'bvec2':
          validate_length(2);
          break;
        case 'vec3':
        case 'ivec3':
        case 'bvec3':
          validate_length(3);
          break;
        case 'vec4':
        case 'ivec4':
        case 'bvec4':
          validate_length(4);
          break;
        default:
          throw new Error("Unexpected type constructor: " + this.type);
      }
      return {
        execute: function(state) {
          var arg, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
            arg = compiled_args[_i];
            _results.push(arg.execute());
          }
          return _results;
        },
        toSource: function() {
          var arg;
          return "" + type + "(" + (((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = compiled_args.length; _i < _len; _i++) {
              arg = compiled_args[_i];
              _results.push(arg.toSource());
            }
            return _results;
          })()).join(', ')) + ")";
        }
      };
    };

    return TypeConstructor;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/value"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Value = (function(_super) {

    __extends(Value, _super);

    Value.prototype.name = "_value";

    function Value() {
      Value.__super__.constructor.apply(this, arguments);
      if (this.children[0].toVariableName) {
        this.toVariableName = function() {
          return this.children[0].toVariableName();
        };
      }
    }

    Value.prototype.type = function(program) {
      return this.children[0].type(program);
    };

    Value.prototype.compile = function(shader) {
      return this.children[0].compile(shader);
    };

    return Value;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/nodes/variable"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Variable = (function(_super) {

    __extends(Variable, _super);

    Variable.prototype.name = '_variable';

    function Variable(type, name, qualified_name) {
      this.qualified_name = qualified_name;
      Variable.__super__.constructor.call(this, type, name);
    }

    Variable.prototype.children = function() {
      return ['type', 'name'];
    };

    Variable.prototype.compile = function(program) {
      var name, variable, _base,
        _this = this;
      name = this.name.toVariableName();
      if (this.qualified_name) {
        variable = program.state.scope.lookup(this.qualified_name);
      } else {
        variable = program.state.scope.define(name, {
          type: this.type
        });
      }
      variable.value = Number.NaN;
      (_base = program.state).variables || (_base.variables = {});
      program.state.variables[name] = variable;
      return {
        execute: function() {
          return variable.value;
        },
        toSource: function() {
          return "" + (variable.type()) + " " + variable.name;
        },
        variable: variable
      };
    };

    return Variable;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/glsl/parser"] = function() {
      var exports = {};
      /* Jison generated parser */

var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"{":10,"}":11,"Identifier":12,"Assign":13,"Call":14,"Literal":15,"TypeConstructor":16,"FunctionCall":17,"Return":18,"Comment":19,"FunctionDefinition":20,"FunctionDeclaration":21,"VariableDeclaration":22,"STATEMENT":23,"Type":24,"CALL_START":25,"ArgumentDefs":26,")":27,",":28,"ArgumentList":29,"(":30,"Arguments":31,"=":32,"IDENTIFIER":33,"NUMBER":34,"VOID":35,"BOOL":36,"INT":37,"FLOAT":38,"VEC2":39,"VEC3":40,"VEC4":41,"BVEC2":42,"BVEC3":43,"BVEC4":44,"IVEC2":45,"IVEC3":46,"IVEC4":47,"MAT2":48,"MAT3":49,"MAT4":50,"MAT2X2":51,"MAT2X3":52,"MAT2X4":53,"MAT3X2":54,"MAT3X3":55,"MAT3X4":56,"MAT4X2":57,"MAT4X3":58,"MAT4X4":59,"SAMPLER1D":60,"SAMPLER2D":61,"SAMPLER3D":62,"SAMPLERCUBE":63,"SAMPLER1DSHADOW":64,"SAMPLER2DSHADOW":65,"Operation":66,"UNARY":67,"-":68,"+":69,"--":70,"SimpleAssignable":71,"++":72,"?":73,"MATH":74,"SHIFT":75,"COMPARE":76,"LOGIC":77,"RELATION":78,"COMPOUND_ASSIGN":79,"INDENT":80,"OUTDENT":81,"EXTENDS":82,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",10:"{",11:"}",14:"Call",18:"Return",19:"Comment",21:"FunctionDeclaration",23:"STATEMENT",25:"CALL_START",27:")",28:",",30:"(",32:"=",33:"IDENTIFIER",34:"NUMBER",35:"VOID",36:"BOOL",37:"INT",38:"FLOAT",39:"VEC2",40:"VEC3",41:"VEC4",42:"BVEC2",43:"BVEC3",44:"BVEC4",45:"IVEC2",46:"IVEC3",47:"IVEC4",48:"MAT2",49:"MAT3",50:"MAT4",51:"MAT2X2",52:"MAT2X3",53:"MAT2X4",54:"MAT3X2",55:"MAT3X3",56:"MAT3X4",57:"MAT4X2",58:"MAT4X3",59:"MAT4X4",60:"SAMPLER1D",61:"SAMPLER2D",62:"SAMPLER3D",63:"SAMPLERCUBE",64:"SAMPLER1DSHADOW",65:"SAMPLER2DSHADOW",67:"UNARY",68:"-",69:"+",70:"--",71:"SimpleAssignable",72:"++",73:"?",74:"MATH",75:"SHIFT",76:"COMPARE",77:"LOGIC",78:"RELATION",79:"COMPOUND_ASSIGN",80:"INDENT",81:"OUTDENT",82:"EXTENDS"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,2],[7,2],[7,1],[5,2],[5,3],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[9,2],[9,2],[9,1],[9,2],[9,2],[9,2],[9,1],[22,2],[20,6],[20,5],[26,2],[26,4],[29,3],[29,3],[29,2],[29,2],[31,1],[31,3],[17,2],[13,3],[12,1],[15,1],[16,2],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[24,1],[66,2],[66,2],[66,2],[66,2],[66,2],[66,2],[66,2],[66,2],[66,3],[66,3],[66,3],[66,3],[66,3],[66,3],[66,3],[66,3],[66,5],[66,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Root(new yy.Block([]));
break;
case 2:return this.$ = new yy.Root($$[$0]);
break;
case 3:return this.$ = new yy.Root($$[$0-1]);
break;
case 4:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:this.$ = (function () {
        $$[$0-1].push($$[$0]);
        return $$[$0-1];
      }());
break;
case 6:this.$ = $$[$0-1];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = new yy.Block;
break;
case 9:this.$ = $$[$0-1];
break;
case 10:this.$ = $$[$0];
break;
case 11:this.$ = $$[$0];
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0-1];
break;
case 17:this.$ = $$[$0-1];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = $$[$0-1];
break;
case 20:this.$ = $$[$0-1];
break;
case 21:this.$ = new yy.Literal($$[$0-1]);
break;
case 22:this.$ = {
          compile: function() {
            return null;
          }
        };
break;
case 23:this.$ = new yy.Variable($$[$0-1], $$[$0]);
break;
case 24:this.$ = new yy.Function($$[$0-5], $$[$0-4], $$[$0-2], $$[$0]);
break;
case 25:this.$ = new yy.Function($$[$0-4], $$[$0-3], [], $$[$0]);
break;
case 26:this.$ = [new yy.Variable($$[$0-1], $$[$0])];
break;
case 27:this.$ = $$[$0-3].concat([new yy.Variable($$[$0-1], $$[$0])]);
break;
case 28:this.$ = $$[$0-1];
break;
case 29:this.$ = $$[$0-1];
break;
case 30:this.$ = [];
break;
case 31:this.$ = [];
break;
case 32:this.$ = [$$[$0]];
break;
case 33:this.$ = $$[$0-2].concat([$$[$0]]);
break;
case 34:this.$ = new yy.Call($$[$0-1], $$[$0]);
break;
case 35:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 36:this.$ = new yy.Identifier($$[$0]);
break;
case 37:this.$ = new yy.Literal($$[$0]);
break;
case 38:this.$ = new yy.TypeConstructor($$[$0-1], $$[$0]);
break;
case 39:this.$ = $$[$0];
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = $$[$0];
break;
case 45:this.$ = $$[$0];
break;
case 46:this.$ = $$[$0];
break;
case 47:this.$ = $$[$0];
break;
case 48:this.$ = $$[$0];
break;
case 49:this.$ = $$[$0];
break;
case 50:this.$ = $$[$0];
break;
case 51:this.$ = $$[$0];
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = $$[$0];
break;
case 54:this.$ = $$[$0];
break;
case 55:this.$ = $$[$0];
break;
case 56:this.$ = $$[$0];
break;
case 57:this.$ = $$[$0];
break;
case 58:this.$ = $$[$0];
break;
case 59:this.$ = $$[$0];
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = $$[$0];
break;
case 64:this.$ = $$[$0];
break;
case 65:this.$ = $$[$0];
break;
case 66:this.$ = $$[$0];
break;
case 67:this.$ = $$[$0];
break;
case 68:this.$ = $$[$0];
break;
case 69:this.$ = $$[$0];
break;
case 70:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 71:this.$ = new yy.Op('-', $$[$0]);
break;
case 72:this.$ = new yy.Op('+', $$[$0]);
break;
case 73:this.$ = new yy.Op('--', $$[$0]);
break;
case 74:this.$ = new yy.Op('++', $$[$0]);
break;
case 75:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 76:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 77:this.$ = new yy.Existence($$[$0-1]);
break;
case 78:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 79:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 80:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 81:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 82:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 83:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 84:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 85:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 86:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 87:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,6:[1,20],7:4,8:6,9:7,10:[1,5],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:[1,14],19:[1,15],20:16,21:[1,17],22:18,23:[1,19],24:23,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{1:[3]},{1:[2,2],6:[1,20],7:55,8:6,9:7,12:8,13:9,14:[1,10],15:11,16:12,17:13,18:[1,14],19:[1,15],20:16,21:[1,17],22:18,23:[1,19],24:23,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{6:[1,56]},{1:[2,4],6:[2,4],11:[2,4],14:[2,4],18:[2,4],19:[2,4],21:[2,4],23:[2,4],33:[2,4],34:[2,4],35:[2,4],36:[2,4],37:[2,4],38:[2,4],39:[2,4],40:[2,4],41:[2,4],42:[2,4],43:[2,4],44:[2,4],45:[2,4],46:[2,4],47:[2,4],48:[2,4],49:[2,4],50:[2,4],51:[2,4],52:[2,4],53:[2,4],54:[2,4],55:[2,4],56:[2,4],57:[2,4],58:[2,4],59:[2,4],60:[2,4],61:[2,4],62:[2,4],63:[2,4],64:[2,4],65:[2,4]},{4:58,6:[1,20],7:4,8:6,9:7,11:[1,57],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:[1,14],19:[1,15],20:16,21:[1,17],22:18,23:[1,19],24:23,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{6:[1,59]},{1:[2,7],6:[2,7],11:[2,7],14:[2,7],18:[2,7],19:[2,7],21:[2,7],23:[2,7],33:[2,7],34:[2,7],35:[2,7],36:[2,7],37:[2,7],38:[2,7],39:[2,7],40:[2,7],41:[2,7],42:[2,7],43:[2,7],44:[2,7],45:[2,7],46:[2,7],47:[2,7],48:[2,7],49:[2,7],50:[2,7],51:[2,7],52:[2,7],53:[2,7],54:[2,7],55:[2,7],56:[2,7],57:[2,7],58:[2,7],59:[2,7],60:[2,7],61:[2,7],62:[2,7],63:[2,7],64:[2,7],65:[2,7]},{6:[2,10],25:[1,63],27:[2,10],28:[2,10],29:61,30:[1,62],32:[1,60]},{6:[2,11],27:[2,11],28:[2,11]},{6:[2,12],27:[2,12],28:[2,12]},{6:[2,13],27:[2,13],28:[2,13]},{6:[2,14],27:[2,14],28:[2,14]},{6:[2,15],27:[2,15],28:[2,15]},{6:[1,64]},{6:[1,65]},{1:[2,18],6:[2,18],11:[2,18],14:[2,18],18:[2,18],19:[2,18],21:[2,18],23:[2,18],33:[2,18],34:[2,18],35:[2,18],36:[2,18],37:[2,18],38:[2,18],39:[2,18],40:[2,18],41:[2,18],42:[2,18],43:[2,18],44:[2,18],45:[2,18],46:[2,18],47:[2,18],48:[2,18],49:[2,18],50:[2,18],51:[2,18],52:[2,18],53:[2,18],54:[2,18],55:[2,18],56:[2,18],57:[2,18],58:[2,18],59:[2,18],60:[2,18],61:[2,18],62:[2,18],63:[2,18],64:[2,18],65:[2,18]},{6:[1,66]},{6:[1,67]},{6:[1,68]},{1:[2,22],6:[2,22],11:[2,22],14:[2,22],18:[2,22],19:[2,22],21:[2,22],23:[2,22],33:[2,22],34:[2,22],35:[2,22],36:[2,22],37:[2,22],38:[2,22],39:[2,22],40:[2,22],41:[2,22],42:[2,22],43:[2,22],44:[2,22],45:[2,22],46:[2,22],47:[2,22],48:[2,22],49:[2,22],50:[2,22],51:[2,22],52:[2,22],53:[2,22],54:[2,22],55:[2,22],56:[2,22],57:[2,22],58:[2,22],59:[2,22],60:[2,22],61:[2,22],62:[2,22],63:[2,22],64:[2,22],65:[2,22]},{6:[2,36],25:[2,36],27:[2,36],28:[2,36],30:[2,36],32:[2,36]},{6:[2,37],27:[2,37],28:[2,37]},{12:70,25:[1,63],29:69,30:[1,62],33:[1,21]},{25:[2,39],30:[2,39],33:[2,39]},{25:[2,40],30:[2,40],33:[2,40]},{25:[2,41],30:[2,41],33:[2,41]},{25:[2,42],30:[2,42],33:[2,42]},{25:[2,43],30:[2,43],33:[2,43]},{25:[2,44],30:[2,44],33:[2,44]},{25:[2,45],30:[2,45],33:[2,45]},{25:[2,46],30:[2,46],33:[2,46]},{25:[2,47],30:[2,47],33:[2,47]},{25:[2,48],30:[2,48],33:[2,48]},{25:[2,49],30:[2,49],33:[2,49]},{25:[2,50],30:[2,50],33:[2,50]},{25:[2,51],30:[2,51],33:[2,51]},{25:[2,52],30:[2,52],33:[2,52]},{25:[2,53],30:[2,53],33:[2,53]},{25:[2,54],30:[2,54],33:[2,54]},{25:[2,55],30:[2,55],33:[2,55]},{25:[2,56],30:[2,56],33:[2,56]},{25:[2,57],30:[2,57],33:[2,57]},{25:[2,58],30:[2,58],33:[2,58]},{25:[2,59],30:[2,59],33:[2,59]},{25:[2,60],30:[2,60],33:[2,60]},{25:[2,61],30:[2,61],33:[2,61]},{25:[2,62],30:[2,62],33:[2,62]},{25:[2,63],30:[2,63],33:[2,63]},{25:[2,64],30:[2,64],33:[2,64]},{25:[2,65],30:[2,65],33:[2,65]},{25:[2,66],30:[2,66],33:[2,66]},{25:[2,67],30:[2,67],33:[2,67]},{25:[2,68],30:[2,68],33:[2,68]},{25:[2,69],30:[2,69],33:[2,69]},{1:[2,5],6:[2,5],11:[2,5],14:[2,5],18:[2,5],19:[2,5],21:[2,5],23:[2,5],33:[2,5],34:[2,5],35:[2,5],36:[2,5],37:[2,5],38:[2,5],39:[2,5],40:[2,5],41:[2,5],42:[2,5],43:[2,5],44:[2,5],45:[2,5],46:[2,5],47:[2,5],48:[2,5],49:[2,5],50:[2,5],51:[2,5],52:[2,5],53:[2,5],54:[2,5],55:[2,5],56:[2,5],57:[2,5],58:[2,5],59:[2,5],60:[2,5],61:[2,5],62:[2,5],63:[2,5],64:[2,5],65:[2,5]},{1:[2,3]},{1:[2,8],6:[2,8],11:[2,8],14:[2,8],18:[2,8],19:[2,8],21:[2,8],23:[2,8],33:[2,8],34:[2,8],35:[2,8],36:[2,8],37:[2,8],38:[2,8],39:[2,8],40:[2,8],41:[2,8],42:[2,8],43:[2,8],44:[2,8],45:[2,8],46:[2,8],47:[2,8],48:[2,8],49:[2,8],50:[2,8],51:[2,8],52:[2,8],53:[2,8],54:[2,8],55:[2,8],56:[2,8],57:[2,8],58:[2,8],59:[2,8],60:[2,8],61:[2,8],62:[2,8],63:[2,8],64:[2,8],65:[2,8]},{6:[1,20],7:55,8:6,9:7,11:[1,71],12:8,13:9,14:[1,10],15:11,16:12,17:13,18:[1,14],19:[1,15],20:16,21:[1,17],22:18,23:[1,19],24:23,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{1:[2,6],6:[2,6],11:[2,6],14:[2,6],18:[2,6],19:[2,6],21:[2,6],23:[2,6],33:[2,6],34:[2,6],35:[2,6],36:[2,6],37:[2,6],38:[2,6],39:[2,6],40:[2,6],41:[2,6],42:[2,6],43:[2,6],44:[2,6],45:[2,6],46:[2,6],47:[2,6],48:[2,6],49:[2,6],50:[2,6],51:[2,6],52:[2,6],53:[2,6],54:[2,6],55:[2,6],56:[2,6],57:[2,6],58:[2,6],59:[2,6],60:[2,6],61:[2,6],62:[2,6],63:[2,6],64:[2,6],65:[2,6]},{8:72,12:8,13:9,14:[1,10],15:11,16:12,17:13,24:73,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{6:[2,34],27:[2,34],28:[2,34]},{8:76,12:8,13:9,14:[1,10],15:11,16:12,17:13,24:73,27:[1,75],31:74,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{8:76,12:8,13:9,14:[1,10],15:11,16:12,17:13,24:73,27:[1,78],31:77,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{1:[2,16],6:[2,16],11:[2,16],14:[2,16],18:[2,16],19:[2,16],21:[2,16],23:[2,16],33:[2,16],34:[2,16],35:[2,16],36:[2,16],37:[2,16],38:[2,16],39:[2,16],40:[2,16],41:[2,16],42:[2,16],43:[2,16],44:[2,16],45:[2,16],46:[2,16],47:[2,16],48:[2,16],49:[2,16],50:[2,16],51:[2,16],52:[2,16],53:[2,16],54:[2,16],55:[2,16],56:[2,16],57:[2,16],58:[2,16],59:[2,16],60:[2,16],61:[2,16],62:[2,16],63:[2,16],64:[2,16],65:[2,16]},{1:[2,17],6:[2,17],11:[2,17],14:[2,17],18:[2,17],19:[2,17],21:[2,17],23:[2,17],33:[2,17],34:[2,17],35:[2,17],36:[2,17],37:[2,17],38:[2,17],39:[2,17],40:[2,17],41:[2,17],42:[2,17],43:[2,17],44:[2,17],45:[2,17],46:[2,17],47:[2,17],48:[2,17],49:[2,17],50:[2,17],51:[2,17],52:[2,17],53:[2,17],54:[2,17],55:[2,17],56:[2,17],57:[2,17],58:[2,17],59:[2,17],60:[2,17],61:[2,17],62:[2,17],63:[2,17],64:[2,17],65:[2,17]},{1:[2,19],6:[2,19],11:[2,19],14:[2,19],18:[2,19],19:[2,19],21:[2,19],23:[2,19],33:[2,19],34:[2,19],35:[2,19],36:[2,19],37:[2,19],38:[2,19],39:[2,19],40:[2,19],41:[2,19],42:[2,19],43:[2,19],44:[2,19],45:[2,19],46:[2,19],47:[2,19],48:[2,19],49:[2,19],50:[2,19],51:[2,19],52:[2,19],53:[2,19],54:[2,19],55:[2,19],56:[2,19],57:[2,19],58:[2,19],59:[2,19],60:[2,19],61:[2,19],62:[2,19],63:[2,19],64:[2,19],65:[2,19]},{1:[2,20],6:[2,20],11:[2,20],14:[2,20],18:[2,20],19:[2,20],21:[2,20],23:[2,20],33:[2,20],34:[2,20],35:[2,20],36:[2,20],37:[2,20],38:[2,20],39:[2,20],40:[2,20],41:[2,20],42:[2,20],43:[2,20],44:[2,20],45:[2,20],46:[2,20],47:[2,20],48:[2,20],49:[2,20],50:[2,20],51:[2,20],52:[2,20],53:[2,20],54:[2,20],55:[2,20],56:[2,20],57:[2,20],58:[2,20],59:[2,20],60:[2,20],61:[2,20],62:[2,20],63:[2,20],64:[2,20],65:[2,20]},{1:[2,21],6:[2,21],11:[2,21],14:[2,21],18:[2,21],19:[2,21],21:[2,21],23:[2,21],33:[2,21],34:[2,21],35:[2,21],36:[2,21],37:[2,21],38:[2,21],39:[2,21],40:[2,21],41:[2,21],42:[2,21],43:[2,21],44:[2,21],45:[2,21],46:[2,21],47:[2,21],48:[2,21],49:[2,21],50:[2,21],51:[2,21],52:[2,21],53:[2,21],54:[2,21],55:[2,21],56:[2,21],57:[2,21],58:[2,21],59:[2,21],60:[2,21],61:[2,21],62:[2,21],63:[2,21],64:[2,21],65:[2,21]},{6:[2,38],27:[2,38],28:[2,38]},{6:[2,23],25:[1,79]},{1:[2,9],6:[2,9],11:[2,9],14:[2,9],18:[2,9],19:[2,9],21:[2,9],23:[2,9],33:[2,9],34:[2,9],35:[2,9],36:[2,9],37:[2,9],38:[2,9],39:[2,9],40:[2,9],41:[2,9],42:[2,9],43:[2,9],44:[2,9],45:[2,9],46:[2,9],47:[2,9],48:[2,9],49:[2,9],50:[2,9],51:[2,9],52:[2,9],53:[2,9],54:[2,9],55:[2,9],56:[2,9],57:[2,9],58:[2,9],59:[2,9],60:[2,9],61:[2,9],62:[2,9],63:[2,9],64:[2,9],65:[2,9]},{6:[2,35],27:[2,35],28:[2,35]},{25:[1,63],29:69,30:[1,62]},{27:[1,80],28:[1,81]},{6:[2,30],27:[2,30],28:[2,30]},{27:[2,32],28:[2,32]},{27:[1,82],28:[1,81]},{6:[2,31],27:[2,31],28:[2,31]},{24:85,26:83,27:[1,84],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{6:[2,28],27:[2,28],28:[2,28]},{8:86,12:8,13:9,14:[1,10],15:11,16:12,17:13,24:73,33:[1,21],34:[1,22],35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{6:[2,29],27:[2,29],28:[2,29]},{27:[1,87],28:[1,88]},{5:89,10:[1,5]},{12:90,33:[1,21]},{27:[2,33],28:[2,33]},{5:91,10:[1,5]},{24:92,35:[1,24],36:[1,25],37:[1,26],38:[1,27],39:[1,28],40:[1,29],41:[1,30],42:[1,31],43:[1,32],44:[1,33],45:[1,34],46:[1,35],47:[1,36],48:[1,37],49:[1,38],50:[1,39],51:[1,40],52:[1,41],53:[1,42],54:[1,43],55:[1,44],56:[1,45],57:[1,46],58:[1,47],59:[1,48],60:[1,49],61:[1,50],62:[1,51],63:[1,52],64:[1,53],65:[1,54]},{1:[2,25],6:[2,25],11:[2,25],14:[2,25],18:[2,25],19:[2,25],21:[2,25],23:[2,25],33:[2,25],34:[2,25],35:[2,25],36:[2,25],37:[2,25],38:[2,25],39:[2,25],40:[2,25],41:[2,25],42:[2,25],43:[2,25],44:[2,25],45:[2,25],46:[2,25],47:[2,25],48:[2,25],49:[2,25],50:[2,25],51:[2,25],52:[2,25],53:[2,25],54:[2,25],55:[2,25],56:[2,25],57:[2,25],58:[2,25],59:[2,25],60:[2,25],61:[2,25],62:[2,25],63:[2,25],64:[2,25],65:[2,25]},{27:[2,26],28:[2,26]},{1:[2,24],6:[2,24],11:[2,24],14:[2,24],18:[2,24],19:[2,24],21:[2,24],23:[2,24],33:[2,24],34:[2,24],35:[2,24],36:[2,24],37:[2,24],38:[2,24],39:[2,24],40:[2,24],41:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24],47:[2,24],48:[2,24],49:[2,24],50:[2,24],51:[2,24],52:[2,24],53:[2,24],54:[2,24],55:[2,24],56:[2,24],57:[2,24],58:[2,24],59:[2,24],60:[2,24],61:[2,24],62:[2,24],63:[2,24],64:[2,24],65:[2,24]},{12:93,33:[1,21]},{27:[2,27],28:[2,27]}],
defaultActions: {56:[2,3]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
undefined
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
;

      return exports;
    };
    _require["shader-script/glsl/program"] = function() {
      var exports = {};
      (function() {
  var Scope,
    __slice = Array.prototype.slice;

  Scope = require('shader-script/scope').Scope;

  exports.Program = (function() {
    var createClone;

    createClone = function(program, entry_point, omit) {
      var attribute, clone, func, name, uniform, variable, varying, _i, _j, _k, _l, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5;
      clone = new exports.Program(program.state);
      _ref = program.uniforms;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        uniform = _ref[_i];
        clone.uniforms.push(uniform);
      }
      _ref2 = program.attributes;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        attribute = _ref2[_j];
        clone.attributes.push(attribute);
      }
      _ref3 = program.varyings;
      for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
        varying = _ref3[_k];
        clone.varyings.push(varying);
      }
      _ref4 = program.variables;
      for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
        variable = _ref4[_l];
        clone.variables.push(variable);
      }
      _ref5 = program.functions;
      for (name in _ref5) {
        func = _ref5[name];
        if (name === omit) {
          continue;
        } else if (name === entry_point) {
          name = 'main';
        }
        clone.functions[name] = func;
      }
      return clone;
    };

    function Program(state) {
      var _base, _base2;
      this.state = state != null ? state : {};
      this.uniforms = [];
      this.attributes = [];
      this.varyings = [];
      this.variables = [];
      this.functions = {};
      (_base = this.state).variables || (_base.variables = {});
      (_base2 = this.state).scope || (_base2.scope = new Scope());
    }

    Program.prototype.toSource = function() {
      var attr, attributes, fn, functions, name, unif, uniforms, vari, variables, vary, varyings, _ref;
      uniforms = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.uniforms;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          unif = _ref[_i];
          _results.push("uniform   " + unif.type + " " + unif.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      attributes = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.attributes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attr = _ref[_i];
          _results.push("attribute " + attr.type + " " + attr.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      varyings = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.varyings;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          vary = _ref[_i];
          _results.push("varying   " + vary.type + " " + vary.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      variables = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.variables;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          vari = _ref[_i];
          _results.push("" + vari.type + " " + vari.name + ";");
        }
        return _results;
      }).call(this)).join("\n");
      functions = [];
      _ref = this.functions;
      for (name in _ref) {
        fn = _ref[name];
        functions.push(fn.toSource(name));
      }
      return [uniforms, attributes, varyings, variables, functions.join("\n\n")].join("\n\n").trim();
    };

    Program.prototype.toVertexProgram = function() {
      return createClone(this, 'vertex', 'fragment');
    };

    Program.prototype.toFragmentProgram = function() {
      return createClone(this, 'fragment', 'vertex');
    };

    Program.prototype.invoke = function() {
      var function_name, params, _ref;
      function_name = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this.functions[function_name]) {
        return (_ref = this.functions[function_name]).invoke.apply(_ref, params);
      } else {
        throw new Error("no " + function_name + " function found!");
      }
    };

    return Program;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/grammar"] = function() {
      var exports = {};
      (function() {
  var Parser, alt, alternatives, grammar, name, o, operators, token, tokens, unwrap;

  Parser = require('jison').Parser;

  unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

  o = function(patternString, action, options) {
    var match;
    patternString = patternString.replace(/\s{2,}/g, ' ');
    if (!action) return [patternString, '$$ = $1;', options];
    action = (match = unwrap.exec(action)) ? match[1] : "(" + action + "())";
    action = action.replace(/\bnew /g, '$&yy.');
    action = action.replace(/\b(?:Block\.wrap|extend)\b/g, 'yy.$&');
    return [patternString, "$$ = " + action + ";", options];
  };

  grammar = {
    Root: [
      o('', function() {
        return new Root(new Block);
      }), o('Body', function() {
        return new Root($1);
      }), o('Block TERMINATOR', function() {
        return new Root($1);
      })
    ],
    Body: [
      o('Line', function() {
        return Block.wrap([$1]);
      }), o('Body TERMINATOR Line', function() {
        return $1.push($3);
      }), o('Body TERMINATOR')
    ],
    Line: [o('Expression'), o('Statement')],
    Statement: [
      o('Return'), o('Comment'), o('STATEMENT', function() {
        return new Literal($1);
      })
    ],
    Expression: [o('Value'), o('Invocation'), o('Code'), o('Operation'), o('Assign'), o('If'), o('Try'), o('While'), o('For'), o('Switch'), o('Class'), o('Throw')],
    Block: [
      o('INDENT OUTDENT', function() {
        return new Block;
      }), o('INDENT Body OUTDENT', function() {
        return $2;
      })
    ],
    Identifier: [
      o('IDENTIFIER', function() {
        return new Identifier($1);
      })
    ],
    AlphaNumeric: [
      o('NUMBER', function() {
        return new Literal($1);
      }), o('STRING', function() {
        return new Literal($1);
      })
    ],
    Literal: [
      o('AlphaNumeric'), o('JS', function() {
        return new Literal($1);
      }), o('REGEX', function() {
        return new Literal($1);
      }), o('DEBUGGER', function() {
        return new Literal($1);
      }), o('BOOL', function() {
        var val;
        val = new Literal($1);
        if ($1 === 'undefined') val.isUndefined = true;
        return val;
      })
    ],
    Assign: [
      o('Assignable = Expression', function() {
        return new Assign($1, $3);
      }), o('Assignable = TERMINATOR Expression', function() {
        return new Assign($1, $4);
      }), o('Assignable = INDENT Expression OUTDENT', function() {
        return new Assign($1, $4);
      })
    ],
    AssignObj: [
      o('ObjAssignable', function() {
        return new Value($1);
      }), o('ObjAssignable : Expression', function() {
        return new Assign(new Value($1), $3, 'object');
      }), o('ObjAssignable :\
       INDENT Expression OUTDENT', function() {
        return new Assign(new Value($1), $4, 'object');
      }), o('Comment')
    ],
    ObjAssignable: [o('Identifier'), o('AlphaNumeric'), o('ThisProperty')],
    Return: [
      o('RETURN Expression', function() {
        return new Return($2);
      }), o('RETURN', function() {
        return new Return;
      })
    ],
    Comment: [
      o('HERECOMMENT', function() {
        return new Comment($1);
      })
    ],
    Code: [
      o('PARAM_START ParamList PARAM_END FuncGlyph Block', function() {
        return new Code($2, $5, $4);
      }), o('FuncGlyph Block', function() {
        return new Code([], $2, $1);
      })
    ],
    FuncGlyph: [
      o('->', function() {
        return 'func';
      }), o('=>', function() {
        return 'boundfunc';
      })
    ],
    OptComma: [o(''), o(',')],
    ParamList: [
      o('', function() {
        return [];
      }), o('Param', function() {
        return [$1];
      }), o('ParamList , Param', function() {
        return $1.concat($3);
      })
    ],
    Param: [
      o('ParamVar', function() {
        return new Param($1);
      }), o('ParamVar ...', function() {
        return new Param($1, null, true);
      }), o('ParamVar = Expression', function() {
        return new Param($1, $3);
      })
    ],
    ParamVar: [o('Identifier'), o('ThisProperty'), o('Array'), o('Object')],
    Splat: [
      o('Expression ...', function() {
        return new Splat($1);
      })
    ],
    SimpleAssignable: [
      o('Identifier', function() {
        return new Value($1);
      }), o('Value Accessor', function() {
        return $1.add($2);
      }), o('Invocation Accessor', function() {
        return new Value($1, [].concat($2));
      }), o('ThisProperty')
    ],
    Assignable: [
      o('SimpleAssignable'), o('Array', function() {
        return new Value($1);
      }), o('Object', function() {
        return new Value($1);
      })
    ],
    Value: [
      o('Assignable'), o('Literal', function() {
        return new Value($1);
      }), o('Parenthetical', function() {
        return new Value($1);
      }), o('Range', function() {
        return new Value($1);
      }), o('This')
    ],
    Accessor: [
      o('.  Identifier', function() {
        return new Access($2);
      }), o('?. Identifier', function() {
        return new Access($2, 'soak');
      }), o(':: Identifier', function() {
        return [new Access(new Literal('prototype')), new Access($2)];
      }), o('::', function() {
        return new Access(new Literal('prototype'));
      }), o('Index')
    ],
    Index: [
      o('INDEX_START IndexValue INDEX_END', function() {
        return $2;
      }), o('INDEX_SOAK  Index', function() {
        return extend($2, {
          soak: true
        });
      })
    ],
    IndexValue: [
      o('Expression', function() {
        return new Index($1);
      }), o('Slice', function() {
        return new Slice($1);
      })
    ],
    Object: [
      o('{ AssignList OptComma }', function() {
        return new Obj($2, $1.generated);
      })
    ],
    AssignList: [
      o('', function() {
        return [];
      }), o('AssignObj', function() {
        return [$1];
      }), o('AssignList , AssignObj', function() {
        return $1.concat($3);
      }), o('AssignList OptComma TERMINATOR AssignObj', function() {
        return $1.concat($4);
      }), o('AssignList OptComma INDENT AssignList OptComma OUTDENT', function() {
        return $1.concat($4);
      })
    ],
    Class: [
      o('CLASS', function() {
        return new Class;
      }), o('CLASS Block', function() {
        return new Class(null, null, $2);
      }), o('CLASS EXTENDS Expression', function() {
        return new Class(null, $3);
      }), o('CLASS EXTENDS Expression Block', function() {
        return new Class(null, $3, $4);
      }), o('CLASS SimpleAssignable', function() {
        return new Class($2);
      }), o('CLASS SimpleAssignable Block', function() {
        return new Class($2, null, $3);
      }), o('CLASS SimpleAssignable EXTENDS Expression', function() {
        return new Class($2, $4);
      }), o('CLASS SimpleAssignable EXTENDS Expression Block', function() {
        return new Class($2, $4, $5);
      })
    ],
    Invocation: [
      o('Value OptFuncExist Arguments', function() {
        return new Call($1, $3, $2);
      }), o('Invocation OptFuncExist Arguments', function() {
        return new Call($1, $3, $2);
      }), o('SUPER', function() {
        return new Call('super', [new Splat(new Literal('arguments'))]);
      }), o('SUPER Arguments', function() {
        return new Call('super', $2);
      })
    ],
    OptFuncExist: [
      o('', function() {
        return false;
      }), o('FUNC_EXIST', function() {
        return true;
      })
    ],
    Arguments: [
      o('CALL_START CALL_END', function() {
        return [];
      }), o('CALL_START ArgList OptComma CALL_END', function() {
        return $2;
      })
    ],
    This: [
      o('THIS', function() {
        return new Value(new Literal('this'));
      }), o('@', function() {
        return new Value(new Literal('this'));
      })
    ],
    ThisProperty: [
      o('@ Identifier', function() {
        return new Value(new Literal('this'), [new Access($2)], 'this');
      })
    ],
    Array: [
      o('[ ]', function() {
        return new Arr([]);
      }), o('[ ArgList OptComma ]', function() {
        return new Arr($2);
      })
    ],
    RangeDots: [
      o('..', function() {
        return 'inclusive';
      }), o('...', function() {
        return 'exclusive';
      })
    ],
    Range: [
      o('[ Expression RangeDots Expression ]', function() {
        return new Range($2, $4, $3);
      })
    ],
    Slice: [
      o('Expression RangeDots Expression', function() {
        return new Range($1, $3, $2);
      }), o('Expression RangeDots', function() {
        return new Range($1, null, $2);
      }), o('RangeDots Expression', function() {
        return new Range(null, $2, $1);
      }), o('RangeDots', function() {
        return new Range(null, null, $1);
      })
    ],
    ArgList: [
      o('Arg', function() {
        return [$1];
      }), o('ArgList , Arg', function() {
        return $1.concat($3);
      }), o('ArgList OptComma TERMINATOR Arg', function() {
        return $1.concat($4);
      }), o('INDENT ArgList OptComma OUTDENT', function() {
        return $2;
      }), o('ArgList OptComma INDENT ArgList OptComma OUTDENT', function() {
        return $1.concat($4);
      })
    ],
    Arg: [o('Expression'), o('Splat')],
    SimpleArgs: [
      o('Expression'), o('SimpleArgs , Expression', function() {
        return [].concat($1, $3);
      })
    ],
    Try: [
      o('TRY Block', function() {
        return new Try($2);
      }), o('TRY Block Catch', function() {
        return new Try($2, $3[0], $3[1]);
      }), o('TRY Block FINALLY Block', function() {
        return new Try($2, null, null, $4);
      }), o('TRY Block Catch FINALLY Block', function() {
        return new Try($2, $3[0], $3[1], $5);
      })
    ],
    Catch: [
      o('CATCH Identifier Block', function() {
        return [$2, $3];
      })
    ],
    Throw: [
      o('THROW Expression', function() {
        return new Throw($2);
      })
    ],
    Parenthetical: [
      o('( Body )', function() {
        return new Parens($2);
      }), o('( INDENT Body OUTDENT )', function() {
        return new Parens($3);
      })
    ],
    WhileSource: [
      o('WHILE Expression', function() {
        return new While($2);
      }), o('WHILE Expression WHEN Expression', function() {
        return new While($2, {
          guard: $4
        });
      }), o('UNTIL Expression', function() {
        return new While($2, {
          invert: true
        });
      }), o('UNTIL Expression WHEN Expression', function() {
        return new While($2, {
          invert: true,
          guard: $4
        });
      })
    ],
    While: [
      o('WhileSource Block', function() {
        return $1.addBody($2);
      }), o('Statement  WhileSource', function() {
        return $2.addBody(Block.wrap([$1]));
      }), o('Expression WhileSource', function() {
        return $2.addBody(Block.wrap([$1]));
      }), o('Loop', function() {
        return $1;
      })
    ],
    Loop: [
      o('LOOP Block', function() {
        return new While(new Literal('true')).addBody($2);
      }), o('LOOP Expression', function() {
        return new While(new Literal('true')).addBody(Block.wrap([$2]));
      })
    ],
    For: [
      o('Statement  ForBody', function() {
        return new For($1, $2);
      }), o('Expression ForBody', function() {
        return new For($1, $2);
      }), o('ForBody    Block', function() {
        return new For($2, $1);
      })
    ],
    ForBody: [
      o('FOR Range', function() {
        return {
          source: new Value($2)
        };
      }), o('ForStart ForSource', function() {
        $2.own = $1.own;
        $2.name = $1[0];
        $2.index = $1[1];
        return $2;
      })
    ],
    ForStart: [
      o('FOR ForVariables', function() {
        return $2;
      }), o('FOR OWN ForVariables', function() {
        $3.own = true;
        return $3;
      })
    ],
    ForValue: [
      o('Identifier'), o('Array', function() {
        return new Value($1);
      }), o('Object', function() {
        return new Value($1);
      })
    ],
    ForVariables: [
      o('ForValue', function() {
        return [$1];
      }), o('ForValue , ForValue', function() {
        return [$1, $3];
      })
    ],
    ForSource: [
      o('FORIN Expression', function() {
        return {
          source: $2
        };
      }), o('FOROF Expression', function() {
        return {
          source: $2,
          object: true
        };
      }), o('FORIN Expression WHEN Expression', function() {
        return {
          source: $2,
          guard: $4
        };
      }), o('FOROF Expression WHEN Expression', function() {
        return {
          source: $2,
          guard: $4,
          object: true
        };
      }), o('FORIN Expression BY Expression', function() {
        return {
          source: $2,
          step: $4
        };
      }), o('FORIN Expression WHEN Expression BY Expression', function() {
        return {
          source: $2,
          guard: $4,
          step: $6
        };
      }), o('FORIN Expression BY Expression WHEN Expression', function() {
        return {
          source: $2,
          step: $4,
          guard: $6
        };
      })
    ],
    Switch: [
      o('SWITCH Expression INDENT Whens OUTDENT', function() {
        return new Switch($2, $4);
      }), o('SWITCH Expression INDENT Whens ELSE Block OUTDENT', function() {
        return new Switch($2, $4, $6);
      }), o('SWITCH INDENT Whens OUTDENT', function() {
        return new Switch(null, $3);
      }), o('SWITCH INDENT Whens ELSE Block OUTDENT', function() {
        return new Switch(null, $3, $5);
      })
    ],
    Whens: [
      o('When'), o('Whens When', function() {
        return $1.concat($2);
      })
    ],
    When: [
      o('LEADING_WHEN SimpleArgs Block', function() {
        return [[$2, $3]];
      }), o('LEADING_WHEN SimpleArgs Block TERMINATOR', function() {
        return [[$2, $3]];
      })
    ],
    IfBlock: [
      o('IF Expression Block', function() {
        return new If($2, $3, {
          type: $1
        });
      }), o('IfBlock ELSE IF Expression Block', function() {
        return $1.addElse(new If($4, $5, {
          type: $3
        }));
      })
    ],
    If: [
      o('IfBlock'), o('IfBlock ELSE Block', function() {
        return $1.addElse($3);
      }), o('Statement  POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), {
          type: $2,
          statement: true
        });
      }), o('Expression POST_IF Expression', function() {
        return new If($3, Block.wrap([$1]), {
          type: $2,
          statement: true
        });
      })
    ],
    Operation: [
      o('UNARY Expression', function() {
        return new Op($1, $2);
      }), o('-     Expression', (function() {
        return new Op('-', $2);
      }), {
        prec: 'UNARY'
      }), o('+     Expression', (function() {
        return new Op('+', $2);
      }), {
        prec: 'UNARY'
      }), o('-- SimpleAssignable', function() {
        return new Op('--', $2);
      }), o('++ SimpleAssignable', function() {
        return new Op('++', $2);
      }), o('SimpleAssignable --', function() {
        return new Op('--', $1, null, true);
      }), o('SimpleAssignable ++', function() {
        return new Op('++', $1, null, true);
      }), o('Expression ?', function() {
        return new Existence($1);
      }), o('Expression +  Expression', function() {
        return new Op('+', $1, $3);
      }), o('Expression -  Expression', function() {
        return new Op('-', $1, $3);
      }), o('Expression MATH     Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression SHIFT    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression COMPARE  Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression LOGIC    Expression', function() {
        return new Op($2, $1, $3);
      }), o('Expression RELATION Expression', function() {
        if ($2.charAt(0) === '!') {
          return new Op($2.slice(1), $1, $3).invert();
        } else {
          return new Op($2, $1, $3);
        }
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       Expression', function() {
        return new Assign($1, $3, $2);
      }), o('SimpleAssignable COMPOUND_ASSIGN\
       INDENT Expression OUTDENT', function() {
        return new Assign($1, $4, $2);
      }), o('SimpleAssignable EXTENDS Expression', function() {
        return new Extends($1, $3);
      })
    ]
  };

  operators = [['left', '.', '?.', '::'], ['left', 'CALL_START', 'CALL_END'], ['nonassoc', '++', '--'], ['left', '?'], ['right', 'UNARY'], ['left', 'MATH'], ['left', '+', '-'], ['left', 'SHIFT'], ['left', 'RELATION'], ['left', 'COMPARE'], ['left', 'LOGIC'], ['nonassoc', 'INDENT', 'OUTDENT'], ['right', '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS'], ['right', 'FORIN', 'FOROF', 'BY', 'WHEN'], ['right', 'IF', 'ELSE', 'FOR', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS'], ['right', 'POST_IF']];

  tokens = [];

  for (name in grammar) {
    alternatives = grammar[name];
    grammar[name] = (function() {
      var _i, _j, _len, _len2, _ref, _results;
      _results = [];
      for (_i = 0, _len = alternatives.length; _i < _len; _i++) {
        alt = alternatives[_i];
        _ref = alt[0].split(' ');
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          token = _ref[_j];
          if (!grammar[token]) tokens.push(token);
        }
        if (name === 'Root') alt[1] = "return " + alt[1];
        _results.push(alt);
      }
      return _results;
    })();
  }

  exports.parser = new Parser({
    tokens: tokens.join(' '),
    bnf: grammar,
    operators: operators.reverse(),
    startSymbol: 'Root'
  });

}).call(this);

      return exports;
    };
    _require["shader-script/helpers"] = function() {
      var exports = {};
      (function() {
  var extend, flatten;

  exports.starts = function(string, literal, start) {
    return literal === string.substr(start, literal.length);
  };

  exports.ends = function(string, literal, back) {
    var len;
    len = literal.length;
    return literal === string.substr(string.length - len - (back || 0), len);
  };

  exports.compact = function(array) {
    var item, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      item = array[_i];
      if (item) _results.push(item);
    }
    return _results;
  };

  exports.count = function(string, substr) {
    var num, pos;
    num = pos = 0;
    if (!substr.length) return 1 / 0;
    while (pos = 1 + string.indexOf(substr, pos)) {
      num++;
    }
    return num;
  };

  exports.merge = function(options, overrides) {
    return extend(extend({}, options), overrides);
  };

  extend = exports.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };

  exports.flatten = flatten = function(array) {
    var element, flattened, _i, _len;
    flattened = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      element = array[_i];
      if (element instanceof Array) {
        flattened = flattened.concat(flatten(element));
      } else {
        flattened.push(element);
      }
    }
    return flattened;
  };

  exports.del = function(obj, key) {
    var val;
    val = obj[key];
    delete obj[key];
    return val;
  };

  exports.last = function(array, back) {
    return array[array.length - (back || 0) - 1];
  };

}).call(this);

      return exports;
    };
    _require["shader-script/lexer"] = function() {
      var exports = {};
      (function() {
  var BOOL, CALLABLE, CODE, COFFEE_ALIASES, COFFEE_ALIAS_MAP, COFFEE_KEYWORDS, COMMENT, COMPARE, COMPOUND_ASSIGN, HEREDOC, HEREDOC_ILLEGAL, HEREDOC_INDENT, HEREGEX, HEREGEX_OMIT, IDENTIFIER, INDEXABLE, INVERSES, JSTOKEN, JS_FORBIDDEN, JS_KEYWORDS, LINE_BREAK, LINE_CONTINUER, LOGIC, Lexer, MATH, MULTILINER, MULTI_DENT, NOT_REGEX, NOT_SPACED_REGEX, NUMBER, OPERATOR, REGEX, RELATION, RESERVED, Rewriter, SHIFT, SIMPLESTR, STRICT_PROSCRIBED, TRAILING_SPACES, UNARY, WHITESPACE, compact, count, key, last, starts, _ref, _ref2,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('shader-script/rewriter'), Rewriter = _ref.Rewriter, INVERSES = _ref.INVERSES;

  _ref2 = require('shader-script/helpers'), count = _ref2.count, starts = _ref2.starts, compact = _ref2.compact, last = _ref2.last;

  exports.Lexer = Lexer = (function() {

    function Lexer() {}

    Lexer.prototype.tokenize = function(code, opts) {
      var i, tag;
      if (opts == null) opts = {};
      if (WHITESPACE.test(code)) code = "\n" + code;
      code = code.replace(/\r/g, '').replace(TRAILING_SPACES, '');
      this.code = code;
      this.line = opts.line || 0;
      this.indent = 0;
      this.indebt = 0;
      this.outdebt = 0;
      this.indents = [];
      this.ends = [];
      this.tokens = [];
      i = 0;
      while (this.chunk = code.slice(i)) {
        i += this.identifierToken() || this.commentToken() || this.whitespaceToken() || this.lineToken() || this.heredocToken() || this.stringToken() || this.numberToken() || this.regexToken() || this.jsToken() || this.literalToken();
      }
      this.closeIndentation();
      if (tag = this.ends.pop()) this.error("missing " + tag);
      if (opts.rewrite === false) return this.tokens;
      return (new Rewriter).rewrite(this.tokens);
    };

    Lexer.prototype.identifierToken = function() {
      var colon, forcedIdentifier, id, input, match, prev, tag, _ref3, _ref4;
      if (!(match = IDENTIFIER.exec(this.chunk))) return 0;
      input = match[0], id = match[1], colon = match[2];
      if (id === 'own' && this.tag() === 'FOR') {
        this.token('OWN', id);
        return id.length;
      }
      forcedIdentifier = colon || (prev = last(this.tokens)) && (((_ref3 = prev[0]) === '.' || _ref3 === '?.' || _ref3 === '::') || !prev.spaced && prev[0] === '@');
      tag = 'IDENTIFIER';
      if (!forcedIdentifier && (__indexOf.call(JS_KEYWORDS, id) >= 0 || __indexOf.call(COFFEE_KEYWORDS, id) >= 0)) {
        tag = id.toUpperCase();
        if (tag === 'WHEN' && (_ref4 = this.tag(), __indexOf.call(LINE_BREAK, _ref4) >= 0)) {
          tag = 'LEADING_WHEN';
        } else if (tag === 'FOR') {
          this.seenFor = true;
        } else if (tag === 'UNLESS') {
          tag = 'IF';
        } else if (__indexOf.call(UNARY, tag) >= 0) {
          tag = 'UNARY';
        } else if (__indexOf.call(RELATION, tag) >= 0) {
          if (tag !== 'INSTANCEOF' && this.seenFor) {
            tag = 'FOR' + tag;
            this.seenFor = false;
          } else {
            tag = 'RELATION';
            if (this.value() === '!') {
              this.tokens.pop();
              id = '!' + id;
            }
          }
        }
      }
      if (__indexOf.call(JS_FORBIDDEN, id) >= 0) {
        if (forcedIdentifier) {
          tag = 'IDENTIFIER';
          id = new String(id);
          id.reserved = true;
        } else if (__indexOf.call(RESERVED, id) >= 0) {
          this.error("reserved word \"" + id + "\"");
        }
      }
      if (!forcedIdentifier) {
        if (__indexOf.call(COFFEE_ALIASES, id) >= 0) id = COFFEE_ALIAS_MAP[id];
        tag = (function() {
          switch (id) {
            case '!':
              return 'UNARY';
            case '==':
            case '!=':
              return 'COMPARE';
            case '&&':
            case '||':
              return 'LOGIC';
            case 'true':
            case 'false':
            case 'null':
            case 'undefined':
              return 'BOOL';
            case 'break':
            case 'continue':
              return 'STATEMENT';
            default:
              return tag;
          }
        })();
      }
      this.token(tag, id);
      if (colon) this.token(':', ':');
      return input.length;
    };

    Lexer.prototype.numberToken = function() {
      var binaryLiteral, lexedLength, match, number, octalLiteral;
      if (!(match = NUMBER.exec(this.chunk))) return 0;
      number = match[0];
      if (/E/.test(number)) {
        this.error("exponential notation '" + number + "' must be indicated with a lowercase 'e'");
      } else if (/[BOX]/.test(number)) {
        this.error("radix prefixes must be lowercase '" + number + "'");
      } else if (/^0[89]/.test(number)) {
        this.error("decimal literals '" + number + "' must not be prefixed with '0'");
      } else if (/^0[0-7]/.test(number)) {
        this.error("octal literals '" + number + "' must be prefixed with '0o'");
      }
      lexedLength = number.length;
      if (octalLiteral = /0o([0-7]+)/.exec(number)) {
        number = (parseInt(octalLiteral[1], 8)).toString();
      }
      if (binaryLiteral = /0b([01]+)/.exec(number)) {
        number = (parseInt(binaryLiteral[1], 2)).toString();
      }
      this.token('NUMBER', number);
      return lexedLength;
    };

    Lexer.prototype.stringToken = function() {
      var match, octalEsc, string;
      switch (this.chunk.charAt(0)) {
        case "'":
          if (!(match = SIMPLESTR.exec(this.chunk))) return 0;
          this.token('STRING', (string = match[0]).replace(MULTILINER, '\\\n'));
          break;
        case '"':
          if (!(string = this.balancedString(this.chunk, '"'))) return 0;
          if (0 < string.indexOf('#{', 1)) {
            this.interpolateString(string.slice(1, -1));
          } else {
            this.token('STRING', this.escapeLines(string));
          }
          break;
        default:
          return 0;
      }
      if (octalEsc = /^(?:\\.|[^\\])*\\[0-7]/.test(string)) {
        this.error("octal escape sequences " + string + " are not allowed");
      }
      this.line += count(string, '\n');
      return string.length;
    };

    Lexer.prototype.heredocToken = function() {
      var doc, heredoc, match, quote;
      if (!(match = HEREDOC.exec(this.chunk))) return 0;
      heredoc = match[0];
      quote = heredoc.charAt(0);
      doc = this.sanitizeHeredoc(match[2], {
        quote: quote,
        indent: null
      });
      if (quote === '"' && 0 <= doc.indexOf('#{')) {
        this.interpolateString(doc, {
          heredoc: true
        });
      } else {
        this.token('STRING', this.makeString(doc, quote, true));
      }
      this.line += count(heredoc, '\n');
      return heredoc.length;
    };

    Lexer.prototype.commentToken = function() {
      var comment, here, match;
      if (!(match = this.chunk.match(COMMENT))) return 0;
      comment = match[0], here = match[1];
      if (here) {
        this.token('HERECOMMENT', this.sanitizeHeredoc(here, {
          herecomment: true,
          indent: Array(this.indent + 1).join(' ')
        }));
      }
      this.line += count(comment, '\n');
      return comment.length;
    };

    Lexer.prototype.jsToken = function() {
      var match, script;
      if (!(this.chunk.charAt(0) === '`' && (match = JSTOKEN.exec(this.chunk)))) {
        return 0;
      }
      this.token('JS', (script = match[0]).slice(1, -1));
      return script.length;
    };

    Lexer.prototype.regexToken = function() {
      var flags, length, match, prev, regex, _ref3, _ref4;
      if (this.chunk.charAt(0) !== '/') return 0;
      if (match = HEREGEX.exec(this.chunk)) {
        length = this.heregexToken(match);
        this.line += count(match[0], '\n');
        return length;
      }
      prev = last(this.tokens);
      if (prev && (_ref3 = prev[0], __indexOf.call((prev.spaced ? NOT_REGEX : NOT_SPACED_REGEX), _ref3) >= 0)) {
        return 0;
      }
      if (!(match = REGEX.exec(this.chunk))) return 0;
      _ref4 = match, match = _ref4[0], regex = _ref4[1], flags = _ref4[2];
      if (regex.slice(0, 2) === '/*') {
        this.error('regular expressions cannot begin with `*`');
      }
      if (regex === '//') regex = '/(?:)/';
      this.token('REGEX', "" + regex + flags);
      return match.length;
    };

    Lexer.prototype.heregexToken = function(match) {
      var body, flags, heregex, re, tag, tokens, value, _i, _len, _ref3, _ref4, _ref5, _ref6;
      heregex = match[0], body = match[1], flags = match[2];
      if (0 > body.indexOf('#{')) {
        re = body.replace(HEREGEX_OMIT, '').replace(/\//g, '\\/');
        if (re.match(/^\*/)) {
          this.error('regular expressions cannot begin with `*`');
        }
        this.token('REGEX', "/" + (re || '(?:)') + "/" + flags);
        return heregex.length;
      }
      this.token('IDENTIFIER', 'RegExp');
      this.tokens.push(['CALL_START', '(']);
      tokens = [];
      _ref3 = this.interpolateString(body, {
        regex: true
      });
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], tag = _ref4[0], value = _ref4[1];
        if (tag === 'TOKENS') {
          tokens.push.apply(tokens, value);
        } else {
          if (!(value = value.replace(HEREGEX_OMIT, ''))) continue;
          value = value.replace(/\\/g, '\\\\');
          tokens.push(['STRING', this.makeString(value, '"', true)]);
        }
        tokens.push(['+', '+']);
      }
      tokens.pop();
      if (((_ref5 = tokens[0]) != null ? _ref5[0] : void 0) !== 'STRING') {
        this.tokens.push(['STRING', '""'], ['+', '+']);
      }
      (_ref6 = this.tokens).push.apply(_ref6, tokens);
      if (flags) this.tokens.push([',', ','], ['STRING', '"' + flags + '"']);
      this.token(')', ')');
      return heregex.length;
    };

    Lexer.prototype.lineToken = function() {
      var diff, indent, match, noNewlines, prev, size;
      if (!(match = MULTI_DENT.exec(this.chunk))) return 0;
      indent = match[0];
      this.line += count(indent, '\n');
      this.seenFor = false;
      prev = last(this.tokens, 1);
      size = indent.length - 1 - indent.lastIndexOf('\n');
      noNewlines = this.unfinished();
      if (size - this.indebt === this.indent) {
        if (noNewlines) {
          this.suppressNewlines();
        } else {
          this.newlineToken();
        }
        return indent.length;
      }
      if (size > this.indent) {
        if (noNewlines) {
          this.indebt = size - this.indent;
          this.suppressNewlines();
          return indent.length;
        }
        diff = size - this.indent + this.outdebt;
        this.token('INDENT', diff);
        this.indents.push(diff);
        this.ends.push('OUTDENT');
        this.outdebt = this.indebt = 0;
      } else {
        this.indebt = 0;
        this.outdentToken(this.indent - size, noNewlines);
      }
      this.indent = size;
      return indent.length;
    };

    Lexer.prototype.outdentToken = function(moveOut, noNewlines) {
      var dent, len;
      while (moveOut > 0) {
        len = this.indents.length - 1;
        if (this.indents[len] === void 0) {
          moveOut = 0;
        } else if (this.indents[len] === this.outdebt) {
          moveOut -= this.outdebt;
          this.outdebt = 0;
        } else if (this.indents[len] < this.outdebt) {
          this.outdebt -= this.indents[len];
          moveOut -= this.indents[len];
        } else {
          dent = this.indents.pop() - this.outdebt;
          moveOut -= dent;
          this.outdebt = 0;
          this.pair('OUTDENT');
          this.token('OUTDENT', dent);
        }
      }
      if (dent) this.outdebt -= moveOut;
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (!(this.tag() === 'TERMINATOR' || noNewlines)) {
        this.token('TERMINATOR', '\n');
      }
      return this;
    };

    Lexer.prototype.whitespaceToken = function() {
      var match, nline, prev;
      if (!((match = WHITESPACE.exec(this.chunk)) || (nline = this.chunk.charAt(0) === '\n'))) {
        return 0;
      }
      prev = last(this.tokens);
      if (prev) prev[match ? 'spaced' : 'newLine'] = true;
      if (match) {
        return match[0].length;
      } else {
        return 0;
      }
    };

    Lexer.prototype.newlineToken = function() {
      while (this.value() === ';') {
        this.tokens.pop();
      }
      if (this.tag() !== 'TERMINATOR') this.token('TERMINATOR', '\n');
      return this;
    };

    Lexer.prototype.suppressNewlines = function() {
      if (this.value() === '\\') this.tokens.pop();
      return this;
    };

    Lexer.prototype.literalToken = function() {
      var match, prev, tag, value, _ref3, _ref4, _ref5, _ref6;
      if (match = OPERATOR.exec(this.chunk)) {
        value = match[0];
        if (CODE.test(value)) this.tagParameters();
      } else {
        value = this.chunk.charAt(0);
      }
      tag = value;
      prev = last(this.tokens);
      if (value === '=' && prev) {
        if (!prev[1].reserved && (_ref3 = prev[1], __indexOf.call(JS_FORBIDDEN, _ref3) >= 0)) {
          this.error("reserved word \"" + (this.value()) + "\" can't be assigned");
        }
        if ((_ref4 = prev[1]) === '||' || _ref4 === '&&') {
          prev[0] = 'COMPOUND_ASSIGN';
          prev[1] += '=';
          return value.length;
        }
      }
      if (value === ';') {
        this.seenFor = false;
        tag = 'TERMINATOR';
      } else if (__indexOf.call(MATH, value) >= 0) {
        tag = 'MATH';
      } else if (__indexOf.call(COMPARE, value) >= 0) {
        tag = 'COMPARE';
      } else if (__indexOf.call(COMPOUND_ASSIGN, value) >= 0) {
        tag = 'COMPOUND_ASSIGN';
      } else if (__indexOf.call(UNARY, value) >= 0) {
        tag = 'UNARY';
      } else if (__indexOf.call(SHIFT, value) >= 0) {
        tag = 'SHIFT';
      } else if (__indexOf.call(LOGIC, value) >= 0 || value === '?' && (prev != null ? prev.spaced : void 0)) {
        tag = 'LOGIC';
      } else if (prev && !prev.spaced) {
        if (value === '(' && (_ref5 = prev[0], __indexOf.call(CALLABLE, _ref5) >= 0)) {
          if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
          tag = 'CALL_START';
        } else if (value === '[' && (_ref6 = prev[0], __indexOf.call(INDEXABLE, _ref6) >= 0)) {
          tag = 'INDEX_START';
          switch (prev[0]) {
            case '?':
              prev[0] = 'INDEX_SOAK';
          }
        }
      }
      switch (value) {
        case '(':
        case '{':
        case '[':
          this.ends.push(INVERSES[value]);
          break;
        case ')':
        case '}':
        case ']':
          this.pair(value);
      }
      this.token(tag, value);
      return value.length;
    };

    Lexer.prototype.sanitizeHeredoc = function(doc, options) {
      var attempt, herecomment, indent, match, _ref3;
      indent = options.indent, herecomment = options.herecomment;
      if (herecomment) {
        if (HEREDOC_ILLEGAL.test(doc)) {
          this.error("block comment cannot contain \"*/\", starting");
        }
        if (doc.indexOf('\n') <= 0) return doc;
      } else {
        while (match = HEREDOC_INDENT.exec(doc)) {
          attempt = match[1];
          if (indent === null || (0 < (_ref3 = attempt.length) && _ref3 < indent.length)) {
            indent = attempt;
          }
        }
      }
      if (indent) doc = doc.replace(RegExp("\\n" + indent, "g"), '\n');
      if (!herecomment) doc = doc.replace(/^\n/, '');
      return doc;
    };

    Lexer.prototype.tagParameters = function() {
      var i, stack, tok, tokens;
      if (this.tag() !== ')') return this;
      stack = [];
      tokens = this.tokens;
      i = tokens.length;
      tokens[--i][0] = 'PARAM_END';
      while (tok = tokens[--i]) {
        switch (tok[0]) {
          case ')':
            stack.push(tok);
            break;
          case '(':
          case 'CALL_START':
            if (stack.length) {
              stack.pop();
            } else if (tok[0] === '(') {
              tok[0] = 'PARAM_START';
              return this;
            } else {
              return this;
            }
        }
      }
      return this;
    };

    Lexer.prototype.closeIndentation = function() {
      return this.outdentToken(this.indent);
    };

    Lexer.prototype.balancedString = function(str, end) {
      var continueCount, i, letter, match, prev, stack, _ref3;
      continueCount = 0;
      stack = [end];
      for (i = 1, _ref3 = str.length; 1 <= _ref3 ? i < _ref3 : i > _ref3; 1 <= _ref3 ? i++ : i--) {
        if (continueCount) {
          --continueCount;
          continue;
        }
        switch (letter = str.charAt(i)) {
          case '\\':
            ++continueCount;
            continue;
          case end:
            stack.pop();
            if (!stack.length) return str.slice(0, i + 1 || 9e9);
            end = stack[stack.length - 1];
            continue;
        }
        if (end === '}' && (letter === '"' || letter === "'")) {
          stack.push(end = letter);
        } else if (end === '}' && letter === '/' && (match = HEREGEX.exec(str.slice(i)) || REGEX.exec(str.slice(i)))) {
          continueCount += match[0].length - 1;
        } else if (end === '}' && letter === '{') {
          stack.push(end = '}');
        } else if (end === '"' && prev === '#' && letter === '{') {
          stack.push(end = '}');
        }
        prev = letter;
      }
      return this.error("missing " + (stack.pop()) + ", starting");
    };

    Lexer.prototype.interpolateString = function(str, options) {
      var expr, heredoc, i, inner, interpolated, len, letter, nested, pi, regex, tag, tokens, value, _len, _ref3, _ref4, _ref5;
      if (options == null) options = {};
      heredoc = options.heredoc, regex = options.regex;
      tokens = [];
      pi = 0;
      i = -1;
      while (letter = str.charAt(i += 1)) {
        if (letter === '\\') {
          i += 1;
          continue;
        }
        if (!(letter === '#' && str.charAt(i + 1) === '{' && (expr = this.balancedString(str.slice(i + 1), '}')))) {
          continue;
        }
        if (pi < i) tokens.push(['NEOSTRING', str.slice(pi, i)]);
        inner = expr.slice(1, -1);
        if (inner.length) {
          nested = new Lexer().tokenize(inner, {
            line: this.line,
            rewrite: false
          });
          nested.pop();
          if (((_ref3 = nested[0]) != null ? _ref3[0] : void 0) === 'TERMINATOR') {
            nested.shift();
          }
          if (len = nested.length) {
            if (len > 1) {
              nested.unshift(['(', '(', this.line]);
              nested.push([')', ')', this.line]);
            }
            tokens.push(['TOKENS', nested]);
          }
        }
        i += expr.length;
        pi = i + 1;
      }
      if ((i > pi && pi < str.length)) tokens.push(['NEOSTRING', str.slice(pi)]);
      if (regex) return tokens;
      if (!tokens.length) return this.token('STRING', '""');
      if (tokens[0][0] !== 'NEOSTRING') tokens.unshift(['', '']);
      if (interpolated = tokens.length > 1) this.token('(', '(');
      for (i = 0, _len = tokens.length; i < _len; i++) {
        _ref4 = tokens[i], tag = _ref4[0], value = _ref4[1];
        if (i) this.token('+', '+');
        if (tag === 'TOKENS') {
          (_ref5 = this.tokens).push.apply(_ref5, value);
        } else {
          this.token('STRING', this.makeString(value, '"', heredoc));
        }
      }
      if (interpolated) this.token(')', ')');
      return tokens;
    };

    Lexer.prototype.pair = function(tag) {
      var size, wanted;
      if (tag !== (wanted = last(this.ends))) {
        if ('OUTDENT' !== wanted) this.error("unmatched " + tag);
        this.indent -= size = last(this.indents);
        this.outdentToken(size, true);
        return this.pair(tag);
      }
      return this.ends.pop();
    };

    Lexer.prototype.token = function(tag, value) {
      return this.tokens.push([tag, value, this.line]);
    };

    Lexer.prototype.tag = function(index, tag) {
      var tok;
      return (tok = last(this.tokens, index)) && (tag ? tok[0] = tag : tok[0]);
    };

    Lexer.prototype.value = function(index, val) {
      var tok;
      return (tok = last(this.tokens, index)) && (val ? tok[1] = val : tok[1]);
    };

    Lexer.prototype.unfinished = function() {
      var _ref3;
      return LINE_CONTINUER.test(this.chunk) || ((_ref3 = this.tag()) === '\\' || _ref3 === '.' || _ref3 === '?.' || _ref3 === 'UNARY' || _ref3 === 'MATH' || _ref3 === '+' || _ref3 === '-' || _ref3 === 'SHIFT' || _ref3 === 'RELATION' || _ref3 === 'COMPARE' || _ref3 === 'LOGIC' || _ref3 === 'THROW' || _ref3 === 'EXTENDS');
    };

    Lexer.prototype.escapeLines = function(str, heredoc) {
      return str.replace(MULTILINER, heredoc ? '\\n' : '');
    };

    Lexer.prototype.makeString = function(body, quote, heredoc) {
      if (!body) return quote + quote;
      body = body.replace(/\\([\s\S])/g, function(match, contents) {
        if (contents === '\n' || contents === quote) {
          return contents;
        } else {
          return match;
        }
      });
      body = body.replace(RegExp("" + quote, "g"), '\\$&');
      return quote + this.escapeLines(body, heredoc) + quote;
    };

    Lexer.prototype.error = function(message) {
      throw SyntaxError("" + message + " on line " + (this.line + 1));
    };

    return Lexer;

  })();

  JS_KEYWORDS = ['true', 'false', 'null', 'this', 'new', 'delete', 'typeof', 'in', 'instanceof', 'return', 'throw', 'break', 'continue', 'debugger', 'if', 'else', 'switch', 'for', 'while', 'do', 'try', 'catch', 'finally', 'class', 'extends', 'super'];

  COFFEE_KEYWORDS = ['undefined', 'then', 'unless', 'until', 'loop', 'of', 'by', 'when'];

  COFFEE_ALIAS_MAP = {
    and: '&&',
    or: '||',
    is: '==',
    isnt: '!=',
    not: '!',
    yes: 'true',
    no: 'false',
    on: 'true',
    off: 'false'
  };

  COFFEE_ALIASES = (function() {
    var _results;
    _results = [];
    for (key in COFFEE_ALIAS_MAP) {
      _results.push(key);
    }
    return _results;
  })();

  COFFEE_KEYWORDS = COFFEE_KEYWORDS.concat(COFFEE_ALIASES);

  RESERVED = ['case', 'default', 'function', 'var', 'void', 'with', 'const', 'let', 'enum', 'export', 'import', 'native', '__hasProp', '__extends', '__slice', '__bind', '__indexOf', 'implements', 'interface', 'let', 'package', 'private', 'protected', 'public', 'static', 'yield'];

  STRICT_PROSCRIBED = ['arguments', 'eval'];

  JS_FORBIDDEN = JS_KEYWORDS.concat(RESERVED).concat(STRICT_PROSCRIBED);

  exports.RESERVED = RESERVED.concat(JS_KEYWORDS).concat(COFFEE_KEYWORDS).concat(STRICT_PROSCRIBED);

  exports.STRICT_PROSCRIBED = STRICT_PROSCRIBED;

  IDENTIFIER = /^([$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)([^\n\S]*:(?!:))?/;

  NUMBER = /^0b[01]+|^0o[0-7]+|^0x[\da-f]+|^\d*\.?\d+(?:e[+-]?\d+)?/i;

  HEREDOC = /^("""|''')([\s\S]*?)(?:\n[^\n\S]*)?\1/;

  OPERATOR = /^(?:[-=]>|[-+*\/%<>&|^!?=]=|>>>=?|([-+:])\1|([&|<>])\2=?|\?\.|\.{2,3})/;

  WHITESPACE = /^[^\n\S]+/;

  COMMENT = /^###([^#][\s\S]*?)(?:###[^\n\S]*|(?:###)?$)|^(?:\s*#(?!##[^#]).*)+/;

  CODE = /^[-=]>/;

  MULTI_DENT = /^(?:\n[^\n\S]*)+/;

  SIMPLESTR = /^'[^\\']*(?:\\.[^\\']*)*'/;

  JSTOKEN = /^`[^\\`]*(?:\\.[^\\`]*)*`/;

  REGEX = /^(\/(?![\s=])[^[\/\n\\]*(?:(?:\\[\s\S]|\[[^\]\n\\]*(?:\\[\s\S][^\]\n\\]*)*])[^[\/\n\\]*)*\/)([imgy]{0,4})(?!\w)/;

  HEREGEX = /^\/{3}([\s\S]+?)\/{3}([imgy]{0,4})(?!\w)/;

  HEREGEX_OMIT = /\s+(?:#.*)?/g;

  MULTILINER = /\n/g;

  HEREDOC_INDENT = /\n+([^\n\S]*)/g;

  HEREDOC_ILLEGAL = /\*\//;

  LINE_CONTINUER = /^\s*(?:,|\??\.(?![.\d])|::)/;

  TRAILING_SPACES = /\s+$/;

  COMPOUND_ASSIGN = ['-=', '+=', '/=', '*=', '%=', '||=', '&&=', '?=', '<<=', '>>=', '>>>=', '&=', '^=', '|='];

  UNARY = ['!', '~', 'NEW', 'TYPEOF', 'DELETE', 'DO'];

  LOGIC = ['&&', '||', '&', '|', '^'];

  SHIFT = ['<<', '>>', '>>>'];

  COMPARE = ['==', '!=', '<', '>', '<=', '>='];

  MATH = ['*', '/', '%'];

  RELATION = ['IN', 'OF', 'INSTANCEOF'];

  BOOL = ['TRUE', 'FALSE', 'NULL', 'UNDEFINED'];

  NOT_REGEX = ['NUMBER', 'REGEX', 'BOOL', '++', '--', ']'];

  NOT_SPACED_REGEX = NOT_REGEX.concat(')', '}', 'THIS', 'IDENTIFIER', 'STRING');

  CALLABLE = ['IDENTIFIER', 'STRING', 'REGEX', ')', ']', '}', '?', '::', '@', 'THIS', 'SUPER'];

  INDEXABLE = CALLABLE.concat('NUMBER', 'BOOL');

  LINE_BREAK = ['INDENT', 'OUTDENT', 'TERMINATOR'];

}).call(this);

      return exports;
    };
    _require["shader-script/name_registry"] = function() {
      var exports = {};
      (function() {
  var __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  exports.NameRegistry = (function() {
    var mangle;

    mangle = function(name, entries) {
      var counter, mangled_name;
      counter = 0;
      mangled_name = name;
      while (__indexOf.call(entries, mangled_name) >= 0) {
        mangled_name = name + counter++;
      }
      return mangled_name;
    };

    function NameRegistry() {
      this.entries = {};
    }

    NameRegistry.prototype.entries_for = function(name) {
      var _base;
      return (_base = this.entries)[name] || (_base[name] = []);
    };

    NameRegistry.prototype.define = function(name) {
      var entries;
      entries = this.entries_for(name);
      entries.push(mangle(name, entries));
      return entries[entries.length - 1];
    };

    return NameRegistry;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/nodes"] = function() {
      var exports = {};
      (function() {
  var node_file, node_name, nodes;

  nodes = {
    Root: 'root',
    Block: 'block',
    Literal: 'literal',
    Value: 'value',
    Call: 'call',
    Identifier: 'identifier',
    Assign: 'assign',
    Function: 'function',
    Code: 'function',
    Arr: 'arr',
    Param: 'param'
  };

  for (node_name in nodes) {
    node_file = nodes[node_name];
    exports[node_name] = require("shader-script/nodes/" + node_file)[node_name];
  }

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/arr"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Arr = (function(_super) {

    __extends(Arr, _super);

    function Arr() {
      Arr.__super__.constructor.apply(this, arguments);
    }

    Arr.prototype.name = "arr";

    Arr.prototype.children = function() {
      return ['elements'];
    };

    Arr.prototype.type = function() {
      return 'vec' + this.elements.length.toString();
    };

    Arr.prototype.compile = function(shader) {
      var child;
      return this.glsl('TypeConstructor', this.type(), (function() {
        var _i, _len, _ref, _results;
        _ref = this.elements;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          _results.push(child.compile(shader));
        }
        return _results;
      }).call(this));
    };

    return Arr;

  })(require("shader-script/nodes/base").Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/assign"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Assign = (function(_super) {

    __extends(Assign, _super);

    function Assign() {
      Assign.__super__.constructor.apply(this, arguments);
    }

    Assign.prototype.name = "assign";

    Assign.prototype.type = function(shader) {
      return this.right.type(shader);
    };

    Assign.prototype.compile = function(shader) {
      var Function, dependent, left, right;
      Function = require('shader-script/nodes').Function;
      if (this.right instanceof Function) {
        this.right.func_name = this.left;
        return this.right.compile(shader);
      } else {
        left = this.left.compile(shader);
        right = this.right.compile(shader);
        if (!left.toVariableName) {
          throw new Error("Can't use " + (JSON.stringify(left)) + " as lvalue");
        }
        if (this.right.variable) dependent = this.right.variable(shader);
        shader.scope.define(left.toVariableName(), {
          type: this.right.type(shader),
          dependent: dependent
        });
        return this.glsl('Assign', left, right);
      }
    };

    return Assign;

  })(require("shader-script/glsl/nodes/assign").Assign);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/base"] = function() {
      var exports = {};
      (function() {
  var Base,
    __slice = Array.prototype.slice;

  exports.Base = Base = (function() {
    var glsl_nodes, required_methods;

    glsl_nodes = null;

    required_methods = ['name', 'compile'];

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

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/block"] = function() {
      var exports = {};
      (function() {
  var Block,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Block = Block = (function(_super) {

    __extends(Block, _super);

    Block.prototype.name = "block";

    function Block(lines) {
      if (lines == null) lines = [];
      Block.__super__.constructor.call(this, lines);
    }

    Block.prototype.compile = function(shader) {
      var compiled_lines, line, name, options, _ref;
      shader.scope.push(this.name);
      compiled_lines = (function() {
        var _i, _len, _ref, _results;
        _ref = this.lines;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          line = _ref[_i];
          _results.push(line.compile(shader));
        }
        return _results;
      }).call(this);
      _ref = shader.scope.delegate(function() {
        return this.definitions;
      });
      for (name in _ref) {
        options = _ref[name];
        compiled_lines.unshift(this.glsl('Variable', options.type(), this.glsl('Identifier', options.name), options.qualified_name));
      }
      shader.scope.pop();
      return this.glsl('Block', compiled_lines);
    };

    Block.wrap = function(lines) {
      if (lines.length === 1 && lines[0] instanceof Block) return lines[0];
      return new exports.Block(lines);
    };

    return Block;

  })(require('shader-script/glsl/nodes/block').Block);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/call"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Call = (function(_super) {

    __extends(Call, _super);

    function Call() {
      Call.__super__.constructor.apply(this, arguments);
    }

    Call.prototype.name = "call";

    Call.prototype.children = function() {
      return ['method_name', 'params'];
    };

    Call.prototype.compile = function(shader) {
      var compiled_params, method_name, param, types, _i, _len, _ref;
      method_name = this.method_name.compile(shader);
      compiled_params = [];
      types = [];
      _ref = this.params;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        param = _ref[_i];
        compiled_params.push(param.compile(shader));
        types.push(param.type());
      }
      shader.mark_function(this.method_name.toVariableName(), types);
      return this.glsl('Call', method_name, compiled_params);
    };

    return Call;

  })(require("shader-script/nodes/base").Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/function"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Code = exports.Function = (function(_super) {

    __extends(Function, _super);

    function Function() {
      Function.__super__.constructor.apply(this, arguments);
    }

    Function.prototype.name = 'function';

    Function.prototype.children = function() {
      return ['params', 'body'];
    };

    Function.prototype.compile = function(shader) {
      var compiled_body, compiled_func_name, compiled_params, param, return_type, str_func_name;
      if (!this.func_name) {
        throw new Error("GLSL doesn't support anonymous functions");
      }
      return_type = 'void';
      compiled_func_name = this.func_name.compile(shader);
      str_func_name = this.func_name.toVariableName();
      shader.scope.push(str_func_name);
      compiled_params = (function() {
        var _i, _len, _ref, _results;
        _ref = this.params;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          param = _ref[_i];
          _results.push(param.compile(shader));
        }
        return _results;
      }).call(this);
      compiled_body = this.body.compile(shader);
      shader.define_function(str_func_name, function(types) {
        var i, type, variable, _ref, _results;
        if (types.length !== compiled_params.length) {
          throw new Error("Function " + str_func_name + " called with incorrect argument count (" + types.length + " for " + compiled_params.length + ")");
        }
        _results = [];
        for (i = 0, _ref = types.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          type = types[i];
          variable = compiled_params[i].variable;
          _results.push(variable.set_type(type));
        }
        return _results;
      });
      shader.scope.pop();
      return this.glsl('Function', return_type, compiled_func_name, compiled_params, compiled_body);
    };

    return Function;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/identifier"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Identifier = (function(_super) {

    __extends(Identifier, _super);

    function Identifier() {
      Identifier.__super__.constructor.apply(this, arguments);
    }

    Identifier.prototype.name = "identifier";

    Identifier.prototype.variable = function(shader) {
      return shader.scope.lookup(this.toVariableName());
    };

    Identifier.prototype.type = function(shader) {
      return this.variable(shader).type();
    };

    Identifier.prototype.compile = function() {
      return this.glsl.apply(this, ['Identifier'].concat(__slice.call(this.children)));
    };

    return Identifier;

  })(require("shader-script/glsl/nodes/identifier").Identifier);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/literal"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  exports.Literal = (function(_super) {

    __extends(Literal, _super);

    function Literal() {
      Literal.__super__.constructor.apply(this, arguments);
    }

    Literal.prototype.name = "literal";

    Literal.prototype.compile = function() {
      return this.glsl.apply(this, ['Literal'].concat(__slice.call(this.children)));
    };

    return Literal;

  })(require("shader-script/glsl/nodes/literal").Literal);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/param"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Param = (function(_super) {

    __extends(Param, _super);

    function Param() {
      Param.__super__.constructor.apply(this, arguments);
    }

    Param.prototype.name = 'param';

    Param.prototype.children = function() {
      return ['name', 'default_value'];
    };

    Param.prototype.toVariableName = function() {
      return this.name.toVariableName();
    };

    Param.prototype.compile = function(shader) {
      var result, variable, varn;
      varn = this.toVariableName();
      variable = shader.scope.define(varn);
      result = this.glsl('Variable', null, this.name.compile(shader), variable.qualified_name);
      result.variable = variable;
      return result;
    };

    return Param;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/root"] = function() {
      var exports = {};
      (function() {
  var Shader,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Shader = require('shader-script/shader').Shader;

  exports.Root = (function(_super) {

    __extends(Root, _super);

    Root.prototype.name = "root";

    function Root(block) {
      this.block = block;
      Root.__super__.constructor.call(this, this.block);
    }

    Root.prototype.compile = function(state) {
      var program, root_node, shader;
      if (state == null) state = {};
      shader = new Shader(state);
      root_node = this.glsl('Root', this.block.compile(shader));
      program = root_node.compile(state);
      return {
        vertex: program.toVertexProgram(),
        fragment: program.toFragmentProgram()
      };
    };

    return Root;

  })(require('shader-script/nodes/base').Base);

}).call(this);

      return exports;
    };
    _require["shader-script/nodes/value"] = function() {
      var exports = {};
      (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Value = (function(_super) {

    __extends(Value, _super);

    function Value() {
      Value.__super__.constructor.apply(this, arguments);
    }

    Value.prototype.name = "value";

    Value.prototype.compile = function(shader) {
      return this.glsl('Value', this.children[0].compile(shader));
    };

    Value.prototype.toVariableName = function() {
      return this.children[0].toVariableName();
    };

    Value.prototype.variable = function(shader) {
      return this.children[0].variable && this.children[0].variable(shader);
    };

    return Value;

  })(require("shader-script/glsl/nodes/value").Value);

}).call(this);

      return exports;
    };
    _require["shader-script/parser"] = function() {
      var exports = {};
      /* Jison generated parser */

var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Root":3,"Body":4,"Block":5,"TERMINATOR":6,"Line":7,"Expression":8,"Statement":9,"Return":10,"Comment":11,"STATEMENT":12,"Value":13,"Invocation":14,"Code":15,"Operation":16,"Assign":17,"If":18,"Try":19,"While":20,"For":21,"Switch":22,"Class":23,"Throw":24,"INDENT":25,"OUTDENT":26,"Identifier":27,"IDENTIFIER":28,"AlphaNumeric":29,"NUMBER":30,"STRING":31,"Literal":32,"JS":33,"REGEX":34,"DEBUGGER":35,"BOOL":36,"Assignable":37,"=":38,"AssignObj":39,"ObjAssignable":40,":":41,"ThisProperty":42,"RETURN":43,"HERECOMMENT":44,"PARAM_START":45,"ParamList":46,"PARAM_END":47,"FuncGlyph":48,"->":49,"=>":50,"OptComma":51,",":52,"Param":53,"ParamVar":54,"...":55,"Array":56,"Object":57,"Splat":58,"SimpleAssignable":59,"Accessor":60,"Parenthetical":61,"Range":62,"This":63,".":64,"?.":65,"::":66,"Index":67,"INDEX_START":68,"IndexValue":69,"INDEX_END":70,"INDEX_SOAK":71,"Slice":72,"{":73,"AssignList":74,"}":75,"CLASS":76,"EXTENDS":77,"OptFuncExist":78,"Arguments":79,"SUPER":80,"FUNC_EXIST":81,"CALL_START":82,"CALL_END":83,"ArgList":84,"THIS":85,"@":86,"[":87,"]":88,"RangeDots":89,"..":90,"Arg":91,"SimpleArgs":92,"TRY":93,"Catch":94,"FINALLY":95,"CATCH":96,"THROW":97,"(":98,")":99,"WhileSource":100,"WHILE":101,"WHEN":102,"UNTIL":103,"Loop":104,"LOOP":105,"ForBody":106,"FOR":107,"ForStart":108,"ForSource":109,"ForVariables":110,"OWN":111,"ForValue":112,"FORIN":113,"FOROF":114,"BY":115,"SWITCH":116,"Whens":117,"ELSE":118,"When":119,"LEADING_WHEN":120,"IfBlock":121,"IF":122,"POST_IF":123,"UNARY":124,"-":125,"+":126,"--":127,"++":128,"?":129,"MATH":130,"SHIFT":131,"COMPARE":132,"LOGIC":133,"RELATION":134,"COMPOUND_ASSIGN":135,"$accept":0,"$end":1},
terminals_: {2:"error",6:"TERMINATOR",12:"STATEMENT",25:"INDENT",26:"OUTDENT",28:"IDENTIFIER",30:"NUMBER",31:"STRING",33:"JS",34:"REGEX",35:"DEBUGGER",36:"BOOL",38:"=",41:":",43:"RETURN",44:"HERECOMMENT",45:"PARAM_START",47:"PARAM_END",49:"->",50:"=>",52:",",55:"...",64:".",65:"?.",66:"::",68:"INDEX_START",70:"INDEX_END",71:"INDEX_SOAK",73:"{",75:"}",76:"CLASS",77:"EXTENDS",80:"SUPER",81:"FUNC_EXIST",82:"CALL_START",83:"CALL_END",85:"THIS",86:"@",87:"[",88:"]",90:"..",93:"TRY",95:"FINALLY",96:"CATCH",97:"THROW",98:"(",99:")",101:"WHILE",102:"WHEN",103:"UNTIL",105:"LOOP",107:"FOR",111:"OWN",113:"FORIN",114:"FOROF",115:"BY",116:"SWITCH",118:"ELSE",120:"LEADING_WHEN",122:"IF",123:"POST_IF",124:"UNARY",125:"-",126:"+",127:"--",128:"++",129:"?",130:"MATH",131:"SHIFT",132:"COMPARE",133:"LOGIC",134:"RELATION",135:"COMPOUND_ASSIGN"},
productions_: [0,[3,0],[3,1],[3,2],[4,1],[4,3],[4,2],[7,1],[7,1],[9,1],[9,1],[9,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[8,1],[5,2],[5,3],[27,1],[29,1],[29,1],[32,1],[32,1],[32,1],[32,1],[32,1],[17,3],[17,4],[17,5],[39,1],[39,3],[39,5],[39,1],[40,1],[40,1],[40,1],[10,2],[10,1],[11,1],[15,5],[15,2],[48,1],[48,1],[51,0],[51,1],[46,0],[46,1],[46,3],[53,1],[53,2],[53,3],[54,1],[54,1],[54,1],[54,1],[58,2],[59,1],[59,2],[59,2],[59,1],[37,1],[37,1],[37,1],[13,1],[13,1],[13,1],[13,1],[13,1],[60,2],[60,2],[60,2],[60,1],[60,1],[67,3],[67,2],[69,1],[69,1],[57,4],[74,0],[74,1],[74,3],[74,4],[74,6],[23,1],[23,2],[23,3],[23,4],[23,2],[23,3],[23,4],[23,5],[14,3],[14,3],[14,1],[14,2],[78,0],[78,1],[79,2],[79,4],[63,1],[63,1],[42,2],[56,2],[56,4],[89,1],[89,1],[62,5],[72,3],[72,2],[72,2],[72,1],[84,1],[84,3],[84,4],[84,4],[84,6],[91,1],[91,1],[92,1],[92,3],[19,2],[19,3],[19,4],[19,5],[94,3],[24,2],[61,3],[61,5],[100,2],[100,4],[100,2],[100,4],[20,2],[20,2],[20,2],[20,1],[104,2],[104,2],[21,2],[21,2],[21,2],[106,2],[106,2],[108,2],[108,3],[112,1],[112,1],[112,1],[110,1],[110,3],[109,2],[109,2],[109,4],[109,4],[109,4],[109,6],[109,6],[22,5],[22,7],[22,4],[22,6],[117,1],[117,2],[119,3],[119,4],[121,3],[121,5],[18,1],[18,3],[18,3],[18,3],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,2],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,3],[16,5],[16,3]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1:return this.$ = new yy.Root(new yy.Block);
break;
case 2:return this.$ = new yy.Root($$[$0]);
break;
case 3:return this.$ = new yy.Root($$[$0-1]);
break;
case 4:this.$ = yy.Block.wrap([$$[$0]]);
break;
case 5:this.$ = $$[$0-2].push($$[$0]);
break;
case 6:this.$ = $$[$0-1];
break;
case 7:this.$ = $$[$0];
break;
case 8:this.$ = $$[$0];
break;
case 9:this.$ = $$[$0];
break;
case 10:this.$ = $$[$0];
break;
case 11:this.$ = new yy.Literal($$[$0]);
break;
case 12:this.$ = $$[$0];
break;
case 13:this.$ = $$[$0];
break;
case 14:this.$ = $$[$0];
break;
case 15:this.$ = $$[$0];
break;
case 16:this.$ = $$[$0];
break;
case 17:this.$ = $$[$0];
break;
case 18:this.$ = $$[$0];
break;
case 19:this.$ = $$[$0];
break;
case 20:this.$ = $$[$0];
break;
case 21:this.$ = $$[$0];
break;
case 22:this.$ = $$[$0];
break;
case 23:this.$ = $$[$0];
break;
case 24:this.$ = new yy.Block;
break;
case 25:this.$ = $$[$0-1];
break;
case 26:this.$ = new yy.Identifier($$[$0]);
break;
case 27:this.$ = new yy.Literal($$[$0]);
break;
case 28:this.$ = new yy.Literal($$[$0]);
break;
case 29:this.$ = $$[$0];
break;
case 30:this.$ = new yy.Literal($$[$0]);
break;
case 31:this.$ = new yy.Literal($$[$0]);
break;
case 32:this.$ = new yy.Literal($$[$0]);
break;
case 33:this.$ = (function () {
        var val;
        val = new yy.Literal($$[$0]);
        if ($$[$0] === 'undefined') val.isUndefined = true;
        return val;
      }());
break;
case 34:this.$ = new yy.Assign($$[$0-2], $$[$0]);
break;
case 35:this.$ = new yy.Assign($$[$0-3], $$[$0]);
break;
case 36:this.$ = new yy.Assign($$[$0-4], $$[$0-1]);
break;
case 37:this.$ = new yy.Value($$[$0]);
break;
case 38:this.$ = new yy.Assign(new yy.Value($$[$0-2]), $$[$0], 'object');
break;
case 39:this.$ = new yy.Assign(new yy.Value($$[$0-4]), $$[$0-1], 'object');
break;
case 40:this.$ = $$[$0];
break;
case 41:this.$ = $$[$0];
break;
case 42:this.$ = $$[$0];
break;
case 43:this.$ = $$[$0];
break;
case 44:this.$ = new yy.Return($$[$0]);
break;
case 45:this.$ = new yy.Return;
break;
case 46:this.$ = new yy.Comment($$[$0]);
break;
case 47:this.$ = new yy.Code($$[$0-3], $$[$0], $$[$0-1]);
break;
case 48:this.$ = new yy.Code([], $$[$0], $$[$0-1]);
break;
case 49:this.$ = 'func';
break;
case 50:this.$ = 'boundfunc';
break;
case 51:this.$ = $$[$0];
break;
case 52:this.$ = $$[$0];
break;
case 53:this.$ = [];
break;
case 54:this.$ = [$$[$0]];
break;
case 55:this.$ = $$[$0-2].concat($$[$0]);
break;
case 56:this.$ = new yy.Param($$[$0]);
break;
case 57:this.$ = new yy.Param($$[$0-1], null, true);
break;
case 58:this.$ = new yy.Param($$[$0-2], $$[$0]);
break;
case 59:this.$ = $$[$0];
break;
case 60:this.$ = $$[$0];
break;
case 61:this.$ = $$[$0];
break;
case 62:this.$ = $$[$0];
break;
case 63:this.$ = new yy.Splat($$[$0-1]);
break;
case 64:this.$ = new yy.Value($$[$0]);
break;
case 65:this.$ = $$[$0-1].add($$[$0]);
break;
case 66:this.$ = new yy.Value($$[$0-1], [].concat($$[$0]));
break;
case 67:this.$ = $$[$0];
break;
case 68:this.$ = $$[$0];
break;
case 69:this.$ = new yy.Value($$[$0]);
break;
case 70:this.$ = new yy.Value($$[$0]);
break;
case 71:this.$ = $$[$0];
break;
case 72:this.$ = new yy.Value($$[$0]);
break;
case 73:this.$ = new yy.Value($$[$0]);
break;
case 74:this.$ = new yy.Value($$[$0]);
break;
case 75:this.$ = $$[$0];
break;
case 76:this.$ = new yy.Access($$[$0]);
break;
case 77:this.$ = new yy.Access($$[$0], 'soak');
break;
case 78:this.$ = [new yy.Access(new yy.Literal('prototype')), new yy.Access($$[$0])];
break;
case 79:this.$ = new yy.Access(new yy.Literal('prototype'));
break;
case 80:this.$ = $$[$0];
break;
case 81:this.$ = $$[$0-1];
break;
case 82:this.$ = yy.extend($$[$0], {
          soak: true
        });
break;
case 83:this.$ = new yy.Index($$[$0]);
break;
case 84:this.$ = new yy.Slice($$[$0]);
break;
case 85:this.$ = new yy.Obj($$[$0-2], $$[$0-3].generated);
break;
case 86:this.$ = [];
break;
case 87:this.$ = [$$[$0]];
break;
case 88:this.$ = $$[$0-2].concat($$[$0]);
break;
case 89:this.$ = $$[$0-3].concat($$[$0]);
break;
case 90:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 91:this.$ = new yy.Class;
break;
case 92:this.$ = new yy.Class(null, null, $$[$0]);
break;
case 93:this.$ = new yy.Class(null, $$[$0]);
break;
case 94:this.$ = new yy.Class(null, $$[$0-1], $$[$0]);
break;
case 95:this.$ = new yy.Class($$[$0]);
break;
case 96:this.$ = new yy.Class($$[$0-1], null, $$[$0]);
break;
case 97:this.$ = new yy.Class($$[$0-2], $$[$0]);
break;
case 98:this.$ = new yy.Class($$[$0-3], $$[$0-1], $$[$0]);
break;
case 99:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 100:this.$ = new yy.Call($$[$0-2], $$[$0], $$[$0-1]);
break;
case 101:this.$ = new yy.Call('super', [new yy.Splat(new yy.Literal('arguments'))]);
break;
case 102:this.$ = new yy.Call('super', $$[$0]);
break;
case 103:this.$ = false;
break;
case 104:this.$ = true;
break;
case 105:this.$ = [];
break;
case 106:this.$ = $$[$0-2];
break;
case 107:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 108:this.$ = new yy.Value(new yy.Literal('this'));
break;
case 109:this.$ = new yy.Value(new yy.Literal('this'), [new yy.Access($$[$0])], 'this');
break;
case 110:this.$ = new yy.Arr([]);
break;
case 111:this.$ = new yy.Arr($$[$0-2]);
break;
case 112:this.$ = 'inclusive';
break;
case 113:this.$ = 'exclusive';
break;
case 114:this.$ = new yy.Range($$[$0-3], $$[$0-1], $$[$0-2]);
break;
case 115:this.$ = new yy.Range($$[$0-2], $$[$0], $$[$0-1]);
break;
case 116:this.$ = new yy.Range($$[$0-1], null, $$[$0]);
break;
case 117:this.$ = new yy.Range(null, $$[$0], $$[$0-1]);
break;
case 118:this.$ = new yy.Range(null, null, $$[$0]);
break;
case 119:this.$ = [$$[$0]];
break;
case 120:this.$ = $$[$0-2].concat($$[$0]);
break;
case 121:this.$ = $$[$0-3].concat($$[$0]);
break;
case 122:this.$ = $$[$0-2];
break;
case 123:this.$ = $$[$0-5].concat($$[$0-2]);
break;
case 124:this.$ = $$[$0];
break;
case 125:this.$ = $$[$0];
break;
case 126:this.$ = $$[$0];
break;
case 127:this.$ = [].concat($$[$0-2], $$[$0]);
break;
case 128:this.$ = new yy.Try($$[$0]);
break;
case 129:this.$ = new yy.Try($$[$0-1], $$[$0][0], $$[$0][1]);
break;
case 130:this.$ = new yy.Try($$[$0-2], null, null, $$[$0]);
break;
case 131:this.$ = new yy.Try($$[$0-3], $$[$0-2][0], $$[$0-2][1], $$[$0]);
break;
case 132:this.$ = [$$[$0-1], $$[$0]];
break;
case 133:this.$ = new yy.Throw($$[$0]);
break;
case 134:this.$ = new yy.Parens($$[$0-1]);
break;
case 135:this.$ = new yy.Parens($$[$0-2]);
break;
case 136:this.$ = new yy.While($$[$0]);
break;
case 137:this.$ = new yy.While($$[$0-2], {
          guard: $$[$0]
        });
break;
case 138:this.$ = new yy.While($$[$0], {
          invert: true
        });
break;
case 139:this.$ = new yy.While($$[$0-2], {
          invert: true,
          guard: $$[$0]
        });
break;
case 140:this.$ = $$[$0-1].addBody($$[$0]);
break;
case 141:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 142:this.$ = $$[$0].addBody(yy.Block.wrap([$$[$0-1]]));
break;
case 143:this.$ = $$[$0];
break;
case 144:this.$ = new yy.While(new yy.Literal('true')).addBody($$[$0]);
break;
case 145:this.$ = new yy.While(new yy.Literal('true')).addBody(yy.Block.wrap([$$[$0]]));
break;
case 146:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 147:this.$ = new yy.For($$[$0-1], $$[$0]);
break;
case 148:this.$ = new yy.For($$[$0], $$[$0-1]);
break;
case 149:this.$ = {
          source: new yy.Value($$[$0])
        };
break;
case 150:this.$ = (function () {
        $$[$0].own = $$[$0-1].own;
        $$[$0].name = $$[$0-1][0];
        $$[$0].index = $$[$0-1][1];
        return $$[$0];
      }());
break;
case 151:this.$ = $$[$0];
break;
case 152:this.$ = (function () {
        $$[$0].own = true;
        return $$[$0];
      }());
break;
case 153:this.$ = $$[$0];
break;
case 154:this.$ = new yy.Value($$[$0]);
break;
case 155:this.$ = new yy.Value($$[$0]);
break;
case 156:this.$ = [$$[$0]];
break;
case 157:this.$ = [$$[$0-2], $$[$0]];
break;
case 158:this.$ = {
          source: $$[$0]
        };
break;
case 159:this.$ = {
          source: $$[$0],
          object: true
        };
break;
case 160:this.$ = {
          source: $$[$0-2],
          guard: $$[$0]
        };
break;
case 161:this.$ = {
          source: $$[$0-2],
          guard: $$[$0],
          object: true
        };
break;
case 162:this.$ = {
          source: $$[$0-2],
          step: $$[$0]
        };
break;
case 163:this.$ = {
          source: $$[$0-4],
          guard: $$[$0-2],
          step: $$[$0]
        };
break;
case 164:this.$ = {
          source: $$[$0-4],
          step: $$[$0-2],
          guard: $$[$0]
        };
break;
case 165:this.$ = new yy.Switch($$[$0-3], $$[$0-1]);
break;
case 166:this.$ = new yy.Switch($$[$0-5], $$[$0-3], $$[$0-1]);
break;
case 167:this.$ = new yy.Switch(null, $$[$0-1]);
break;
case 168:this.$ = new yy.Switch(null, $$[$0-3], $$[$0-1]);
break;
case 169:this.$ = $$[$0];
break;
case 170:this.$ = $$[$0-1].concat($$[$0]);
break;
case 171:this.$ = [[$$[$0-1], $$[$0]]];
break;
case 172:this.$ = [[$$[$0-2], $$[$0-1]]];
break;
case 173:this.$ = new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        });
break;
case 174:this.$ = $$[$0-4].addElse(new yy.If($$[$0-1], $$[$0], {
          type: $$[$0-2]
        }));
break;
case 175:this.$ = $$[$0];
break;
case 176:this.$ = $$[$0-2].addElse($$[$0]);
break;
case 177:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 178:this.$ = new yy.If($$[$0], yy.Block.wrap([$$[$0-2]]), {
          type: $$[$0-1],
          statement: true
        });
break;
case 179:this.$ = new yy.Op($$[$0-1], $$[$0]);
break;
case 180:this.$ = new yy.Op('-', $$[$0]);
break;
case 181:this.$ = new yy.Op('+', $$[$0]);
break;
case 182:this.$ = new yy.Op('--', $$[$0]);
break;
case 183:this.$ = new yy.Op('++', $$[$0]);
break;
case 184:this.$ = new yy.Op('--', $$[$0-1], null, true);
break;
case 185:this.$ = new yy.Op('++', $$[$0-1], null, true);
break;
case 186:this.$ = new yy.Existence($$[$0-1]);
break;
case 187:this.$ = new yy.Op('+', $$[$0-2], $$[$0]);
break;
case 188:this.$ = new yy.Op('-', $$[$0-2], $$[$0]);
break;
case 189:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 190:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 191:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 192:this.$ = new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
break;
case 193:this.$ = (function () {
        if ($$[$0-1].charAt(0) === '!') {
          return new yy.Op($$[$0-1].slice(1), $$[$0-2], $$[$0]).invert();
        } else {
          return new yy.Op($$[$0-1], $$[$0-2], $$[$0]);
        }
      }());
break;
case 194:this.$ = new yy.Assign($$[$0-2], $$[$0], $$[$0-1]);
break;
case 195:this.$ = new yy.Assign($$[$0-4], $$[$0-1], $$[$0-3]);
break;
case 196:this.$ = new yy.Extends($$[$0-2], $$[$0]);
break;
}
},
table: [{1:[2,1],3:1,4:2,5:3,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,5],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[3]},{1:[2,2],6:[1,72]},{6:[1,73]},{1:[2,4],6:[2,4],26:[2,4],99:[2,4]},{4:75,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[1,74],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,7],6:[2,7],26:[2,7],99:[2,7],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,8],6:[2,8],26:[2,8],99:[2,8],100:88,101:[1,63],103:[1,64],106:89,107:[1,66],108:67,123:[1,87]},{1:[2,12],6:[2,12],25:[2,12],26:[2,12],47:[2,12],52:[2,12],55:[2,12],60:91,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],70:[2,12],71:[1,98],75:[2,12],78:90,81:[1,92],82:[2,103],83:[2,12],88:[2,12],90:[2,12],99:[2,12],101:[2,12],102:[2,12],103:[2,12],107:[2,12],115:[2,12],123:[2,12],125:[2,12],126:[2,12],129:[2,12],130:[2,12],131:[2,12],132:[2,12],133:[2,12],134:[2,12]},{1:[2,13],6:[2,13],25:[2,13],26:[2,13],47:[2,13],52:[2,13],55:[2,13],60:100,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],70:[2,13],71:[1,98],75:[2,13],78:99,81:[1,92],82:[2,103],83:[2,13],88:[2,13],90:[2,13],99:[2,13],101:[2,13],102:[2,13],103:[2,13],107:[2,13],115:[2,13],123:[2,13],125:[2,13],126:[2,13],129:[2,13],130:[2,13],131:[2,13],132:[2,13],133:[2,13],134:[2,13]},{1:[2,14],6:[2,14],25:[2,14],26:[2,14],47:[2,14],52:[2,14],55:[2,14],70:[2,14],75:[2,14],83:[2,14],88:[2,14],90:[2,14],99:[2,14],101:[2,14],102:[2,14],103:[2,14],107:[2,14],115:[2,14],123:[2,14],125:[2,14],126:[2,14],129:[2,14],130:[2,14],131:[2,14],132:[2,14],133:[2,14],134:[2,14]},{1:[2,15],6:[2,15],25:[2,15],26:[2,15],47:[2,15],52:[2,15],55:[2,15],70:[2,15],75:[2,15],83:[2,15],88:[2,15],90:[2,15],99:[2,15],101:[2,15],102:[2,15],103:[2,15],107:[2,15],115:[2,15],123:[2,15],125:[2,15],126:[2,15],129:[2,15],130:[2,15],131:[2,15],132:[2,15],133:[2,15],134:[2,15]},{1:[2,16],6:[2,16],25:[2,16],26:[2,16],47:[2,16],52:[2,16],55:[2,16],70:[2,16],75:[2,16],83:[2,16],88:[2,16],90:[2,16],99:[2,16],101:[2,16],102:[2,16],103:[2,16],107:[2,16],115:[2,16],123:[2,16],125:[2,16],126:[2,16],129:[2,16],130:[2,16],131:[2,16],132:[2,16],133:[2,16],134:[2,16]},{1:[2,17],6:[2,17],25:[2,17],26:[2,17],47:[2,17],52:[2,17],55:[2,17],70:[2,17],75:[2,17],83:[2,17],88:[2,17],90:[2,17],99:[2,17],101:[2,17],102:[2,17],103:[2,17],107:[2,17],115:[2,17],123:[2,17],125:[2,17],126:[2,17],129:[2,17],130:[2,17],131:[2,17],132:[2,17],133:[2,17],134:[2,17]},{1:[2,18],6:[2,18],25:[2,18],26:[2,18],47:[2,18],52:[2,18],55:[2,18],70:[2,18],75:[2,18],83:[2,18],88:[2,18],90:[2,18],99:[2,18],101:[2,18],102:[2,18],103:[2,18],107:[2,18],115:[2,18],123:[2,18],125:[2,18],126:[2,18],129:[2,18],130:[2,18],131:[2,18],132:[2,18],133:[2,18],134:[2,18]},{1:[2,19],6:[2,19],25:[2,19],26:[2,19],47:[2,19],52:[2,19],55:[2,19],70:[2,19],75:[2,19],83:[2,19],88:[2,19],90:[2,19],99:[2,19],101:[2,19],102:[2,19],103:[2,19],107:[2,19],115:[2,19],123:[2,19],125:[2,19],126:[2,19],129:[2,19],130:[2,19],131:[2,19],132:[2,19],133:[2,19],134:[2,19]},{1:[2,20],6:[2,20],25:[2,20],26:[2,20],47:[2,20],52:[2,20],55:[2,20],70:[2,20],75:[2,20],83:[2,20],88:[2,20],90:[2,20],99:[2,20],101:[2,20],102:[2,20],103:[2,20],107:[2,20],115:[2,20],123:[2,20],125:[2,20],126:[2,20],129:[2,20],130:[2,20],131:[2,20],132:[2,20],133:[2,20],134:[2,20]},{1:[2,21],6:[2,21],25:[2,21],26:[2,21],47:[2,21],52:[2,21],55:[2,21],70:[2,21],75:[2,21],83:[2,21],88:[2,21],90:[2,21],99:[2,21],101:[2,21],102:[2,21],103:[2,21],107:[2,21],115:[2,21],123:[2,21],125:[2,21],126:[2,21],129:[2,21],130:[2,21],131:[2,21],132:[2,21],133:[2,21],134:[2,21]},{1:[2,22],6:[2,22],25:[2,22],26:[2,22],47:[2,22],52:[2,22],55:[2,22],70:[2,22],75:[2,22],83:[2,22],88:[2,22],90:[2,22],99:[2,22],101:[2,22],102:[2,22],103:[2,22],107:[2,22],115:[2,22],123:[2,22],125:[2,22],126:[2,22],129:[2,22],130:[2,22],131:[2,22],132:[2,22],133:[2,22],134:[2,22]},{1:[2,23],6:[2,23],25:[2,23],26:[2,23],47:[2,23],52:[2,23],55:[2,23],70:[2,23],75:[2,23],83:[2,23],88:[2,23],90:[2,23],99:[2,23],101:[2,23],102:[2,23],103:[2,23],107:[2,23],115:[2,23],123:[2,23],125:[2,23],126:[2,23],129:[2,23],130:[2,23],131:[2,23],132:[2,23],133:[2,23],134:[2,23]},{1:[2,9],6:[2,9],26:[2,9],99:[2,9],101:[2,9],103:[2,9],107:[2,9],123:[2,9]},{1:[2,10],6:[2,10],26:[2,10],99:[2,10],101:[2,10],103:[2,10],107:[2,10],123:[2,10]},{1:[2,11],6:[2,11],26:[2,11],99:[2,11],101:[2,11],103:[2,11],107:[2,11],123:[2,11]},{1:[2,71],6:[2,71],25:[2,71],26:[2,71],38:[1,101],47:[2,71],52:[2,71],55:[2,71],64:[2,71],65:[2,71],66:[2,71],68:[2,71],70:[2,71],71:[2,71],75:[2,71],81:[2,71],82:[2,71],83:[2,71],88:[2,71],90:[2,71],99:[2,71],101:[2,71],102:[2,71],103:[2,71],107:[2,71],115:[2,71],123:[2,71],125:[2,71],126:[2,71],129:[2,71],130:[2,71],131:[2,71],132:[2,71],133:[2,71],134:[2,71]},{1:[2,72],6:[2,72],25:[2,72],26:[2,72],47:[2,72],52:[2,72],55:[2,72],64:[2,72],65:[2,72],66:[2,72],68:[2,72],70:[2,72],71:[2,72],75:[2,72],81:[2,72],82:[2,72],83:[2,72],88:[2,72],90:[2,72],99:[2,72],101:[2,72],102:[2,72],103:[2,72],107:[2,72],115:[2,72],123:[2,72],125:[2,72],126:[2,72],129:[2,72],130:[2,72],131:[2,72],132:[2,72],133:[2,72],134:[2,72]},{1:[2,73],6:[2,73],25:[2,73],26:[2,73],47:[2,73],52:[2,73],55:[2,73],64:[2,73],65:[2,73],66:[2,73],68:[2,73],70:[2,73],71:[2,73],75:[2,73],81:[2,73],82:[2,73],83:[2,73],88:[2,73],90:[2,73],99:[2,73],101:[2,73],102:[2,73],103:[2,73],107:[2,73],115:[2,73],123:[2,73],125:[2,73],126:[2,73],129:[2,73],130:[2,73],131:[2,73],132:[2,73],133:[2,73],134:[2,73]},{1:[2,74],6:[2,74],25:[2,74],26:[2,74],47:[2,74],52:[2,74],55:[2,74],64:[2,74],65:[2,74],66:[2,74],68:[2,74],70:[2,74],71:[2,74],75:[2,74],81:[2,74],82:[2,74],83:[2,74],88:[2,74],90:[2,74],99:[2,74],101:[2,74],102:[2,74],103:[2,74],107:[2,74],115:[2,74],123:[2,74],125:[2,74],126:[2,74],129:[2,74],130:[2,74],131:[2,74],132:[2,74],133:[2,74],134:[2,74]},{1:[2,75],6:[2,75],25:[2,75],26:[2,75],47:[2,75],52:[2,75],55:[2,75],64:[2,75],65:[2,75],66:[2,75],68:[2,75],70:[2,75],71:[2,75],75:[2,75],81:[2,75],82:[2,75],83:[2,75],88:[2,75],90:[2,75],99:[2,75],101:[2,75],102:[2,75],103:[2,75],107:[2,75],115:[2,75],123:[2,75],125:[2,75],126:[2,75],129:[2,75],130:[2,75],131:[2,75],132:[2,75],133:[2,75],134:[2,75]},{1:[2,101],6:[2,101],25:[2,101],26:[2,101],47:[2,101],52:[2,101],55:[2,101],64:[2,101],65:[2,101],66:[2,101],68:[2,101],70:[2,101],71:[2,101],75:[2,101],79:102,81:[2,101],82:[1,103],83:[2,101],88:[2,101],90:[2,101],99:[2,101],101:[2,101],102:[2,101],103:[2,101],107:[2,101],115:[2,101],123:[2,101],125:[2,101],126:[2,101],129:[2,101],130:[2,101],131:[2,101],132:[2,101],133:[2,101],134:[2,101]},{27:107,28:[1,71],42:108,46:104,47:[2,53],52:[2,53],53:105,54:106,56:109,57:110,73:[1,68],86:[1,111],87:[1,112]},{5:113,25:[1,5]},{8:114,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:116,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:117,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{13:119,14:120,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:121,42:61,56:47,57:48,59:118,61:25,62:26,63:27,73:[1,68],80:[1,28],85:[1,56],86:[1,57],87:[1,55],98:[1,54]},{13:119,14:120,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:121,42:61,56:47,57:48,59:122,61:25,62:26,63:27,73:[1,68],80:[1,28],85:[1,56],86:[1,57],87:[1,55],98:[1,54]},{1:[2,68],6:[2,68],25:[2,68],26:[2,68],38:[2,68],47:[2,68],52:[2,68],55:[2,68],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,68],71:[2,68],75:[2,68],77:[1,126],81:[2,68],82:[2,68],83:[2,68],88:[2,68],90:[2,68],99:[2,68],101:[2,68],102:[2,68],103:[2,68],107:[2,68],115:[2,68],123:[2,68],125:[2,68],126:[2,68],127:[1,123],128:[1,124],129:[2,68],130:[2,68],131:[2,68],132:[2,68],133:[2,68],134:[2,68],135:[1,125]},{1:[2,175],6:[2,175],25:[2,175],26:[2,175],47:[2,175],52:[2,175],55:[2,175],70:[2,175],75:[2,175],83:[2,175],88:[2,175],90:[2,175],99:[2,175],101:[2,175],102:[2,175],103:[2,175],107:[2,175],115:[2,175],118:[1,127],123:[2,175],125:[2,175],126:[2,175],129:[2,175],130:[2,175],131:[2,175],132:[2,175],133:[2,175],134:[2,175]},{5:128,25:[1,5]},{5:129,25:[1,5]},{1:[2,143],6:[2,143],25:[2,143],26:[2,143],47:[2,143],52:[2,143],55:[2,143],70:[2,143],75:[2,143],83:[2,143],88:[2,143],90:[2,143],99:[2,143],101:[2,143],102:[2,143],103:[2,143],107:[2,143],115:[2,143],123:[2,143],125:[2,143],126:[2,143],129:[2,143],130:[2,143],131:[2,143],132:[2,143],133:[2,143],134:[2,143]},{5:130,25:[1,5]},{8:131,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,132],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,91],5:133,6:[2,91],13:119,14:120,25:[1,5],26:[2,91],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:121,42:61,47:[2,91],52:[2,91],55:[2,91],56:47,57:48,59:135,61:25,62:26,63:27,70:[2,91],73:[1,68],75:[2,91],77:[1,134],80:[1,28],83:[2,91],85:[1,56],86:[1,57],87:[1,55],88:[2,91],90:[2,91],98:[1,54],99:[2,91],101:[2,91],102:[2,91],103:[2,91],107:[2,91],115:[2,91],123:[2,91],125:[2,91],126:[2,91],129:[2,91],130:[2,91],131:[2,91],132:[2,91],133:[2,91],134:[2,91]},{8:136,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,45],6:[2,45],8:137,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[2,45],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],99:[2,45],100:39,101:[2,45],103:[2,45],104:40,105:[1,65],106:41,107:[2,45],108:67,116:[1,42],121:37,122:[1,62],123:[2,45],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,46],6:[2,46],25:[2,46],26:[2,46],52:[2,46],75:[2,46],99:[2,46],101:[2,46],103:[2,46],107:[2,46],123:[2,46]},{1:[2,69],6:[2,69],25:[2,69],26:[2,69],38:[2,69],47:[2,69],52:[2,69],55:[2,69],64:[2,69],65:[2,69],66:[2,69],68:[2,69],70:[2,69],71:[2,69],75:[2,69],81:[2,69],82:[2,69],83:[2,69],88:[2,69],90:[2,69],99:[2,69],101:[2,69],102:[2,69],103:[2,69],107:[2,69],115:[2,69],123:[2,69],125:[2,69],126:[2,69],129:[2,69],130:[2,69],131:[2,69],132:[2,69],133:[2,69],134:[2,69]},{1:[2,70],6:[2,70],25:[2,70],26:[2,70],38:[2,70],47:[2,70],52:[2,70],55:[2,70],64:[2,70],65:[2,70],66:[2,70],68:[2,70],70:[2,70],71:[2,70],75:[2,70],81:[2,70],82:[2,70],83:[2,70],88:[2,70],90:[2,70],99:[2,70],101:[2,70],102:[2,70],103:[2,70],107:[2,70],115:[2,70],123:[2,70],125:[2,70],126:[2,70],129:[2,70],130:[2,70],131:[2,70],132:[2,70],133:[2,70],134:[2,70]},{1:[2,29],6:[2,29],25:[2,29],26:[2,29],47:[2,29],52:[2,29],55:[2,29],64:[2,29],65:[2,29],66:[2,29],68:[2,29],70:[2,29],71:[2,29],75:[2,29],81:[2,29],82:[2,29],83:[2,29],88:[2,29],90:[2,29],99:[2,29],101:[2,29],102:[2,29],103:[2,29],107:[2,29],115:[2,29],123:[2,29],125:[2,29],126:[2,29],129:[2,29],130:[2,29],131:[2,29],132:[2,29],133:[2,29],134:[2,29]},{1:[2,30],6:[2,30],25:[2,30],26:[2,30],47:[2,30],52:[2,30],55:[2,30],64:[2,30],65:[2,30],66:[2,30],68:[2,30],70:[2,30],71:[2,30],75:[2,30],81:[2,30],82:[2,30],83:[2,30],88:[2,30],90:[2,30],99:[2,30],101:[2,30],102:[2,30],103:[2,30],107:[2,30],115:[2,30],123:[2,30],125:[2,30],126:[2,30],129:[2,30],130:[2,30],131:[2,30],132:[2,30],133:[2,30],134:[2,30]},{1:[2,31],6:[2,31],25:[2,31],26:[2,31],47:[2,31],52:[2,31],55:[2,31],64:[2,31],65:[2,31],66:[2,31],68:[2,31],70:[2,31],71:[2,31],75:[2,31],81:[2,31],82:[2,31],83:[2,31],88:[2,31],90:[2,31],99:[2,31],101:[2,31],102:[2,31],103:[2,31],107:[2,31],115:[2,31],123:[2,31],125:[2,31],126:[2,31],129:[2,31],130:[2,31],131:[2,31],132:[2,31],133:[2,31],134:[2,31]},{1:[2,32],6:[2,32],25:[2,32],26:[2,32],47:[2,32],52:[2,32],55:[2,32],64:[2,32],65:[2,32],66:[2,32],68:[2,32],70:[2,32],71:[2,32],75:[2,32],81:[2,32],82:[2,32],83:[2,32],88:[2,32],90:[2,32],99:[2,32],101:[2,32],102:[2,32],103:[2,32],107:[2,32],115:[2,32],123:[2,32],125:[2,32],126:[2,32],129:[2,32],130:[2,32],131:[2,32],132:[2,32],133:[2,32],134:[2,32]},{1:[2,33],6:[2,33],25:[2,33],26:[2,33],47:[2,33],52:[2,33],55:[2,33],64:[2,33],65:[2,33],66:[2,33],68:[2,33],70:[2,33],71:[2,33],75:[2,33],81:[2,33],82:[2,33],83:[2,33],88:[2,33],90:[2,33],99:[2,33],101:[2,33],102:[2,33],103:[2,33],107:[2,33],115:[2,33],123:[2,33],125:[2,33],126:[2,33],129:[2,33],130:[2,33],131:[2,33],132:[2,33],133:[2,33],134:[2,33]},{4:138,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,139],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:140,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:142,85:[1,56],86:[1,57],87:[1,55],88:[1,141],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,107],6:[2,107],25:[2,107],26:[2,107],47:[2,107],52:[2,107],55:[2,107],64:[2,107],65:[2,107],66:[2,107],68:[2,107],70:[2,107],71:[2,107],75:[2,107],81:[2,107],82:[2,107],83:[2,107],88:[2,107],90:[2,107],99:[2,107],101:[2,107],102:[2,107],103:[2,107],107:[2,107],115:[2,107],123:[2,107],125:[2,107],126:[2,107],129:[2,107],130:[2,107],131:[2,107],132:[2,107],133:[2,107],134:[2,107]},{1:[2,108],6:[2,108],25:[2,108],26:[2,108],27:146,28:[1,71],47:[2,108],52:[2,108],55:[2,108],64:[2,108],65:[2,108],66:[2,108],68:[2,108],70:[2,108],71:[2,108],75:[2,108],81:[2,108],82:[2,108],83:[2,108],88:[2,108],90:[2,108],99:[2,108],101:[2,108],102:[2,108],103:[2,108],107:[2,108],115:[2,108],123:[2,108],125:[2,108],126:[2,108],129:[2,108],130:[2,108],131:[2,108],132:[2,108],133:[2,108],134:[2,108]},{25:[2,49]},{25:[2,50]},{1:[2,64],6:[2,64],25:[2,64],26:[2,64],38:[2,64],47:[2,64],52:[2,64],55:[2,64],64:[2,64],65:[2,64],66:[2,64],68:[2,64],70:[2,64],71:[2,64],75:[2,64],77:[2,64],81:[2,64],82:[2,64],83:[2,64],88:[2,64],90:[2,64],99:[2,64],101:[2,64],102:[2,64],103:[2,64],107:[2,64],115:[2,64],123:[2,64],125:[2,64],126:[2,64],127:[2,64],128:[2,64],129:[2,64],130:[2,64],131:[2,64],132:[2,64],133:[2,64],134:[2,64],135:[2,64]},{1:[2,67],6:[2,67],25:[2,67],26:[2,67],38:[2,67],47:[2,67],52:[2,67],55:[2,67],64:[2,67],65:[2,67],66:[2,67],68:[2,67],70:[2,67],71:[2,67],75:[2,67],77:[2,67],81:[2,67],82:[2,67],83:[2,67],88:[2,67],90:[2,67],99:[2,67],101:[2,67],102:[2,67],103:[2,67],107:[2,67],115:[2,67],123:[2,67],125:[2,67],126:[2,67],127:[2,67],128:[2,67],129:[2,67],130:[2,67],131:[2,67],132:[2,67],133:[2,67],134:[2,67],135:[2,67]},{8:147,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:148,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:149,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{5:150,8:151,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,5],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{27:156,28:[1,71],56:157,57:158,62:152,73:[1,68],87:[1,55],110:153,111:[1,154],112:155},{109:159,113:[1,160],114:[1,161]},{6:[2,86],11:165,25:[2,86],27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:163,40:164,42:168,44:[1,46],52:[2,86],74:162,75:[2,86],86:[1,111]},{1:[2,27],6:[2,27],25:[2,27],26:[2,27],41:[2,27],47:[2,27],52:[2,27],55:[2,27],64:[2,27],65:[2,27],66:[2,27],68:[2,27],70:[2,27],71:[2,27],75:[2,27],81:[2,27],82:[2,27],83:[2,27],88:[2,27],90:[2,27],99:[2,27],101:[2,27],102:[2,27],103:[2,27],107:[2,27],115:[2,27],123:[2,27],125:[2,27],126:[2,27],129:[2,27],130:[2,27],131:[2,27],132:[2,27],133:[2,27],134:[2,27]},{1:[2,28],6:[2,28],25:[2,28],26:[2,28],41:[2,28],47:[2,28],52:[2,28],55:[2,28],64:[2,28],65:[2,28],66:[2,28],68:[2,28],70:[2,28],71:[2,28],75:[2,28],81:[2,28],82:[2,28],83:[2,28],88:[2,28],90:[2,28],99:[2,28],101:[2,28],102:[2,28],103:[2,28],107:[2,28],115:[2,28],123:[2,28],125:[2,28],126:[2,28],129:[2,28],130:[2,28],131:[2,28],132:[2,28],133:[2,28],134:[2,28]},{1:[2,26],6:[2,26],25:[2,26],26:[2,26],38:[2,26],41:[2,26],47:[2,26],52:[2,26],55:[2,26],64:[2,26],65:[2,26],66:[2,26],68:[2,26],70:[2,26],71:[2,26],75:[2,26],77:[2,26],81:[2,26],82:[2,26],83:[2,26],88:[2,26],90:[2,26],99:[2,26],101:[2,26],102:[2,26],103:[2,26],107:[2,26],113:[2,26],114:[2,26],115:[2,26],123:[2,26],125:[2,26],126:[2,26],127:[2,26],128:[2,26],129:[2,26],130:[2,26],131:[2,26],132:[2,26],133:[2,26],134:[2,26],135:[2,26]},{1:[2,6],6:[2,6],7:169,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,26:[2,6],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],99:[2,6],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,3]},{1:[2,24],6:[2,24],25:[2,24],26:[2,24],47:[2,24],52:[2,24],55:[2,24],70:[2,24],75:[2,24],83:[2,24],88:[2,24],90:[2,24],95:[2,24],96:[2,24],99:[2,24],101:[2,24],102:[2,24],103:[2,24],107:[2,24],115:[2,24],118:[2,24],120:[2,24],123:[2,24],125:[2,24],126:[2,24],129:[2,24],130:[2,24],131:[2,24],132:[2,24],133:[2,24],134:[2,24]},{6:[1,72],26:[1,170]},{1:[2,186],6:[2,186],25:[2,186],26:[2,186],47:[2,186],52:[2,186],55:[2,186],70:[2,186],75:[2,186],83:[2,186],88:[2,186],90:[2,186],99:[2,186],101:[2,186],102:[2,186],103:[2,186],107:[2,186],115:[2,186],123:[2,186],125:[2,186],126:[2,186],129:[2,186],130:[2,186],131:[2,186],132:[2,186],133:[2,186],134:[2,186]},{8:171,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:172,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:173,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:174,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:175,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:176,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:177,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:178,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,142],6:[2,142],25:[2,142],26:[2,142],47:[2,142],52:[2,142],55:[2,142],70:[2,142],75:[2,142],83:[2,142],88:[2,142],90:[2,142],99:[2,142],101:[2,142],102:[2,142],103:[2,142],107:[2,142],115:[2,142],123:[2,142],125:[2,142],126:[2,142],129:[2,142],130:[2,142],131:[2,142],132:[2,142],133:[2,142],134:[2,142]},{1:[2,147],6:[2,147],25:[2,147],26:[2,147],47:[2,147],52:[2,147],55:[2,147],70:[2,147],75:[2,147],83:[2,147],88:[2,147],90:[2,147],99:[2,147],101:[2,147],102:[2,147],103:[2,147],107:[2,147],115:[2,147],123:[2,147],125:[2,147],126:[2,147],129:[2,147],130:[2,147],131:[2,147],132:[2,147],133:[2,147],134:[2,147]},{8:179,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,141],6:[2,141],25:[2,141],26:[2,141],47:[2,141],52:[2,141],55:[2,141],70:[2,141],75:[2,141],83:[2,141],88:[2,141],90:[2,141],99:[2,141],101:[2,141],102:[2,141],103:[2,141],107:[2,141],115:[2,141],123:[2,141],125:[2,141],126:[2,141],129:[2,141],130:[2,141],131:[2,141],132:[2,141],133:[2,141],134:[2,141]},{1:[2,146],6:[2,146],25:[2,146],26:[2,146],47:[2,146],52:[2,146],55:[2,146],70:[2,146],75:[2,146],83:[2,146],88:[2,146],90:[2,146],99:[2,146],101:[2,146],102:[2,146],103:[2,146],107:[2,146],115:[2,146],123:[2,146],125:[2,146],126:[2,146],129:[2,146],130:[2,146],131:[2,146],132:[2,146],133:[2,146],134:[2,146]},{79:180,82:[1,103]},{1:[2,65],6:[2,65],25:[2,65],26:[2,65],38:[2,65],47:[2,65],52:[2,65],55:[2,65],64:[2,65],65:[2,65],66:[2,65],68:[2,65],70:[2,65],71:[2,65],75:[2,65],77:[2,65],81:[2,65],82:[2,65],83:[2,65],88:[2,65],90:[2,65],99:[2,65],101:[2,65],102:[2,65],103:[2,65],107:[2,65],115:[2,65],123:[2,65],125:[2,65],126:[2,65],127:[2,65],128:[2,65],129:[2,65],130:[2,65],131:[2,65],132:[2,65],133:[2,65],134:[2,65],135:[2,65]},{82:[2,104]},{27:181,28:[1,71]},{27:182,28:[1,71]},{1:[2,79],6:[2,79],25:[2,79],26:[2,79],27:183,28:[1,71],38:[2,79],47:[2,79],52:[2,79],55:[2,79],64:[2,79],65:[2,79],66:[2,79],68:[2,79],70:[2,79],71:[2,79],75:[2,79],77:[2,79],81:[2,79],82:[2,79],83:[2,79],88:[2,79],90:[2,79],99:[2,79],101:[2,79],102:[2,79],103:[2,79],107:[2,79],115:[2,79],123:[2,79],125:[2,79],126:[2,79],127:[2,79],128:[2,79],129:[2,79],130:[2,79],131:[2,79],132:[2,79],133:[2,79],134:[2,79],135:[2,79]},{1:[2,80],6:[2,80],25:[2,80],26:[2,80],38:[2,80],47:[2,80],52:[2,80],55:[2,80],64:[2,80],65:[2,80],66:[2,80],68:[2,80],70:[2,80],71:[2,80],75:[2,80],77:[2,80],81:[2,80],82:[2,80],83:[2,80],88:[2,80],90:[2,80],99:[2,80],101:[2,80],102:[2,80],103:[2,80],107:[2,80],115:[2,80],123:[2,80],125:[2,80],126:[2,80],127:[2,80],128:[2,80],129:[2,80],130:[2,80],131:[2,80],132:[2,80],133:[2,80],134:[2,80],135:[2,80]},{8:185,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],55:[1,189],56:47,57:48,59:36,61:25,62:26,63:27,69:184,72:186,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],89:187,90:[1,188],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{67:190,68:[1,97],71:[1,98]},{79:191,82:[1,103]},{1:[2,66],6:[2,66],25:[2,66],26:[2,66],38:[2,66],47:[2,66],52:[2,66],55:[2,66],64:[2,66],65:[2,66],66:[2,66],68:[2,66],70:[2,66],71:[2,66],75:[2,66],77:[2,66],81:[2,66],82:[2,66],83:[2,66],88:[2,66],90:[2,66],99:[2,66],101:[2,66],102:[2,66],103:[2,66],107:[2,66],115:[2,66],123:[2,66],125:[2,66],126:[2,66],127:[2,66],128:[2,66],129:[2,66],130:[2,66],131:[2,66],132:[2,66],133:[2,66],134:[2,66],135:[2,66]},{6:[1,193],8:192,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,194],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,102],6:[2,102],25:[2,102],26:[2,102],47:[2,102],52:[2,102],55:[2,102],64:[2,102],65:[2,102],66:[2,102],68:[2,102],70:[2,102],71:[2,102],75:[2,102],81:[2,102],82:[2,102],83:[2,102],88:[2,102],90:[2,102],99:[2,102],101:[2,102],102:[2,102],103:[2,102],107:[2,102],115:[2,102],123:[2,102],125:[2,102],126:[2,102],129:[2,102],130:[2,102],131:[2,102],132:[2,102],133:[2,102],134:[2,102]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],83:[1,195],84:196,85:[1,56],86:[1,57],87:[1,55],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{47:[1,198],52:[1,199]},{47:[2,54],52:[2,54]},{38:[1,201],47:[2,56],52:[2,56],55:[1,200]},{38:[2,59],47:[2,59],52:[2,59],55:[2,59]},{38:[2,60],47:[2,60],52:[2,60],55:[2,60]},{38:[2,61],47:[2,61],52:[2,61],55:[2,61]},{38:[2,62],47:[2,62],52:[2,62],55:[2,62]},{27:146,28:[1,71]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:142,85:[1,56],86:[1,57],87:[1,55],88:[1,141],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,48],6:[2,48],25:[2,48],26:[2,48],47:[2,48],52:[2,48],55:[2,48],70:[2,48],75:[2,48],83:[2,48],88:[2,48],90:[2,48],99:[2,48],101:[2,48],102:[2,48],103:[2,48],107:[2,48],115:[2,48],123:[2,48],125:[2,48],126:[2,48],129:[2,48],130:[2,48],131:[2,48],132:[2,48],133:[2,48],134:[2,48]},{1:[2,179],6:[2,179],25:[2,179],26:[2,179],47:[2,179],52:[2,179],55:[2,179],70:[2,179],75:[2,179],83:[2,179],88:[2,179],90:[2,179],99:[2,179],100:85,101:[2,179],102:[2,179],103:[2,179],106:86,107:[2,179],108:67,115:[2,179],123:[2,179],125:[2,179],126:[2,179],129:[1,76],130:[2,179],131:[2,179],132:[2,179],133:[2,179],134:[2,179]},{100:88,101:[1,63],103:[1,64],106:89,107:[1,66],108:67,123:[1,87]},{1:[2,180],6:[2,180],25:[2,180],26:[2,180],47:[2,180],52:[2,180],55:[2,180],70:[2,180],75:[2,180],83:[2,180],88:[2,180],90:[2,180],99:[2,180],100:85,101:[2,180],102:[2,180],103:[2,180],106:86,107:[2,180],108:67,115:[2,180],123:[2,180],125:[2,180],126:[2,180],129:[1,76],130:[2,180],131:[2,180],132:[2,180],133:[2,180],134:[2,180]},{1:[2,181],6:[2,181],25:[2,181],26:[2,181],47:[2,181],52:[2,181],55:[2,181],70:[2,181],75:[2,181],83:[2,181],88:[2,181],90:[2,181],99:[2,181],100:85,101:[2,181],102:[2,181],103:[2,181],106:86,107:[2,181],108:67,115:[2,181],123:[2,181],125:[2,181],126:[2,181],129:[1,76],130:[2,181],131:[2,181],132:[2,181],133:[2,181],134:[2,181]},{1:[2,182],6:[2,182],25:[2,182],26:[2,182],47:[2,182],52:[2,182],55:[2,182],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,182],71:[2,68],75:[2,182],81:[2,68],82:[2,68],83:[2,182],88:[2,182],90:[2,182],99:[2,182],101:[2,182],102:[2,182],103:[2,182],107:[2,182],115:[2,182],123:[2,182],125:[2,182],126:[2,182],129:[2,182],130:[2,182],131:[2,182],132:[2,182],133:[2,182],134:[2,182]},{60:91,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],71:[1,98],78:90,81:[1,92],82:[2,103]},{60:100,64:[1,93],65:[1,94],66:[1,95],67:96,68:[1,97],71:[1,98],78:99,81:[1,92],82:[2,103]},{64:[2,71],65:[2,71],66:[2,71],68:[2,71],71:[2,71],81:[2,71],82:[2,71]},{1:[2,183],6:[2,183],25:[2,183],26:[2,183],47:[2,183],52:[2,183],55:[2,183],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,183],71:[2,68],75:[2,183],81:[2,68],82:[2,68],83:[2,183],88:[2,183],90:[2,183],99:[2,183],101:[2,183],102:[2,183],103:[2,183],107:[2,183],115:[2,183],123:[2,183],125:[2,183],126:[2,183],129:[2,183],130:[2,183],131:[2,183],132:[2,183],133:[2,183],134:[2,183]},{1:[2,184],6:[2,184],25:[2,184],26:[2,184],47:[2,184],52:[2,184],55:[2,184],70:[2,184],75:[2,184],83:[2,184],88:[2,184],90:[2,184],99:[2,184],101:[2,184],102:[2,184],103:[2,184],107:[2,184],115:[2,184],123:[2,184],125:[2,184],126:[2,184],129:[2,184],130:[2,184],131:[2,184],132:[2,184],133:[2,184],134:[2,184]},{1:[2,185],6:[2,185],25:[2,185],26:[2,185],47:[2,185],52:[2,185],55:[2,185],70:[2,185],75:[2,185],83:[2,185],88:[2,185],90:[2,185],99:[2,185],101:[2,185],102:[2,185],103:[2,185],107:[2,185],115:[2,185],123:[2,185],125:[2,185],126:[2,185],129:[2,185],130:[2,185],131:[2,185],132:[2,185],133:[2,185],134:[2,185]},{8:202,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,203],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:204,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{5:205,25:[1,5],122:[1,206]},{1:[2,128],6:[2,128],25:[2,128],26:[2,128],47:[2,128],52:[2,128],55:[2,128],70:[2,128],75:[2,128],83:[2,128],88:[2,128],90:[2,128],94:207,95:[1,208],96:[1,209],99:[2,128],101:[2,128],102:[2,128],103:[2,128],107:[2,128],115:[2,128],123:[2,128],125:[2,128],126:[2,128],129:[2,128],130:[2,128],131:[2,128],132:[2,128],133:[2,128],134:[2,128]},{1:[2,140],6:[2,140],25:[2,140],26:[2,140],47:[2,140],52:[2,140],55:[2,140],70:[2,140],75:[2,140],83:[2,140],88:[2,140],90:[2,140],99:[2,140],101:[2,140],102:[2,140],103:[2,140],107:[2,140],115:[2,140],123:[2,140],125:[2,140],126:[2,140],129:[2,140],130:[2,140],131:[2,140],132:[2,140],133:[2,140],134:[2,140]},{1:[2,148],6:[2,148],25:[2,148],26:[2,148],47:[2,148],52:[2,148],55:[2,148],70:[2,148],75:[2,148],83:[2,148],88:[2,148],90:[2,148],99:[2,148],101:[2,148],102:[2,148],103:[2,148],107:[2,148],115:[2,148],123:[2,148],125:[2,148],126:[2,148],129:[2,148],130:[2,148],131:[2,148],132:[2,148],133:[2,148],134:[2,148]},{25:[1,210],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{117:211,119:212,120:[1,213]},{1:[2,92],6:[2,92],25:[2,92],26:[2,92],47:[2,92],52:[2,92],55:[2,92],70:[2,92],75:[2,92],83:[2,92],88:[2,92],90:[2,92],99:[2,92],101:[2,92],102:[2,92],103:[2,92],107:[2,92],115:[2,92],123:[2,92],125:[2,92],126:[2,92],129:[2,92],130:[2,92],131:[2,92],132:[2,92],133:[2,92],134:[2,92]},{8:214,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,95],5:215,6:[2,95],25:[1,5],26:[2,95],47:[2,95],52:[2,95],55:[2,95],64:[2,68],65:[2,68],66:[2,68],68:[2,68],70:[2,95],71:[2,68],75:[2,95],77:[1,216],81:[2,68],82:[2,68],83:[2,95],88:[2,95],90:[2,95],99:[2,95],101:[2,95],102:[2,95],103:[2,95],107:[2,95],115:[2,95],123:[2,95],125:[2,95],126:[2,95],129:[2,95],130:[2,95],131:[2,95],132:[2,95],133:[2,95],134:[2,95]},{1:[2,133],6:[2,133],25:[2,133],26:[2,133],47:[2,133],52:[2,133],55:[2,133],70:[2,133],75:[2,133],83:[2,133],88:[2,133],90:[2,133],99:[2,133],100:85,101:[2,133],102:[2,133],103:[2,133],106:86,107:[2,133],108:67,115:[2,133],123:[2,133],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,44],6:[2,44],26:[2,44],99:[2,44],100:85,101:[2,44],103:[2,44],106:86,107:[2,44],108:67,123:[2,44],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,72],99:[1,217]},{4:218,7:4,8:6,9:7,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,124],25:[2,124],52:[2,124],55:[1,220],88:[2,124],89:219,90:[1,188],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,110],6:[2,110],25:[2,110],26:[2,110],38:[2,110],47:[2,110],52:[2,110],55:[2,110],64:[2,110],65:[2,110],66:[2,110],68:[2,110],70:[2,110],71:[2,110],75:[2,110],81:[2,110],82:[2,110],83:[2,110],88:[2,110],90:[2,110],99:[2,110],101:[2,110],102:[2,110],103:[2,110],107:[2,110],113:[2,110],114:[2,110],115:[2,110],123:[2,110],125:[2,110],126:[2,110],129:[2,110],130:[2,110],131:[2,110],132:[2,110],133:[2,110],134:[2,110]},{6:[2,51],25:[2,51],51:221,52:[1,222],88:[2,51]},{6:[2,119],25:[2,119],26:[2,119],52:[2,119],83:[2,119],88:[2,119]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:223,85:[1,56],86:[1,57],87:[1,55],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,125],25:[2,125],26:[2,125],52:[2,125],83:[2,125],88:[2,125]},{1:[2,109],6:[2,109],25:[2,109],26:[2,109],38:[2,109],41:[2,109],47:[2,109],52:[2,109],55:[2,109],64:[2,109],65:[2,109],66:[2,109],68:[2,109],70:[2,109],71:[2,109],75:[2,109],77:[2,109],81:[2,109],82:[2,109],83:[2,109],88:[2,109],90:[2,109],99:[2,109],101:[2,109],102:[2,109],103:[2,109],107:[2,109],115:[2,109],123:[2,109],125:[2,109],126:[2,109],127:[2,109],128:[2,109],129:[2,109],130:[2,109],131:[2,109],132:[2,109],133:[2,109],134:[2,109],135:[2,109]},{5:224,25:[1,5],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,136],6:[2,136],25:[2,136],26:[2,136],47:[2,136],52:[2,136],55:[2,136],70:[2,136],75:[2,136],83:[2,136],88:[2,136],90:[2,136],99:[2,136],100:85,101:[1,63],102:[1,225],103:[1,64],106:86,107:[1,66],108:67,115:[2,136],123:[2,136],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,138],6:[2,138],25:[2,138],26:[2,138],47:[2,138],52:[2,138],55:[2,138],70:[2,138],75:[2,138],83:[2,138],88:[2,138],90:[2,138],99:[2,138],100:85,101:[1,63],102:[1,226],103:[1,64],106:86,107:[1,66],108:67,115:[2,138],123:[2,138],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,144],6:[2,144],25:[2,144],26:[2,144],47:[2,144],52:[2,144],55:[2,144],70:[2,144],75:[2,144],83:[2,144],88:[2,144],90:[2,144],99:[2,144],101:[2,144],102:[2,144],103:[2,144],107:[2,144],115:[2,144],123:[2,144],125:[2,144],126:[2,144],129:[2,144],130:[2,144],131:[2,144],132:[2,144],133:[2,144],134:[2,144]},{1:[2,145],6:[2,145],25:[2,145],26:[2,145],47:[2,145],52:[2,145],55:[2,145],70:[2,145],75:[2,145],83:[2,145],88:[2,145],90:[2,145],99:[2,145],100:85,101:[1,63],102:[2,145],103:[1,64],106:86,107:[1,66],108:67,115:[2,145],123:[2,145],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,149],6:[2,149],25:[2,149],26:[2,149],47:[2,149],52:[2,149],55:[2,149],70:[2,149],75:[2,149],83:[2,149],88:[2,149],90:[2,149],99:[2,149],101:[2,149],102:[2,149],103:[2,149],107:[2,149],115:[2,149],123:[2,149],125:[2,149],126:[2,149],129:[2,149],130:[2,149],131:[2,149],132:[2,149],133:[2,149],134:[2,149]},{113:[2,151],114:[2,151]},{27:156,28:[1,71],56:157,57:158,73:[1,68],87:[1,112],110:227,112:155},{52:[1,228],113:[2,156],114:[2,156]},{52:[2,153],113:[2,153],114:[2,153]},{52:[2,154],113:[2,154],114:[2,154]},{52:[2,155],113:[2,155],114:[2,155]},{1:[2,150],6:[2,150],25:[2,150],26:[2,150],47:[2,150],52:[2,150],55:[2,150],70:[2,150],75:[2,150],83:[2,150],88:[2,150],90:[2,150],99:[2,150],101:[2,150],102:[2,150],103:[2,150],107:[2,150],115:[2,150],123:[2,150],125:[2,150],126:[2,150],129:[2,150],130:[2,150],131:[2,150],132:[2,150],133:[2,150],134:[2,150]},{8:229,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:230,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,51],25:[2,51],51:231,52:[1,232],75:[2,51]},{6:[2,87],25:[2,87],26:[2,87],52:[2,87],75:[2,87]},{6:[2,37],25:[2,37],26:[2,37],41:[1,233],52:[2,37],75:[2,37]},{6:[2,40],25:[2,40],26:[2,40],52:[2,40],75:[2,40]},{6:[2,41],25:[2,41],26:[2,41],41:[2,41],52:[2,41],75:[2,41]},{6:[2,42],25:[2,42],26:[2,42],41:[2,42],52:[2,42],75:[2,42]},{6:[2,43],25:[2,43],26:[2,43],41:[2,43],52:[2,43],75:[2,43]},{1:[2,5],6:[2,5],26:[2,5],99:[2,5]},{1:[2,25],6:[2,25],25:[2,25],26:[2,25],47:[2,25],52:[2,25],55:[2,25],70:[2,25],75:[2,25],83:[2,25],88:[2,25],90:[2,25],95:[2,25],96:[2,25],99:[2,25],101:[2,25],102:[2,25],103:[2,25],107:[2,25],115:[2,25],118:[2,25],120:[2,25],123:[2,25],125:[2,25],126:[2,25],129:[2,25],130:[2,25],131:[2,25],132:[2,25],133:[2,25],134:[2,25]},{1:[2,187],6:[2,187],25:[2,187],26:[2,187],47:[2,187],52:[2,187],55:[2,187],70:[2,187],75:[2,187],83:[2,187],88:[2,187],90:[2,187],99:[2,187],100:85,101:[2,187],102:[2,187],103:[2,187],106:86,107:[2,187],108:67,115:[2,187],123:[2,187],125:[2,187],126:[2,187],129:[1,76],130:[1,79],131:[2,187],132:[2,187],133:[2,187],134:[2,187]},{1:[2,188],6:[2,188],25:[2,188],26:[2,188],47:[2,188],52:[2,188],55:[2,188],70:[2,188],75:[2,188],83:[2,188],88:[2,188],90:[2,188],99:[2,188],100:85,101:[2,188],102:[2,188],103:[2,188],106:86,107:[2,188],108:67,115:[2,188],123:[2,188],125:[2,188],126:[2,188],129:[1,76],130:[1,79],131:[2,188],132:[2,188],133:[2,188],134:[2,188]},{1:[2,189],6:[2,189],25:[2,189],26:[2,189],47:[2,189],52:[2,189],55:[2,189],70:[2,189],75:[2,189],83:[2,189],88:[2,189],90:[2,189],99:[2,189],100:85,101:[2,189],102:[2,189],103:[2,189],106:86,107:[2,189],108:67,115:[2,189],123:[2,189],125:[2,189],126:[2,189],129:[1,76],130:[2,189],131:[2,189],132:[2,189],133:[2,189],134:[2,189]},{1:[2,190],6:[2,190],25:[2,190],26:[2,190],47:[2,190],52:[2,190],55:[2,190],70:[2,190],75:[2,190],83:[2,190],88:[2,190],90:[2,190],99:[2,190],100:85,101:[2,190],102:[2,190],103:[2,190],106:86,107:[2,190],108:67,115:[2,190],123:[2,190],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[2,190],132:[2,190],133:[2,190],134:[2,190]},{1:[2,191],6:[2,191],25:[2,191],26:[2,191],47:[2,191],52:[2,191],55:[2,191],70:[2,191],75:[2,191],83:[2,191],88:[2,191],90:[2,191],99:[2,191],100:85,101:[2,191],102:[2,191],103:[2,191],106:86,107:[2,191],108:67,115:[2,191],123:[2,191],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[2,191],133:[2,191],134:[1,83]},{1:[2,192],6:[2,192],25:[2,192],26:[2,192],47:[2,192],52:[2,192],55:[2,192],70:[2,192],75:[2,192],83:[2,192],88:[2,192],90:[2,192],99:[2,192],100:85,101:[2,192],102:[2,192],103:[2,192],106:86,107:[2,192],108:67,115:[2,192],123:[2,192],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[2,192],134:[1,83]},{1:[2,193],6:[2,193],25:[2,193],26:[2,193],47:[2,193],52:[2,193],55:[2,193],70:[2,193],75:[2,193],83:[2,193],88:[2,193],90:[2,193],99:[2,193],100:85,101:[2,193],102:[2,193],103:[2,193],106:86,107:[2,193],108:67,115:[2,193],123:[2,193],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[2,193],133:[2,193],134:[2,193]},{1:[2,178],6:[2,178],25:[2,178],26:[2,178],47:[2,178],52:[2,178],55:[2,178],70:[2,178],75:[2,178],83:[2,178],88:[2,178],90:[2,178],99:[2,178],100:85,101:[1,63],102:[2,178],103:[1,64],106:86,107:[1,66],108:67,115:[2,178],123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,177],6:[2,177],25:[2,177],26:[2,177],47:[2,177],52:[2,177],55:[2,177],70:[2,177],75:[2,177],83:[2,177],88:[2,177],90:[2,177],99:[2,177],100:85,101:[1,63],102:[2,177],103:[1,64],106:86,107:[1,66],108:67,115:[2,177],123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,99],6:[2,99],25:[2,99],26:[2,99],47:[2,99],52:[2,99],55:[2,99],64:[2,99],65:[2,99],66:[2,99],68:[2,99],70:[2,99],71:[2,99],75:[2,99],81:[2,99],82:[2,99],83:[2,99],88:[2,99],90:[2,99],99:[2,99],101:[2,99],102:[2,99],103:[2,99],107:[2,99],115:[2,99],123:[2,99],125:[2,99],126:[2,99],129:[2,99],130:[2,99],131:[2,99],132:[2,99],133:[2,99],134:[2,99]},{1:[2,76],6:[2,76],25:[2,76],26:[2,76],38:[2,76],47:[2,76],52:[2,76],55:[2,76],64:[2,76],65:[2,76],66:[2,76],68:[2,76],70:[2,76],71:[2,76],75:[2,76],77:[2,76],81:[2,76],82:[2,76],83:[2,76],88:[2,76],90:[2,76],99:[2,76],101:[2,76],102:[2,76],103:[2,76],107:[2,76],115:[2,76],123:[2,76],125:[2,76],126:[2,76],127:[2,76],128:[2,76],129:[2,76],130:[2,76],131:[2,76],132:[2,76],133:[2,76],134:[2,76],135:[2,76]},{1:[2,77],6:[2,77],25:[2,77],26:[2,77],38:[2,77],47:[2,77],52:[2,77],55:[2,77],64:[2,77],65:[2,77],66:[2,77],68:[2,77],70:[2,77],71:[2,77],75:[2,77],77:[2,77],81:[2,77],82:[2,77],83:[2,77],88:[2,77],90:[2,77],99:[2,77],101:[2,77],102:[2,77],103:[2,77],107:[2,77],115:[2,77],123:[2,77],125:[2,77],126:[2,77],127:[2,77],128:[2,77],129:[2,77],130:[2,77],131:[2,77],132:[2,77],133:[2,77],134:[2,77],135:[2,77]},{1:[2,78],6:[2,78],25:[2,78],26:[2,78],38:[2,78],47:[2,78],52:[2,78],55:[2,78],64:[2,78],65:[2,78],66:[2,78],68:[2,78],70:[2,78],71:[2,78],75:[2,78],77:[2,78],81:[2,78],82:[2,78],83:[2,78],88:[2,78],90:[2,78],99:[2,78],101:[2,78],102:[2,78],103:[2,78],107:[2,78],115:[2,78],123:[2,78],125:[2,78],126:[2,78],127:[2,78],128:[2,78],129:[2,78],130:[2,78],131:[2,78],132:[2,78],133:[2,78],134:[2,78],135:[2,78]},{70:[1,234]},{55:[1,189],70:[2,83],89:235,90:[1,188],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{70:[2,84]},{8:236,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,70:[2,118],73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{12:[2,112],28:[2,112],30:[2,112],31:[2,112],33:[2,112],34:[2,112],35:[2,112],36:[2,112],43:[2,112],44:[2,112],45:[2,112],49:[2,112],50:[2,112],70:[2,112],73:[2,112],76:[2,112],80:[2,112],85:[2,112],86:[2,112],87:[2,112],93:[2,112],97:[2,112],98:[2,112],101:[2,112],103:[2,112],105:[2,112],107:[2,112],116:[2,112],122:[2,112],124:[2,112],125:[2,112],126:[2,112],127:[2,112],128:[2,112]},{12:[2,113],28:[2,113],30:[2,113],31:[2,113],33:[2,113],34:[2,113],35:[2,113],36:[2,113],43:[2,113],44:[2,113],45:[2,113],49:[2,113],50:[2,113],70:[2,113],73:[2,113],76:[2,113],80:[2,113],85:[2,113],86:[2,113],87:[2,113],93:[2,113],97:[2,113],98:[2,113],101:[2,113],103:[2,113],105:[2,113],107:[2,113],116:[2,113],122:[2,113],124:[2,113],125:[2,113],126:[2,113],127:[2,113],128:[2,113]},{1:[2,82],6:[2,82],25:[2,82],26:[2,82],38:[2,82],47:[2,82],52:[2,82],55:[2,82],64:[2,82],65:[2,82],66:[2,82],68:[2,82],70:[2,82],71:[2,82],75:[2,82],77:[2,82],81:[2,82],82:[2,82],83:[2,82],88:[2,82],90:[2,82],99:[2,82],101:[2,82],102:[2,82],103:[2,82],107:[2,82],115:[2,82],123:[2,82],125:[2,82],126:[2,82],127:[2,82],128:[2,82],129:[2,82],130:[2,82],131:[2,82],132:[2,82],133:[2,82],134:[2,82],135:[2,82]},{1:[2,100],6:[2,100],25:[2,100],26:[2,100],47:[2,100],52:[2,100],55:[2,100],64:[2,100],65:[2,100],66:[2,100],68:[2,100],70:[2,100],71:[2,100],75:[2,100],81:[2,100],82:[2,100],83:[2,100],88:[2,100],90:[2,100],99:[2,100],101:[2,100],102:[2,100],103:[2,100],107:[2,100],115:[2,100],123:[2,100],125:[2,100],126:[2,100],129:[2,100],130:[2,100],131:[2,100],132:[2,100],133:[2,100],134:[2,100]},{1:[2,34],6:[2,34],25:[2,34],26:[2,34],47:[2,34],52:[2,34],55:[2,34],70:[2,34],75:[2,34],83:[2,34],88:[2,34],90:[2,34],99:[2,34],100:85,101:[2,34],102:[2,34],103:[2,34],106:86,107:[2,34],108:67,115:[2,34],123:[2,34],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{8:237,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:238,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,105],6:[2,105],25:[2,105],26:[2,105],47:[2,105],52:[2,105],55:[2,105],64:[2,105],65:[2,105],66:[2,105],68:[2,105],70:[2,105],71:[2,105],75:[2,105],81:[2,105],82:[2,105],83:[2,105],88:[2,105],90:[2,105],99:[2,105],101:[2,105],102:[2,105],103:[2,105],107:[2,105],115:[2,105],123:[2,105],125:[2,105],126:[2,105],129:[2,105],130:[2,105],131:[2,105],132:[2,105],133:[2,105],134:[2,105]},{6:[2,51],25:[2,51],51:239,52:[1,222],83:[2,51]},{6:[2,124],25:[2,124],26:[2,124],52:[2,124],55:[1,240],83:[2,124],88:[2,124],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{48:241,49:[1,58],50:[1,59]},{27:107,28:[1,71],42:108,53:242,54:106,56:109,57:110,73:[1,68],86:[1,111],87:[1,112]},{47:[2,57],52:[2,57]},{8:243,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,194],6:[2,194],25:[2,194],26:[2,194],47:[2,194],52:[2,194],55:[2,194],70:[2,194],75:[2,194],83:[2,194],88:[2,194],90:[2,194],99:[2,194],100:85,101:[2,194],102:[2,194],103:[2,194],106:86,107:[2,194],108:67,115:[2,194],123:[2,194],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{8:244,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,196],6:[2,196],25:[2,196],26:[2,196],47:[2,196],52:[2,196],55:[2,196],70:[2,196],75:[2,196],83:[2,196],88:[2,196],90:[2,196],99:[2,196],100:85,101:[2,196],102:[2,196],103:[2,196],106:86,107:[2,196],108:67,115:[2,196],123:[2,196],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,176],6:[2,176],25:[2,176],26:[2,176],47:[2,176],52:[2,176],55:[2,176],70:[2,176],75:[2,176],83:[2,176],88:[2,176],90:[2,176],99:[2,176],101:[2,176],102:[2,176],103:[2,176],107:[2,176],115:[2,176],123:[2,176],125:[2,176],126:[2,176],129:[2,176],130:[2,176],131:[2,176],132:[2,176],133:[2,176],134:[2,176]},{8:245,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,129],6:[2,129],25:[2,129],26:[2,129],47:[2,129],52:[2,129],55:[2,129],70:[2,129],75:[2,129],83:[2,129],88:[2,129],90:[2,129],95:[1,246],99:[2,129],101:[2,129],102:[2,129],103:[2,129],107:[2,129],115:[2,129],123:[2,129],125:[2,129],126:[2,129],129:[2,129],130:[2,129],131:[2,129],132:[2,129],133:[2,129],134:[2,129]},{5:247,25:[1,5]},{27:248,28:[1,71]},{117:249,119:212,120:[1,213]},{26:[1,250],118:[1,251],119:252,120:[1,213]},{26:[2,169],118:[2,169],120:[2,169]},{8:254,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],92:253,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,93],5:255,6:[2,93],25:[1,5],26:[2,93],47:[2,93],52:[2,93],55:[2,93],70:[2,93],75:[2,93],83:[2,93],88:[2,93],90:[2,93],99:[2,93],100:85,101:[1,63],102:[2,93],103:[1,64],106:86,107:[1,66],108:67,115:[2,93],123:[2,93],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,96],6:[2,96],25:[2,96],26:[2,96],47:[2,96],52:[2,96],55:[2,96],70:[2,96],75:[2,96],83:[2,96],88:[2,96],90:[2,96],99:[2,96],101:[2,96],102:[2,96],103:[2,96],107:[2,96],115:[2,96],123:[2,96],125:[2,96],126:[2,96],129:[2,96],130:[2,96],131:[2,96],132:[2,96],133:[2,96],134:[2,96]},{8:256,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,134],6:[2,134],25:[2,134],26:[2,134],47:[2,134],52:[2,134],55:[2,134],64:[2,134],65:[2,134],66:[2,134],68:[2,134],70:[2,134],71:[2,134],75:[2,134],81:[2,134],82:[2,134],83:[2,134],88:[2,134],90:[2,134],99:[2,134],101:[2,134],102:[2,134],103:[2,134],107:[2,134],115:[2,134],123:[2,134],125:[2,134],126:[2,134],129:[2,134],130:[2,134],131:[2,134],132:[2,134],133:[2,134],134:[2,134]},{6:[1,72],26:[1,257]},{8:258,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,63],12:[2,113],25:[2,63],28:[2,113],30:[2,113],31:[2,113],33:[2,113],34:[2,113],35:[2,113],36:[2,113],43:[2,113],44:[2,113],45:[2,113],49:[2,113],50:[2,113],52:[2,63],73:[2,113],76:[2,113],80:[2,113],85:[2,113],86:[2,113],87:[2,113],88:[2,63],93:[2,113],97:[2,113],98:[2,113],101:[2,113],103:[2,113],105:[2,113],107:[2,113],116:[2,113],122:[2,113],124:[2,113],125:[2,113],126:[2,113],127:[2,113],128:[2,113]},{6:[1,260],25:[1,261],88:[1,259]},{6:[2,52],8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[2,52],26:[2,52],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],83:[2,52],85:[1,56],86:[1,57],87:[1,55],88:[2,52],91:262,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,51],25:[2,51],26:[2,51],51:263,52:[1,222]},{1:[2,173],6:[2,173],25:[2,173],26:[2,173],47:[2,173],52:[2,173],55:[2,173],70:[2,173],75:[2,173],83:[2,173],88:[2,173],90:[2,173],99:[2,173],101:[2,173],102:[2,173],103:[2,173],107:[2,173],115:[2,173],118:[2,173],123:[2,173],125:[2,173],126:[2,173],129:[2,173],130:[2,173],131:[2,173],132:[2,173],133:[2,173],134:[2,173]},{8:264,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:265,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{113:[2,152],114:[2,152]},{27:156,28:[1,71],56:157,57:158,73:[1,68],87:[1,112],112:266},{1:[2,158],6:[2,158],25:[2,158],26:[2,158],47:[2,158],52:[2,158],55:[2,158],70:[2,158],75:[2,158],83:[2,158],88:[2,158],90:[2,158],99:[2,158],100:85,101:[2,158],102:[1,267],103:[2,158],106:86,107:[2,158],108:67,115:[1,268],123:[2,158],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,159],6:[2,159],25:[2,159],26:[2,159],47:[2,159],52:[2,159],55:[2,159],70:[2,159],75:[2,159],83:[2,159],88:[2,159],90:[2,159],99:[2,159],100:85,101:[2,159],102:[1,269],103:[2,159],106:86,107:[2,159],108:67,115:[2,159],123:[2,159],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,271],25:[1,272],75:[1,270]},{6:[2,52],11:165,25:[2,52],26:[2,52],27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:273,40:164,42:168,44:[1,46],75:[2,52],86:[1,111]},{8:274,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,275],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,81],6:[2,81],25:[2,81],26:[2,81],38:[2,81],47:[2,81],52:[2,81],55:[2,81],64:[2,81],65:[2,81],66:[2,81],68:[2,81],70:[2,81],71:[2,81],75:[2,81],77:[2,81],81:[2,81],82:[2,81],83:[2,81],88:[2,81],90:[2,81],99:[2,81],101:[2,81],102:[2,81],103:[2,81],107:[2,81],115:[2,81],123:[2,81],125:[2,81],126:[2,81],127:[2,81],128:[2,81],129:[2,81],130:[2,81],131:[2,81],132:[2,81],133:[2,81],134:[2,81],135:[2,81]},{8:276,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,70:[2,116],73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{70:[2,117],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,35],6:[2,35],25:[2,35],26:[2,35],47:[2,35],52:[2,35],55:[2,35],70:[2,35],75:[2,35],83:[2,35],88:[2,35],90:[2,35],99:[2,35],100:85,101:[2,35],102:[2,35],103:[2,35],106:86,107:[2,35],108:67,115:[2,35],123:[2,35],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{26:[1,277],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,260],25:[1,261],83:[1,278]},{6:[2,63],25:[2,63],26:[2,63],52:[2,63],83:[2,63],88:[2,63]},{5:279,25:[1,5]},{47:[2,55],52:[2,55]},{47:[2,58],52:[2,58],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{26:[1,280],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{5:281,25:[1,5],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{5:282,25:[1,5]},{1:[2,130],6:[2,130],25:[2,130],26:[2,130],47:[2,130],52:[2,130],55:[2,130],70:[2,130],75:[2,130],83:[2,130],88:[2,130],90:[2,130],99:[2,130],101:[2,130],102:[2,130],103:[2,130],107:[2,130],115:[2,130],123:[2,130],125:[2,130],126:[2,130],129:[2,130],130:[2,130],131:[2,130],132:[2,130],133:[2,130],134:[2,130]},{5:283,25:[1,5]},{26:[1,284],118:[1,285],119:252,120:[1,213]},{1:[2,167],6:[2,167],25:[2,167],26:[2,167],47:[2,167],52:[2,167],55:[2,167],70:[2,167],75:[2,167],83:[2,167],88:[2,167],90:[2,167],99:[2,167],101:[2,167],102:[2,167],103:[2,167],107:[2,167],115:[2,167],123:[2,167],125:[2,167],126:[2,167],129:[2,167],130:[2,167],131:[2,167],132:[2,167],133:[2,167],134:[2,167]},{5:286,25:[1,5]},{26:[2,170],118:[2,170],120:[2,170]},{5:287,25:[1,5],52:[1,288]},{25:[2,126],52:[2,126],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,94],6:[2,94],25:[2,94],26:[2,94],47:[2,94],52:[2,94],55:[2,94],70:[2,94],75:[2,94],83:[2,94],88:[2,94],90:[2,94],99:[2,94],101:[2,94],102:[2,94],103:[2,94],107:[2,94],115:[2,94],123:[2,94],125:[2,94],126:[2,94],129:[2,94],130:[2,94],131:[2,94],132:[2,94],133:[2,94],134:[2,94]},{1:[2,97],5:289,6:[2,97],25:[1,5],26:[2,97],47:[2,97],52:[2,97],55:[2,97],70:[2,97],75:[2,97],83:[2,97],88:[2,97],90:[2,97],99:[2,97],100:85,101:[1,63],102:[2,97],103:[1,64],106:86,107:[1,66],108:67,115:[2,97],123:[2,97],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{99:[1,290]},{88:[1,291],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,111],6:[2,111],25:[2,111],26:[2,111],38:[2,111],47:[2,111],52:[2,111],55:[2,111],64:[2,111],65:[2,111],66:[2,111],68:[2,111],70:[2,111],71:[2,111],75:[2,111],81:[2,111],82:[2,111],83:[2,111],88:[2,111],90:[2,111],99:[2,111],101:[2,111],102:[2,111],103:[2,111],107:[2,111],113:[2,111],114:[2,111],115:[2,111],123:[2,111],125:[2,111],126:[2,111],129:[2,111],130:[2,111],131:[2,111],132:[2,111],133:[2,111],134:[2,111]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],91:292,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:197,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,25:[1,144],27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,58:145,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],84:293,85:[1,56],86:[1,57],87:[1,55],91:143,93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[2,120],25:[2,120],26:[2,120],52:[2,120],83:[2,120],88:[2,120]},{6:[1,260],25:[1,261],26:[1,294]},{1:[2,137],6:[2,137],25:[2,137],26:[2,137],47:[2,137],52:[2,137],55:[2,137],70:[2,137],75:[2,137],83:[2,137],88:[2,137],90:[2,137],99:[2,137],100:85,101:[1,63],102:[2,137],103:[1,64],106:86,107:[1,66],108:67,115:[2,137],123:[2,137],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,139],6:[2,139],25:[2,139],26:[2,139],47:[2,139],52:[2,139],55:[2,139],70:[2,139],75:[2,139],83:[2,139],88:[2,139],90:[2,139],99:[2,139],100:85,101:[1,63],102:[2,139],103:[1,64],106:86,107:[1,66],108:67,115:[2,139],123:[2,139],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{113:[2,157],114:[2,157]},{8:295,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:296,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:297,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,85],6:[2,85],25:[2,85],26:[2,85],38:[2,85],47:[2,85],52:[2,85],55:[2,85],64:[2,85],65:[2,85],66:[2,85],68:[2,85],70:[2,85],71:[2,85],75:[2,85],81:[2,85],82:[2,85],83:[2,85],88:[2,85],90:[2,85],99:[2,85],101:[2,85],102:[2,85],103:[2,85],107:[2,85],113:[2,85],114:[2,85],115:[2,85],123:[2,85],125:[2,85],126:[2,85],129:[2,85],130:[2,85],131:[2,85],132:[2,85],133:[2,85],134:[2,85]},{11:165,27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:298,40:164,42:168,44:[1,46],86:[1,111]},{6:[2,86],11:165,25:[2,86],26:[2,86],27:166,28:[1,71],29:167,30:[1,69],31:[1,70],39:163,40:164,42:168,44:[1,46],52:[2,86],74:299,86:[1,111]},{6:[2,88],25:[2,88],26:[2,88],52:[2,88],75:[2,88]},{6:[2,38],25:[2,38],26:[2,38],52:[2,38],75:[2,38],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{8:300,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{70:[2,115],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,36],6:[2,36],25:[2,36],26:[2,36],47:[2,36],52:[2,36],55:[2,36],70:[2,36],75:[2,36],83:[2,36],88:[2,36],90:[2,36],99:[2,36],101:[2,36],102:[2,36],103:[2,36],107:[2,36],115:[2,36],123:[2,36],125:[2,36],126:[2,36],129:[2,36],130:[2,36],131:[2,36],132:[2,36],133:[2,36],134:[2,36]},{1:[2,106],6:[2,106],25:[2,106],26:[2,106],47:[2,106],52:[2,106],55:[2,106],64:[2,106],65:[2,106],66:[2,106],68:[2,106],70:[2,106],71:[2,106],75:[2,106],81:[2,106],82:[2,106],83:[2,106],88:[2,106],90:[2,106],99:[2,106],101:[2,106],102:[2,106],103:[2,106],107:[2,106],115:[2,106],123:[2,106],125:[2,106],126:[2,106],129:[2,106],130:[2,106],131:[2,106],132:[2,106],133:[2,106],134:[2,106]},{1:[2,47],6:[2,47],25:[2,47],26:[2,47],47:[2,47],52:[2,47],55:[2,47],70:[2,47],75:[2,47],83:[2,47],88:[2,47],90:[2,47],99:[2,47],101:[2,47],102:[2,47],103:[2,47],107:[2,47],115:[2,47],123:[2,47],125:[2,47],126:[2,47],129:[2,47],130:[2,47],131:[2,47],132:[2,47],133:[2,47],134:[2,47]},{1:[2,195],6:[2,195],25:[2,195],26:[2,195],47:[2,195],52:[2,195],55:[2,195],70:[2,195],75:[2,195],83:[2,195],88:[2,195],90:[2,195],99:[2,195],101:[2,195],102:[2,195],103:[2,195],107:[2,195],115:[2,195],123:[2,195],125:[2,195],126:[2,195],129:[2,195],130:[2,195],131:[2,195],132:[2,195],133:[2,195],134:[2,195]},{1:[2,174],6:[2,174],25:[2,174],26:[2,174],47:[2,174],52:[2,174],55:[2,174],70:[2,174],75:[2,174],83:[2,174],88:[2,174],90:[2,174],99:[2,174],101:[2,174],102:[2,174],103:[2,174],107:[2,174],115:[2,174],118:[2,174],123:[2,174],125:[2,174],126:[2,174],129:[2,174],130:[2,174],131:[2,174],132:[2,174],133:[2,174],134:[2,174]},{1:[2,131],6:[2,131],25:[2,131],26:[2,131],47:[2,131],52:[2,131],55:[2,131],70:[2,131],75:[2,131],83:[2,131],88:[2,131],90:[2,131],99:[2,131],101:[2,131],102:[2,131],103:[2,131],107:[2,131],115:[2,131],123:[2,131],125:[2,131],126:[2,131],129:[2,131],130:[2,131],131:[2,131],132:[2,131],133:[2,131],134:[2,131]},{1:[2,132],6:[2,132],25:[2,132],26:[2,132],47:[2,132],52:[2,132],55:[2,132],70:[2,132],75:[2,132],83:[2,132],88:[2,132],90:[2,132],95:[2,132],99:[2,132],101:[2,132],102:[2,132],103:[2,132],107:[2,132],115:[2,132],123:[2,132],125:[2,132],126:[2,132],129:[2,132],130:[2,132],131:[2,132],132:[2,132],133:[2,132],134:[2,132]},{1:[2,165],6:[2,165],25:[2,165],26:[2,165],47:[2,165],52:[2,165],55:[2,165],70:[2,165],75:[2,165],83:[2,165],88:[2,165],90:[2,165],99:[2,165],101:[2,165],102:[2,165],103:[2,165],107:[2,165],115:[2,165],123:[2,165],125:[2,165],126:[2,165],129:[2,165],130:[2,165],131:[2,165],132:[2,165],133:[2,165],134:[2,165]},{5:301,25:[1,5]},{26:[1,302]},{6:[1,303],26:[2,171],118:[2,171],120:[2,171]},{8:304,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{1:[2,98],6:[2,98],25:[2,98],26:[2,98],47:[2,98],52:[2,98],55:[2,98],70:[2,98],75:[2,98],83:[2,98],88:[2,98],90:[2,98],99:[2,98],101:[2,98],102:[2,98],103:[2,98],107:[2,98],115:[2,98],123:[2,98],125:[2,98],126:[2,98],129:[2,98],130:[2,98],131:[2,98],132:[2,98],133:[2,98],134:[2,98]},{1:[2,135],6:[2,135],25:[2,135],26:[2,135],47:[2,135],52:[2,135],55:[2,135],64:[2,135],65:[2,135],66:[2,135],68:[2,135],70:[2,135],71:[2,135],75:[2,135],81:[2,135],82:[2,135],83:[2,135],88:[2,135],90:[2,135],99:[2,135],101:[2,135],102:[2,135],103:[2,135],107:[2,135],115:[2,135],123:[2,135],125:[2,135],126:[2,135],129:[2,135],130:[2,135],131:[2,135],132:[2,135],133:[2,135],134:[2,135]},{1:[2,114],6:[2,114],25:[2,114],26:[2,114],47:[2,114],52:[2,114],55:[2,114],64:[2,114],65:[2,114],66:[2,114],68:[2,114],70:[2,114],71:[2,114],75:[2,114],81:[2,114],82:[2,114],83:[2,114],88:[2,114],90:[2,114],99:[2,114],101:[2,114],102:[2,114],103:[2,114],107:[2,114],115:[2,114],123:[2,114],125:[2,114],126:[2,114],129:[2,114],130:[2,114],131:[2,114],132:[2,114],133:[2,114],134:[2,114]},{6:[2,121],25:[2,121],26:[2,121],52:[2,121],83:[2,121],88:[2,121]},{6:[2,51],25:[2,51],26:[2,51],51:305,52:[1,222]},{6:[2,122],25:[2,122],26:[2,122],52:[2,122],83:[2,122],88:[2,122]},{1:[2,160],6:[2,160],25:[2,160],26:[2,160],47:[2,160],52:[2,160],55:[2,160],70:[2,160],75:[2,160],83:[2,160],88:[2,160],90:[2,160],99:[2,160],100:85,101:[2,160],102:[2,160],103:[2,160],106:86,107:[2,160],108:67,115:[1,306],123:[2,160],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,162],6:[2,162],25:[2,162],26:[2,162],47:[2,162],52:[2,162],55:[2,162],70:[2,162],75:[2,162],83:[2,162],88:[2,162],90:[2,162],99:[2,162],100:85,101:[2,162],102:[1,307],103:[2,162],106:86,107:[2,162],108:67,115:[2,162],123:[2,162],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,161],6:[2,161],25:[2,161],26:[2,161],47:[2,161],52:[2,161],55:[2,161],70:[2,161],75:[2,161],83:[2,161],88:[2,161],90:[2,161],99:[2,161],100:85,101:[2,161],102:[2,161],103:[2,161],106:86,107:[2,161],108:67,115:[2,161],123:[2,161],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[2,89],25:[2,89],26:[2,89],52:[2,89],75:[2,89]},{6:[2,51],25:[2,51],26:[2,51],51:308,52:[1,232]},{26:[1,309],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{26:[1,310]},{1:[2,168],6:[2,168],25:[2,168],26:[2,168],47:[2,168],52:[2,168],55:[2,168],70:[2,168],75:[2,168],83:[2,168],88:[2,168],90:[2,168],99:[2,168],101:[2,168],102:[2,168],103:[2,168],107:[2,168],115:[2,168],123:[2,168],125:[2,168],126:[2,168],129:[2,168],130:[2,168],131:[2,168],132:[2,168],133:[2,168],134:[2,168]},{26:[2,172],118:[2,172],120:[2,172]},{25:[2,127],52:[2,127],100:85,101:[1,63],103:[1,64],106:86,107:[1,66],108:67,123:[1,84],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[1,260],25:[1,261],26:[1,311]},{8:312,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{8:313,9:115,10:20,11:21,12:[1,22],13:8,14:9,15:10,16:11,17:12,18:13,19:14,20:15,21:16,22:17,23:18,24:19,27:60,28:[1,71],29:49,30:[1,69],31:[1,70],32:24,33:[1,50],34:[1,51],35:[1,52],36:[1,53],37:23,42:61,43:[1,45],44:[1,46],45:[1,29],48:30,49:[1,58],50:[1,59],56:47,57:48,59:36,61:25,62:26,63:27,73:[1,68],76:[1,43],80:[1,28],85:[1,56],86:[1,57],87:[1,55],93:[1,38],97:[1,44],98:[1,54],100:39,101:[1,63],103:[1,64],104:40,105:[1,65],106:41,107:[1,66],108:67,116:[1,42],121:37,122:[1,62],124:[1,31],125:[1,32],126:[1,33],127:[1,34],128:[1,35]},{6:[1,271],25:[1,272],26:[1,314]},{6:[2,39],25:[2,39],26:[2,39],52:[2,39],75:[2,39]},{1:[2,166],6:[2,166],25:[2,166],26:[2,166],47:[2,166],52:[2,166],55:[2,166],70:[2,166],75:[2,166],83:[2,166],88:[2,166],90:[2,166],99:[2,166],101:[2,166],102:[2,166],103:[2,166],107:[2,166],115:[2,166],123:[2,166],125:[2,166],126:[2,166],129:[2,166],130:[2,166],131:[2,166],132:[2,166],133:[2,166],134:[2,166]},{6:[2,123],25:[2,123],26:[2,123],52:[2,123],83:[2,123],88:[2,123]},{1:[2,163],6:[2,163],25:[2,163],26:[2,163],47:[2,163],52:[2,163],55:[2,163],70:[2,163],75:[2,163],83:[2,163],88:[2,163],90:[2,163],99:[2,163],100:85,101:[2,163],102:[2,163],103:[2,163],106:86,107:[2,163],108:67,115:[2,163],123:[2,163],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{1:[2,164],6:[2,164],25:[2,164],26:[2,164],47:[2,164],52:[2,164],55:[2,164],70:[2,164],75:[2,164],83:[2,164],88:[2,164],90:[2,164],99:[2,164],100:85,101:[2,164],102:[2,164],103:[2,164],106:86,107:[2,164],108:67,115:[2,164],123:[2,164],125:[1,78],126:[1,77],129:[1,76],130:[1,79],131:[1,80],132:[1,81],133:[1,82],134:[1,83]},{6:[2,90],25:[2,90],26:[2,90],52:[2,90],75:[2,90]}],
defaultActions: {58:[2,49],59:[2,50],73:[2,3],92:[2,104],186:[2,84]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};
undefined
return parser;
})();
if (typeof require !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); }
exports.main = function commonjsMain(args) {
    if (!args[1])
        throw new Error('Usage: '+args[0]+' FILE');
    if (typeof process !== 'undefined') {
        var source = require('fs').readFileSync(require('path').join(process.cwd(), args[1]), "utf8");
    } else {
        var cwd = require("file").path(require("file").cwd());
        var source = cwd.join(args[1]).read({charset: "utf-8"});
    }
    return exports.parser.parse(source);
}
if (typeof module !== 'undefined' && require.main === module) {
  exports.main(typeof process !== 'undefined' ? process.argv.slice(1) : require("system").args);
}
}
;

      return exports;
    };
    _require["shader-script/rewriter"] = function() {
      var exports = {};
      (function() {
  var BALANCED_PAIRS, EXPRESSION_CLOSE, EXPRESSION_END, EXPRESSION_START, IMPLICIT_BLOCK, IMPLICIT_CALL, IMPLICIT_END, IMPLICIT_FUNC, IMPLICIT_UNSPACED_CALL, INVERSES, LINEBREAKS, SINGLE_CLOSERS, SINGLE_LINERS, left, rite, _i, _len, _ref,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __slice = Array.prototype.slice;

  exports.Rewriter = (function() {

    function Rewriter() {}

    Rewriter.prototype.rewrite = function(tokens) {
      this.tokens = tokens;
      this.removeLeadingNewlines();
      this.removeMidExpressionNewlines();
      this.closeOpenCalls();
      this.closeOpenIndexes();
      this.addImplicitIndentation();
      this.tagPostfixConditionals();
      this.addImplicitBraces();
      this.addImplicitParentheses();
      return this.tokens;
    };

    Rewriter.prototype.scanTokens = function(block) {
      var i, token, tokens;
      tokens = this.tokens;
      i = 0;
      while (token = tokens[i]) {
        i += block.call(this, token, i, tokens);
      }
      return true;
    };

    Rewriter.prototype.detectEnd = function(i, condition, action) {
      var levels, token, tokens, _ref, _ref2;
      tokens = this.tokens;
      levels = 0;
      while (token = tokens[i]) {
        if (levels === 0 && condition.call(this, token, i)) {
          return action.call(this, token, i);
        }
        if (!token || levels < 0) return action.call(this, token, i - 1);
        if (_ref = token[0], __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          levels += 1;
        } else if (_ref2 = token[0], __indexOf.call(EXPRESSION_END, _ref2) >= 0) {
          levels -= 1;
        }
        i += 1;
      }
      return i - 1;
    };

    Rewriter.prototype.removeLeadingNewlines = function() {
      var i, tag, _len, _ref;
      _ref = this.tokens;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        tag = _ref[i][0];
        if (tag !== 'TERMINATOR') break;
      }
      if (i) return this.tokens.splice(0, i);
    };

    Rewriter.prototype.removeMidExpressionNewlines = function() {
      return this.scanTokens(function(token, i, tokens) {
        var _ref;
        if (!(token[0] === 'TERMINATOR' && (_ref = this.tag(i + 1), __indexOf.call(EXPRESSION_CLOSE, _ref) >= 0))) {
          return 1;
        }
        tokens.splice(i, 1);
        return 0;
      });
    };

    Rewriter.prototype.closeOpenCalls = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return ((_ref = token[0]) === ')' || _ref === 'CALL_END') || token[0] === 'OUTDENT' && this.tag(i - 1) === ')';
      };
      action = function(token, i) {
        return this.tokens[token[0] === 'OUTDENT' ? i - 1 : i][0] = 'CALL_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'CALL_START') this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.closeOpenIndexes = function() {
      var action, condition;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === ']' || _ref === 'INDEX_END';
      };
      action = function(token, i) {
        return token[0] = 'INDEX_END';
      };
      return this.scanTokens(function(token, i) {
        if (token[0] === 'INDEX_START') this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.addImplicitBraces = function() {
      var action, condition, sameLine, stack, start, startIndent, startsLine;
      stack = [];
      start = null;
      startsLine = null;
      sameLine = true;
      startIndent = 0;
      condition = function(token, i) {
        var one, tag, three, two, _ref, _ref2;
        _ref = this.tokens.slice(i + 1, (i + 3) + 1 || 9e9), one = _ref[0], two = _ref[1], three = _ref[2];
        if ('HERECOMMENT' === (one != null ? one[0] : void 0)) return false;
        tag = token[0];
        if (__indexOf.call(LINEBREAKS, tag) >= 0) sameLine = false;
        return (((tag === 'TERMINATOR' || tag === 'OUTDENT') || (__indexOf.call(IMPLICIT_END, tag) >= 0 && sameLine)) && ((!startsLine && this.tag(i - 1) !== ',') || !((two != null ? two[0] : void 0) === ':' || (one != null ? one[0] : void 0) === '@' && (three != null ? three[0] : void 0) === ':'))) || (tag === ',' && one && ((_ref2 = one[0]) !== 'IDENTIFIER' && _ref2 !== 'NUMBER' && _ref2 !== 'STRING' && _ref2 !== '@' && _ref2 !== 'TERMINATOR' && _ref2 !== 'OUTDENT'));
      };
      action = function(token, i) {
        var tok;
        tok = this.generate('}', '}', token[2]);
        return this.tokens.splice(i, 0, tok);
      };
      return this.scanTokens(function(token, i, tokens) {
        var ago, idx, prevTag, tag, tok, value, _ref, _ref2;
        if (_ref = (tag = token[0]), __indexOf.call(EXPRESSION_START, _ref) >= 0) {
          stack.push([(tag === 'INDENT' && this.tag(i - 1) === '{' ? '{' : tag), i]);
          return 1;
        }
        if (__indexOf.call(EXPRESSION_END, tag) >= 0) {
          start = stack.pop();
          return 1;
        }
        if (!(tag === ':' && ((ago = this.tag(i - 2)) === ':' || ((_ref2 = stack[stack.length - 1]) != null ? _ref2[0] : void 0) !== '{'))) {
          return 1;
        }
        sameLine = true;
        stack.push(['{']);
        idx = ago === '@' ? i - 2 : i - 1;
        while (this.tag(idx - 2) === 'HERECOMMENT') {
          idx -= 2;
        }
        prevTag = this.tag(idx - 1);
        startsLine = !prevTag || (__indexOf.call(LINEBREAKS, prevTag) >= 0);
        value = new String('{');
        value.generated = true;
        tok = this.generate('{', value, token[2]);
        tokens.splice(idx, 0, tok);
        this.detectEnd(i + 2, condition, action);
        return 2;
      });
    };

    Rewriter.prototype.addImplicitParentheses = function() {
      var action, condition, noCall, seenControl, seenSingle;
      noCall = seenSingle = seenControl = false;
      condition = function(token, i) {
        var post, tag, _ref, _ref2;
        tag = token[0];
        if (!seenSingle && token.fromThen) return true;
        if (tag === 'IF' || tag === 'ELSE' || tag === 'CATCH' || tag === '->' || tag === '=>' || tag === 'CLASS') {
          seenSingle = true;
        }
        if (tag === 'IF' || tag === 'ELSE' || tag === 'SWITCH' || tag === 'TRY' || tag === '=') {
          seenControl = true;
        }
        if ((tag === '.' || tag === '?.' || tag === '::') && this.tag(i - 1) === 'OUTDENT') {
          return true;
        }
        return !token.generated && this.tag(i - 1) !== ',' && (__indexOf.call(IMPLICIT_END, tag) >= 0 || (tag === 'INDENT' && !seenControl)) && (tag !== 'INDENT' || (((_ref = this.tag(i - 2)) !== 'CLASS' && _ref !== 'EXTENDS') && (_ref2 = this.tag(i - 1), __indexOf.call(IMPLICIT_BLOCK, _ref2) < 0) && !((post = this.tokens[i + 1]) && post.generated && post[0] === '{')));
      };
      action = function(token, i) {
        return this.tokens.splice(i, 0, this.generate('CALL_END', ')', token[2]));
      };
      return this.scanTokens(function(token, i, tokens) {
        var callObject, current, next, prev, tag, _ref, _ref2, _ref3;
        tag = token[0];
        if (tag === 'CLASS' || tag === 'IF' || tag === 'FOR' || tag === 'WHILE') {
          noCall = true;
        }
        _ref = tokens.slice(i - 1, (i + 1) + 1 || 9e9), prev = _ref[0], current = _ref[1], next = _ref[2];
        callObject = !noCall && tag === 'INDENT' && next && next.generated && next[0] === '{' && prev && (_ref2 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref2) >= 0);
        seenSingle = false;
        seenControl = false;
        if (__indexOf.call(LINEBREAKS, tag) >= 0) noCall = false;
        if (prev && !prev.spaced && tag === '?') token.call = true;
        if (token.fromThen) return 1;
        if (!(callObject || (prev != null ? prev.spaced : void 0) && (prev.call || (_ref3 = prev[0], __indexOf.call(IMPLICIT_FUNC, _ref3) >= 0)) && (__indexOf.call(IMPLICIT_CALL, tag) >= 0 || !(token.spaced || token.newLine) && __indexOf.call(IMPLICIT_UNSPACED_CALL, tag) >= 0))) {
          return 1;
        }
        tokens.splice(i, 0, this.generate('CALL_START', '(', token[2]));
        this.detectEnd(i + 1, condition, action);
        if (prev[0] === '?') prev[0] = 'FUNC_EXIST';
        return 2;
      });
    };

    Rewriter.prototype.addImplicitIndentation = function() {
      var action, condition, indent, outdent, starter;
      starter = indent = outdent = null;
      condition = function(token, i) {
        var _ref;
        return token[1] !== ';' && (_ref = token[0], __indexOf.call(SINGLE_CLOSERS, _ref) >= 0) && !(token[0] === 'ELSE' && (starter !== 'IF' && starter !== 'THEN'));
      };
      action = function(token, i) {
        return this.tokens.splice((this.tag(i - 1) === ',' ? i - 1 : i), 0, outdent);
      };
      return this.scanTokens(function(token, i, tokens) {
        var tag, _ref, _ref2;
        tag = token[0];
        if (tag === 'TERMINATOR' && this.tag(i + 1) === 'THEN') {
          tokens.splice(i, 1);
          return 0;
        }
        if (tag === 'ELSE' && this.tag(i - 1) !== 'OUTDENT') {
          tokens.splice.apply(tokens, [i, 0].concat(__slice.call(this.indentation(token))));
          return 2;
        }
        if (tag === 'CATCH' && ((_ref = this.tag(i + 2)) === 'OUTDENT' || _ref === 'TERMINATOR' || _ref === 'FINALLY')) {
          tokens.splice.apply(tokens, [i + 2, 0].concat(__slice.call(this.indentation(token))));
          return 4;
        }
        if (__indexOf.call(SINGLE_LINERS, tag) >= 0 && this.tag(i + 1) !== 'INDENT' && !(tag === 'ELSE' && this.tag(i + 1) === 'IF')) {
          starter = tag;
          _ref2 = this.indentation(token, true), indent = _ref2[0], outdent = _ref2[1];
          if (starter === 'THEN') indent.fromThen = true;
          tokens.splice(i + 1, 0, indent);
          this.detectEnd(i + 2, condition, action);
          if (tag === 'THEN') tokens.splice(i, 1);
          return 1;
        }
        return 1;
      });
    };

    Rewriter.prototype.tagPostfixConditionals = function() {
      var action, condition, original;
      original = null;
      condition = function(token, i) {
        var _ref;
        return (_ref = token[0]) === 'TERMINATOR' || _ref === 'INDENT';
      };
      action = function(token, i) {
        if (token[0] !== 'INDENT' || (token.generated && !token.fromThen)) {
          return original[0] = 'POST_' + original[0];
        }
      };
      return this.scanTokens(function(token, i) {
        if (token[0] !== 'IF') return 1;
        original = token;
        this.detectEnd(i + 1, condition, action);
        return 1;
      });
    };

    Rewriter.prototype.indentation = function(token, implicit) {
      var indent, outdent;
      if (implicit == null) implicit = false;
      indent = ['INDENT', 2, token[2]];
      outdent = ['OUTDENT', 2, token[2]];
      if (implicit) indent.generated = outdent.generated = true;
      return [indent, outdent];
    };

    Rewriter.prototype.generate = function(tag, value, line) {
      var tok;
      tok = [tag, value, line];
      tok.generated = true;
      return tok;
    };

    Rewriter.prototype.tag = function(i) {
      var _ref;
      return (_ref = this.tokens[i]) != null ? _ref[0] : void 0;
    };

    return Rewriter;

  })();

  BALANCED_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['INDENT', 'OUTDENT'], ['CALL_START', 'CALL_END'], ['PARAM_START', 'PARAM_END'], ['INDEX_START', 'INDEX_END']];

  exports.INVERSES = INVERSES = {};

  EXPRESSION_START = [];

  EXPRESSION_END = [];

  for (_i = 0, _len = BALANCED_PAIRS.length; _i < _len; _i++) {
    _ref = BALANCED_PAIRS[_i], left = _ref[0], rite = _ref[1];
    EXPRESSION_START.push(INVERSES[rite] = left);
    EXPRESSION_END.push(INVERSES[left] = rite);
  }

  EXPRESSION_CLOSE = ['CATCH', 'WHEN', 'ELSE', 'FINALLY'].concat(EXPRESSION_END);

  IMPLICIT_FUNC = ['IDENTIFIER', 'SUPER', ')', 'CALL_END', ']', 'INDEX_END', '@', 'THIS'];

  IMPLICIT_CALL = ['IDENTIFIER', 'NUMBER', 'STRING', 'JS', 'REGEX', 'NEW', 'PARAM_START', 'CLASS', 'IF', 'TRY', 'SWITCH', 'THIS', 'BOOL', 'UNARY', 'SUPER', '@', '->', '=>', '[', '(', '{', '--', '++'];

  IMPLICIT_UNSPACED_CALL = ['+', '-'];

  IMPLICIT_BLOCK = ['->', '=>', '{', '[', ','];

  IMPLICIT_END = ['POST_IF', 'FOR', 'WHILE', 'UNTIL', 'WHEN', 'BY', 'LOOP', 'TERMINATOR'];

  SINGLE_LINERS = ['ELSE', '->', '=>', 'TRY', 'FINALLY', 'THEN'];

  SINGLE_CLOSERS = ['TERMINATOR', 'CATCH', 'FINALLY', 'ELSE', 'OUTDENT', 'LEADING_WHEN'];

  LINEBREAKS = ['TERMINATOR', 'INDENT', 'OUTDENT'];

}).call(this);

      return exports;
    };
    _require["shader-script/scope"] = function() {
      var exports = {};
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
        var def, type;
        options.name || (options.name = name);
        def = this.lookup(name, true);
        if (def) {
          def.set_type(options.type);
          options.set_type = def.set_type;
          options.type = def.type;
          options.scope = def.scope;
          options.scope.definitions[name] = options;
        } else {
          options.qualified_name = this.qualifier() + "." + name;
          options.scope = this;
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
                if (this.dependent) {
                  return this.dependent.type();
                } else {
                  return;
                }
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

      return exports;
    };
    _require["shader-script/shader"] = function() {
      var exports = {};
      (function() {
  var Scope;

  Scope = require('shader-script/scope').Scope;

  exports.Shader = (function() {

    function Shader(state) {
      this.scope = state.scope || (state.scope = new Scope());
      this.functions = {};
      this.fn_types = {};
    }

    Shader.prototype.define_function = function(name, callback) {
      var types, _i, _len, _ref, _results;
      this.functions[name] = callback;
      if (this.fn_types[name]) {
        _ref = this.fn_types[name];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          types = _ref[_i];
          _results.push(callback(types));
        }
        return _results;
      }
    };

    Shader.prototype.mark_function = function(name, types, dependent_variable) {
      var _base;
      if (dependent_variable == null) dependent_variable = null;
      if (this.functions[name]) {
        return this.functions[name](types);
      } else {
        (_base = this.fn_types)[name] || (_base[name] = []);
        return this.fn_types[name].push(types);
      }
    };

    return Shader;

  })();

}).call(this);

      return exports;
    };
    _require["shader-script/simulator"] = function() {
      var exports = {};
      (function() {
  var Glsl, Simulator;

  Glsl = require('shader-script/glsl');

  exports.Simulator = Simulator = (function() {

    function Simulator(glsl) {
      this.state = {};
      if (glsl.vertex) this.vertex = Glsl.compile(glsl.vertex, this.state);
      if (glsl.fragment) this.fragment = Glsl.compile(glsl.fragment, this.state);
      if (!(this.vertex || this.fragment)) throw new Error("No programs found!");
    }

    Simulator.prototype.start = function(which) {
      var program;
      if (which == null) which = 'both';
      switch (which) {
        case 'both':
          if (this.vertex) this.start('vertex');
          if (this.fragment) this.start('fragment');
          break;
        default:
          program = this[which];
          if (!program) throw new Error("No " + which + " program found!");
          this.run_program(which, program);
      }
      return this;
    };

    Simulator.prototype.run_program = function(name, program) {
      try {
        return program.invoke('main');
      } catch (err) {
        err.message = "" + name + ": " + err.message;
        throw err;
      }
    };

    return Simulator;

  })();

}).call(this);

      return exports;
    };
  
  global.ShaderScript = require("shader-script");
})(this);
