nodes = 
  Root:       'root'
  Block:      'block'
  Literal:    'literal'
  Value:      'value'
  Call:       'call'
  Identifier: 'identifier'
  Assign:     'assign'
  Function:   'function'
  Code:       'function'
  Arr:        'arr'
  Param:      'param'
  Return:     'return'
  Op:         'op'
  Comment:    'comment'
  TypeConstructor: 'type_constructor'

for node_name, node_file of nodes
  exports[node_name] = require("shader-script/nodes/" + node_file)[node_name]
