FROM httpd:2.4

RUN apt update
ARG DEBIAN_FRONTEND=noninteractive
RUN apt install -y genometools samtools tabix nodejs npm

RUN npm install -g @jbrowse/cli
RUN jbrowse create -f /usr/local/apache2/htdocs

EXPOSE 80

COPY target/release/jbrowselistener /usr/local/j_listener/jbrowselistener
CMD cd /usr/local/j_listener && ./jbrowselistener