FROM node:20-alpine

WORKDIR /app

COPY services/pets-service/package*.json ./services/pets-service/

WORKDIR /app/services/pets-service

RUN npm install

COPY services/barramento-service/ .

COPY shared/ /app/shared/

EXPOSE 10000

CMD ["npm", "start"]