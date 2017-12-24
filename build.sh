#!/bin/bash

set -e 
npm-run webpack --config webpack.prod.config.js --env production
cordova build
