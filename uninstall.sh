#!/bin/bash

# stop docker container
MYSQL_CONTAINER_NAME=$(grep "MYSQL_CONTAINER_NAME" config.txt | cut -f2 -d "=")
NEXTCLOUD_CONTAINER_NAME=$(grep "NEXTCLOUD_CONTAINER_NAME" config.txt | cut -f2 -d "=")
REACTAPP_CONTAINER_NAME=$(grep "REACTAPP_CONTAINER_NAME" config.txt | cut -f2 -d "=")
FLASK_CONTAINER_NAME=$(grep "FLASK_CONTAINER_NAME" config.txt | cut -f2 -d "=")

while true; do
    read -p "Are you sure? All data will be removed! (y/N): " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer y/Y (yes) or n/N (no).";;
    esac
done

echo "Removing G-nom..."
docker rm -f $MYSQL_CONTAINER_NAME $NEXTCLOUD_CONTAINER_NAME $REACTAPP_CONTAINER_NAME $FLASK_CONTAINER_NAME
DATA_DIR=$(grep "DATA_DIR" config.txt | cut -f2 -d "=")
IMPORT_DIR=$(grep "IMPORT_DIR" config.txt | cut -f2 -d "=")
sudo rm -r $DATA_DIR
sudo rm -r $IMPORT_DIR