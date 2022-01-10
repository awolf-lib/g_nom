FROM httpd:2.4

RUN apt update
ARG DEBIAN_FRONTEND=noninteractive
RUN apt install -y genometools samtools tabix nodejs npm python3 python3-pip
RUN pip3 install pika

RUN npm i -g @jbrowse/cli
RUN jbrowse create -f /usr/local/apache2/htdocs
RUN mkdir -p /usr/local/apache2/htdocs/assemblies

EXPOSE 80

COPY src/main.py /usr/local/j_listener/main.py
COPY httpd.conf /usr/local/apache2/conf/httpd.conf
CMD httpd-foreground & cd /usr/local/j_listener && python3 -u ./main.py