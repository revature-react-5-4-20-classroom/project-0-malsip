#!/bin/sh
echo "running npm install"
npm install

echo "modifying compiler option"
export TS_NODE_COMPILER_OPTIONS='{"esModuleInterop":true}'

echo "success!"

# {
#     user: 'malsip',
#     host: 'mark-alsip-project-zero.cab3p8px90sp.us-east-2.rds.amazonaws.com',
#     database: 'P0Data',
#     password: 'l0fh34ty',
#     port: 5432
# };
#setting doesnt work
export PG_USER='malsip'
export PG_HOST='mark-alsip-project-zero.cab3p8px90sp.us-east-2.rds.amazonaws.com'
export PG_DATABASE='P0Data'
export PG_PASSWORD='l0fh34ty'