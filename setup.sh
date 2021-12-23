#!/bin/bash

# check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

## get config
source ./default.config
source ./local.config

# ============================================ #

## Docker network
docker network create ${DOCKER_NETWORK_NAME}

# ============================================ #

## MySQL
echo "Build mysql docker container..."
# start
echo "Start ${MYSQL_CONTAINER_NAME} container..."
docker run -p 3306:3306 --name $MYSQL_CONTAINER_NAME -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD --network ${DOCKER_NETWORK_NAME} -d mysql/mysql-server:8.0.27 -h $MYSQL_HOST_ADRESS

echo "Waiting for database to start..."
while [ "`docker inspect -f {{.State.Health.Status}} ${MYSQL_CONTAINER_NAME}`" != "healthy" ]; do 
    printf '.'
    sleep 3
done
echo ""

# users
echo "Adding users to database..."
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"CREATE USER 'root'@'%' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';\"; exit;"
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"GRANT ALL PRIVILEGES ON * . * TO 'root'@'%' WITH GRANT OPTION;\"; exit;"
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"FLUSH PRIVILEGES;\"; exit;"

echo "Create base database schemas by template..."
cat ./mysql/create_gnom_db.sql | docker exec -i $MYSQL_CONTAINER_NAME /usr/bin/mysql -u root --password=$MYSQL_ROOT_PASSWORD

# ============================================ #

# ## Nextcloud server
# echo "Build nextcloud docker container..."
# mkdir -p ${DATA_DIR}
# # start
# echo "Start ${NEXTCLOUD_CONTAINER_NAME} container..."
# docker run --name ${NEXTCLOUD_CONTAINER_NAME} --network ${DOCKER_NETWORK_NAME} -v ${DATA_DIR}:/var/www/html/data -e MYSQL_DATABASE=nextcloud -e MYSQL_USER=root -e MYSQL_PASSWORD=${MYSQL_ROOT_PASSWORD} -e MYSQL_HOST=${MYSQL_CONTAINER_NAME} -e NEXTCLOUD_ADMIN_USER=admin -e NEXTCLOUD_ADMIN_PASSWORD=admin -e NEXTCLOUD_DATA_DIR=/var/www/html/data -d -p 8080:80 nextcloud

# echo "Waiting for nextcloud installation..."
# until [ $(curl --write-out '%{http_code}' --silent --output /dev/null  ${NEXTCLOUD_DOWNLOAD_ADRESS}/login) -eq 200 ]; do
#   printf "."
#   sleep 3;
# done;
# echo ""

# # setup nexloud defaults
# echo "Remove default nextcloud files and setup group folders..."
# docker exec $NEXTCLOUD_CONTAINER_NAME bash -c "rm -r /var/www/html/core/skeleton/*"
# docker exec $NEXTCLOUD_CONTAINER_NAME bash -c "rm -r /var/www/html/data/admin/files/*"
# # group folders
# echo "Install group folders addon..."
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ app:install groupfolders
# echo "Setup nextcloud groups..."
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ group:add all
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ group:adduser all admin

# echo "Setup nextcloud group directories..."
# # assemblies directory
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:create assemblies
# ASSEMBLIES_FOLDER_ID=$(docker exec -u www-data ${NEXTCLOUD_CONTAINER_NAME} php occ groupfolders:list | grep -m 1 "assemblies" | cut -d '|' -f 2 | tr -d " \t\n\r")
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:group ${ASSEMBLIES_FOLDER_ID} all share
# # taxa directory
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:create taxa
# TAXA_FOLDER_ID=$(docker exec -u www-data ${NEXTCLOUD_CONTAINER_NAME} php occ groupfolders:list | grep -m 1 "taxa" | cut -d '|' -f 2 | tr -d " \t\n\r")
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:group ${TAXA_FOLDER_ID} all share
# # reindex
# echo "Reindex nextcloud directories..."
# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ files:scan --all

# ============================================ #

## RabbitMQ
docker run -d --network ${DOCKER_NETWORK_NAME} --hostname gnom_rabbit_host --name ${RABBIT_CONTAINER_NAME} -p 15672:15672 -p 5672:5672 rabbitmq:3-management-alpine

## Reactapp
echo "Build reactapp docker container and install dependencies..."
# envs
# grep "API_ADRESS" default.config | awk '{print "REACT_APP_"$1}' > ./react-frontend/.env
# grep "NEXTCLOUD_DOWNLOAD_ADRESS" default.config | awk '{print "REACT_APP_"$1}' >> ./react-frontend/.env
# grep "JBROWSE_ADRESS" default.config | awk '{print "REACT_APP_"$1}' >> ./react-frontend/.env
echo "REACT_APP_API_ADRESS=${API_ADRESS}" > ./react-frontend/.env
echo "REACT_APP_NEXTCLOUD_DOWNLOAD_ADRESS=${NEXTCLOUD_DOWNLOAD_ADRESS}" >> ./react-frontend/.env
echo "REACT_APP_JBROWSE_ADRESS=${JBROWSE_ADRESS}" >> ./react-frontend/.env

# build
mkdir -p ${IMPORT_DIR}
cd ./react-frontend
docker build --no-cache -t gnom/reactapp .
# start
echo "Start ${REACTAPP_CONTAINER_NAME} container..."
docker run --name $REACTAPP_CONTAINER_NAME --network ${DOCKER_NETWORK_NAME} -d -p 5000:5000 gnom/reactapp
cd ..

# ============================================ #

## Flask server
echo "Build flask docker container and install dependencies..."
# build
cd ./flask-backend
docker build -t gnom/flask .
# start
echo "Start ${FLASK_CONTAINER_NAME} container..."
docker run --name $FLASK_CONTAINER_NAME -e "MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME}" -e "MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}" -e "API_ADRESS=${API_ADRESS}" -e "NEXTCLOUD_DOWNLOAD_ADRESS=${NEXTCLOUD_DOWNLOAD_ADRESS}" -e "JBROWSE_ADRESS=${JBROWSE_ADRESS}" -e "RABBIT_CONTAINER_NAME=${RABBIT_CONTAINER_NAME}" -v ${DATA_DIR}/taxa:/flask-backend/data/storage/taxa -v ${IMPORT_DIR}:/flask-backend/data/import --network ${DOCKER_NETWORK_NAME} -dp 3002:3002 gnom/flask
cd ..

echo "Waiting for flask server to start..."
until [ $(curl --write-out '%{http_code}' --silent --output /dev/null  ${API_ADRESS}/connectionTest) -eq 200 ]; do
  printf "."
  sleep 3;
done;
echo ""

# JBrowse container
echo "Build jbrowse docker container"
cd ./jbrowse
docker build -t gnom/jbrowse .
echo "RABBIT_CONTAINER_NAME=${RABBIT_CONTAINER_NAME}" > .env
docker run --name $JBROWSE_CONTAINER_NAME -v ${DATA_DIR}/taxa:/flask-backend/data/storage/taxa -dp 8082:80 --env-file .env --network $DOCKER_NETWORK_NAME gnom/jbrowse
cd ..

# setup missing directories
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/assemblies"
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/taxa/images"
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/taxa/taxdmp"
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/import"
docker exec $FLASK_CONTAINER_NAME bash -c "touch /flask-backend/data/storage/taxa/tree.json"
docker exec $FLASK_CONTAINER_NAME bash -c "echo '{}' > /flask-backend/data/storage/taxa/tree.json"
# RUN mkdir -p ./storage/externalTools/

# download taxa information from NCBI
docker exec $FLASK_CONTAINER_NAME bash -c "wget -q https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip -P /flask-backend/data/storage/taxa && unzip /flask-backend/data/storage/taxa/taxdmp.zip -d /flask-backend/data/storage/taxa/taxdmp"
docker exec $FLASK_CONTAINER_NAME bash -c "rm -r /flask-backend/data/storage/taxa/taxdmp.zip"

# docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ files:scan --all

# ============================================ #

# initial taxa import into database
echo "Initial taxa import..."
docker exec $FLASK_CONTAINER_NAME bash -c "cd src/ && python3 -m modules.taxa reloadTaxonIDsFromFile && cd .."

# ============================================ #

echo "Successfully setup G-nom!"
