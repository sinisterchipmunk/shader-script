(function() {
  var node_file, node_name, nodes;

  nodes = {
    Root: 'nodes/root',
    Block: 'nodes/block',
    Literal: 'nodes/literal',
    Value: 'nodes/value',
    Call: 'nodes/call',
    Identifier: 'nodes/identifier'
  };

  for (node_name in nodes) {
    node_file = nodes[node_name];
    exports[node_name] = require("./" + node_file)[node_name];
  }

}).call(this);
