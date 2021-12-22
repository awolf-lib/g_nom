FROM node:16.13
WORKDIR /react-frontend
COPY . .
RUN npm install -g serve
RUN npm install
ENV NODE_OPTIONS=--max_old_space_size=8192
RUN npm run build
CMD [ "serve", "-s", "build", "-l", "5000" ]
