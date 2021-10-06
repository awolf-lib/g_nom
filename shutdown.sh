#!/bin/bash

# kill screen sessions
export SCREENDIR=$HOME/.screen
killall screen

# stop docker container
MYSQL_CONTAINER_NAME=$(grep "MYSQL_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker stop $MYSQL_CONTAINER_NAME

# stop React Docker container
REACTAPP_CONTAINER_NAME=$(grep "REACTAPP_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker stop $REACTAPP_CONTAINER_NAME