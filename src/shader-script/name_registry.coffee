class exports.NameRegistry
  # mangles name such that it is guaranteed not to appear in entries,
  # which is expected to be an array. Returns the mangled name.
  mangle = (name, entries) ->
    counter = 0
    mangled_name = name
    while mangled_name in entries
      mangled_name = name + counter++
    mangled_name
  
  constructor: -> @entries = {}
  
  # Returns an array containing all mangled names for the specified base
  # name.
  entries_for: (name) ->
    @entries[name] or= []
  
  # returns a name guaranteed to be unique within this name registry.
  # If the name is not taken, it is returned. Otherwise, it is mangled
  # for uniqueness.
  define: (name) ->
    entries = @entries_for name
    entries.push mangle name, entries
    entries[entries.length-1]