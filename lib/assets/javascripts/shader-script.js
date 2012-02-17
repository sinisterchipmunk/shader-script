(function() {
  var Lexer, Simulator, fs, lexer, parser;

  fs = require('fs');

  Lexer = require("shader-script/lexer").Lexer;

  Simulator = require("shader-script/simulator").Simulator;

  parser = require("shader-script/parser").parser;

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

  exports.parse = function(code) {
    return parser.parse(lexer.tokenize(code));
  };

  exports.compile_to_glsl = function(code) {
    throw new Error("Not yet implemented");
  };

  exports.compile_to_json = function(code) {
    if (code instanceof Object && code.compile) {
      return code.compile();
    } else {
      return exports.parse(code).compile();
    }
  };

  exports.compile = function(code) {
    return exports.compile_to_json(code);
  };

}).call(this);
