#!/bin/bash

# Example
#  ./dev-utils/rename-trans.sh "tile-set.winter" "xxx.winter"

for file in `find src/renderer/locales/*.json`; do
  (rm -f $file && jq --sort-keys --indent 2 "." > $file) < $file
done

