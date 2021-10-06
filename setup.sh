#!/bin/bash

# check if docker daemon is running
if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!"
  exit 1
fi

# install local requirements
## python2 and python3
sudo apt-get update
sudo apt install python2
sudo apt-get install python3.8

## samtools
echo "Install samtools..."
sudo apt-get install samtools

## screen
echo "Install screen..."
sudo apt-get install screen

## Cloudcommander
echo "Install cloudcmd..."
npm i cloudcmd -g

## Jbrowse requirements
echo "Install and setup Jbrowse..."
sudo apt install build-essential zlib1g-dev

## Jbrowse
wget https://github.com/GMOD/jbrowse/archive/refs/heads/master.zip -P ./flask-backend/storage/externalTools/
unzip ./flask-backend/storage/externalTools/master.zip -d ./flask-backend/storage/externalTools/
mv ./flask-backend/storage/externalTools/jbrowse-master ./flask-backend/storage/externalTools/jbrowse
rm -r ./flask-backend/storage/externalTools/master.zip
cd ./flask-backend/storage/externalTools/jbrowse
./setup.sh
cd ../../../../

## Reactapp
echo "Build reactapp docker container and install dependencies..."
REACTAPP_CONTAINER_NAME=$(grep "REACTAPP_CONTAINER_NAME" config.txt | cut -f2 -d "=")
cd ./react-frontend
docker build -t gnom/reactapp .
docker run --name $REACTAPP_CONTAINER_NAME -dp 3000:3000 gnom/reactapp
cd ..

## Flask Server and Python libraries (venv)
echo "Setting up Python virtual environment..."
python3 -m venv ./flask-backend/venv
source ./flask-backend/venv/bin/activate
pip install -r ./flask-backend/requirements.txt
deactivate

# setup missing directories
echo "Create storage directories..."
mkdir -p ./flask-backend/storage/files/download/assemblies
mkdir -p ./flask-backend/storage/files/download/taxa/images
mkdir -p ./flask-backend/storage/files/download/taxa/taxdmp
mkdir -p ./flask-backend/storage/files/upload/
mkdir -p ./flask-backend/storage/externalTools/
touch ./flask-backend/storage/files/download/taxa/tree.json

# download taxa information from NCBI
echo "Download taxa from NCBI..."
wget https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip -P ./flask-backend/storage/files/download/taxa
unzip ./flask-backend/storage/files/download/taxa/taxdmp.zip -d ./flask-backend/storage/files/download/taxa/taxdmp
rm -r ./flask-backend/storage/files/download/taxa/taxdmp.zip

# read config / write .env
grep "API_ADRESS" config.txt | awk '{print "REACT_APP_"$1}' > ./react-frontend/.env
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
echo "Import taxa into database..."
cd ./flask-backend/
source ./venv/bin/activate
python3 -c 'from src.Tools import DatabaseManager; api=DatabaseManager(); api.reloadTaxonIDsFromFile(1, False)'
deactivate
cd ../