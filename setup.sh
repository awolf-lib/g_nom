#!/bin/bash

mkdir -p ./flask-backend/storage/files/download/assemblies
mkdir -p ./flask-backend/storage/files/download/taxa/images
mkdir -p ./flask-backend/storage/files/download/taxa/taxdmp
mkdir -p ./flask-backend/storage/files/upload/
mkdir -p ./flask-backend/storage/externalTools/
touch ./flask-backend/storage/files/download/taxa/tree.json

sudo apt install build-essential zlib1g-dev
wget https://github.com/GMOD/jbrowse/archive/refs/heads/master.zip -P ./flask-backend/storage/externalTools/
unzip ./flask-backend/storage/externalTools/master.zip -d ./flask-backend/storage/externalTools/
mv ./flask-backend/storage/externalTools/jbrowse-master ./flask-backend/storage/externalTools/jbrowse
rm -r ./flask-backend/storage/externalTools/master.zip
cd ./flask-backend/storage/externalTools/jbrowse
./setup.sh
cd ../../../../

sudo apt-get install samtools

wget https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip -P ./flask-backend/storage/files/download/taxa
unzip ./flask-backend/storage/files/download/taxa/taxdmp.zip -d ./flask-backend/storage/files/download/taxa/taxdmp
rm -r ./flask-backend/storage/files/download/taxa/taxdmp.zip

sudo npm i cloudcmd -g

cd ./react-frontend
npm install
cd ..

python3 -m venv ./flask-backend/venv
source ./flask-backend/venv/bin/activate
pip install -r ./flask-backend/requirements.txt
deactivate

python3 ./readConfig.py