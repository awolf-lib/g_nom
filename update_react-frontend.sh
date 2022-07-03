#!/bin/bash

# check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

## get config
source ./default.config
source ./local.config

# remove react container
docker rm -f $FRONTEND_CONTAINER_NAME

# rebuild container
cd ./react-frontend
docker build --no-cache -t gnom/reactapp .
cd ..

# restart container
docker run --name $FRONTEND_CONTAINER_NAME --network ${DOCKER_NETWORK_NAME} --restart on-failure:10 -d -p 5000:5000 gnom/reactapp