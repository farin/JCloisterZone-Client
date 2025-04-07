. as $in
| reduce leaf_paths as $path ({};
     . + { ($path | map(tostring) | join(".")): $in | getpath($path) })
