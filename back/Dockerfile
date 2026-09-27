FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node services ./services
COPY --chown=node:node shared ./shared

USER node

EXPOSE 3000 3001 3002 3003 3004 3005 3006 3007 10000

CMD ["node", "services/api-gateway/index.js"]