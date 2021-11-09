FROM node:17.0.1
WORKDIR /react-frontend
COPY . .
RUN npm install -g serve
RUN npm install
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build
CMD [ "serve", "-s", "build", "-l", "5000" ]