#!/bin/bash

cd src/resources/artworks/jcz
mkdir -p tile-images/cloisters
mkdir -p images/noise
mkdir -p images/cities
mkdir -p images/roads
mkdir -p images/trees

cd images-png
/home/farin/bin/webp-convert-directory.sh
mv *.webp ../images

cd cloisters
/home/farin/bin/webp-convert-directory.sh
mv *.webp ../../images/cloisters

cd ../noise
/home/farin/bin/webp-convert-directory.sh
mv *.webp ../../images/noise

cd ../cities
/home/farin/bin/webp-convert-directory.sh
mv *.webp ../../images/cities

cd ../roads
/home/farin/bin/webp-convert-directory.sh
mv *.webp ../../images/roads

cd ../trees
/home/farin/bin/webp-convert-directory.sh
mv *.webp ../../images/trees
