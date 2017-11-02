#!/bin/bash

set -e 
webpack --config webpack.prod.config.js --env production -p
cordova build
