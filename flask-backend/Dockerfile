FROM python:3.8-slim-buster
WORKDIR /flask-backend

## Flask Server and Python libraries (venv)
SHELL [ "/bin/bash", "-c" ]

COPY . .

RUN python3 -m venv ./venv
RUN source ./venv/bin/activate
RUN pip install -r ./requirements.txt
RUN apt-get -y update && apt-get install -y wget && apt-get install unzip && apt-get install tabix

CMD python3 src/main.py