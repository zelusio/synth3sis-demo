FROM node:16

WORKDIR /opt/app
COPY package*.json ./
RUN npm install --prod
COPY ./src .

EXPOSE 8000
CMD node app.js