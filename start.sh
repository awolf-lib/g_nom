#!/bin/bash

sudo /etc/init.d/mysql start
screen -dmS "frontend" "npm" "start" "--prefix" "react-frontend/"
cd flask-backend/
screen -dmS "backend" "./run_main.sh"
screen -dmS "jbrowse" "npm" "start" "--prefix" "./storage/externalTools/jbrowse/"
cd storage/files
screen -dmS "cloudcmd" "cloudcmd" "--save" "--port" "5003" "--one-file-panel" "--no-contact" "--root" "." "--prefix" "/g-nom/portal"