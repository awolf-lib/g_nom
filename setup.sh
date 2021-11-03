#!/bin/bash

# check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

## get config
DATA_DIR=$(grep "DATA_DIR" config.txt | cut -f2 -d "=")
IMPORT_DIR=$(grep "IMPORT_DIR" config.txt | cut -f2 -d "=")

MYSQL_CONTAINER_NAME=$(grep "MYSQL_CONTAINER_NAME" config.txt | cut -f2 -d "=")
MYSQL_ROOT_PASSWORD=$(grep "MYSQL_ROOT_PASSWORD" config.txt | cut -f2 -d "=")
MYSQL_HOST_ADRESS=$(grep "MYSQL_HOST_ADRESS" config.txt | cut -f2 -d "=")

NEXTCLOUD_CONTAINER_NAME=$(grep "NEXTCLOUD_CONTAINER_NAME" config.txt | cut -f2 -d "=")
NEXTCLOUD_DOWNLOAD_ADRESS=$(grep "NEXTCLOUD_DOWNLOAD_ADRESS" config.txt | cut -f2 -d "=")

REACTAPP_CONTAINER_NAME=$(grep "REACTAPP_CONTAINER_NAME" config.txt | cut -f2 -d "=")

FLASK_CONTAINER_NAME=$(grep "FLASK_CONTAINER_NAME" config.txt | cut -f2 -d "=")
API_ADRESS=$(grep "API_ADRESS" config.txt | cut -f2 -d "=")
JBROWSE_ADRESS=$(grep "JBROWSE_ADRESS" config.txt | cut -f2 -d "=")
JBROWSE_DIR=$(grep "JBROWSE_DIR" config.txt | cut -f2 -d "=")

# ============================================ #

## MySQL
echo "Build mysql docker container..."
# start
echo "Start ${MYSQL_CONTAINER_NAME} container..."
docker run -p 3306:3306 --name $MYSQL_CONTAINER_NAME -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD --network gnom_app -d mysql/mysql-server:latest -h $MYSQL_HOST_ADRESS

echo "Waiting for database to start..."
while [ "`docker inspect -f {{.State.Health.Status}} ${MYSQL_CONTAINER_NAME}`" != "healthy" ]; do sleep 1; done
# users
echo "Adding users to database..."
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"CREATE USER 'root'@'%' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';\"; exit;"
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"GRANT ALL PRIVILEGES ON * . * TO 'root'@'%' WITH GRANT OPTION;\"; exit;"
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"FLUSH PRIVILEGES;\"; exit;"

echo "Create database schema by template..."
cat ./mysql/create_g-nom_dev.sql | docker exec -i $MYSQL_CONTAINER_NAME /usr/bin/mysql -u root --password=$MYSQL_ROOT_PASSWORD

# ============================================ #

## Nextcloud server
echo "Build nextcloud docker container..."
mkdir -p ${DATA_DIR}
# start
echo "Start ${NEXTCLOUD_CONTAINER_NAME} container..."
docker run --name ${NEXTCLOUD_CONTAINER_NAME} --network gnom_app -v ${DATA_DIR}:/var/www/html/data -e MYSQL_DATABASE=nextcloud -e MYSQL_USER=root -e MYSQL_PASSWORD=${MYSQL_ROOT_PASSWORD} -e MYSQL_HOST=${MYSQL_CONTAINER_NAME} -e NEXTCLOUD_ADMIN_USER=admin -e NEXTCLOUD_ADMIN_PASSWORD=admin -e NEXTCLOUD_DATA_DIR=/var/www/html/data -d -p 8080:80 nextcloud 

echo "Waiting for nextcloud installation..."
sleep 30;

# setup nexloud defaults
echo "Remove default nextcloud files and setup group folders..."
docker exec $NEXTCLOUD_CONTAINER_NAME bash -c "rm -r /var/www/html/core/skeleton/*"
docker exec $NEXTCLOUD_CONTAINER_NAME bash -c "rm -r /var/www/html/data/admin/files/*"
# group folders
echo "Install group folders addon..."
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ app:install groupfolders
echo "Setup nextcloud groups..."
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ group:add all
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ group:adduser all admin

echo "Setup nextcloud group directories..."
# assemblies directory
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:create assemblies
ASSEMBLIES_FOLDER_ID=$(docker exec -u www-data nextcloud_gnom php occ groupfolders:list | grep -m 1 "assemblies" | cut -d '|' -f 2 | tr -d " \t\n\r")
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:group ${ASSEMBLIES_FOLDER_ID} all share
# taxa directory
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:create taxa
TAXA_FOLDER_ID=$(docker exec -u www-data nextcloud_gnom php occ groupfolders:list | grep -m 1 "taxa" | cut -d '|' -f 2 | tr -d " \t\n\r")
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ groupfolders:group ${TAXA_FOLDER_ID} all share
# reindex
echo "Reindex nextcloud directories..."
docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ files:scan --all

# ============================================ #

## Reactapp
echo "Build reactapp docker container and install dependencies..."c
# envs
grep "API_ADRESS" config.txt | awk '{print "REACT_APP_"$1}' > ./react-frontend/.env
grep "NEXTCLOUD_DOWNLOAD_ADRESS" config.txt | awk '{print "REACT_APP_"$1}' >> ./react-frontend/.env
grep "JBROWSE_ADRESS" config.txt | awk '{print "REACT_APP_"$1}' >> ./react-frontend/.env
# build
cd ./react-frontend
docker build --no-cache -t gnom/reactapp .
# start
echo "Start ${REACTAPP_CONTAINER_NAME} container..."
docker run --name $REACTAPP_CONTAINER_NAME --network gnom_app -d -p 5000:5000 gnom/reactapp
# docker run --name $REACTAPP_CONTAINER_NAME -v PATH/TO/LOCAL/SRC:/react-frontend/src --network gnom_app -d -p 3000:3000 gnom/reactapp npm start
cd ..

# ============================================ #

## Flask server
echo "Build flask docker container and install dependencies..."
# build
cd ./flask-backend
docker build -t gnom/flask .
# start
echo "Start ${FLASK_CONTAINER_NAME} container..."
docker run --name $FLASK_CONTAINER_NAME -e "API_ADRESS=${API_ADRESS}" -e "NEXTCLOUD_DOWNLOAD_ADRESS=${NEXTCLOUD_DOWNLOAD_ADRESS}" -e "JBROWSE_ADRESS=${JBROWSE_ADRESS}" -v ${DATA_DIR}/__groupfolders/${ASSEMBLIES_FOLDER_ID}:/flask-backend/data/storage/assemblies -v ${DATA_DIR}/__groupfolders/${TAXA_FOLDER_ID}:/flask-backend/data/storage/taxa -v ${IMPORT_DIR}:/flask-backend/data/import --network gnom_app -dp 3002:3002 gnom/flask
# docker run --name $FLASK_CONTAINER_NAME -v PATH/TO/LOCAL/SRC:/flask-backend/src -e "API_ADRESS=${API_ADRESS}" -e "NEXTCLOUD_DOWNLOAD_ADRESS=${NEXTCLOUD_DOWNLOAD_ADRESS}" -e "JBROWSE_ADRESS=${JBROWSE_ADRESS}" -v ${DATA_DIR}/__groupfolders/${ASSEMBLIES_FOLDER_ID}:/flask-backend/data/storage/assemblies -v ${DATA_DIR}/__groupfolders/${TAXA_FOLDER_ID}:/flask-backend/data/storage/taxa -v ${IMPORT_DIR}:/flask-backend/data/import --network gnom_app -dp 3002:3002 gnom/flask
cd ..

echo "Waiting for flask server to start..."
sleep 5;

# setup missing directories
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/assemblies"
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/taxa/images"
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/taxa/taxdmp"
docker exec $FLASK_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/import"
docker exec $FLASK_CONTAINER_NAME bash -c "touch /flask-backend/data/storage/taxa/tree.json"
# RUN mkdir -p ./storage/externalTools/

# download taxa information from NCBI
docker exec $FLASK_CONTAINER_NAME bash -c "wget https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip -P /flask-backend/data/storage/taxa && unzip /flask-backend/data/storage/taxa/taxdmp.zip -d /flask-backend/data/storage/taxa/taxdmp"
docker exec $FLASK_CONTAINER_NAME bash -c "rm -r /flask-backend/data/storage/taxa/taxdmp.zip"

docker exec -u www-data $NEXTCLOUD_CONTAINER_NAME php occ files:scan --all

# ============================================ #

# initial taxa import into database
echo "Initial taxa import..."
curl -v ${API_ADRESS}/reloadTaxonIDsFromFile?userID=1

# ============================================ #

mkdir -p ${IMPORT_DIR}

# remove prune containers
docker image prune

echo "Sucessfully setup G-nom!"