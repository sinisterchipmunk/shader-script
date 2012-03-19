class exports.Access extends require('shader-script/nodes/base').Base
  name: "_access"
  children: -> [ 'accessor', 'source' ]

  accessor_name: -> @accessor.toVariableName()
  
  toVariableName: -> @source.toVariableName()
  # "#{@source.toVariableName()}.#{@accessor_name()}"
  
  is_access: -> true
  
  cast: (type, program) ->
    # do nothing, since the type is already set
  
  type: (program) ->
    base_type = @base_type program
    base_type and "#{base_type}#{@vector_length()}"
    
  base_type: (program) ->
    base_type = @source.type program
    name = @accessor_name()
    
    return null unless base_type
    switch base_type
      when 'int',   'ivec2', 'ivec3', 'ivec4' then "ivec"
      when 'float', 'vec2',  'vec3',  'vec4'  then "vec"
      when 'bool',  'bvec2', 'bvec3', 'bvec4' then "bvec"
      else throw new Error "Cannot use component accessors for type #{base_type}"
    
  vector_length: -> @accessor_name().length
  
  compile: (program) ->
    accessor = @accessor_name()
    source = @source.compile program
    
    iterate_components: (max_length, assignment, callback) ->
      already_iterated = []
      for i in accessor
        index = switch i
          when 'x', 'r', 's' then 0
          when 'y', 'g', 't' then 1
          when 'z', 'b', 'p' then 2
          when 'w', 'a', 'q' then 3
          else throw new Error "Unrecognized vector component: #{i}"

        if assignment and already_iterated.indexOf(index) != -1
          throw new Error "Can't specify the same component twice in the same assignment"
        already_iterated.push index

        if index <= max_length then callback index
        else throw new Error "Component #{i} equates to vector index #{index}, which exceeds vector length #{max_length}"
    
    filter_assignment: (value) ->
      source_value = source.execute()
      result = source_value.slice 0
      @iterate_components source_value.length, true, (index) -> result[index] = value[index]
      result
      
    toSource: -> "#{source.toSource()}.#{accessor}"
    
    execute: ->
      source_value = source.execute()
      result = []
      @iterate_components source_value.length, false, (index) -> result.push source_value[index]
      result