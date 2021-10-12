FROM node:latest
WORKDIR /react-frontend
COPY package.json ./
RUN npm install
COPY . .
CMD [ "npm", "run", "start"]