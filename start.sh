#!/bin/bash
sudo /etc/init.d/mysql start
cd react-frontend/
npm run start ./react-frontend/ & pids+=" $!"
cd ../flask-backend/
./run_main.sh & pids+=" $!"
cd src/files/
cloudcmd --username admin --password admin --save --port 5003 --one-file-panel --no-contact --root . --prefix /g-nom/portal & pids+=" $!"
cd ../externalTools/jbrowse
npm start & pids+=" $!"

trap "kill $pids" SIGTERM SIGINT
wait $pids