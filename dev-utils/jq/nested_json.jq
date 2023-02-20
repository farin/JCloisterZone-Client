to_entries | map(.key |= split(".")) | reduce .[] as $obj({}; setpath($obj.key; $obj.value))
