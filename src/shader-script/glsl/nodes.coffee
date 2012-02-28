nodes = 
  Block:      'block'
  Literal:    'literal'
  Value:      'value'
  Identifier: 'identifier'
  Call:       'call'
  Variable:   'variable'
  Assign:     'assign'
  Function:   'function'
  Root:       'root'
  TypeConstructor: 'type_constructor'
  Return:     'return'
  Op:         'op'
  Comment:    'comment'

for node_name, node_file of nodes
  exports[node_name] = require("shader-script/glsl/nodes/" + node_file)[node_name]
