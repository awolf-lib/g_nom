FROM node:16.13
WORKDIR /react-frontend
COPY . .
RUN npm install -g serve
RUN npm install --legacy-peer-deps
RUN TSC_COMPILE_ON_ERROR=true npm run build
CMD [ "serve", "-s", "build", "-l", "5000" ]
