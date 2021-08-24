# Prepare Flask

    - Setup virtual environment:
        Go to .../g-nom/flask-backend
        python3 -m venv /g-nom/flask-backend/venv
    - Activate venv:
        source /g-nom/flask-backend/venv/bin/activate
    - Install requirements:
        pip install -r /g-nom/flask-backend/requirements.txt
    - Deactivate venv:
        deactivate

# CloudCommander

Install:
npm i cloudcmd -g

Run:
cloudcmd --username admin --password admin --save --port 5003 --one-file-panel --no-contact --root /g-nom/download/ --prefix /g-nom/portal

# React App

Install:
cd react-frontend
npm install

Run:
cd react-frontend
npm start

# MySQL

Run:
sudo /etc/init.d/mysql start

# jbrowse

Install:
Clone master into flask-backend/src/externalTools/jbrowse
cd jbrowse
./setup.sh

Run:
cd jbrowse
npm start

Prerequisites:
sudo apt-get install samtools

# insert names.dmp

Download:
https://ftp.ncbi.nlm.nih.gov/pub/taxonomy/taxdmp.zip

Extract files and insert names.dmp and nodes.dmp at .../g-nom/flask-backend/storage/files/download/taxa/
