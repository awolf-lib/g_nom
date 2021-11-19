#!/bin/bash

# stop docker container
source ./default.config
source ./local.config

docker stop $MYSQL_CONTAINER_NAME $NEXTCLOUD_CONTAINER_NAME $REACTAPP_CONTAINER_NAME $FLASK_CONTAINER_NAME $JBROWSE_CONTAINER_NAME
