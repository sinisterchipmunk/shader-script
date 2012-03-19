(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.Comment = (function(_super) {

    __extends(Comment, _super);

    function Comment() {
      Comment.__super__.constructor.apply(this, arguments);
    }

    Comment.prototype.name = '_comment';

    Comment.prototype.children = function() {
      return ['comment'];
    };

    Comment.prototype.compile = function(program) {
      var _this = this;
      return {
        execute: function() {},
        is_comment: true,
        no_terminator: true,
        toSource: function() {
          if (_this.comment.indexOf("\n") !== -1) {
            return "/*\n  " + (_this.comment.trim().replace(/\n/g, '\n  ')) + "\n*/";
          } else {
            return "// " + _this.comment;
          }
        }
      };
    };

    return Comment;

  })(require('shader-script/nodes/base').Base);

}).call(this);
