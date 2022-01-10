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
docker run --name $MYSQL_CONTAINER_NAME --network ${DOCKER_NETWORK_NAME} --restart on-failure:5 -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD mysql/mysql-server:8.0.27

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

## RabbitMQ
docker run --name ${RABBIT_CONTAINER_NAME} --network ${DOCKER_NETWORK_NAME} --restart on-failure:5 -d -p 15672:15672 -p 5672:5672 --hostname gnom_rabbit_host rabbitmq:3-management-alpine

# ============================================ #

## Nextcloud server
echo "Build nextcloud docker container..."
mkdir -p ${DATA_DIR}
# start
echo "Start ${FILE_SERVER_CONTAINER_NAME} container..."
cd ./fileserver
docker build --no-cache -t gnom/nextcloud .
docker run --name ${FILE_SERVER_CONTAINER_NAME} --network ${DOCKER_NETWORK_NAME} --restart on-failure:5 -v ${DATA_DIR}:/var/www/data/ -e RABBIT_CONTAINER_NAME=${RABBIT_CONTAINER_NAME} -e MYSQL_DATABASE=nextcloud -e MYSQL_USER=root -e MYSQL_PASSWORD=${MYSQL_ROOT_PASSWORD} -e MYSQL_HOST=${MYSQL_CONTAINER_NAME} -e NEXTCLOUD_ADMIN_USER=${INITIAL_USER_USERNAME} -e NEXTCLOUD_ADMIN_PASSWORD=${INITIAL_USER_PASSWORD} -e NEXTCLOUD_DATA_DIR=/var/www/html/data -d -p 8080:80 gnom/nextcloud
cd ..

echo "Waiting for nextcloud installation..."
until [ $(curl --write-out '%{http_code}' --silent --output /dev/null  ${FILE_SERVER_ADRESS}:${FILE_SERVER_PORT}/login) -eq 200 ]; do
  printf "."
  sleep 3;
done;
echo ""

docker exec -u www-data $FILE_SERVER_CONTAINER_NAME php occ app:install files_external
docker exec -u www-data $FILE_SERVER_CONTAINER_NAME php occ app:enable files_external
docker exec -u www-data $FILE_SERVER_CONTAINER_NAME php occ files_external:create -c datadir=/var/www/data "GnomData" 'local' null::null
docker exec -u www-data $FILE_SERVER_CONTAINER_NAME php occ app:disable password_policy
docker exec -u www-data $FILE_SERVER_CONTAINER_NAME php occ app:disable photos
docker exec -u www-data $FILE_SERVER_CONTAINER_NAME php occ app:install announcementcenter

# setup nextcloud defaults
echo "Remove default nextcloud files and setup group folders..."
docker exec $FILE_SERVER_CONTAINER_NAME bash -c "rm -r /var/www/html/core/skeleton/*"
docker exec $FILE_SERVER_CONTAINER_NAME bash -c "rm -r /var/www/html/data/$INITIAL_USER_USERNAME/files/*"

# reindex
echo "Reindex nextcloud directories..."
docker exec -u www-data $FILE_SERVER_CONTAINER_NAME php occ files:scan --all

docker exec -it $FILE_SERVER_CONTAINER_NAME python3 /usr/local/j_listener/main.py &

# ============================================ #

## Reactapp
echo "Build reactapp docker container and install dependencies..."
# envs
echo "REACT_APP_API_ADRESS=http://${API_ADRESS}:${API_PORT}" > ./react-frontend/.env
echo "REACT_APP_FILE_SERVER_ADRESS=http://${FILE_SERVER_ADRESS}:${FILE_SERVER_PORT}" >> ./react-frontend/.env
echo "REACT_APP_JBROWSE_ADRESS=http://${JBROWSE_ADRESS}:${JBROWSE_PORT}" >> ./react-frontend/.env

# build
mkdir -p ${IMPORT_DIR}
cd ./react-frontend
docker build --no-cache -t gnom/reactapp .
# start
echo "Start ${FRONTEND_CONTAINER_NAME} container..."
docker run --name $FRONTEND_CONTAINER_NAME --network ${DOCKER_NETWORK_NAME} --restart on-failure:5 -d -p 5000:5000 gnom/reactapp
cd ..

# ============================================ #

## Flask server
echo "Build flask docker container and install dependencies..."
# build
cd ./flask-backend
docker build -t gnom/flask .
# start
echo "Start ${API_CONTAINER_NAME} container..."
docker run --name $API_CONTAINER_NAME --network ${DOCKER_NETWORK_NAME} --restart on-failure:5 -d -p ${API_PORT}:${API_PORT} -v ${DATA_DIR}/taxa:/flask-backend/data/storage/taxa -v ${IMPORT_DIR}:/flask-backend/data/import -e RABBIT_WORKER_COUNT=${RABBIT_WORKER_COUNT} -e MYSQL_HOST=${MYSQL_CONTAINER_NAME} -e INITIAL_USER_USERNAME=${INITIAL_USER_USERNAME} -e INITIAL_USER_PASSWORD=${INITIAL_USER_PASSWORD} -e MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME} -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD} -e API_ADRESS=http://${API_ADRESS} -e API_PORT=${API_PORT} -e FILE_SERVER_ADRESS=${FILE_SERVER_ADRESS} -e JBROWSE_ADRESS=${JBROWSE_ADRESS} -e RABBIT_CONTAINER_NAME=${RABBIT_CONTAINER_NAME} gnom/flask
cd ..

echo "Waiting for flask server to start..."
until [ $(curl --write-out '%{http_code}' --silent --output /dev/null  http://${API_ADRESS}:${API_PORT}/connectionTest) -eq 200 ]; do
  printf "."
  sleep 3;
done;
echo ""

# JBrowse container
echo "Build jbrowse docker container"
cd ./jbrowse
docker build -t gnom/jbrowse .
echo "RABBIT_CONTAINER_NAME=${RABBIT_CONTAINER_NAME}" > .env
docker run --name $JBROWSE_CONTAINER_NAME --network $DOCKER_NETWORK_NAME --restart on-failure:5 -d -p 8082:80 -v ${DATA_DIR}/taxa:/flask-backend/data/storage/taxa --env-file .env gnom/jbrowse

docker exec $JBROWSE_CONTAINER_NAME bash -c "npm i -g @jbrowse/cli@1.5.3"
docker exec $JBROWSE_CONTAINER_NAME bash -c "jbrowse create -f /usr/local/apache2/htdocs"

cd ..

# setup missing directories
docker exec $API_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/assemblies"
docker exec $API_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/storage/taxa/taxdmp"
docker exec $API_CONTAINER_NAME bash -c "mkdir -p /flask-backend/data/import"
docker exec $API_CONTAINER_NAME bash -c "touch /flask-backend/data/storage/taxa/tree.json"
docker exec $API_CONTAINER_NAME bash -c "echo '{}' > /flask-backend/data/storage/taxa/tree.json"

# download taxa information from NCBI
docker exec $API_CONTAINER_NAME bash -c "wget -q https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip -P /flask-backend/data/storage/taxa && unzip -qq /flask-backend/data/storage/taxa/taxdmp.zip -d /flask-backend/data/storage/taxa/taxdmp"
docker exec $API_CONTAINER_NAME bash -c "rm -r /flask-backend/data/storage/taxa/taxdmp.zip"

# ============================================ #

# initial user import into database
echo "Initial user import..."
docker exec $API_CONTAINER_NAME bash -c "cd src/ && python3 -m modules.users addInitialUser && cd .."

# initial taxa import into database
echo "Initial taxa import..."
docker exec $API_CONTAINER_NAME bash -c "cd src/ && python3 -m modules.taxa reloadTaxonIDsFromFile && cd .."

# ============================================ #

echo "Successfully setup G-nom!"