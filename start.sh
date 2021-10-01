#!/bin/bash

export API_ADRESS=$(grep "API_ADRESS" ./config.txt | cut -f2 -d "=")

# manage screen access
mkdir ~/.screen && chmod 700 ~/.screen
export SCREENDIR=$HOME/.screen

# open screen sessions
screen -dmS "frontend" "npm" "start" "--prefix" "react-frontend/"
cd flask-backend/
screen -dmS "backend" "./run_main.sh"
screen -dmS "jbrowse" "npm" "start" "--prefix" "./storage/externalTools/jbrowse/"
cd storage/files
rm -r ~/.cloudcmd.json
screen -dmS "cloudcmd" "cloudcmd" "--save" "--port" "5003" "--one-file-panel" "--no-contact" "--root" "." "--prefix" "/g-nom/portal"