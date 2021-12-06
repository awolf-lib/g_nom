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
docker rm -f $MYSQL_CONTAINER_NAME $NEXTCLOUD_CONTAINER_NAME $REACTAPP_CONTAINER_NAME $FLASK_CONTAINER_NAME $JBROWSE_CONTAINER_NAME $RABBIT_CONTAINER_NAME
sudo rm -r $DATA_DIR
sudo rm -r $IMPORT_DIR