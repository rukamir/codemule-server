FROM node:alpine

EXPOSE 3000

ADD . /app
WORKDIR /app

RUN npm cache clean --force && npm install

CMD [ "npm", "start" ]