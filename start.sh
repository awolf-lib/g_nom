#!/bin/bash

# check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

source ./default.config
source ./local.config

# start MySQL Docker container
docker start $MYSQL_CONTAINER_NAME

# start Flask Docker container
docker start $NEXTCLOUD_CONTAINER_NAME

# start React Docker container
docker start $REACTAPP_CONTAINER_NAME

# start Flask Docker container
docker start $FLASK_CONTAINER_NAME
