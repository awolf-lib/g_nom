#!/bin/bash

# check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

export API_ADRESS=$(grep "API_ADRESS" ./config.txt | cut -f2 -d "=")

# manage screen access
mkdir ~/.screen && chmod 700 ~/.screen
export SCREENDIR=$HOME/.screen

# start MySQL Docker container
MYSQL_CONTAINER_NAME=$(grep "MYSQL_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker start $MYSQL_CONTAINER_NAME

# start React Docker container
REACTAPP_CONTAINER_NAME=$(grep "REACTAPP_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker start $REACTAPP_CONTAINER_NAME

# open screen sessions
cd flask-backend/
screen -dmS "backend_gnom" "./run_main.sh"
screen -dmS "jbrowse_gnom" "npm" "start" "--prefix" "./storage/externalTools/jbrowse/"
cd storage/files
rm -r ~/.cloudcmd.json
screen -dmS "cloudcmd_gnom" "cloudcmd" "--port" "5003" "--one-file-panel" "--no-contact" "--root" "." "--prefix" "/g-nom/portal" "--open" "false"
cd ../../../
