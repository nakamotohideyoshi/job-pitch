#! /bin/bash

path_src=./build
path_dst=../web/src/web

# yarn build

echo ""
echo "removing old data..."

rm $path_dst/templates/*
rm -r $path_dst/static/*

echo ""
echo "copying templates data..."

for f in $path_src/*.*
do 
    cp ${f%} $path_dst/templates
done

echo "copying static data..."

cp -a $path_src/static/* $path_dst/static

echo ""
