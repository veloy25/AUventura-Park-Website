FROM node:20-alpine

WORKDIR /app

COPY services/pets-service/package*.json ./services/pets-service/

WORKDIR /app/services/pets-service

RUN npm install

COPY services/user-service/ .

COPY shared/ /app/shared/

EXPOSE 3001

CMD ["npm", "start"]