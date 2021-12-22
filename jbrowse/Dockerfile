FROM httpd:2.4

RUN apt update
ARG DEBIAN_FRONTEND=noninteractive
RUN apt install -y genometools samtools tabix nodejs npm python3 python3-pip
RUN pip3 install pika

RUN npm install -g @jbrowse/cli
RUN jbrowse create -f /usr/local/apache2/htdocs

EXPOSE 80

# COPY target/release/jbrowselistener /usr/local/j_listener/jbrowselistener
COPY src/main.py /usr/local/j_listener/main.py
COPY httpd.conf /usr/local/apache2/conf/httpd.conf
CMD httpd-foreground & cd /usr/local/j_listener && python3 ./main.py