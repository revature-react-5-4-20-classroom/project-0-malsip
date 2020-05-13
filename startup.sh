#!/bin/sh
echo "running npm install"
npm install

echo "modifying compiler option"
export TS_NODE_COMPILER_OPTIONS='{"esModuleInterop":true}'

echo "success!"