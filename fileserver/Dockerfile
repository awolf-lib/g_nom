FROM httpd:2.4
FROM nextcloud:23.0.2-apache

RUN apt update
ARG DEBIAN_FRONTEND=noninteractive
RUN apt install -y python3 python3-pip
RUN pip3 install pika

ENV NEXTCLOUD_UPDATE=1

COPY src/main.py /usr/local/j_listener/main.py

CMD apache2-foreground & python3 /usr/local/j_listener/main.py
