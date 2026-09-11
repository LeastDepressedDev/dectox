#!/bin/bash

if [[ -d "build" ]]; then
    rm -r build
fi
mkdir build

npm install
npm run compile
vsce package --allow-star-activation