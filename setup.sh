#!/bin/bash

# install local requirements
## samtools
sudo apt-get install samtools

## screen
sudo apt-get install screen

## Cloudcommander
npm i cloudcmd -g

## Jbrowse requirements
sudo apt install build-essential zlib1g-dev

## Jbrowse
wget https://github.com/GMOD/jbrowse/archive/refs/heads/master.zip -P ./flask-backend/storage/externalTools/
unzip ./flask-backend/storage/externalTools/master.zip -d ./flask-backend/storage/externalTools/
mv ./flask-backend/storage/externalTools/jbrowse-master ./flask-backend/storage/externalTools/jbrowse
rm -r ./flask-backend/storage/externalTools/master.zip
cd ./flask-backend/storage/externalTools/jbrowse
./setup.sh
cd ../../../../

## React Webapp
cd ./react-frontend
npm install
cd ..

## Flask Server and Python libraries (venv)
python3 -m venv ./flask-backend/venv
source ./flask-backend/venv/bin/activate
pip install -r ./flask-backend/requirements.txt
deactivate

# setup missing directories
mkdir -p ./flask-backend/storage/files/download/assemblies
mkdir -p ./flask-backend/storage/files/download/taxa/images
mkdir -p ./flask-backend/storage/files/download/taxa/taxdmp
mkdir -p ./flask-backend/storage/files/upload/
mkdir -p ./flask-backend/storage/externalTools/
touch ./flask-backend/storage/files/download/taxa/tree.json

# download taxa information from NCBI
wget https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip -P ./flask-backend/storage/files/download/taxa
unzip ./flask-backend/storage/files/download/taxa/taxdmp.zip -d ./flask-backend/storage/files/download/taxa/taxdmp
rm -r ./flask-backend/storage/files/download/taxa/taxdmp.zip

# read config / write .env
grep "API_ADRESS" config.txt | awk '{print "REACT_APP_"$1}' >> ./react-frontend/.env
grep "FTP_ADRESS" config.txt | awk '{print "REACT_APP_"$1}' >> ./react-frontend/.env
grep "JBROWSE_ADRESS" config.txt | awk '{print "REACT_APP_"$1}' >> ./react-frontend/.env

# setup mysql docker container
MYSQL_HOST_ADRESS=$(grep "MYSQL_HOST_ADRESS" config.txt | cut -f2 -d "=")
MYSQL_ROOT_PASSWORD=$(grep "MYSQL_ROOT_PASSWORD" config.txt | cut -f2 -d "=")
MYSQL_CONTAINER_NAME=$(grep "MYSQL_CONTAINER_NAME" config.txt | cut -f2 -d "=")
docker run -p 3306:3306 --name=$MYSQL_CONTAINER_NAME -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD -d mysql/mysql-server:latest -h $MYSQL_HOST_ADRESS
echo "Waiting for container to start..."
while [ "`docker inspect -f {{.State.Health.Status}} ${MYSQL_CONTAINER_NAME}`" != "healthy" ]; do sleep 1; done 
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"CREATE USER 'gnom'@'${MYSQL_HOST_ADRESS}' IDENTIFIED BY 'G-nom_BOT#0';\"; exit;"
docker exec $MYSQL_CONTAINER_NAME bash -c "mysql -P 3306 -uroot -p${MYSQL_ROOT_PASSWORD} -e \"GRANT ALL PRIVILEGES ON * . * TO 'gnom'@'${MYSQL_HOST_ADRESS}';\"; exit;"
cat ./mysql/create_g-nom_dev.sql | docker exec -i $MYSQL_CONTAINER_NAME /usr/bin/mysql -u root --password=$MYSQL_ROOT_PASSWORD

# initial load taxa
cd ./flask-backend/src/
python3 -c 'from Tools import DatabaseManager; api=DatabaseManager(); api.reloadTaxonIDsFromFile(1, False)'
cd ../../