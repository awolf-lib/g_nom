#!/bin/bash

# stop docker container
source ./default.config
source ./local.config

while true; do
    read -p "Are you sure? All data will be removed! (y/N): " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y/Y (yes) or n/N (no).";;
    esac
done

echo "Removing G-nom..."
docker rm -f $MYSQL_CONTAINER_NAME $FRONTEND_CONTAINER_NAME $API_CONTAINER_NAME $JBROWSE_CONTAINER_NAME $RABBIT_CONTAINER_NAME $FILE_SERVER_CONTAINER_NAME gnom_fileserver
# docker rm -f $NEXTCLOUD_CONTAINER_NAME
docker network rm $DOCKER_NETWORK_NAME

while true; do
    read -p "Also remove data/import directory (y/N): " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y/Y (yes) or n/N (no).";;
    esac
done
sudo rm -r $DATA_DIR
sudo rm -r $IMPORT_DIR