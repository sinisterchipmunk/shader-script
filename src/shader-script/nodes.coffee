nodes = 
  Root:       'nodes/root'
  Block:      'nodes/block'
  Literal:    'nodes/literal'
  Value:      'nodes/value'
  Call:       'nodes/call'
  Identifier: 'nodes/identifier'

for node_name, node_file of nodes
  exports[node_name] = require("./" + node_file)[node_name]
