#!/bin/bash

# kill screen sessions
export SCREENDIR=$HOME/.screen
killall screen

# stop docker container
MYSQL_CONTAINER_NAME=$(grep "MYSQL_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker stop $MYSQL_CONTAINER_NAME