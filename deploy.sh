#!/usr/bin/sh
# Comment these out or change them if you're not using this on wolfy1339's VPS
SCREEN1_ID=12509
SCREEN2_ID=12491

git pull

#Run Node servers in background
if [-z $SCREEN1_ID] && [-z $SCREEN2_ID]
    then
        screen -r  $SCREEN1_ID -X stuff 'node app.js\n'
        screen -r $SCREEN2_ID -X stuff 'node app_static.js\n'
    else
        node app.js &
        node app_static.js &
fi
