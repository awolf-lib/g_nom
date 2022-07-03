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
docker rm -f $API_CONTAINER_NAME

# rebuild container
cd ./flask-backend
docker build -t gnom/flask .
cd ..

# restart container
docker run --name $API_CONTAINER_NAME --network ${DOCKER_NETWORK_NAME} --restart on-failure:10 -d -p ${API_PORT}:${API_PORT} -v ${DATA_DIR}/taxa:/flask-backend/data/storage/taxa -v ${IMPORT_DIR}:/flask-backend/data/import -e RABBIT_WORKER_COUNT=${RABBIT_WORKER_COUNT} -e MYSQL_HOST=${MYSQL_CONTAINER_NAME} -e INITIAL_USER_USERNAME=${INITIAL_USER_USERNAME} -e INITIAL_USER_PASSWORD=${INITIAL_USER_PASSWORD} -e MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME} -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD} -e API_ADRESS=${PROTOCOL}://${API_ADRESS} -e API_PORT=${API_PORT} -e FILE_SERVER_ADRESS=${FILE_SERVER_ADRESS} -e JBROWSE_ADRESS=${JBROWSE_ADRESS} -e RABBIT_CONTAINER_NAME=${RABBIT_CONTAINER_NAME} gnom/flask