#!usr/bin/sh
git pull
#Run Node servers in background
node app.js &
node app_static.js
