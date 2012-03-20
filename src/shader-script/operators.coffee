exports.component_wise = component_wise = (args...) ->
  # make a shallow copy of arg arrays so that they aren't modified in place
  (args[i] = args[i].splice(0) if args[i] and args[i].splice) for i of args
  callback = args.pop()
  
  resultset = []
  again = true
  while again
    size = null
    again = false
    argset = for arg in args
      if arg and arg.length
        if arg.length > 1 then again = true
        if size and arg.length != size then throw new Error "All vectors must be the same size"
        size = arg.length
      if arg and arg.shift then arg.shift()
      else arg
    resultset.push callback argset...
  
  if resultset.length == 1
    resultset[0]
  else resultset

cw_mult = (le, re) -> component_wise le.value, re && re.value, (l, r) -> l * r
cw_subt = (le, re) -> component_wise le.value, re && re.value, (l, r) -> if r then l - r else -l
cw_add  = (le, re) -> component_wise le.value, re && re.value, (l, r) -> if r then l + r else +l
cw_divide=(le, re) -> component_wise le.value, re && re.value, (l, r) -> l / r

exports.mat4 =
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
        dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
        dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
        dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
        dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;
        dest
      else cw_mult le, re

exports.vec4 = 
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide

exports.vec3 = 
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide

exports.float =
  '*': cw_mult
  '-': cw_subt
  '+': cw_add
  '/': cw_divide
