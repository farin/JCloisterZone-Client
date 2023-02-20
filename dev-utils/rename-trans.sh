#!/bin/bash

# Example
#  ./dev-utils/rename-trans.sh "tile-set.winter" "xxx.winter"

for file in `find src/renderer/locales/*.json`; do
  # file='src/renderer/locales
  # echo $file
  (rm -f $file && jq -f dev-utils/jq/flatten_json.jq | \
    jq -f dev-utils/jq/rename.jq --arg from $1 --arg to $2 | \
    jq -f dev-utils/jq/nested_json.jq > $file) < $file
done

