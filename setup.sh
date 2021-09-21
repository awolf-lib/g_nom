#!/bin/bash

mkdir -p ./flask-backend/storage/files/download/assemblies
mkdir -p ./flask-backend/storage/files/download/taxa/images
mkdir -p ./flask-backend/storage/files/upload/
mkdir -p ./flask-backend/storage/externalTools/jbrowse/
touch ./flask-backend/storage/files/download/taxa/tree.json

sudo apt install build-essential zlib1g-dev
wget https://github.com/GMOD/jbrowse/archive/refs/heads/master.zip -P ./flask-backend/storage/externalTools/jbrowse/
unzip ./flask-backend/storage/externalTools/master.zip
./jbrowse/setup.sh

sudo apt-get install samtools

wget https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip -P ./flask-backend/storage/files/download/taxa
gunzip ./flask-backend/storage/files/download/taxa/taxdmp.zip

sudo npm i cloudcmd -g

npm install --prefix ./react-frontend

python3 -m venv ./flask-backend/venv
source /g-nom/flask-backend/venv/bin/activate
pip install -r ./flask-backend/requirements.txt
deactivate

python3 ./readConfig.py