FROM httpd:2.4

RUN apt update
ARG DEBIAN_FRONTEND=noninteractive
RUN apt install -y genometools samtools tabix nodejs npm

RUN npm install -g @jbrowse/cli
# Maybe we should force create so we are using the root directory
RUN jbrowse create -f /usr/local/apache2/htdocs

COPY target/release/jbrowselistener /usr/local/jbrowselistener

EXPOSE 80