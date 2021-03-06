exports.component_wise = component_wise = (args...) ->
  callback = args.pop()
  # convert args that are typed arrays into arrays
  (args[i] = (k for k in args[i]) if args[i] and args[i].length) for i of args
  # make a shallow copy of arg arrays so that they aren't modified in place
  (args[i] = args[i].slice() if args[i] and args[i].slice) for i of args
  
  resultset = []
  again = true
  while again
    size = null
    again = false
    argset = for argi in [0...args.length]
      arg = args[argi]
      if arg and arg.length
        if arg.length > 1 then again = true
        if size and arg.length != size then throw new Error "All vectors must be the same size"
        size = arg.length
        args[argi] = arg[1..-1]
      if arg and arg.shift then arg.shift()
      else arg
    result = callback argset...
    resultset.push result
  
  if resultset.length == 1
    resultset[0]
  else resultset

cw_subt = (le, re) -> component_wise le.value, re && re.value, (l, r) -> if r is undefined then -l else l - r
cw_add  = (le, re) -> component_wise le.value, re && re.value, (l, r) -> if r is undefined then +l else l + r
cw_mult = (le, re) -> component_wise le.value, re.value, (l, r) -> l * r
cw_divide=(le, re) -> component_wise le.value, re.value, (l, r) -> l / r

# An object containing lval, operator, and rval types. The lowest
# level is the object which would be returned by performing the
# operation with the uppermost type on the left. For example,
# the resultant type of (mat4 * vec4) is 'vec4'. This is used
# by the type inferencer when it encounters any operation, to determine
# the outcome of the operation without actually performing it.
#
# If an rval does not exist beneath the operator, that operation
# can't be performed without first casting the rval to a compatible type.
#
# If an lval doesn't exist, no operations can be performed with it.
#
exports.signatures =
  vec2:
    '-':
      vec2: 'vec2'
      float: 'vec2'
    '+':
      vec2: 'vec2'
      float: 'vec2'
    '/':
      vec2: 'vec2'
      float: 'vec2'
    '*':
      vec2: 'vec2'
      float: 'vec2'
  vec3:
    '==': vec3: 'vec3'
    '-': vec3: 'vec3'
    '+': vec3: 'vec3'
    '/': vec3: 'vec3'
    '*':
      vec3: 'vec3'
      mat3: 'vec3'
      mat4: 'vec3'
      float: 'vec3'
  vec4:
    '==': vec4: 'vec4'
    '-': vec4: 'vec4'
    '+': vec4: 'vec4'
    '/': vec4: 'vec4'
    '*':
      vec4: 'vec4'
      mat3: 'vec4'
      mat4: 'vec4'
      float: 'vec4'
  mat3:
    '==': mat3: 'mat3'
    '-': mat3: 'mat3'
    '+': mat3: 'mat3'
    '/': mat3: 'mat3'
    '*':
      vec3: 'vec3'
      vec4: 'vec4'
      mat3: 'mat3'
      float: 'mat3'
  mat4:
    '==': mat4: 'mat4'
    '-': mat4: 'mat4'
    '+': mat4: 'mat4'
    '/': mat4: 'mat4'
    '*':
      vec3: 'vec3'
      vec4: 'vec4'
      mat4: 'mat4'
      float: 'mat4'

exports.bool =
  '!': (le) -> !le

exports.mat4 =
  '==': (le, re) -> le.value == re.value
  '!=': (le, re) -> if le.value != re.value then 1 else 0
  '-': cw_subt
  '+': cw_add
  '/': cw_divide
  '*': (le, re) ->
    switch re.type()
      when 'vec4'
        dest = []
        mat = le.value
        vec = re.value
        [x, y, z, w] = [vec[0], vec[1], vec[2], vec[3]]
        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w
        dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w
        dest
      else cw_mult le, re

exports.mat3 =
  '==': (le, re) -> le.value == re.value
  '!=': (le, re) -> if le.value != re.value then 1 else 0
  '-': cw_subt
  '+': cw_add
  '/': cw_divide
  '*': (le, re) ->
    switch re.type()
      when 'vec3'
        dest = []
        matrix = le.value
        vec = re.value
        [x, y, z] = [vec[0], vec[1], vec[2]]
        dest[0] = x * matrix[0] + y * matrix[3] + z * matrix[6]
        dest[1] = x * matrix[1] + y * matrix[4] + z * matrix[7]
        dest[2] = x * matrix[2] + y * matrix[5] + z * matrix[8]
        dest
      else cw_mult le, re

exports.vec4 = 
  '==': (le, re) -> if le.value == re.value then 1 else 0
  '!=': (le, re) -> if le.value != re.value then 1 else 0
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide

exports.vec3 = 
  '==': (le, re) -> if le.value == re.value then 1 else 0
  '!=': (le, re) -> if le.value != re.value then 1 else 0
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide
  
exports.vec2 =
  '==': (le, re) -> if le.value == re.value then 1 else 0
  '!=': (le, re) -> if le.value != re.value then 1 else 0
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide

exports.float =
  '==': (le, re) -> if le.value == re.value then 1 else 0
  '!=': (le, re) -> if le.value != re.value then 1 else 0
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide
  '>': (le, re) -> if le.value > re.value then 1 else 0

exports.int =
  '==': (le, re) -> if le.value == re.value then 1 else 0
  '!=': (le, re) -> if le.value != re.value then 1 else 0
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide
  '>': (le, re) -> if le.value > re.value then 1 else 0
