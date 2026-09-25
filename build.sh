#!/bin/bash

if [[ -d "build" ]]; then
    rm -r build
fi
mkdir build

if [[ ! $1 = 'offline' ]]; then
    npm install
fi

npm run compile --verbose
npx typedoc src/** --skipErrorChecking --readme README.md
vsce package --allow-star-activation --readme-path src/README.md