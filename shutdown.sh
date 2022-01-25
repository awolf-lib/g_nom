#!/bin/bash

# stop docker container
source ./default.config
source ./local.config

docker stop $MYSQL_CONTAINER_NAME $FRONTEND_CONTAINER_NAME $API_CONTAINER_NAME $JBROWSE_CONTAINER_NAME $FILE_SERVER_CONTAINER_NAME $RABBIT_CONTAINER_NAME