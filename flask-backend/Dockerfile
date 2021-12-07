FROM python:3.8-slim-buster
WORKDIR /flask-backend

## Flask Server and Python libraries (venv)
SHELL [ "/bin/bash", "-c" ]

COPY . .

RUN python3 -m venv ./venv
RUN source ./venv/bin/activate
RUN pip install -r ./requirements.txt
<<<<<<< HEAD
RUN apt-get -y update && apt-get install -y wget unzip tabix
=======
RUN apt-get -y update && apt-get install -y wget && apt-get install -y unzip && apt-get install -y tabix
>>>>>>> start refactoring db and api

CMD python3 src/main.py