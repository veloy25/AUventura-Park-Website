FROM node:20-alpine

WORKDIR /app

COPY services/pets-service/package*.json ./services/pets-service/

WORKDIR /app/services/pets-service

RUN npm install

COPY services/notificacoes-service/ .

COPY shared/ /app/shared/

EXPOSE 3007

CMD ["npm", "start"]