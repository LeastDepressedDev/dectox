#!/bin/bash

if [[ -d "build" ]]; then
    rm -r build
fi
mkdir build

if [[ ! $1 = 'offline' ]]; then
    npm install
fi

npm run compile --verbose
cp -r src/assets build/assets
cp src/left-bar/OptionsProvider.html build/assets/OptionsProvider.html
vsce package --allow-star-activation --readme-path src/README.md