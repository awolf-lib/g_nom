FROM node:latest
WORKDIR /react-frontend
COPY . .
RUN npm install -g serve
RUN npm install
RUN npm run build
CMD [ "serve", "-s", "build" ]