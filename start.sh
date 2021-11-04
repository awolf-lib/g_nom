#!/bin/bash

# check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

# start MySQL Docker container
MYSQL_CONTAINER_NAME=$(grep "MYSQL_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker start $MYSQL_CONTAINER_NAME

# start Flask Docker container
NEXTCLOUD_CONTAINER_NAME=$(grep "NEXTCLOUD_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker start $NEXTCLOUD_CONTAINER_NAME

# start React Docker container
REACTAPP_CONTAINER_NAME=$(grep "REACTAPP_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker start $REACTAPP_CONTAINER_NAME

# start Flask Docker container
FLASK_CONTAINER_NAME=$(grep "FLASK_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker start $FLASK_CONTAINER_NAME
