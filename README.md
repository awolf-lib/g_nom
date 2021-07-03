# Prepare Flask
    - Setup virtual environment:
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
    cloudcmd --username admin --password admin --save --port 5003 --one-file-panel --no-contact --root /g-nom/download/ --prefix /g-nom/storage
